import { NhostClient } from '@nhost/nhost-js';

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_REACT_APP_NHOST_SUBDOMAIN || 'localhost',
  region: import.meta.env.VITE_REACT_APP_NHOST_REGION || 'local',
});