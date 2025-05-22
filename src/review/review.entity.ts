import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Venue } from '../venue/entities/venue.entity';
import {AutoMap} from "@automapper/classes";

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @AutoMap()
  user: User;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  @AutoMap()
  venue: Venue;

  @Column({ type: 'int' })
  @AutoMap()
  rating: number;

  @Column({ type: 'text' })
  @AutoMap()
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  photos: string[];

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  isVerified: boolean;

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;

  @UpdateDateColumn()
  @AutoMap()
  updatedAt: Date;
}
