import React, { useCallback, useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Box } from '@mui/material';

interface BottomSheetProps {
    children: React.ReactNode;
    snapPoints: number[]; // En pourcentage de la hauteur de l'écran (ex: [15, 50, 90])
    initialSnapIndex?: number;
    onChange?: (index: number) => void;
    headerContent?: React.ReactNode;
}

/**
 * Bottom Sheet style Google Maps / gorhom react-native-bottom-sheet
 * - Toujours visible
 * - Plusieurs snap points
 * - Swipe pour changer de position
 * - Animation fluide
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
    children,
    snapPoints,
    initialSnapIndex = 0,
    onChange,
    headerContent
}) => {
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapIndex);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const y = useMotionValue(0);

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
    const handleDragEnd = useCallback((_: any, info: PanInfo) => {
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

    return (
        <motion.div
            ref={containerRef}
            drag="y"
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
                touchAction: 'none',
                willChange: 'transform',
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    bgcolor: '#FFFFFF',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Handle - zone de drag */}
                <Box
                    sx={{
                        pt: 1.5,
                        pb: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'grab',
                        flexShrink: 0,
                        bgcolor: '#FFFFFF',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        '&:active': {
                            cursor: 'grabbing',
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: 36,
                            height: 5,
                            bgcolor: '#DADCE0',
                            borderRadius: 2.5,
                        }}
                    />
                </Box>

                {/* Header personnalisé */}
                {headerContent && (
                    <Box sx={{ flexShrink: 0 }}>
                        {headerContent}
                    </Box>
                )}

                {/* Contenu scrollable */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: currentSnapIndex === 0 ? 'hidden' : 'auto',
                        overflowX: 'hidden',
                        pb: 'env(safe-area-inset-bottom, 16px)',
                        minHeight: 0,
                        // Empêcher le scroll de déclencher le drag
                        touchAction: currentSnapIndex === 0 ? 'none' : 'pan-y',
                    }}
                    onTouchStart={(e) => {
                        // Permettre le scroll interne sans déclencher le drag du sheet
                        if (currentSnapIndex > 0) {
                            e.stopPropagation();
                        }
                    }}
                >
                    {children}
                </Box>
            </Box>
        </motion.div>
    );
};

export default BottomSheet;
