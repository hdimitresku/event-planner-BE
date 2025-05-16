import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Venue } from '../venue/entities/venue.entity';

@Entity('external_reviews')
export class ExternalReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column()
  source: string; // e.g., 'google', 'facebook'

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @Column()
  author: string;

  @CreateDateColumn()
  createdAt: Date;
} 