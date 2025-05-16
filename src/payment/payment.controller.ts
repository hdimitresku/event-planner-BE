import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentService.create(createPaymentDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.paymentService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.paymentService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req,
  ) {
    return this.paymentService.update(id, updatePaymentDto, req.user);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Request() req) {
    return this.paymentService.refund(id, req.user);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.paymentService.cancel(id, req.user);
  }
} 