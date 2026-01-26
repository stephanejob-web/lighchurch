/**
 * Utility functions for calculating event status dynamically
 */

/**
 * Calculate the dynamic status of an event based on dates and cancellation
 * @param {Object} event - Event object with start_datetime, end_datetime, and cancelled_at
 * @returns {string} - Status: 'UPCOMING', 'ONGOING', 'COMPLETED', or 'CANCELLED'
 */
function computeEventStatus(event) {
    // If cancelled, always return CANCELLED regardless of dates
    if (event.cancelled_at) {
        return 'CANCELLED';
    }

    const now = new Date();
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);

    // Event hasn't started yet
    if (now < startDate) {
        return 'UPCOMING';
    }

    // Event is currently happening
    if (now >= startDate && now <= endDate) {
        return 'ONGOING';
    }

    // Event has ended
    return 'COMPLETED';
}

/**
 * Enrich a single event object with computed status
 * @param {Object} event - Event object
 * @returns {Object} - Event object with computed status
 */
function enrichEventWithStatus(event) {
    return {
        ...event,
        status: computeEventStatus(event)
    };
}

/**
 * Enrich an array of event objects with computed statuses
 * @param {Array} events - Array of event objects
 * @returns {Array} - Array of event objects with computed statuses
 */
function enrichEventsWithStatus(events) {
    return events.map(enrichEventWithStatus);
}

module.exports = {
    computeEventStatus,
    enrichEventWithStatus,
    enrichEventsWithStatus
};
