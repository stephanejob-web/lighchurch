import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Box, Typography, Button, IconButton, Skeleton, Divider, Chip, Link, Stack, Alert } from '@mui/material';
import { Close, Directions, PunchClock, Call, Language, LocationOn, LocalParking, Accessible, Mic, Person, People, Euro, YouTube, InsertLink, CancelOutlined, Info, Email, Translate, Facebook, Instagram, Twitter, LinkedIn, WhatsApp, EventBusy } from '@mui/icons-material';
import type { ChurchDetails, EventDetails } from '../../types/publicMap';
import useEventInterestWeb from '../../hooks/useEventInterestWeb';
import TikTokIcon from '../icons/TikTokIcon';

interface DetailDrawerProps {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    data: ChurchDetails | EventDetails | null;
    type: 'church' | 'event' | null;
    embedded?: boolean;
    onOrganizerClick?: (churchId: string) => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ open, onClose, loading, data, type, embedded = false, onOrganizerClick }) => {
    const navigate = useNavigate();
    const [overrideData, setOverrideData] = useState<ChurchDetails | null>(null);
    const [overrideType, setOverrideType] = useState<'church' | 'event' | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const handleClose = () => {
        setOverrideData(null);
        setOverrideType(null);
        setIsDescriptionExpanded(false);
        onClose();
    };

    const renderChurchDetails = (church: ChurchDetails) => {
        // Helper to get social icon
        const getSocialIcon = (platform: string) => {
            const p = platform.toUpperCase();
            switch (p) {
                case 'FACEBOOK': return <Facebook fontSize="small" sx={{ color: '#1877F2' }} />;
                case 'INSTAGRAM': return <Instagram fontSize="small" sx={{ color: '#E4405F' }} />;
                case 'YOUTUBE': return <YouTube fontSize="small" sx={{ color: '#FF0000' }} />;
                case 'TWITTER': return <Twitter fontSize="small" sx={{ color: '#1DA1F2' }} />;
                case 'X': return <Twitter fontSize="small" sx={{ color: '#1DA1F2' }} />;
                case 'WHATSAPP': return <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />;
                case 'LINKEDIN': return <LinkedIn fontSize="small" sx={{ color: '#0A66C2' }} />;
                case 'TIKTOK': return <TikTokIcon fontSize="small" sx={{ color: '#000000' }} />;
                default: return <Language fontSize="small" />;
            }
        };

        return (
            <Box sx={{ p: 3 }}>
                {/* Title */}
                <Typography variant="h5" fontWeight="500" color="#202124" gutterBottom>
                    {church.church_name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label="Église" size="small" sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', fontWeight: 500 }} />
                    {church.denomination_name && <Chip label={church.denomination_name} size="small" sx={{ bgcolor: '#F1F3F4', color: '#5F6368' }} />}
                </Stack>

                <Divider sx={{ my: 2, borderColor: '#E8EAED' }} />

                {/* Actions - Google Maps Style */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<Directions />}
                        fullWidth
                        onClick={() => {
                            window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`,
                                '_blank'
                            );
                        }}
                        sx={{
                            borderRadius: 8,
                            bgcolor: '#1A73E8',
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#1765CC', boxShadow: 'none' }
                        }}
                    >
                        Itinéraire
                    </Button>
                    {/* share removed per UX request */}
                </Box>

                <Divider sx={{ my: 2, borderColor: '#E8EAED' }} />

                {/* Info Section */}
                <Stack spacing={3}>
                    {/* Address */}
                    {(church.details?.address || church.details?.city) && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <LocationOn sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Typography variant="body2" color="#3C4043">
                                {[church.details?.address, church.details?.postal_code, church.details?.city].filter(Boolean).join(', ')}
                            </Typography>
                        </Box>
                    )}

                    {/* Pastor */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Person sx={{ color: '#5F6368', fontSize: 20 }} />
                        <Typography variant="body2" color="#3C4043">Pasteur: {church.first_name} {church.last_name}</Typography>
                    </Box>

                    {/* Pastor Email */}
                    {church.email && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Email sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Link href={`mailto:${church.email}`} sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{church.email}</Link>
                        </Box>
                    )}

                    {/* Phone */}
                    {church.details?.phone && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Call sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Link href={`tel:${church.details.phone}`} sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{church.details.phone}</Link>
                        </Box>
                    )}

                    {/* Website */}
                    {church.details?.website && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Language sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Link href={church.details.website} target="_blank" rel="noopener" sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Site Web</Link>
                        </Box>
                    )}
                </Stack>

                {/* Description */}
                {church.details?.description && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="500" color="#202124" sx={{ mb: 1 }}>À propos</Typography>
                            <Typography variant="body2" color="#5F6368" sx={{ lineHeight: 1.6 }}>{church.details.description}</Typography>
                        </Box>
                    </>
                )}

                {/* Parking */}
                {church.details?.has_parking && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                <LocalParking sx={{ color: '#5F6368', fontSize: 20 }} />
                                <Typography variant="body2" fontWeight="500" color="#202124">Parking disponible</Typography>
                            </Box>
                            {church.details.parking_capacity && (
                                <Typography variant="body2" color="#5F6368" sx={{ ml: 5 }}>
                                    Capacité: {church.details.parking_capacity} places
                                </Typography>
                            )}
                            {church.details.parking_info && (
                                <Typography variant="body2" color="#5F6368" sx={{ ml: 5 }}>
                                    {church.details.parking_info}
                                </Typography>
                            )}
                        </Box>
                    </>
                )}

                {/* Features */}
                {(church.details?.seating_capacity || church.details?.accessibility_features) && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {church.details?.seating_capacity && (
                                <Chip label={`${church.details.seating_capacity} places`} size="small" sx={{ bgcolor: '#F1F3F4', color: '#5F6368' }} />
                            )}
                            {church.details?.accessibility_features && <Chip icon={<Accessible />} label="Accès PMR" size="small" sx={{ bgcolor: '#F1F3F4', color: '#5F6368' }} />}
                        </Stack>
                    </>
                )}

                {/* Schedules */}
                {church.schedules && church.schedules.length > 0 && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="500" color="#202124" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PunchClock fontSize="small" sx={{ color: '#5F6368' }} /> Horaires
                            </Typography>
                            {church.schedules.map((sch) => (
                                <Box key={sch.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography variant="body2" color="#5F6368">{sch.day_of_week}</Typography>
                                    <Typography variant="body2" fontWeight="500" color="#3C4043">{sch.start_time.slice(0, 5)} - {sch.activity_type || 'Service'}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </>
                )}

                {/* Social Media */}
                {church.socials && church.socials.length > 0 && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="500" color="#202124" sx={{ mb: 2 }}>
                                Réseaux sociaux
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {church.socials.map((social, idx) => (
                                    <IconButton
                                        key={idx}
                                        component={Link}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener"
                                        size="small"
                                        aria-label={`Voir ${social.platform}`}
                                        sx={{
                                            border: '1px solid #DADCE0',
                                            borderRadius: 1,
                                            color: '#5F6368',
                                            '&:hover': { bgcolor: '#F8F9FA' }
                                        }}
                                    >
                                        {getSocialIcon(social.platform)}
                                    </IconButton>
                                ))}
                            </Stack>
                        </Box>
                    </>
                )}
            </Box>
        );
    };

    const renderEventDetails = (event: EventDetails) => {
        const isCancelled = Boolean(event.cancelled_at);
        // Hook for unsubscription logic in detail view might be needed, or we just rely on parent updates?
        // Actually, DetailDrawer doesn't have the subscription hook. We should probably accept an onToggleInterest prop or similar,
        // but for now, since subscription state is local/cached, we can't easily toggle it HERE without the hook.
        // However, the user request says "pas de buttons pour me desinscritre".
        // The Participation logic is currently inside EventCard and MyParticipationsSidebar via `useEventInterestWeb`.
        // To add it here, we need to import `useEventInterestWeb`.

        // NOTE: We cannot use hooks inside this render function (nested function). 
        // We will need to extract this or use a separate component.
        // Let's create a sub-component for actions.


        return (
            <Box sx={{ p: 3 }}>
                {/* Badge ANNULÉ */}
                {isCancelled && (
                    <Alert severity="error" icon={<CancelOutlined />} sx={{ mb: 2, bgcolor: '#FFEBEE', color: '#C5221F' }}>
                        <Typography variant="subtitle2" fontWeight="600">ÉVÉNEMENT ANNULÉ</Typography>
                    </Alert>
                )}

                {/* Title */}
                <Typography variant="h5" fontWeight="500" color="#202124" gutterBottom>
                    {event.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    <Chip label="Événement" size="small" sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', fontWeight: 500 }} />
                    <Chip label={new Date(event.start_datetime).toLocaleDateString('fr-FR')} size="small" sx={{ bgcolor: '#F1F3F4', color: '#5F6368' }} />
                    {event.details?.is_free && <Chip label="Gratuit" size="small" sx={{ bgcolor: '#E6F4EA', color: '#137333', fontWeight: 500 }} icon={<Euro />} />}
                </Stack>

                {/* Raison d'annulation */}
                {isCancelled && event.cancellation_reason && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: '#FFF4E5', borderLeft: '4px solid #F9AB00', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <Info fontSize="small" sx={{ color: '#E37400' }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: '#E37400', fontWeight: 600 }}>Raison de l'annulation</Typography>
                                <Typography variant="body2" color="#5F6368">{event.cancellation_reason}</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 2, borderColor: '#E8EAED' }} />

                {/* Actions - Google Maps Style */}
                <EventActions event={event} navigate={navigate} />

                <Divider sx={{ my: 2, borderColor: '#E8EAED' }} />

                <Stack spacing={3}>
                    {/* Date/Time */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <PunchClock sx={{ color: '#5F6368', fontSize: 20 }} />
                        <Box>
                            <Typography variant="body2" fontWeight="500" color="#3C4043">
                                {new Date(event.start_datetime).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                            <Typography variant="body2" color="#5F6368">
                                {new Date(event.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                {event.end_datetime && ` - ${new Date(event.end_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Participants */}
                    {event.interested_count !== undefined && event.interested_count > 0 && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <People sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Typography variant="body2" color="#3C4043">{event.interested_count} participant{event.interested_count > 1 ? 's' : ''} intéressé{event.interested_count > 1 ? 's' : ''}</Typography>
                        </Box>
                    )}

                    {/* Location */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <LocationOn sx={{ color: '#5F6368', fontSize: 20 }} />
                        <Box>
                            <Typography variant="body2" fontWeight="500" color="#3C4043">{event.church_name}</Typography>
                            <Typography variant="body2" color="#5F6368">
                                {[event.details?.street_number, event.details?.street_name].filter(Boolean).join(' ') || event.details?.address}
                            </Typography>
                            <Typography variant="body2" color="#5F6368">
                                {[event.details?.postal_code, event.details?.city].filter(Boolean).join(' ')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Speaker */}
                    {event.details?.speaker_name && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Mic sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Typography variant="body2" color="#3C4043">Intervenant: {event.details.speaker_name}</Typography>
                        </Box>
                    )}
                </Stack>

                {/* Description */}
                {event.details?.description && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="500" color="#202124" sx={{ mb: 1 }}>Détails</Typography>
                            <Typography variant="body2" color="#5F6368" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {(() => {
                                    const description = event.details.description;
                                    const charLimit = 300;
                                    const isLongText = description.length > charLimit;

                                    if (isLongText && !isDescriptionExpanded) {
                                        return description.substring(0, charLimit) + '...';
                                    }
                                    return description;
                                })()}
                            </Typography>
                            {event.details.description.length > 300 && (
                                <Button
                                    size="small"
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    sx={{
                                        mt: 1,
                                        color: '#1A73E8',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        p: 0,
                                        minWidth: 'auto',
                                        '&:hover': {
                                            bgcolor: 'transparent',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    {isDescriptionExpanded ? 'Voir moins' : 'Lire la suite'}
                                </Button>
                            )}
                        </Box>
                    </>
                )}

                {/* Languages */}
                {(event.primary_language || (event.translations && event.translations.length > 0)) && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="500" color="#202124" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Translate fontSize="small" sx={{ color: '#5F6368' }} /> Langues
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {event.primary_language && (
                                    <Chip
                                        label={`${event.primary_language.flag || ''} ${event.primary_language.name}`}
                                        size="small"
                                        sx={{ bgcolor: '#E8F0FE', color: '#1A73E8', fontWeight: 500 }}
                                    />
                                )}
                                {event.translations && event.translations.length > 0 && (
                                    <Typography variant="body2" color="#5F6368" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        • traduit en {event.translations.map((lang: any, idx: number) => {
                                            const name = lang.language_name || lang.name;
                                            const flag = lang.language_flag || lang.flag || '';
                                            return (
                                                <Chip
                                                    key={idx}
                                                    label={`${flag} ${name}`}
                                                    size="small"
                                                    sx={{ bgcolor: '#F1F3F4', color: '#5F6368', ml: idx > 0 ? 0.5 : 0 }}
                                                />
                                            );
                                        })}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </>
                )}

                {/* Parking */}
                {event.details?.has_parking && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                <LocalParking sx={{ color: '#5F6368', fontSize: 20 }} />
                                <Typography variant="body2" fontWeight="500" color="#202124">Parking disponible</Typography>
                            </Box>
                            {event.details.parking_capacity && (
                                <Typography variant="body2" color="#5F6368" sx={{ ml: 5 }}>
                                    Capacité: {event.details.parking_capacity} places
                                </Typography>
                            )}
                            {event.details.is_parking_free !== undefined && (
                                <Typography variant="body2" color="#5F6368" sx={{ ml: 5 }}>
                                    {event.details.is_parking_free ? 'Gratuit' : 'Payant'}
                                </Typography>
                            )}
                            {event.details.parking_details && (
                                <Typography variant="body2" color="#5F6368" sx={{ ml: 5 }}>
                                    {event.details.parking_details}
                                </Typography>
                            )}
                        </Box>
                    </>
                )}

                {/* Registration Link */}
                {event.details?.registration_link && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <InsertLink sx={{ color: '#5F6368', fontSize: 20 }} />
                            <Link href={event.details.registration_link} target="_blank" rel="noopener" sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                S'inscrire à l'événement
                            </Link>
                        </Box>
                    </>
                )}

                {/* YouTube Live */}
                {event.details?.youtube_live && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <YouTube sx={{ color: '#FF0000', fontSize: 20 }} />
                            <Link href={event.details.youtube_live} target="_blank" rel="noopener" sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Voir le live YouTube
                            </Link>
                        </Box>
                    </>
                )}

                {/* Contact */}
                {(event.details?.contact_email || event.details?.contact_phone) && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="500" color="#202124" sx={{ mb: 2 }}>Contact</Typography>
                            <Stack spacing={2}>
                                {event.details.contact_email && (
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Email fontSize="small" sx={{ color: '#5F6368' }} />
                                        <Link href={`mailto:${event.details.contact_email}`} sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{event.details.contact_email}</Link>
                                    </Box>
                                )}
                                {event.details.contact_phone && (
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Call fontSize="small" sx={{ color: '#5F6368' }} />
                                        <Link href={`tel:${event.details.contact_phone}`} sx={{ color: '#1A73E8', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{event.details.contact_phone}</Link>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </>
                )}

                {/* Organizer/Church */}
                {event.church && (
                    <>
                        <Divider sx={{ my: 3, borderColor: '#E8EAED' }} />
                        <Box
                            sx={{
                                p: 3,
                                bgcolor: '#F8F9FA',
                                borderRadius: 2,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#E8F0FE' },
                                transition: 'background-color 0.2s'
                            }}
                            onClick={async () => {
                                if (onOrganizerClick && event.church_id) {
                                    onOrganizerClick(String(event.church_id));
                                    return;
                                }
                                try {
                                    const { fetchChurchDetails } = await import('../../services/publicMapService');
                                    if (event.church_id) {
                                        const ch = await fetchChurchDetails(Number(event.church_id));
                                        if (ch) {
                                            setOverrideData(ch);
                                            setOverrideType('church');
                                        }
                                    }
                                } catch (e) {
                                    console.error('Failed to fetch organizer church', e);
                                }
                            }}
                        >
                            <Typography variant="caption" color="#5F6368">Organisé par</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" fontWeight="500" color="#1A73E8">{event.church.church_name}</Typography>
                                    {event.church.denomination_name && (
                                        <Typography variant="caption" color="#5F6368">{event.church.denomination_name}</Typography>
                                    )}
                                </Box>
                                {onOrganizerClick && <Directions sx={{ color: '#1A73E8', fontSize: 20 }} />}
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        );
    };

    // Show skeleton when loading OR when drawer is open but data is not yet loaded
    const showSkeleton = loading || (open && !data);

    const innerContent = showSkeleton ? (
        <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
            <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
            <Skeleton variant="text" width="50%" />
        </Box>
    ) : data ? (
        <Box>
            {(() => {
                // Determine current data and type logic
                const currentData = overrideData || data;
                const currentType = overrideType || type;
                
                const imageUrl = currentType === 'church' 
                    ? (currentData as ChurchDetails).details?.logo_url 
                    : (currentData as EventDetails).details?.image_url;

                // Render Image Header if URL exists
                if (imageUrl) {
                    return (
                        <Box
                            sx={{
                                height: 200,
                                backgroundColor: '#F1F3F4',
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative'
                            }}
                        >
                            <IconButton
                                onClick={handleClose}
                                aria-label="Fermer"
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: '#FFFFFF',
                                    color: '#5F6368',
                                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
                                    '&:hover': { backgroundColor: '#F8F9FA' }
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>
                    );
                }

                // Render just Close button if no image
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                        <IconButton
                            onClick={handleClose}
                            aria-label="Fermer"
                            sx={{
                                color: '#5F6368',
                                '&:hover': { backgroundColor: '#F8F9FA' }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                );
            })()}

            {overrideType === 'church' && overrideData
                ? renderChurchDetails(overrideData as ChurchDetails)
                : (type === 'church' ? renderChurchDetails(data as ChurchDetails) : renderEventDetails(data as EventDetails))
            }
        </Box>
    ) : null;

    if (embedded) {
        return (
            <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#fff' }}>
                {innerContent}
            </Box>
        );
    }

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={handleClose}
            variant="persistent"
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    top: 0,
                    height: '100%',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
                    borderRight: 'none',
                    zIndex: 2200, // Higher than SearchPanel (2000) and Autocomplete (2100)
                    bgcolor: '#FFFFFF'
                }
            }}
        >
            {innerContent}
        </Drawer>
    );
};

const EventActions: React.FC<{ event: EventDetails; navigate: any }> = ({ event, navigate }) => {
    const { isInterested, isPending, toggle } = useEventInterestWeb(event.id, false, event.interested_count);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<Directions />}
                    onClick={() => {
                        window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`,
                            '_blank'
                        );
                    }}
                    sx={{
                        flex: 1,
                        borderRadius: 8,
                        bgcolor: '#1A73E8',
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#1765CC', boxShadow: 'none' }
                    }}
                >
                    Itinéraire
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<LocationOn />}
                    onClick={() => {
                        try {
                            navigate(`/map?focusEvent=${event.id}`);
                        } catch { }
                        try {
                            window.dispatchEvent(new CustomEvent('light_church:focus_event', { detail: { eventId: event.id } }));
                        } catch { }
                    }}
                    sx={{
                        flex: 1,
                        borderRadius: 8,
                        borderColor: '#DADCE0',
                        color: '#1A73E8',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: '#DADCE0',
                            bgcolor: '#F1F3F4'
                        }
                    }}
                >
                    Centrer la carte
                </Button>
            </Box>

            {/* Inscription / Désinscription Bouton Large */}
            <Button
                variant={isInterested ? "outlined" : "contained"}
                color={isInterested ? "error" : "primary"}
                startIcon={isInterested ? <EventBusy /> : null}
                onClick={() => toggle()}
                disabled={isPending}
                sx={{
                    width: '100%',
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                    bgcolor: isInterested ? 'transparent' : '#1A73E8',
                    color: isInterested ? '#d32f2f' : '#fff',
                    borderColor: isInterested ? '#d32f2f' : 'transparent',
                    '&:hover': {
                        bgcolor: isInterested ? '#ffebee' : '#1765CC',
                        borderColor: isInterested ? '#d32f2f' : 'transparent',
                        boxShadow: 'none'
                    }
                }}
            >
                {isInterested ? "Se désinscrire de l'événement" : "S'inscrire à l'événement"}
            </Button>
            {event.cancelled_at && (
                <Typography variant="caption" color="error" align="center" sx={{ display: 'block', mt: -1 }}>
                    Les inscriptions sont closes car l'événement est annulé.
                </Typography>
            )}
        </Box>
    );
};

export default DetailDrawer;
