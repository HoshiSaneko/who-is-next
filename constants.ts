
export * from './configs/upMembers.config';
export * from './configs/games.config';
export * from './configs/goddesses.config';
export * from './configs/stats.config';

// Alias exports to match existing component references
import { UP_MEMBERS_CONFIG } from './configs/upMembers.config';
import { GAMES_CONFIG } from './configs/games.config';
import { GODDESSES_CONFIG } from './configs/goddesses.config';

export const UP_MEMBERS = UP_MEMBERS_CONFIG;
export const GAMES_DATA = GAMES_CONFIG;
export const GODDESS_DATA = GODDESSES_CONFIG;
