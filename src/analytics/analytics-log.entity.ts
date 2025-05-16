import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import {AutoMap} from "@automapper/classes";

@Entity('analytics_logs')
export class AnalyticsLog {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @Index()
  @Column({ nullable: true })
  @AutoMap()
  userId: string;

  @Column()
  @AutoMap()
  action: string;

  @Column('jsonb', { nullable: true })
  @AutoMap()
  details: any;

  @CreateDateColumn()
  @AutoMap()
  createdAt: Date;
} 