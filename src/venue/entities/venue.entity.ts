import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { Booking } from '@/booking/booking.entity';
import { MediaItem } from '@/media/media.entity';
import { Review } from '@/review/review.entity';
import { VenueType } from '@/shared/enums/venue-type.enum';
import {AddressInterface} from "@/shared/interfaces/address.interface";
import {VenueCapacityInterface} from "@/shared/interfaces/venue-capacity.interface";
import {PriceInterface} from "@/shared/interfaces/price.interface";
import {AutoMap} from "@automapper/classes";

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id' })
  @AutoMap()
  owner: User;

  @Column({ type: 'jsonb' })
  @AutoMap()
  name: { [key: string]: string };

  @Column({ type: 'jsonb' })
  @AutoMap()
  description: { [key: string]: string };

  @Column({
    type: 'enum',
    enum: VenueType,
  })
  @AutoMap()
  type: VenueType;

  @Column({type: 'jsonb'})
  @AutoMap()
  address: AddressInterface;

  @Column({ type: 'jsonb' })
  @AutoMap()
  capacity: VenueCapacityInterface;

  @Column({ type: 'jsonb' })
  @AutoMap()
  price: PriceInterface;

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  amenities: string[];

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  dayAvailability: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  @Column({ default: true })
  @AutoMap()
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  metadata: Record<string, any>;

  @OneToMany(() => Booking, booking => booking.venue)
  @AutoMap()
  bookings: Booking[];

  @OneToMany(() => MediaItem, media => media.venue)
  @AutoMap()
  media: MediaItem[];

  @OneToMany(() => Review, review => review.venue)
  @AutoMap()
  reviews: Review[];

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;

  @UpdateDateColumn()
  @AutoMap()
  updatedAt: Date;
} 