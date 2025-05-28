import {ServiceDto} from "@/service/dto/service.dto";
import {BookingDto} from "@/booking/dto/booking.dto";

export class ServiceWithBookingsDto extends ServiceDto {
    bookings: BookingDto[];
}