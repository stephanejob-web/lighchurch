import { useState } from 'react';
import {
    Box,
    TextField,
    Grid,
    Typography,
    Button,
    Paper,
    Alert,
    AlertTitle
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    Map as MapIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AddressData {
    street_number: string;
    street_name: string;
    postal_code: string;
    city: string;
    latitude: number;
    longitude: number;
    full_address: string;
}

interface ManualAddressInputProps {
    onAddressSelect: (address: AddressData) => void;
    defaultValue?: Partial<AddressData>;
}

// Composant pour capturer les clics sur la carte
function LocationMarker({ position, onPositionChange }: {
    position: [number, number];
    onPositionChange: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function ManualAddressInput({ onAddressSelect, defaultValue }: ManualAddressInputProps) {
    const [streetNumber, setStreetNumber] = useState(defaultValue?.street_number || '');
    const [streetName, setStreetName] = useState(defaultValue?.street_name || '');
    const [postalCode, setPostalCode] = useState(defaultValue?.postal_code || '');
    const [city, setCity] = useState(defaultValue?.city || '');
    const [latitude, setLatitude] = useState<number>(defaultValue?.latitude || 46.603354);
    const [longitude, setLongitude] = useState<number>(defaultValue?.longitude || 1.888334);
    const [showMap, setShowMap] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleMapClick = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!streetName.trim()) {
            newErrors.streetName = 'Le nom de rue est obligatoire';
        }
        if (!city.trim()) {
            newErrors.city = 'La ville est obligatoire';
        }
        if (!postalCode.trim()) {
            newErrors.postalCode = 'Le code postal est obligatoire';
        } else if (!/^\d{5}$/.test(postalCode)) {
            newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
        }
        if (latitude < -90 || latitude > 90) {
            newErrors.latitude = 'Latitude invalide (-90 à 90)';
        }
        if (longitude < -180 || longitude > 180) {
            newErrors.longitude = 'Longitude invalide (-180 à 180)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const fullAddress = `${streetNumber} ${streetName}, ${postalCode} ${city}`.trim();

        const addressData: AddressData = {
            street_number: streetNumber,
            street_name: streetName,
            postal_code: postalCode,
            city: city,
            latitude: latitude,
            longitude: longitude,
            full_address: fullAddress,
        };

        onAddressSelect(addressData);
    };

    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Mode de saisie manuelle</AlertTitle>
                Les services de géocodage automatique sont temporairement indisponibles.
                Veuillez saisir l'adresse manuellement et cliquer sur la carte pour définir la position.
            </Alert>

            <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon color="primary" />
                    Adresse
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            fullWidth
                            label="N° de rue"
                            value={streetNumber}
                            onChange={(e) => setStreetNumber(e.target.value)}
                            placeholder="10"
                            helperText="Optionnel"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 9 }}>
                        <TextField
                            fullWidth
                            required
                            label="Nom de rue"
                            value={streetName}
                            onChange={(e) => setStreetName(e.target.value)}
                            placeholder="Rue de la Paix"
                            error={!!errors.streetName}
                            helperText={errors.streetName}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            required
                            label="Code postal"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="75001"
                            error={!!errors.postalCode}
                            helperText={errors.postalCode}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                            fullWidth
                            required
                            label="Ville"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Paris"
                            error={!!errors.city}
                            helperText={errors.city}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="primary" />
                    Coordonnées GPS
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Latitude"
                            type="number"
                            value={latitude}
                            onChange={(e) => setLatitude(parseFloat(e.target.value))}
                            error={!!errors.latitude}
                            helperText={errors.latitude || 'Ex: 48.8566'}
                            inputProps={{ step: 0.000001 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Longitude"
                            type="number"
                            value={longitude}
                            onChange={(e) => setLongitude(parseFloat(e.target.value))}
                            error={!!errors.longitude}
                            helperText={errors.longitude || 'Ex: 2.3522'}
                            inputProps={{ step: 0.000001 }}
                        />
                    </Grid>
                </Grid>

                <Button
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={() => setShowMap(!showMap)}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    {showMap ? 'Masquer la carte' : 'Choisir sur la carte'}
                </Button>

                {showMap && (
                    <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden' }}>
                        <MapContainer
                            center={[latitude, longitude]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <LocationMarker
                                position={[latitude, longitude]}
                                onPositionChange={handleMapClick}
                            />
                        </MapContainer>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            💡 Cliquez sur la carte pour définir la position exacte de l'église
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                startIcon={<LocationOnIcon />}
            >
                Valider l'adresse
            </Button>
        </Box>
    );
}
