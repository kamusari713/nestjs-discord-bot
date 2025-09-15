import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SerializedOverwrite } from '../types/serialized-overwrite.type';

@Entity('channel_snapshots')
@Index('idx_snapshots_guild', ['guildId'])
export class ChannelSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  guildId!: string;

  @Column({ type: 'varchar', length: 32 })
  originalChannelId!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  parentId!: string | null;

  @Column({ type: 'int', nullable: true })
  position!: number | null;

  @Column({ type: 'int', nullable: true })
  userLimit!: number | null;

  @Column({ type: 'int', nullable: true })
  bitrate!: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  rtcRegion!: string | null;

  @Column({ type: 'jsonb' })
  permissionOverwrites!: SerializedOverwrite[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'boolean', default: false })
  restored!: boolean;
}
