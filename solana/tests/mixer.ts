import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";
import { MiyaMixer } from "../target/types/miya_mixer";

describe("miya_mixer", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MiyaMixer as Program<MiyaMixer>;
  const authority = Keypair.generate();
  const user = Keypair.generate();
  let tokenMint: PublicKey;
  let userTokenAccount: PublicKey;
  let poolTokenAccount: PublicKey;
  let poolKey: PublicKey;
  let poolBump: number;
  
  const depositAmount = new anchor.BN(1_000_000_000); // 1 token with 9 decimals
  
  before(async () => {
    // Airdrop SOL to authority and user
    await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9
    );
    
    // Create user token account
    userTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user,
      tokenMint,
      user.publicKey
    );
    
    // Mint tokens to user
    await mintTo(
      provider.connection,
      authority,
      tokenMint,
      userTokenAccount,
      authority,
      depositAmount.toNumber()
    );
    
    // Derive the pool address
    [poolKey, poolBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("miya_pool"),
        tokenMint.toBuffer(),
        depositAmount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    
    // Create pool token account
    poolTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      authority,
      tokenMint,
      poolKey,
      true
    );
  });

  it("Initialize pool", async () => {
    // Initialize the pool
    await program.methods
      .initializePool(tokenMint, depositAmount)
      .accounts({
        pool: poolKey,
        authority: authority.publicKey,
        tokenMint: tokenMint,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();
    
    // Fetch the pool account
    const pool = await program.account.pool.fetch(poolKey);
    
    // Verify pool data
    assert.equal(pool.authority.toString(), authority.publicKey.toString());
    assert.equal(pool.tokenMint.toString(), tokenMint.toString());
    assert.equal(pool.depositAmount.toString(), depositAmount.toString());
    assert.equal(pool.totalDeposits.toString(), "0");
    assert.isTrue(pool.isActive);
    assert.equal(pool.bump, poolBump);
  });

  it("Deposit to pool", async () => {
    // Generate commitment and nullifier hash
    const commitment = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    const nullifierHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    
    // Deposit to the pool
    await program.methods
      .deposit(commitment, nullifierHash)
      .accounts({
        pool: poolKey,
        signer: user.publicKey,
        userTokenAccount: userTokenAccount,
        poolTokenAccount: poolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
    
    // Fetch the updated pool account
    const pool = await program.account.pool.fetch(poolKey);
    
    // Verify pool data
    assert.equal(pool.totalDeposits.toString(), "1");
  });

  it("Pause pool", async () => {
    // Pause the pool
    await program.methods
      .pausePool()
      .accounts({
        pool: poolKey,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
    
    // Fetch the updated pool account
    const pool = await program.account.pool.fetch(poolKey);
    
    // Verify pool status
    assert.isFalse(pool.isActive);
  });

  it("Resume pool", async () => {
    // Resume the pool
    await program.methods
      .resumePool()
      .accounts({
        pool: poolKey,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
    
    // Fetch the updated pool account
    const pool = await program.account.pool.fetch(poolKey);
    
    // Verify pool status
    assert.isTrue(pool.isActive);
  });

  // In a real-world scenario, we would also test withdraw functionality
  // However, that requires generating a valid zero-knowledge proof which
  // is beyond the scope of this prototype test
  it.skip("Withdraw from pool", async () => {
    // This would be implemented in a real test suite with actual ZK proofs
  });
}); 