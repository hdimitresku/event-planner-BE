import {BadRequestException} from "@nestjs/common";



export function checkVenueDayAvailability
(
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    dayAvailability: Record<string, string>
) {
    try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const startDay = days[startDate.getDay()];
        const endDay = days[endDate.getDay()];

        // Check if the venue is open on the requested days
        if (!dayAvailability[startDay] || !dayAvailability[endDay]) {
            throw new BadRequestException(`Venue is not open on ${startDay} or ${endDay}`);
        }

// Check if the requested times are within the allowed hours
        if (!isWithinTimeRange(startTime, dayAvailability[startDay])) {
            throw new BadRequestException(`Booking start time is outside of venue's operating hours for ${startDay}`);
        }

        if (!isWithinTimeRange(endTime, dayAvailability[endDay])) {
            throw new BadRequestException(`Booking end time is outside of venue's operating hours for ${endDay}`);
        }
    } catch (error) {
        if (error instanceof BadRequestException) {
            throw error;
        }
        throw new BadRequestException(`Error checking availability: ${error.message}`);
    }
}

export function checkServiceDayAvailability(startDate: Date, endDate: Date, startTime: string, endTime: string, dayAvailability: Record<string, string>): void {
    try {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const startDay = days[startDate.getDay()];
        const endDay = days[endDate.getDay()];

        // Check if the venue is open on the requested days
        if (!dayAvailability[startDay] || !dayAvailability[endDay]
        ) {
            throw new BadRequestException(`Service is not open on ${startDay} or ${endDay}`);
        }

// Check if the requested times are within the allowed hours
        if (!isWithinTimeRange(startTime, dayAvailability[startDay])) {
            throw new BadRequestException(`Booking start time is outside of service's operating hours for ${startDay}`);
        }

        if (!isWithinTimeRange(endTime, dayAvailability[endDay])) {
            throw new BadRequestException(`Booking end time is outside of service's operating hours for ${endDay}`);
        }
    } catch
        (error) {
        if (error instanceof BadRequestException) {
            throw error;
        }
        throw new BadRequestException(`Error checking availability: ${error.message}`);
    }
}

function isWithinTimeRange(requestedTime: string, allowedTimeRange: string): boolean {
    try {
        // Handle 24/7 availability string
        if (allowedTimeRange.trim().toLowerCase() === '24/7') {
            return true; // 24/7 availability, any time is allowed
        }

        const { start: allowedStart, end: allowedEnd } = parseTimeRange(allowedTimeRange);
        const requested = parseIndividualTime(requestedTime);

        // Handle full day availability (e.g., "12:00 AM - 11:59 PM")
        if (allowedStart.getHours() === 0 && allowedStart.getMinutes() === 0 &&
            allowedEnd.getHours() === 23 && allowedEnd.getMinutes() === 59) {
            return true; // Full day, any time is allowed
        }

        // Handle normal time ranges
        if (allowedStart <= allowedEnd) {
            // Normal range within the same day
            return requested >= allowedStart && requested <= allowedEnd;
        } else {
            // Range crosses midnight
            return requested >= allowedStart || requested <= allowedEnd;
        }
    } catch (error) {
        throw new BadRequestException(`Invalid time format: ${requestedTime}. Expected formats: "9:00 AM", "21:00", "09:00", or "9:00 PM"`);
    }
}

function parseIndividualTime(timeStr: string): Date {
    const trimmed = timeStr.trim();

    // Check for 12-hour format (contains AM/PM)
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
        let [, hours, minutes, period] = ampmMatch;
        let hour24 = parseInt(hours);
        const min = parseInt(minutes);

        // Convert to 24-hour format
        if (period.toUpperCase() === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
            hour24 = 0;
        }

        if (hour24 < 0 || hour24 > 23 || min < 0 || min > 59) {
            throw new Error('Invalid time values');
        }

        const date = new Date();
        date.setHours(hour24, min, 0, 0);
        return date;
    }

    // Check for 24-hour format
    const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourMatch) {
        const [, hours, minutes] = twentyFourMatch;
        const hour24 = parseInt(hours);
        const min = parseInt(minutes);

        if (hour24 < 0 || hour24 > 23 || min < 0 || min > 59) {
            throw new Error('Invalid time values');
        }

        const date = new Date();
        date.setHours(hour24, min, 0, 0);
        return date;
    }

    throw new Error('Invalid time format');
}

function parseTimeRange(rangeStr: string): { start: Date; end: Date } {
    const parts = rangeStr.split('-').map(part => part.trim());
    if (parts.length !== 2) {
        throw new Error('Invalid time range format');
    }

    const start = parseIndividualTime(parts[0]);
    const end = parseIndividualTime(parts[1]);

    return { start, end };
}

