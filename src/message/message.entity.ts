import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Booking } from '../booking/booking.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages)
  receiver: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  sentAt: Date;

  @ManyToOne(() => Booking, { nullable: true })
  booking: Booking;

  @Column({ default: false })
  read: boolean;
} 