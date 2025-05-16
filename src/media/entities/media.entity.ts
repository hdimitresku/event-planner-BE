import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Venue } from '../../venue/entities/venue.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  venueId: string;

  @ManyToOne(() => Venue)
  venue: Venue;

  @Column({ nullable: true })
  serviceId: string;

  @ManyToOne(() => Service)
  service: Service;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 