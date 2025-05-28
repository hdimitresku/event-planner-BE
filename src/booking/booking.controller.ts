import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {GetUser} from "@/auth/decorators/get-user.decorator";
import {UserDto} from "@/user/dto/user.dto";

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: UserDto) {
    return this.bookingService.create(createBookingDto, user);
  }


  @Get('services')
  @UseGuards(JwtAuthGuard)
  findAllBookingsByOwnedServices(
      @GetUser('id') userId: string,
  ) {
    return this.bookingService.findAllBookingsByOwnedServices(userId);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.bookingService.findAll(userId);
  }

  @Get(':venueId')
  findAllByVenue(@GetUser('id') userId: string, @Param('venueId') venueId: string) {
    return this.bookingService.findAllByVenue(userId, venueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.bookingService.findOne(id, req.user);
  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ) {
    return this.bookingService.update(id, updateBookingDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.bookingService.remove(id, req.user);
  }

  @Patch(':id/venue-status')
  updateVenueBookingStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @Request() req,
  ) {
    return this.bookingService.updateVenueBookingStatus(
      id,
      updateStatusDto,
      req.user,
    );
  }

  @Patch(':id/service/:serviceId/status')
  updateServiceBookingStatus(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @Request() req,
  ) {
    return this.bookingService.updateServiceBookingStatus(
      id,
      serviceId,
      updateStatusDto,
      req.user,
    );
  }
} 