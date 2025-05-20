import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ChainInfo, TokenPairInfo, VerificationResult } from './types';
import { findBridgeAddress, findTokenPairAddress, generateCommitment } from './utils';

// Default program ID for the bridge program
const DEFAULT_PROGRAM_ID = new PublicKey('Bridge1111111111111111111111111111111111111');

/**
 * Client for interacting with the MIYA bridge program
 */
export class MiyaBridgeClient {
  private connection: Connection;
  private programId: PublicKey;

  /**
   * Create a new MiyaBridgeClient instance
   * 
   * @param connection - The Solana connection object
   * @param programId - Optional custom program ID
   */
  constructor(connection: Connection, programId?: string) {
    this.connection = connection;
    this.programId = programId ? new PublicKey(programId) : DEFAULT_PROGRAM_ID;
  }

  /**
   * Initialize the bridge
   * 
   * @param authority - The authority keypair
   * @returns Transaction signature
   */
  async initializeBridge(authority: Keypair): Promise<string> {
    const [bridgeAddress, _] = await findBridgeAddress(this.programId);

    // Create the instruction data buffer
    const dataLayout = Buffer.alloc(8);
    // Command index for initialize_bridge (0)
    dataLayout.writeUInt8(0, 0);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: bridgeAddress, isSigner: false, isWritable: true },
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: dataLayout,
    });

    const transaction = new Transaction().add(instruction);
    
    return await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [authority],
    );
  }

  /**
   * Add a supported chain
   * 
   * @param authority - The authority keypair
   * @param chainId - The chain ID
   * @param chainName - The chain name
   * @param adapterProgram - The adapter program address
   * @returns Transaction signature
   */
  async addSupportedChain(
    authority: Keypair,
    chainId: number,
    chainName: string,
    adapterProgram: PublicKey,
  ): Promise<string> {
    const [bridgeAddress, _] = await findBridgeAddress(this.programId);

    // Chain seed for PDA derivation
    const chainSeed = Buffer.alloc(2);
    chainSeed.writeUInt16LE(chainId, 0);

    // Find supported chain PDA
    const [supportedChainAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('miya_chain'), chainSeed],
      this.programId,
    );

    // Create the instruction data buffer
    const nameBuffer = Buffer.from(chainName);
    const dataLayout = Buffer.alloc(8 + 2 + 4 + nameBuffer.length + 32);
    
    // Command index for add_supported_chain (1)
    dataLayout.writeUInt8(1, 0);
    
    // Chain ID
    dataLayout.writeUInt16LE(chainId, 8);
    
    // Chain name length
    dataLayout.writeUInt32LE(nameBuffer.length, 10);
    
    // Chain name
    nameBuffer.copy(dataLayout, 14);
    
    // Adapter program
    adapterProgram.toBuffer().copy(dataLayout, 14 + nameBuffer.length);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: bridgeAddress, isSigner: false, isWritable: false },
        { pubkey: supportedChainAddress, isSigner: false, isWritable: true },
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: dataLayout,
    });

    const transaction = new Transaction().add(instruction);
    
    return await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [authority],
    );
  }

  /**
   * Register a token pair for cross-chain transfers
   * 
   * @param authority - The authority keypair
   * @param sourceChainId - Source chain ID
   * @param targetChainId - Target chain ID
   * @param sourceTokenAddress - Source token address (on external chain)
   * @param targetTokenMint - Target token mint (on Solana)
   * @param feePercentage - Fee percentage in basis points (1/100 of a percent)
   * @returns Transaction signature
   */
  async registerTokenPair(
    authority: Keypair,
    sourceChainId: number,
    targetChainId: number,
    sourceTokenAddress: Uint8Array,
    targetTokenMint: PublicKey,
    feePercentage: number,
  ): Promise<string> {
    const [bridgeAddress, _] = await findBridgeAddress(this.programId);

    // Find source chain PDA
    const sourceChainSeed = Buffer.alloc(2);
    sourceChainSeed.writeUInt16LE(sourceChainId, 0);
    const [sourceChainAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('miya_chain'), sourceChainSeed],
      this.programId,
    );

    // Find target chain PDA
    const targetChainSeed = Buffer.alloc(2);
    targetChainSeed.writeUInt16LE(targetChainId, 0);
    const [targetChainAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('miya_chain'), targetChainSeed],
      this.programId,
    );

    // Find token pair PDA
    const [tokenPairAddress, tokenPairBump] = await findTokenPairAddress(
      this.programId,
      sourceChainId,
      targetChainId,
      targetTokenMint,
    );

    // Create the instruction data buffer
    const sourceTokenBuffer = Buffer.from(sourceTokenAddress);
    const dataLayout = Buffer.alloc(8 + 2 + 2 + 4 + sourceTokenBuffer.length + 2);
    
    // Command index for register_token_pair (3)
    dataLayout.writeUInt8(3, 0);
    
    // Source chain ID
    dataLayout.writeUInt16LE(sourceChainId, 8);
    
    // Target chain ID
    dataLayout.writeUInt16LE(targetChainId, 10);
    
    // Source token address length
    dataLayout.writeUInt32LE(sourceTokenBuffer.length, 12);
    
    // Source token address
    sourceTokenBuffer.copy(dataLayout, 16);
    
    // Fee percentage
    dataLayout.writeUInt16LE(feePercentage, 16 + sourceTokenBuffer.length);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: bridgeAddress, isSigner: false, isWritable: false },
        { pubkey: tokenPairAddress, isSigner: false, isWritable: true },
        { pubkey: sourceChainAddress, isSigner: false, isWritable: false },
        { pubkey: targetChainAddress, isSigner: false, isWritable: false },
        { pubkey: targetTokenMint, isSigner: false, isWritable: false },
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: dataLayout,
    });

    const transaction = new Transaction().add(instruction);
    
    return await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [authority],
    );
  }

  /**
   * Lock tokens for cross-chain transfer
   * 
   * @param user - The user keypair
   * @param userTokenAccount - The user's token account
   * @param bridgeVault - The bridge vault token account
   * @param targetChainId - Target chain ID
   * @param recipientAddress - Recipient address on target chain
   * @param tokenMint - Token mint address
   * @param amount - Amount to transfer
   * @returns Transaction signature and commitment
   */
  async lockTokens(
    user: Keypair,
    userTokenAccount: PublicKey,
    bridgeVault: PublicKey,
    targetChainId: number,
    recipientAddress: Uint8Array,
    tokenMint: PublicKey,
    sourceChainId: number,
    amount: bigint,
  ): Promise<{ signature: string; commitment: Uint8Array }> {
    const [bridgeAddress, _] = await findBridgeAddress(this.programId);

    // Find token pair
    const [tokenPairAddress] = await findTokenPairAddress(
      this.programId,
      sourceChainId,
      targetChainId,
      tokenMint,
    );

    // Generate commitment
    const commitment = generateCommitment();

    // Create the instruction data buffer
    const recipientBuffer = Buffer.from(recipientAddress);
    const dataLayout = Buffer.alloc(8 + 8 + 2 + 4 + recipientBuffer.length + 32);
    
    // Command index for lock_tokens (4)
    dataLayout.writeUInt8(4, 0);
    
    // Amount
    const amountBuf = Buffer.alloc(8);
    amountBuf.writeBigUInt64LE(amount, 0);
    amountBuf.copy(dataLayout, 8);
    
    // Target chain ID
    dataLayout.writeUInt16LE(targetChainId, 16);
    
    // Recipient address length
    dataLayout.writeUInt32LE(recipientBuffer.length, 18);
    
    // Recipient address
    recipientBuffer.copy(dataLayout, 22);
    
    // Commitment
    Buffer.from(commitment).copy(dataLayout, 22 + recipientBuffer.length);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: bridgeAddress, isSigner: false, isWritable: true },
        { pubkey: tokenPairAddress, isSigner: false, isWritable: true },
        { pubkey: user.publicKey, isSigner: true, isWritable: false },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: bridgeVault, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: dataLayout,
    });

    const transaction = new Transaction().add(instruction);
    
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [user],
    );

    return { signature, commitment };
  }

  /**
   * Get information about a supported chain
   * 
   * @param chainId - The chain ID
   * @returns Chain information
   */
  async getChainInfo(chainId: number): Promise<ChainInfo | null> {
    try {
      // Chain seed for PDA derivation
      const chainSeed = Buffer.alloc(2);
      chainSeed.writeUInt16LE(chainId, 0);

      // Find supported chain PDA
      const [supportedChainAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('miya_chain'), chainSeed],
        this.programId,
      );

      const accountInfo = await this.connection.getAccountInfo(supportedChainAddress);
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified - would need proper layout parsing in reality)
      const data = accountInfo.data;
      
      // Simple parsing based on expected offsets
      // In a real implementation, this would use proper layout parsing
      const chainIdFromData = data.readUInt16LE(8);
      // Extract chain name length and name
      const nameLength = Math.min(data.readUInt32LE(10), 32); // Ensure we don't exceed buffer
      const chainName = data.slice(14, 14 + nameLength).toString('utf8');
      const adapterProgram = new PublicKey(data.slice(14 + nameLength, 14 + nameLength + 32));
      const isActive = data[14 + nameLength + 32] === 1;
      const totalVolume = data.readBigUInt64LE(14 + nameLength + 32 + 1);

      return {
        chainId: chainIdFromData,
        chainName,
        adapterProgram,
        isActive,
        totalVolume,
      };
    } catch (error) {
      console.error('Error fetching chain info:', error);
      return null;
    }
  }

  /**
   * Get information about a token pair
   * 
   * @param sourceChainId - Source chain ID
   * @param targetChainId - Target chain ID
   * @param targetTokenMint - Target token mint address
   * @returns Token pair information
   */
  async getTokenPairInfo(
    sourceChainId: number,
    targetChainId: number,
    targetTokenMint: PublicKey,
  ): Promise<TokenPairInfo | null> {
    try {
      const [tokenPairAddress] = await findTokenPairAddress(
        this.programId,
        sourceChainId,
        targetChainId,
        targetTokenMint,
      );

      const accountInfo = await this.connection.getAccountInfo(tokenPairAddress);
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified - would need proper layout parsing in reality)
      const data = accountInfo.data;
      
      // Simple parsing based on expected offsets
      // In a real implementation, this would use proper layout parsing
      const sourceChainIdFromData = data.readUInt16LE(8);
      const targetChainIdFromData = data.readUInt16LE(10);
      
      // Extract source token address
      const sourceTokenLength = data.readUInt32LE(12);
      const sourceTokenAddress = data.slice(16, 16 + sourceTokenLength);
      
      const offset = 16 + sourceTokenLength;
      const targetTokenMintFromData = new PublicKey(data.slice(offset, offset + 32));
      const feePercentage = data.readUInt16LE(offset + 32);
      const isActive = data[offset + 34] === 1;
      const totalLocked = data.readBigUInt64LE(offset + 35);
      const totalReleased = data.readBigUInt64LE(offset + 43);

      return {
        sourceChainId: sourceChainIdFromData,
        targetChainId: targetChainIdFromData,
        sourceTokenAddress,
        targetTokenMint: targetTokenMintFromData,
        feePercentage,
        isActive,
        totalLocked,
        totalReleased,
      };
    } catch (error) {
      console.error('Error fetching token pair info:', error);
      return null;
    }
  }
} 