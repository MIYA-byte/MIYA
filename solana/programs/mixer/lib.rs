use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Mixer111111111111111111111111111111111111111");

#[program]
pub mod miya_mixer {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        token_mint: Pubkey,
        deposit_amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.token_mint = token_mint;
        pool.deposit_amount = deposit_amount;
        pool.total_deposits = 0;
        pool.is_active = true;

        // Create a unique bump seed for the pool PDA
        let (_, bump) = Pubkey::find_program_address(
            &[
                b"miya_pool".as_ref(),
                token_mint.as_ref(),
                &deposit_amount.to_le_bytes(),
            ],
            ctx.program_id,
        );
        pool.bump = bump;

        msg!("Pool initialized for token mint: {}", token_mint);
        msg!("Deposit amount: {}", deposit_amount);

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, commitment: [u8; 32], nullifier_hash: [u8; 32]) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        // Ensure the pool is active
        require!(pool.is_active, MiyaError::PoolInactive);

        // Ensure the deposit amount matches the expected amount
        require!(
            ctx.accounts.user_token_account.amount >= pool.deposit_amount,
            MiyaError::InsufficientFunds
        );

        // Add commitment to the pool's merkle tree (simplified)
        let deposit_note = DepositNote {
            commitment,
            nullifier_hash,
            timestamp: Clock::get()?.unix_timestamp,
        };
        
        // Transfer tokens from user to pool account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.pool_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, pool.deposit_amount)?;

        // Update pool stats
        pool.total_deposits += 1;
        
        // Emit deposit event
        emit!(DepositEvent {
            pool: pool.key(),
            commitment,
            timestamp: deposit_note.timestamp,
        });

        msg!("Deposit successful, commitment added to pool");
        
        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        proof: Vec<u8>,
        nullifier: [u8; 32],
        recipient: Pubkey,
        relayer: Option<Pubkey>,
        fee: Option<u64>,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        // Ensure the pool is active
        require!(pool.is_active, MiyaError::PoolInactive);
        
        // Verify the provided proof (placeholder for actual zk-proof verification)
        // In a real implementation, this would call a zkengine program or verify on-chain
        require!(verify_proof(&proof, &nullifier, &recipient), MiyaError::InvalidProof);
        
        // Ensure the nullifier hasn't been used before
        require!(!is_nullifier_used(nullifier), MiyaError::NullifierAlreadyUsed);
        
        // Calculate the withdrawal amount
        let withdraw_amount = if let Some(fee_amount) = fee {
            pool.deposit_amount.checked_sub(fee_amount).ok_or(MiyaError::ArithmeticError)?
        } else {
            pool.deposit_amount
        };
        
        // Transfer tokens from pool to the recipient
        let seeds = &[
            b"miya_pool".as_ref(),
            pool.token_mint.as_ref(),
            &pool.deposit_amount.to_le_bytes(),
            &[pool.bump],
        ];
        let signer = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, withdraw_amount)?;
        
        // Pay fee to relayer if specified
        if let (Some(fee_amount), Some(_)) = (fee, relayer) {
            if fee_amount > 0 {
                let relayer_transfer_ctx = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.pool_token_account.to_account_info(),
                        to: ctx.accounts.relayer_token_account.to_account_info(),
                        authority: ctx.accounts.pool.to_account_info(),
                    },
                    signer,
                );
                token::transfer(relayer_transfer_ctx, fee_amount)?;
            }
        }
        
        // Mark the nullifier as used (simplified)
        // mark_nullifier_used(nullifier);
        
        // Emit withdrawal event
        emit!(WithdrawEvent {
            pool: pool.key(),
            nullifier,
            recipient,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Withdrawal successful");
        
        Ok(())
    }

    pub fn pause_pool(ctx: Context<UpdatePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(pool.is_active, MiyaError::PoolAlreadyPaused);
        
        // Only the pool authority can pause the pool
        require!(
            ctx.accounts.authority.key() == pool.authority,
            MiyaError::Unauthorized
        );
        
        pool.is_active = false;
        msg!("Pool paused");
        
        Ok(())
    }

    pub fn resume_pool(ctx: Context<UpdatePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.is_active, MiyaError::PoolAlreadyActive);
        
        // Only the pool authority can resume the pool
        require!(
            ctx.accounts.authority.key() == pool.authority,
            MiyaError::Unauthorized
        );
        
        pool.is_active = true;
        msg!("Pool resumed");
        
        Ok(())
    }
}

// Function to verify the zero-knowledge proof (placeholder implementation)
fn verify_proof(_proof: &[u8], _nullifier: &[u8; 32], _recipient: &Pubkey) -> bool {
    // This would call into the zkengine module or verify the proof on-chain
    // For now, return true for development purposes
    true
}

// Function to check if a nullifier has been used (placeholder implementation)
fn is_nullifier_used(_nullifier: [u8; 32]) -> bool {
    // This would check against a stored list of used nullifiers
    // For now, return false for development purposes
    false
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::LEN,
        seeds = [
            b"miya_pool",
            token_mint.key().as_ref(),
            &deposit_amount.to_le_bytes(),
        ],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [
            b"miya_pool",
            pool.token_mint.as_ref(),
            &pool.deposit_amount.to_le_bytes(),
        ],
        bump = pool.bump,
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == signer.key(),
        constraint = user_token_account.mint == pool.token_mint,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_token_account.owner == pool.key(),
        constraint = pool_token_account.mint == pool.token_mint,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [
            b"miya_pool",
            pool.token_mint.as_ref(),
            &pool.deposit_amount.to_le_bytes(),
        ],
        bump = pool.bump,
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        constraint = pool_token_account.owner == pool.key(),
        constraint = pool_token_account.mint == pool.token_mint,
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = recipient_token_account.mint == pool.token_mint,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    /// Optional relayer token account for fees
    #[account(
        mut,
        constraint = relayer_token_account.mint == pool.token_mint,
    )]
    pub relayer_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdatePool<'info> {
    #[account(
        mut,
        seeds = [
            b"miya_pool",
            pool.token_mint.as_ref(),
            &pool.deposit_amount.to_le_bytes(),
        ],
        bump = pool.bump,
    )]
    pub pool: Account<'info, Pool>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,        // Authority allowed to admin the pool
    pub token_mint: Pubkey,       // The token mint address
    pub deposit_amount: u64,      // Fixed amount for deposits
    pub total_deposits: u64,      // Number of deposits made
    pub is_active: bool,          // Whether the pool is active or paused
    pub bump: u8,                 // Bump seed for PDA
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 1 + 1;
}

#[derive(Debug)]
struct DepositNote {
    commitment: [u8; 32],
    nullifier_hash: [u8; 32],
    timestamp: i64,
}

#[event]
pub struct DepositEvent {
    pool: Pubkey,
    commitment: [u8; 32],
    timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pool: Pubkey,
    nullifier: [u8; 32],
    recipient: Pubkey,
    timestamp: i64,
}

#[error_code]
pub enum MiyaError {
    #[msg("Pool is not active")]
    PoolInactive,
    
    #[msg("Pool is already active")]
    PoolAlreadyActive,
    
    #[msg("Pool is already paused")]
    PoolAlreadyPaused,
    
    #[msg("Insufficient funds in user account")]
    InsufficientFunds,
    
    #[msg("Zero-knowledge proof verification failed")]
    InvalidProof,
    
    #[msg("Nullifier has already been used")]
    NullifierAlreadyUsed,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Arithmetic error")]
    ArithmeticError,
} 