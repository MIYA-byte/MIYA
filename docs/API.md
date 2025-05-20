# MIYA Protocol API Reference

This document provides an overview of the API endpoints and SDK functions available for interacting with the MIYA Protocol.

## SDK Installation

```bash
npm install miya-sdk
```

## SDK Usage

```javascript
import { MiyaClient } from 'miya-sdk';
import { Connection } from '@solana/web3.js';

// Initialize the client
const connection = new Connection('https://api.devnet.solana.com');
const miyaClient = new MiyaClient({ connection });

// Now you can use the client to interact with the protocol
const pools = await miyaClient.mixer.getPools();
```

## Core SDK Classes

### MiyaClient

The main client for interacting with the MIYA Protocol.

```typescript
class MiyaClient {
  mixer: MiyaMixerClient;
  bridge: MiyaBridgeClient;
  
  constructor(config: {
    connection: Connection;
    programIds?: {
      mixer?: string;
      zkengine?: string;
      bridge?: string;
      governance?: string;
    }
  });
}
```

### MiyaMixerClient

Client for interacting with the mixer program.

```typescript
class MiyaMixerClient {
  constructor(connection: Connection, programId?: string);
  
  // Initialize a new mixer pool
  async initializePool(
    authority: Keypair,
    tokenMint: PublicKey,
    depositAmount: bigint,
  ): Promise<string>;
  
  // Deposit tokens into a mixer pool
  async deposit(
    user: Keypair,
    userTokenAccount: PublicKey,
    poolTokenAccount: PublicKey,
    tokenMint: PublicKey,
    depositAmount: bigint,
  ): Promise<{ note: DepositNote; signature: string }>;
  
  // Withdraw tokens from a mixer pool
  async withdraw(
    proof: Uint8Array,
    nullifier: Uint8Array,
    recipient: PublicKey,
    recipientTokenAccount: PublicKey,
    poolTokenAccount: PublicKey,
    tokenMint: PublicKey,
    depositAmount: bigint,
    relayer?: PublicKey,
    relayerTokenAccount?: PublicKey,
    fee?: bigint,
  ): Promise<VerificationResult>;
  
  // Get information about a mixer pool
  async getPoolInfo(
    tokenMint: PublicKey,
    depositAmount: bigint,
  ): Promise<PoolInfo | null>;
}
```

### MiyaBridgeClient

Client for interacting with the bridge program.

```typescript
class MiyaBridgeClient {
  constructor(connection: Connection, programId?: string);
  
  // Initialize the bridge
  async initializeBridge(authority: Keypair): Promise<string>;
  
  // Add a supported chain
  async addSupportedChain(
    authority: Keypair,
    chainId: number,
    chainName: string,
    adapterProgram: PublicKey,
  ): Promise<string>;
  
  // Register a token pair for cross-chain transfers
  async registerTokenPair(
    authority: Keypair,
    sourceChainId: number,
    targetChainId: number,
    sourceTokenAddress: Uint8Array,
    targetTokenMint: PublicKey,
    feePercentage: number,
  ): Promise<string>;
  
  // Lock tokens for cross-chain transfer
  async lockTokens(
    user: Keypair,
    userTokenAccount: PublicKey,
    bridgeVault: PublicKey,
    targetChainId: number,
    recipientAddress: Uint8Array,
    tokenMint: PublicKey,
    sourceChainId: number,
    amount: bigint,
  ): Promise<{ signature: string; commitment: Uint8Array }>;
  
  // Get information about a supported chain
  async getChainInfo(chainId: number): Promise<ChainInfo | null>;
  
  // Get information about a token pair
  async getTokenPairInfo(
    sourceChainId: number,
    targetChainId: number,
    targetTokenMint: PublicKey,
  ): Promise<TokenPairInfo | null>;
}
```

## Type Definitions

### PoolInfo

```typescript
interface PoolInfo {
  address: PublicKey;
  tokenMint: PublicKey;
  depositAmount: bigint;
  totalDeposits: bigint;
  isActive: boolean;
}
```

### DepositNote

```typescript
interface DepositNote {
  commitment: Uint8Array;
  nullifierHash: Uint8Array;
  timestamp: number;
}
```

### ChainInfo

```typescript
interface ChainInfo {
  chainId: number;
  chainName: string;
  adapterProgram: PublicKey;
  isActive: boolean;
  totalVolume: bigint;
}
```

### TokenPairInfo

```typescript
interface TokenPairInfo {
  sourceChainId: number;
  targetChainId: number;
  sourceTokenAddress: Uint8Array;
  targetTokenMint: PublicKey;
  feePercentage: number;
  isActive: boolean;
  totalLocked: bigint;
  totalReleased: bigint;
}
```

### VerificationResult

```typescript
interface VerificationResult {
  success: boolean;
  signature?: string;
  error?: string;
}
```

## Utility Functions

```typescript
// Generate a random cryptographic commitment
function generateCommitment(): Uint8Array;

// Generate a nullifier hash from a commitment and a secret
function generateNullifierHash(commitment: Uint8Array, secret: Uint8Array): Uint8Array;

// Find a pool address for a given token mint and deposit amount
async function findPoolAddress(
  programId: PublicKey,
  tokenMint: PublicKey,
  depositAmount: bigint,
): Promise<[PublicKey, number]>;

// Find a bridge address
async function findBridgeAddress(
  programId: PublicKey,
): Promise<[PublicKey, number]>;

// Find a token pair address for cross-chain transfers
async function findTokenPairAddress(
  programId: PublicKey,
  sourceChainId: number,
  targetChainId: number,
  targetTokenMint: PublicKey,
): Promise<[PublicKey, number]>;

// Prepare a proof for verification
function prepareProof(
  commitment: Uint8Array,
  nullifier: Uint8Array,
  recipient: PublicKey,
): Uint8Array;
```

## REST API Endpoints

The following REST API endpoints are available for interacting with the MIYA Protocol:

### Mixer Endpoints

```
GET /api/v1/mixer/pools
GET /api/v1/mixer/pool/:tokenMint/:depositAmount
POST /api/v1/mixer/deposit
POST /api/v1/mixer/withdraw
```

### Bridge Endpoints

```
GET /api/v1/bridge/chains
GET /api/v1/bridge/chain/:chainId
GET /api/v1/bridge/token-pairs
GET /api/v1/bridge/token-pair/:sourceChainId/:targetChainId/:targetTokenMint
POST /api/v1/bridge/lock-tokens
```

### Transaction History

```
GET /api/v1/transactions/:walletAddress
```

## WebSocket API

Real-time updates can be subscribed to using WebSocket connections:

```
ws://api.miya.baby/ws
```

### Events

- `pool_update`: Emitted when a pool's state changes
- `deposit_confirmed`: Emitted when a deposit is confirmed
- `withdrawal_confirmed`: Emitted when a withdrawal is confirmed
- `bridge_transfer_initiated`: Emitted when a cross-chain transfer is initiated
- `bridge_transfer_completed`: Emitted when a cross-chain transfer is completed

## Rate Limits

API rate limits:
- 100 requests per minute for public endpoints
- 300 requests per minute for authenticated users

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

## Sandbox Environment

A sandbox environment is available for testing:

```
https://sandbox.api.miya.baby
``` 