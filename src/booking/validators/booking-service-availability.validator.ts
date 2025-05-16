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

        // Helper function to parse time
        const parseTime = (time: string) => {
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
                            // 12 AM becomes 24:00 (end of day), 12 PM becomes 12:00
                            hours = period.toUpperCase() === 'AM' ? 24 : 12;
                        } else {
                            // For other hours, add 12 if PM
                            hours = (hours % 12) + (period.toUpperCase() === 'PM' ? 12 : 0);
                        }
                    }

                    date.setHours(hours, parseInt(minute));
                    return date;
                }
            }

            throw new Error(`Invalid time format: ${time}`);
        };

        return {
            start: parseTime(startTime),
            end: parseTime(endTime)
        };
    } catch (error) {
        throw new BadRequestException(`Invalid time range format: ${timeRange}. Expected format: "9:00 AM - 10:00 PM"`);
    }
}

function isWithinTimeRange(requestedTime: string, allowedTimeRange: string): boolean {
    try {
        const { start: allowedStart, end: allowedEnd } = parseTimeRange(allowedTimeRange);
        const requested = parseTimeRange(requestedTime + ' - ' + requestedTime).start;

        return requested >= allowedStart && requested <= allowedEnd;
    } catch (error) {
        throw new BadRequestException(`Invalid time format: ${requestedTime}. Expected format: "9:00 AM"`);
    }
}

