import React, { useCallback, useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { motion, useAnimation, useMotionValue, useDragControls, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export interface BottomSheetRef {
    snapTo: (index: number) => void;
    getCurrentSnapIndex: () => number;
}

interface BottomSheetProps {
    children: React.ReactNode;
    snapPoints: number[]; // En pourcentage de la hauteur de l'écran (ex: [15, 50, 90])
    initialSnapIndex?: number;
    onChange?: (index: number) => void;
    // Mode détails
    detailsContent?: React.ReactNode;
    showDetails?: boolean;
    onBackToList?: () => void;
    detailsTitle?: string;
}

/**
 * Bottom Sheet style Google Maps / gorhom react-native-bottom-sheet
 * - Toujours visible
 * - Plusieurs snap points
 * - Swipe pour changer de position
 * - Animation fluide
 * - Support mode détails avec transition animée
 */
const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(({
    children,
    snapPoints,
    initialSnapIndex = 0,
    onChange,
    detailsContent,
    showDetails = false,
    onBackToList,
    detailsTitle
}, ref) => {
    const controls = useAnimation();
    const dragControls = useDragControls();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapIndex);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const y = useMotionValue(0);

    // Exposer les méthodes via ref
    useImperativeHandle(ref, () => ({
        snapTo: (index: number) => {
            const positions = getSnapPositions();
            if (index >= 0 && index < positions.length) {
                controls.start({
                    y: positions[index],
                    transition: { type: 'spring', damping: 30, stiffness: 300 }
                });
                setCurrentSnapIndex(index);
                onChange?.(index);
            }
        },
        getCurrentSnapIndex: () => currentSnapIndex
    }));

    // Calculer les positions Y pour chaque snap point (en pixels depuis le bas)
    const getSnapPositions = useCallback(() => {
        return snapPoints.map(percent => windowHeight * (1 - percent / 100));
    }, [snapPoints, windowHeight]);

    // Mettre à jour la hauteur de la fenêtre
    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Position initiale
    useEffect(() => {
        const positions = getSnapPositions();
        controls.set({ y: positions[initialSnapIndex] });
    }, [controls, getSnapPositions, initialSnapIndex]);

    // Quand on passe en mode détails, monter le sheet à 50% minimum
    const prevShowDetailsRef = useRef(showDetails);
    useEffect(() => {
        // Seulement quand showDetails passe de false à true
        if (showDetails && !prevShowDetailsRef.current) {
            // Monter le sheet si on est en position basse
            if (currentSnapIndex < 1) {
                const positions = getSnapPositions();
                const midIndex = Math.min(1, positions.length - 1);
                controls.start({
                    y: positions[midIndex],
                    transition: { type: 'spring', damping: 30, stiffness: 300 }
                });
                setCurrentSnapIndex(midIndex);
            }
        }
        prevShowDetailsRef.current = showDetails;
    }, [showDetails, controls, getSnapPositions, currentSnapIndex]);

    // Trouver le snap point le plus proche
    const findClosestSnapPoint = useCallback((currentY: number, velocity: number) => {
        const positions = getSnapPositions();

        // Si velocity importante, aller dans la direction du swipe
        if (Math.abs(velocity) > 500) {
            if (velocity > 0) {
                // Swipe vers le bas -> snap point plus bas (index plus petit)
                const lowerPoints = positions.filter((_, i) => i < currentSnapIndex);
                if (lowerPoints.length > 0) {
                    return { index: currentSnapIndex - 1, position: positions[currentSnapIndex - 1] };
                }
            } else {
                // Swipe vers le haut -> snap point plus haut (index plus grand)
                const higherPoints = positions.filter((_, i) => i > currentSnapIndex);
                if (higherPoints.length > 0) {
                    return { index: currentSnapIndex + 1, position: positions[currentSnapIndex + 1] };
                }
            }
        }

        // Sinon, trouver le plus proche
        let closestIndex = 0;
        let closestDistance = Math.abs(positions[0] - currentY);

        positions.forEach((pos, index) => {
            const distance = Math.abs(pos - currentY);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return { index: closestIndex, position: positions[closestIndex] };
    }, [getSnapPositions, currentSnapIndex]);

    // Gérer la fin du drag
    const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
        const currentY = y.get();
        const { index, position } = findClosestSnapPoint(currentY, info.velocity.y);

        controls.start({
            y: position,
            transition: {
                type: 'spring',
                damping: 30,
                stiffness: 300
            }
        });

        if (index !== currentSnapIndex) {
            setCurrentSnapIndex(index);
            onChange?.(index);
        }
    }, [controls, findClosestSnapPoint, currentSnapIndex, onChange, y]);

    // Contraintes de drag
    const positions = getSnapPositions();
    const minY = Math.min(...positions); // Position la plus haute (plus petit Y)
    const maxY = Math.max(...positions); // Position la plus basse (plus grand Y)

    // Démarrer le drag depuis le handle
    const startDrag = (event: React.PointerEvent) => {
        dragControls.start(event);
    };

    // Reset scroll when details change
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, 0);
        }
    }, [showDetails, detailsTitle]);

    return (
        <motion.div
            ref={containerRef}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: minY, bottom: maxY }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{
                y,
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: windowHeight,
                zIndex: 1300,
                willChange: 'transform',
                pointerEvents: 'none', // Laisser passer les clics à travers la zone invisible
            }}
        >
            <motion.div
                style={{
                    height: useTransform(y, value => windowHeight - value),
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    pointerEvents: 'auto', // Réactiver les clics sur le contenu visible
                }}
            >

                {/* Handle - zone de drag élargie pour meilleure UX */}
                <Box
                    onPointerDown={startDrag}
                    sx={{
                        pt: 2,
                        pb: 1.5,
                        px: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'grab',
                        flexShrink: 0,
                        bgcolor: '#FFFFFF',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        touchAction: 'none',
                        // Zone de touch élargie
                        minHeight: 44,
                        '&:active': {
                            cursor: 'grabbing',
                            bgcolor: '#F8F9FA',
                        },
                        '&:hover': {
                            bgcolor: '#FAFAFA',
                        },
                        transition: 'background-color 0.15s ease',
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 5,
                            bgcolor: '#DADCE0',
                            borderRadius: 2.5,
                            mb: 0.5,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#9AA0A6',
                            fontSize: '0.65rem',
                            userSelect: 'none',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Glisser pour ajuster
                    </Typography>
                </Box>

                {/* Header avec bouton retour en mode détails - aussi draggable */}
                {showDetails && onBackToList && (
                    <Box
                        onPointerDown={startDrag}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 1,
                            pb: 1,
                            borderBottom: '1px solid #E8EAED',
                            flexShrink: 0,
                            cursor: 'grab',
                            touchAction: 'none',
                            '&:active': {
                                cursor: 'grabbing',
                                bgcolor: '#F8F9FA',
                            },
                        }}
                    >
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onBackToList();
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            size="small"
                            sx={{ color: '#5F6368' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        {detailsTitle && (
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    ml: 1,
                                    fontWeight: 500,
                                    color: '#202124',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                }}
                            >
                                {detailsTitle}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Contenu scrollable - le scroll fonctionne indépendamment du drag */}
                <Box
                    ref={scrollRef}
                    component="div"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        minHeight: 0,
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-y',
                    }}
                >
                    {/* Liste des résultats */}
                    {!showDetails && (
                        <Box sx={{ pb: 'max(80px, env(safe-area-inset-bottom, 80px))' }}>
                            {children}
                        </Box>
                    )}

                    {/* Détails */}
                    {showDetails && (
                        <Box sx={{ pb: 'max(80px, env(safe-area-inset-bottom, 80px))' }}>
                            {detailsContent}
                        </Box>
                    )}
                </Box>
            </motion.div>
        </motion.div>

    );
});

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
