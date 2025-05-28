import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne} from 'typeorm';
import {Venue} from '@/venue/entities/venue.entity';
import {Service} from '@/service/entities/service.entity';
import {Booking} from '@/booking/entities/booking.entity';
import {Review} from "@/review/review.entity";
import {Message} from '@/message/entities/message.entity';
import {AutoMap} from "@automapper/classes";
import {AddressInterface} from "@/shared/interfaces/address.interface";

export enum UserRole {
    USER = 'user',
    HOST = 'host',
    ADMIN = 'admin'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    @AutoMap()
    id: string;

    @Column({unique: true})
    @AutoMap()
    email: string;

    @Column()
    password: string;

    @Column()
    @AutoMap()
    firstName: string;

    @Column()
    @AutoMap()
    lastName: string;

    @Column({nullable: true})
    @AutoMap()
    phoneNumber: string;

    @Column({nullable: true})
    @AutoMap()
    birthday: Date;

    @Column({nullable: true})
    @AutoMap()
    profilePicture: string;

    @Column({type: "jsonb", nullable: true})
    @AutoMap()
    address: AddressInterface;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    @AutoMap()
    role: UserRole;

    @OneToMany(() => Message, message => message.sender)
    @AutoMap()
    sentMessages: Message[];

    @OneToMany(() => Message, message => message.receiver)
    @AutoMap()
    receivedMessages: Message[];

    @OneToMany(() => Venue, venue => venue.owner)
    @AutoMap()
    venues: Venue[];

    @OneToMany(() => Service, service => service.provider)
    @AutoMap()
    services: Service[];

    @OneToMany(() => Review, review => review.user)
    @AutoMap()
    reviews: Review[];

    @OneToMany(() => Booking, booking => booking.user)
    @AutoMap()
    bookings: Booking[];

    @Column({type: 'jsonb', nullable: true})
    @AutoMap()
    metadata: Record<string, any>;

    @CreateDateColumn()
    @AutoMap()
    createdAt: Date;

    @UpdateDateColumn()
    @AutoMap()
    updatedAt: Date;
}  