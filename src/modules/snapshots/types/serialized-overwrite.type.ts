import { OverwriteType } from 'discord.js';

export type SerializedOverwrite = {
  id: string;
  type: OverwriteType;
  allow: string;
  deny: string;
};
