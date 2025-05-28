import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { User } from '../user/entities/user.entity';
import { Booking } from '../booking/entities/booking.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  CASH = 'cash',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @AutoMap()
  user: User;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  @AutoMap()
  booking: Booking;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @AutoMap()
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  @AutoMap()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @AutoMap()
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  @AutoMap()
  paymentMethod: PaymentMethod;

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  paymentDetails: {
    transactionId?: string;
    cardLast4?: string;
    cardBrand?: string;
    bankName?: string;
    accountNumber?: string;
  };

  @Column({ type: 'text', nullable: true })
  @AutoMap()
  failureReason: string;

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  metadata: Record<string, any>;

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;

  @UpdateDateColumn()
  @AutoMap()
  updatedAt: Date;
}