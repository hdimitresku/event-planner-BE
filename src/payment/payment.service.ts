import {Injectable, NotFoundException, BadRequestException, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { User } from '../user/entities/user.entity';
import { BookingService } from '../booking/booking.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, user: User): Promise<PaymentDto> {
    const booking = await this.bookingService.findOne(createPaymentDto.bookingId, user);

    // Check if booking already has a completed payment
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        booking: { id: booking.id },
        status: PaymentStatus.COMPLETED,
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Booking already has a completed payment');
    }

    // Validate payment amount matches booking total
    if (createPaymentDto.amount !== booking.totalAmount) {
      throw new BadRequestException('Payment amount does not match booking total');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      user: { id: user.id },
      booking: { id: booking.id },
      status: PaymentStatus.PENDING,
    });

    // TODO: Integrate with payment gateway
    // For now, we'll simulate a successful payment
    payment.status = PaymentStatus.COMPLETED;
    payment.paymentDetails = {
      transactionId: `TXN_${Date.now()}`,
      ...createPaymentDto.paymentDetails,
    };

    const savedPayment = await this.paymentRepository.save(payment);
    return this.mapper.map(savedPayment, Payment, PaymentDto);
  }

  async findAll(user: User): Promise<PaymentDto[]> {
    const payments = await this.paymentRepository.find({
      where: { user: { id: user.id } },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
    return this.mapper.mapArray(payments, Payment, PaymentDto);
  }

  private async findPaymentEntity(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findOne(id: string, user: User): Promise<PaymentDto> {
    const payment = await this.findPaymentEntity(id);

    if (payment.user.id !== user.id) {
      throw new BadRequestException('You can only view your own payments');
    }

    return this.mapper.map(payment, Payment, PaymentDto);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, user: User): Promise<PaymentDto> {
    const payment = await this.findOne(id, user);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed payment');
    }

    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.paymentRepository.save(payment);
    return this.mapper.map(updatedPayment, Payment, PaymentDto);
  }

  async refund(id: string, user: User): Promise<PaymentDto> {
    const payment = await this.findOne(id, user);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // TODO: Integrate with payment gateway for refund
    payment.status = PaymentStatus.REFUNDED;
    const refundedPayment = await this.paymentRepository.save(payment);
    return this.mapper.map(refundedPayment, Payment, PaymentDto);
  }

  async cancel(id: string, user: User): Promise<PaymentDto> {
    const payment = await this.findOne(id, user);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    payment.status = PaymentStatus.CANCELLED;
    const cancelledPayment = await this.paymentRepository.save(payment);
    return this.mapper.map(cancelledPayment, Payment, PaymentDto);
  }
} 