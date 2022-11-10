import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelMessage } from './channelMessage.entity';
import { ChannelParticipant } from './channelParticipant.entity';

export type ChannelRestrictionType = 'public' | 'protected' | 'private';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['public', 'protected', 'private'],
    default: 'public',
  })
  restriction: ChannelRestrictionType;

  @Column({ select: false })
  password: string;

  @OneToMany(
    () => ChannelParticipant,
    (channelParticipant) => channelParticipant.user,
  )
  channelParticipants: ChannelParticipant[];

  @OneToMany(() => ChannelMessage, (channelMessage) => channelMessage.channel)
  channelMessages: ChannelMessage[];
}
