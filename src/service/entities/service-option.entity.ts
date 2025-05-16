import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {PriceInterface} from "@/shared/interfaces/price.interface";
import { Service } from './service.entity';
import {AutoMap} from "@automapper/classes";

@Entity('service_options')
export class ServiceOption {
    @PrimaryGeneratedColumn('uuid')
    @AutoMap()
    id: string;

    @Column({ type: 'jsonb' })
    @AutoMap()
    name: { [key: string]: string };

    @Column({ type: 'jsonb' })
    @AutoMap()
    description: { [key: string]: string };

    @Column({type: "jsonb"})
    @AutoMap()
    price: PriceInterface;

    @Column({type: 'jsonb', nullable: true})
    @AutoMap()
    metadata: Record<string, any>;

    @ManyToOne(() => Service, service => service.options)
    @JoinColumn({ name: 'id' })
    @AutoMap()
    service: Service;

    @CreateDateColumn()
    @AutoMap()
    createdAt: Date;

    @UpdateDateColumn()
    @AutoMap()
    updatedAt: Date;
} 