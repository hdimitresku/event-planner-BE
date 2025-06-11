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

function parseTimeRange(timeRange: string): { start: Date, end: Date } {
    try {
        const [startTime, endTime] = timeRange.split(' - ');

        return {
            start: parseIndividualTime(startTime),
            end: parseIndividualTime(endTime)
        };
    } catch (error) {
        throw new BadRequestException(`Invalid time range format: ${timeRange}. Expected format: "9:00 AM - 10:00 PM" or "09:00 - 17:00"`);
    }
}

function parseIndividualTime(time: string): Date {
    // Try different time formats
    const formats = [
        /(\d+):(\d+)\s*(AM|PM)/i,  // 9:00 AM
        /(\d+)\s*(AM|PM)/i,        // 9 AM
        /(\d+):(\d+)/              // 24h format
    ];

    for (const format of formats) {
        const match = time.trim().match(format);
        if (match) {
            const [_, hour, minute = '0', period] = match;
            const date = new Date();
            let hours = parseInt(hour);

            if (period) {
                // Handle 12-hour format
                if (hours === 12) {
                    // 12 AM becomes 0:00 (midnight), 12 PM becomes 12:00 (noon)
                    hours = period.toUpperCase() === 'AM' ? 0 : 12;
                } else {
                    // For other hours, add 12 if PM
                    hours = (hours % 12) + (period.toUpperCase() === 'PM' ? 12 : 0);
                }
            }

            date.setHours(hours, parseInt(minute), 0, 0);
            return date;
        }
    }

    throw new Error(`Invalid time format: ${time}`);
}

function isWithinTimeRange(requestedTime: string, allowedTimeRange: string): boolean {
    try {
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
        throw new BadRequestException(`Invalid time format: ${requestedTime}. Expected format: "9:00 AM" or "09:00"`);
    }
}

