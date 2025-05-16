import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Venue } from '../venue/entities/venue.entity';
import { Service } from '../service/entities/service.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum MediaEntityType {
  VENUE = 'venue',
  SERVICE = 'service',
}

@Entity('media_items')
export class MediaItem {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @Column()
  @AutoMap()
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  @AutoMap()
  type: MediaType;

  @Column('jsonb')
  @AutoMap()
  description: { en: string; sq: string };

  @Column({ type: 'enum', enum: MediaEntityType })
  @AutoMap()
  entityType: MediaEntityType;

  @Column()
  @AutoMap()
  entityId: string;

  @ManyToOne(() => Venue, venue => venue.media, { nullable: true })
  @AutoMap()
  venue: Venue;

  @ManyToOne(() => Service, service => service.media, { nullable: true })
  @AutoMap()
  service: Service;

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;

  @UpdateDateColumn()
  @AutoMap()
  updatedAt: Date;
}