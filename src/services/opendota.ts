import { OPENDOTA_BASE_URL } from './constants';
export { OPENDOTA_BASE_URL };

// Export all types from the central types directory
export * from '@/types';

// Export all functions from domain-specific services for backward compatibility
export * from './playerService';
export * from './matchService';
export * from './heroService';
export * from './proSceneService';

// Import services to reconstruct the openDotaApi object
import * as playerService from './playerService';
import * as matchService from './matchService';
import * as heroService from './heroService';
import * as proSceneService from './proSceneService';

export const openDotaApi = {
  ...playerService,
  ...matchService,
  ...heroService,
  ...proSceneService,
};
