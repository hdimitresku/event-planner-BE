import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MediaItem } from '../../media/entities/media.entity';
import { ServiceType } from '../../shared/enums/service-type.enum';
import { VenueType } from '../../shared/enums/venue-type.enum';
import {ServiceOption} from "@/service/entities/service-option.entity";
import {AutoMap} from "@automapper/classes";

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'provider_id' })
  @AutoMap()
  provider: User;

  @Column('enum', { array: true, enum: VenueType })
  @AutoMap()
  venueTypes: VenueType[];

  @Column({ type: 'jsonb' })
  @AutoMap()
  name: { [key: string]: string };

  @Column({ type: 'jsonb' })
  @AutoMap()
  description: { [key: string]: string };

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  @AutoMap()
  type: ServiceType;


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

  @Column({ type: 'varchar', nullable: true })
  @AutoMap()
  icon: string;

  @Column({ type: 'jsonb', nullable: true })
  @AutoMap()
  metadata: Record<string, any>;

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;

  @UpdateDateColumn()
  @AutoMap()
  updatedAt: Date;

  @OneToMany(() => ServiceOption, option => option.service, {cascade: true})
  @AutoMap()
  options: ServiceOption[];

  @OneToMany(() => MediaItem, media => media.service)
  @AutoMap()
  media: MediaItem[];
} 