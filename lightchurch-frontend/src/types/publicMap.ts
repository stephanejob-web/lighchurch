/**
 * Types pour l'API publique de la carte
 */

export interface Church {
    id: number;
    church_name: string;
    longitude: number;
    latitude: number;
    denomination_name: string | null;
    pastor_name: string;
    city: string | null;
    postal_code: string | null;
    distance_km: number | null;
    logo_url?: string | null;
}

export interface ChurchDetails {
    id: number;
    church_name: string;
    denomination_id: number | null;
    longitude: number;
    latitude: number;
    denomination_name: string | null;
    first_name: string;
    last_name: string;
    email: string;
    details: {
        church_id?: number;
        address?: string;
        city?: string;
        postal_code?: string;
        country?: string;
        phone?: string;
        website?: string;
        description?: string;
        logo_url?: string;
        seating_capacity?: number;
        has_parking?: boolean;
        parking_info?: string;
        parking_capacity?: number;
        accessibility_features?: boolean;
    };
    schedules: ChurchSchedule[];
    socials: ChurchSocial[];
}

export interface ChurchSchedule {
    id: number;
    day_of_week: string;
    start_time: string;
    activity_type: string | null;
}

export interface ChurchSocial {
    platform: string;
    url: string;
}

export interface Event {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string | null;
    created_at: string;
    updated_at: string;
    longitude: number;
    latitude: number;
    church_name: string;
    church_id: number;
    event_address: string | null;
    event_city: string | null;
    event_postal_code: string | null;
    distance_km: number | null;
    interested_count?: number;
    image_url?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
}

export interface Language {
    code: string;
    name: string;
    flag: string | null;
}

export interface EventDetails {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string | null;
    created_at: string;
    updated_at: string;
    longitude: number;
    latitude: number;
    church_name: string;
    church_id: number;
    organizer_name: string;
    primary_language: Language | null;
    translations: Language[];
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    cancelled_by?: number | null;
    details: {
        event_id?: number;
        description?: string;
        max_seats?: number;
        image_url?: string;
        address?: string;
        street_number?: string;
        street_name?: string;
        postal_code?: string;
        city?: string;
        country?: string;
        speaker_name?: string;
        has_parking?: boolean;
        parking_capacity?: number;
        is_parking_free?: boolean;
        parking_details?: string;
        is_free?: boolean;
        registration_link?: string;
        youtube_live?: string;
        contact_email?: string;
        contact_phone?: string;
    };
    church: {
        id: number;
        church_name: string;
        denomination_id: number | null;
        denomination_name: string | null;
        pastor_first_name: string;
        pastor_last_name: string;
        pastor_email: string;
        details: {
            church_id?: number;
            address?: string;
            city?: string;
            postal_code?: string;
            country?: string;
            phone?: string;
            website?: string;
            description?: string;
            logo_url?: string;
            seating_capacity?: number;
            has_parking?: boolean;
            parking_info?: string;
            parking_capacity?: number;
            accessibility_features?: boolean;
        } | null;
        schedules: ChurchSchedule[];
        socials: ChurchSocial[];
    } | null;
    interested_count?: number;
}

export interface Denomination {
    id: number;
    name: string;
}

export interface MapFilters {
    radius: number;
    denominationId: number | null;
    showChurches: boolean;
    showEvents: boolean;
    search: string;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface ApiResponse<T> {
    success: boolean;
    count?: number;
    message?: string;
    churches?: T extends Church[] ? T : never;
    events?: T extends Event[] ? T : never;
    denominations?: T extends Denomination[] ? T : never;
    church?: T extends ChurchDetails ? T : never;
    event?: T extends EventDetails ? T : never;
    stats?: T extends { churches: number; events: number } ? T : never;
}
