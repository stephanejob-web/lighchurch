import React from 'react';
import { Alert, Button, Box, Typography, Container } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Mettre à jour l'état pour afficher l'UI de fallback au prochain rendu
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Logger l'erreur pour le débogage
        console.error('Error caught by boundary:', error, errorInfo);

        // Sauvegarder l'errorInfo dans le state
        this.setState({
            errorInfo
        });

        // Vous pouvez également envoyer l'erreur à un service de monitoring ici
        // Par exemple: Sentry, LogRocket, etc.
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md" sx={{ mt: 8 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            p: 4
                        }}
                    >
                        <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />

                        <Typography variant="h4" gutterBottom fontWeight={600}>
                            Oups ! Une erreur s'est produite
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                            Nous sommes désolés, mais quelque chose s'est mal passé.
                            Vous pouvez essayer de rafraîchir la page ou revenir en arrière.
                        </Typography>

                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left', width: '100%', maxWidth: 600 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Détails de l'erreur:
                            </Typography>
                            <Typography variant="body2" component="pre" sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                            }}>
                                {this.state.error?.message || 'Erreur inconnue'}
                            </Typography>

                            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                <Typography variant="caption" component="pre" sx={{
                                    mt: 2,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    opacity: 0.7
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </Typography>
                            )}
                        </Alert>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleReload}
                                size="large"
                            >
                                Rafraîchir la page
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={this.handleReset}
                                size="large"
                            >
                                Réessayer
                            </Button>

                            <Button
                                variant="text"
                                onClick={() => window.history.back()}
                                size="large"
                            >
                                Retour
                            </Button>
                        </Box>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
