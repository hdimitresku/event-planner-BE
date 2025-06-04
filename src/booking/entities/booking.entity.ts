import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { User } from '@/user/entities/user.entity';
import { Venue } from '@/venue/entities/venue.entity';
import { ServiceOption } from '@/service/entities/service-option.entity';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

export enum EventType {
    PHOTOSHOOT = 'photoshoot',
    BABYSHOWER = 'babyshower',
    BAPTISM = 'baptism',
    GENDER_REVEAL = 'gender_reveal',
    SEASONAL_EVENT = 'seasonal_event',
    CORPORATE = 'corporate',
    WEDDING = 'wedding',
    CONFERENCE = 'conference',
    BIRTHDAY = 'birthday',
    ANNIVERSARY = 'anniversary',
    OTHER = 'other',
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    @AutoMap()
    id: string;

    @Column()
    @AutoMap()
    venueId: string;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venueId' })
    @AutoMap()
    venue: Venue;

    @Column()
    @AutoMap()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    @AutoMap()
    user: User;

    @Column({ type: 'date' })
    @AutoMap()
    startDate: Date;

    @Column({ type: 'date' })
    @AutoMap()
    endDate: Date;

    @Column({ type: 'time' })
    @AutoMap()
    startTime: string;

    @Column({ type: 'time' })
    @AutoMap()
    endTime: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @AutoMap()
    totalAmount: number;

    @Column({type: 'decimal', precision: 10, scale: 2, default: 5})
    @AutoMap()
    serviceFeePercentage: number;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    @AutoMap()
    status: BookingStatus;

    @Column({
        type: 'enum',
        enum: EventType,
        default: EventType.OTHER
    })
    @AutoMap()
    eventType: EventType;

    @Column({ type: 'text', nullable: true })
    @AutoMap()
    specialRequests: string;

    @Column({ type: 'int', default: 0 })
    @AutoMap()
    numberOfGuests: number;

    @ManyToMany(() => ServiceOption, { cascade: true })
    @JoinTable()
    @AutoMap()
    serviceOptions: ServiceOption[];

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