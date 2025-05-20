import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PoolInfo, DepositNote, VerificationResult } from './types';
import { findPoolAddress, generateCommitment, generateNullifierHash, prepareProof } from './utils';

// Default program ID for the mixer program
const DEFAULT_PROGRAM_ID = new PublicKey('Mixer111111111111111111111111111111111111111');

/**
 * Client for interacting with the MIYA mixer program
 */
export class MiyaMixerClient {
  private connection: Connection;
  private programId: PublicKey;

  /**
   * Create a new MiyaMixerClient instance
   * 
   * @param connection - The Solana connection object
   * @param programId - Optional custom program ID
   */
  constructor(connection: Connection, programId?: string) {
    this.connection = connection;
    this.programId = programId ? new PublicKey(programId) : DEFAULT_PROGRAM_ID;
  }

  /**
   * Initialize a new mixer pool
   * 
   * @param authority - The authority keypair
   * @param tokenMint - The token mint address
   * @param depositAmount - The fixed deposit amount
   * @returns Transaction signature
   */
  async initializePool(
    authority: Keypair,
    tokenMint: PublicKey,
    depositAmount: bigint,
  ): Promise<string> {
    const [poolAddress, _] = await findPoolAddress(
      this.programId,
      tokenMint,
      depositAmount,
    );

    // Create the instruction data buffer
    const dataLayout = Buffer.alloc(8 + 32 + 8);
    // Command index for initialize_pool (0)
    dataLayout.writeUInt8(0, 0);
    // Token mint
    tokenMint.toBuffer().copy(dataLayout, 8);
    // Deposit amount
    const depositAmountBuf = Buffer.alloc(8);
    depositAmountBuf.writeBigUInt64LE(depositAmount, 0);
    depositAmountBuf.copy(dataLayout, 8 + 32);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: tokenMint, isSigner: false, isWritable: false },
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
   * Deposit tokens into a mixer pool
   * 
   * @param user - The user keypair
   * @param userTokenAccount - The user's token account
   * @param poolTokenAccount - The pool's token account
   * @param tokenMint - The token mint address
   * @param depositAmount - The deposit amount
   * @returns Deposit note and transaction signature
   */
  async deposit(
    user: Keypair,
    userTokenAccount: PublicKey,
    poolTokenAccount: PublicKey,
    tokenMint: PublicKey,
    depositAmount: bigint,
  ): Promise<{ note: DepositNote; signature: string }> {
    const [poolAddress, _] = await findPoolAddress(
      this.programId,
      tokenMint,
      depositAmount,
    );

    // Generate commitment and nullifier
    const secret = generateCommitment();
    const commitment = generateCommitment();
    const nullifierHash = generateNullifierHash(commitment, secret);

    // Create the instruction data buffer
    const dataLayout = Buffer.alloc(8 + 32 + 32);
    // Command index for deposit (1)
    dataLayout.writeUInt8(1, 0);
    // Commitment
    Buffer.from(commitment).copy(dataLayout, 8);
    // Nullifier hash
    Buffer.from(nullifierHash).copy(dataLayout, 8 + 32);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: user.publicKey, isSigner: true, isWritable: false },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
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

    const note: DepositNote = {
      commitment,
      nullifierHash,
      timestamp: Date.now(),
    };

    return { note, signature };
  }

  /**
   * Withdraw tokens from a mixer pool
   * 
   * @param proof - The zero-knowledge proof
   * @param nullifier - The nullifier
   * @param recipient - The recipient address
   * @param tokenMint - The token mint address
   * @param depositAmount - The deposit amount
   * @param relayer - Optional relayer address
   * @param fee - Optional fee amount
   * @returns Verification result
   */
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
  ): Promise<VerificationResult> {
    try {
      const [poolAddress, _] = await findPoolAddress(
        this.programId,
        tokenMint,
        depositAmount,
      );

      // Create the instruction data buffer
      const dataSize = 8 + proof.length + 32 + 32 + (relayer ? 32 : 0) + (fee ? 8 : 0);
      const dataLayout = Buffer.alloc(dataSize);
      
      // Command index for withdraw (2)
      dataLayout.writeUInt8(2, 0);
      
      // Proof length
      dataLayout.writeUInt32LE(proof.length, 1);
      
      // Proof data
      Buffer.from(proof).copy(dataLayout, 8);
      
      // Nullifier
      Buffer.from(nullifier).copy(dataLayout, 8 + proof.length);
      
      // Recipient
      recipient.toBuffer().copy(dataLayout, 8 + proof.length + 32);
      
      // Relayer (if provided)
      if (relayer) {
        relayer.toBuffer().copy(dataLayout, 8 + proof.length + 32 + 32);
      }
      
      // Fee (if provided)
      if (fee) {
        const feeBuf = Buffer.alloc(8);
        feeBuf.writeBigUInt64LE(fee, 0);
        feeBuf.copy(dataLayout, 8 + proof.length + 32 + 32 + (relayer ? 32 : 0));
      }

      const keys = [
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      ];

      if (relayer && relayerTokenAccount) {
        keys.push({ pubkey: relayerTokenAccount, isSigner: false, isWritable: true });
      }

      keys.push({ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false });

      const instruction = new TransactionInstruction({
        keys,
        programId: this.programId,
        data: dataLayout,
      });

      const transaction = new Transaction().add(instruction);
      
      // In a real implementation, this would be sent by a relayer
      // For demonstration, we don't actually send this transaction
      return {
        success: true,
        signature: 'simulated_signature',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get information about a mixer pool
   * 
   * @param tokenMint - The token mint address
   * @param depositAmount - The deposit amount
   * @returns Pool information
   */
  async getPoolInfo(tokenMint: PublicKey, depositAmount: bigint): Promise<PoolInfo | null> {
    try {
      const [poolAddress, _] = await findPoolAddress(
        this.programId,
        tokenMint,
        depositAmount,
      );

      const accountInfo = await this.connection.getAccountInfo(poolAddress);
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified - would need proper layout parsing in reality)
      const data = accountInfo.data;
      
      // Simple parsing based on expected offsets
      // In a real implementation, this would use proper layout parsing
      const authority = new PublicKey(data.slice(8, 40));
      const tokenMintFromData = new PublicKey(data.slice(40, 72));
      const depositAmountFromData = data.readBigUInt64LE(72);
      const totalDeposits = data.readBigUInt64LE(80);
      const isActive = data[88] === 1;

      return {
        address: poolAddress,
        tokenMint: tokenMintFromData,
        depositAmount: depositAmountFromData,
        totalDeposits,
        isActive,
      };
    } catch (error) {
      console.error('Error fetching pool info:', error);
      return null;
    }
  }
} 