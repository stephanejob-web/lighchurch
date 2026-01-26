import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr } from 'date-fns/locale';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface DateTimeInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    minDateTime?: string;
    error?: string;
    dateOnly?: boolean;
}

// Textes français pour les pickers
const frenchLocaleText = {
    cancelButtonLabel: 'Annuler',
    clearButtonLabel: 'Effacer',
    okButtonLabel: 'OK',
    todayButtonLabel: "Aujourd'hui",
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    openPreviousView: 'Vue précédente',
    openNextView: 'Vue suivante',
    calendarViewSwitchingButtonAriaLabel: (view: string) =>
        view === 'year' ? 'Vue année ouverte, passer à la vue calendrier' : 'Vue calendrier ouverte, passer à la vue année',
    start: 'Début',
    end: 'Fin',
    fieldYearPlaceholder: (params: { digitAmount: number }) => 'A'.repeat(params.digitAmount),
    fieldMonthPlaceholder: (params: { contentType: string }) => params.contentType === 'letter' ? 'MMMM' : 'MM',
    fieldDayPlaceholder: () => 'JJ',
    fieldHoursPlaceholder: () => 'hh',
    fieldMinutesPlaceholder: () => 'mm',
};

export default function DateTimeInput({
    label,
    value,
    onChange,
    required = false,
    minDateTime,
    error,
    dateOnly = false
}: DateTimeInputProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Parse initial value
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    setSelectedDate(date);
                }
            } catch {
                setSelectedDate(null);
            }
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    // Handle date change
    const handleDateChange = (newValue: Date | null) => {
        setSelectedDate(newValue);
        if (newValue && !isNaN(newValue.getTime())) {
            if (dateOnly) {
                onChange(format(newValue, 'yyyy-MM-dd'));
            } else {
                onChange(format(newValue, "yyyy-MM-dd'T'HH:mm"));
            }
        } else {
            onChange('');
        }
    };

    const handleQuickAction = (action: 'today' | 'tomorrow' | 'next-week') => {
        const now = new Date();
        let targetDate: Date;

        switch (action) {
            case 'today':
                targetDate = setMinutes(setHours(now, now.getHours() + 1), 0);
                break;
            case 'tomorrow':
                targetDate = setMinutes(setHours(addDays(now, 1), 10), 0);
                break;
            case 'next-week':
                targetDate = setMinutes(setHours(addDays(now, 7), 10), 0);
                break;
            default:
                targetDate = now;
        }

        handleDateChange(targetDate);
    };

    const formatDisplayDate = () => {
        if (!selectedDate) return null;
        if (dateOnly) {
            return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr });
        }
        return format(selectedDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    };

    const minDate = minDateTime ? new Date(minDateTime) : undefined;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    {label}
                    {required && <Typography component="span" sx={{ color: 'error.main' }}>*</Typography>}
                </Typography>

                {/* Quick Actions */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickAction('today')}
                        sx={{
                            fontSize: '0.75rem',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            bgcolor: 'rgba(33, 150, 243, 0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.2)',
                                borderColor: 'primary.main'
                            }
                        }}
                    >
                        Aujourd'hui
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickAction('tomorrow')}
                        sx={{
                            fontSize: '0.75rem',
                            borderColor: 'secondary.main',
                            color: 'secondary.main',
                            bgcolor: 'rgba(156, 39, 176, 0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(156, 39, 176, 0.2)',
                                borderColor: 'secondary.main'
                            }
                        }}
                    >
                        Demain
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickAction('next-week')}
                        sx={{
                            fontSize: '0.75rem',
                            borderColor: 'success.main',
                            color: 'success.main',
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(76, 175, 80, 0.2)',
                                borderColor: 'success.main'
                            }
                        }}
                    >
                        Dans 7 jours
                    </Button>
                </Box>

                {/* Date/Time Picker */}
                {dateOnly ? (
                    <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        minDate={minDate}
                        format="dd/MM/yyyy"
                        localeText={frenchLocaleText}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error,
                                placeholder: 'Sélectionner une date',
                            },
                            actionBar: {
                                actions: ['clear', 'today', 'accept'],
                            },
                        }}
                    />
                ) : (
                    <DateTimePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        minDateTime={minDate}
                        format="dd/MM/yyyy HH:mm"
                        ampm={false}
                        localeText={frenchLocaleText}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error,
                                placeholder: 'Sélectionner date et heure',
                            },
                            actionBar: {
                                actions: ['clear', 'today', 'accept'],
                            },
                        }}
                    />
                )}

                {/* Display Formatted Date */}
                {selectedDate && (
                    <Paper
                        sx={{
                            p: 1.5,
                            bgcolor: 'rgba(33, 150, 243, 0.05)',
                            border: 1,
                            borderColor: 'rgba(33, 150, 243, 0.2)'
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 500,
                                textTransform: 'capitalize'
                            }}
                        >
                            {formatDisplayDate()}
                        </Typography>
                    </Paper>
                )}

                {/* Error Message */}
                {error && (
                    <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {error}
                    </Typography>
                )}
            </Box>
        </LocalizationProvider>
    );
}
