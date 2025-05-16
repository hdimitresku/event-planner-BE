import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Venue } from '../../venue/entities/venue.entity';

@Entity('external_reviews')
export class ExternalReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  venueId: string;

  @ManyToOne(() => Venue)
  venue: Venue;

  @Column()
  externalId: string;

  @Column()
  externalSource: string;

  @Column({ nullable: true })
  externalUrl: string;

  @Column('decimal', { precision: 2, scale: 1 })
  rating: number;

  @Column('text')
  comment: string;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  authorPhoto: string;

  @Column({ type: 'timestamp' })
  externalCreatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 