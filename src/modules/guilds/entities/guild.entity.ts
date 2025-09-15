import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { Policy } from '../types/policy.type';

@Entity('guilds')
export class Guild {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  name!: string;

  @Column({ type: 'varchar', default: 'Europe/Moscow' })
  timezone!: string;

  @Column({ type: 'int', default: 23 })
  startHour!: number;

  @Column({ type: 'int', default: 7 })
  endHour!: number;

  @Column({ type: 'int', default: 0 })
  startMinute!: number;

  @Column({ type: 'int', default: 0 })
  endMinute!: number;

  @Column({ type: 'enum', enum: Policy, default: Policy.MOVE })
  policy!: Policy;

  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  @Column({ type: 'boolean', default: false })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'boolean', default: false })
  revoked!: boolean;
}
