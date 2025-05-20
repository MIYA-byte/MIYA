import { PublicKey } from '@solana/web3.js';

/**
 * MIYA Pool information
 */
export interface PoolInfo {
  /** Pool address */
  address: PublicKey;
  /** Token mint address */
  tokenMint: PublicKey;
  /** Fixed deposit amount */
  depositAmount: bigint;
  /** Number of deposits made */
  totalDeposits: bigint;
  /** Whether the pool is active */
  isActive: boolean;
}

/**
 * Deposit note information
 */
export interface DepositNote {
  /** Cryptographic commitment */
  commitment: Uint8Array;
  /** Nullifier hash */
  nullifierHash: Uint8Array;
  /** Timestamp of deposit */
  timestamp: number;
}

/**
 * MIYA Bridge chain information
 */
export interface ChainInfo {
  /** Chain ID */
  chainId: number;
  /** Chain name */
  chainName: string;
  /** Adapter program address */
  adapterProgram: PublicKey;
  /** Whether the chain is active */
  isActive: boolean;
  /** Total volume processed */
  totalVolume: bigint;
}

/**
 * Token pair information for cross-chain transfers
 */
export interface TokenPairInfo {
  /** Source chain ID */
  sourceChainId: number;
  /** Target chain ID */
  targetChainId: number;
  /** Source token address (external chain) */
  sourceTokenAddress: Uint8Array;
  /** Target token mint (Solana) */
  targetTokenMint: PublicKey;
  /** Fee percentage in basis points (1/100 of a percent) */
  feePercentage: number;
  /** Whether the token pair is active */
  isActive: boolean;
  /** Total tokens locked */
  totalLocked: bigint;
  /** Total tokens released */
  totalReleased: bigint;
}

/**
 * Zero-knowledge proof verification result
 */
export interface VerificationResult {
  /** Whether verification succeeded */
  success: boolean;
  /** Transaction signature if successful */
  signature?: string;
  /** Error message if failed */
  error?: string;
} 