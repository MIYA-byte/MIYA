// MIYA Protocol SDK
export * from './mixer';
export * from './bridge';
export * from './types';
export * from './utils';

import { MiyaMixerClient } from './mixer';
import { MiyaBridgeClient } from './bridge';

/**
 * Main MIYA SDK client class
 */
export class MiyaClient {
  public readonly mixer: MiyaMixerClient;
  public readonly bridge: MiyaBridgeClient;

  /**
   * Create a new MIYA client instance
   * 
   * @param config - Configuration options
   */
  constructor(config: {
    connection: any; // Solana web3.js Connection
    programIds?: {
      mixer?: string;
      zkengine?: string;
      bridge?: string;
      governance?: string;
    }
  }) {
    this.mixer = new MiyaMixerClient(config.connection, config.programIds?.mixer);
    this.bridge = new MiyaBridgeClient(config.connection, config.programIds?.bridge);
  }
} 