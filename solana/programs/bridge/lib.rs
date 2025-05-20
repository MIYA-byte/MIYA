use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Bridge1111111111111111111111111111111111111");

#[program]
pub mod miya_bridge {
    use super::*;

    pub fn initialize_bridge(ctx: Context<InitializeBridge>) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        bridge.authority = ctx.accounts.authority.key();
        bridge.is_active = true;
        bridge.supported_chain_count = 0;
        bridge.total_locked_tokens = 0;
        bridge.total_released_tokens = 0;
        
        msg!("Bridge initialized");
        
        Ok(())
    }

    pub fn add_supported_chain(
        ctx: Context<ManageSupportedChain>,
        chain_id: u16,
        chain_name: String,
        adapter_program: Pubkey,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        let supported_chain = &mut ctx.accounts.supported_chain;
        
        // Only the bridge authority can add supported chains
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        // Validate chain name length
        require!(chain_name.len() <= 32, BridgeError::ChainNameTooLong);
        
        supported_chain.chain_id = chain_id;
        supported_chain.chain_name = chain_name;
        supported_chain.adapter_program = adapter_program;
        supported_chain.is_active = true;
        supported_chain.total_volume = 0;
        
        bridge.supported_chain_count += 1;
        
        emit!(ChainSupportedEvent {
            chain_id,
            adapter_program,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Added supported chain: {}", chain_id);
        
        Ok(())
    }

    pub fn update_chain_status(
        ctx: Context<ManageSupportedChain>,
        is_active: bool,
    ) -> Result<()> {
        let bridge = &ctx.accounts.bridge;
        let supported_chain = &mut ctx.accounts.supported_chain;
        
        // Only the bridge authority can update chain status
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        supported_chain.is_active = is_active;
        
        msg!(
            "Updated chain status: {}, active: {}",
            supported_chain.chain_id,
            is_active
        );
        
        Ok(())
    }

    pub fn register_token_pair(
        ctx: Context<RegisterTokenPair>,
        source_chain_id: u16,
        target_chain_id: u16,
        source_token_address: Vec<u8>,
        fee_percentage: u16,
    ) -> Result<()> {
        let bridge = &ctx.accounts.bridge;
        let token_pair = &mut ctx.accounts.token_pair;
        
        // Only the bridge authority can register token pairs
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        // Validate fee percentage (max 10%)
        require!(fee_percentage <= 1000, BridgeError::FeeTooHigh);
        
        token_pair.source_chain_id = source_chain_id;
        token_pair.target_chain_id = target_chain_id;
        token_pair.source_token_address = source_token_address;
        token_pair.target_token_mint = ctx.accounts.target_token_mint.key();
        token_pair.fee_percentage = fee_percentage;
        token_pair.is_active = true;
        token_pair.total_locked = 0;
        token_pair.total_released = 0;
        
        emit!(TokenPairRegisteredEvent {
            source_chain_id,
            target_chain_id,
            target_token_mint: ctx.accounts.target_token_mint.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Registered token pair: {} -> {}", source_chain_id, target_chain_id);
        
        Ok(())
    }

    pub fn lock_tokens(
        ctx: Context<LockTokens>,
        amount: u64,
        target_chain_id: u16,
        recipient_address: Vec<u8>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        let token_pair = &mut ctx.accounts.token_pair;
        
        // Ensure the bridge is active
        require!(bridge.is_active, BridgeError::BridgeInactive);
        
        // Ensure the token pair is active
        require!(token_pair.is_active, BridgeError::TokenPairInactive);
        
        // Ensure the target chain matches the token pair
        require!(
            token_pair.target_chain_id == target_chain_id,
            BridgeError::ChainMismatch
        );
        
        // Validate recipient address (arbitrary check for demo)
        require!(
            recipient_address.len() > 0 && recipient_address.len() <= 64,
            BridgeError::InvalidRecipientAddress
        );
        
        // Transfer tokens from user to bridge vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.bridge_vault.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Update accounting
        token_pair.total_locked = token_pair.total_locked.checked_add(amount).ok_or(BridgeError::ArithmeticError)?;
        bridge.total_locked_tokens = bridge.total_locked_tokens.checked_add(amount).ok_or(BridgeError::ArithmeticError)?;
        
        // Create lock record (in a real implementation, this would be stored in a separate account)
        let lock_record = LockRecord {
            user: ctx.accounts.signer.key(),
            token_pair: token_pair.key(),
            amount,
            target_chain_id,
            recipient_address: recipient_address.clone(),
            commitment,
            timestamp: Clock::get()?.unix_timestamp,
        };
        
        emit!(TokensLockedEvent {
            user: lock_record.user,
            token_pair: lock_record.token_pair,
            amount: lock_record.amount,
            target_chain_id: lock_record.target_chain_id,
            commitment: lock_record.commitment,
            timestamp: lock_record.timestamp,
        });
        
        msg!("Tokens locked for cross-chain transfer: {}", amount);
        
        Ok(())
    }

    pub fn release_tokens(
        ctx: Context<ReleaseTokens>,
        amount: u64,
        source_chain_id: u16,
        proof: Vec<u8>,
        nullifier: [u8; 32],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        let token_pair = &mut ctx.accounts.token_pair;
        
        // Ensure the bridge is active
        require!(bridge.is_active, BridgeError::BridgeInactive);
        
        // Ensure the token pair is active
        require!(token_pair.is_active, BridgeError::TokenPairInactive);
        
        // Ensure the source chain matches the token pair
        require!(
            token_pair.source_chain_id == source_chain_id,
            BridgeError::ChainMismatch
        );
        
        // Verify proof (placeholder for actual zk-proof verification)
        // In a real implementation, this would call the zkengine program
        // require!(verify_proof(&proof, &nullifier), BridgeError::InvalidProof);
        
        // Ensure the nullifier hasn't been used before (placeholder)
        // require!(!is_nullifier_used(nullifier), BridgeError::NullifierAlreadyUsed);
        
        // Calculate fee
        let fee_amount = amount.checked_mul(token_pair.fee_percentage as u64)
            .ok_or(BridgeError::ArithmeticError)?
            .checked_div(10000).ok_or(BridgeError::ArithmeticError)?;
        
        let release_amount = amount.checked_sub(fee_amount).ok_or(BridgeError::ArithmeticError)?;
        
        // Transfer tokens from bridge vault to recipient
        let seeds = &[
            b"miya_bridge".as_ref(),
            &[bridge.bump],
        ];
        let signer = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bridge_vault.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.bridge.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, release_amount)?;
        
        // If there's a fee, transfer it to the fee account
        if fee_amount > 0 {
            let fee_transfer_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.bridge_vault.to_account_info(),
                    to: ctx.accounts.fee_account.to_account_info(),
                    authority: ctx.accounts.bridge.to_account_info(),
                },
                signer,
            );
            token::transfer(fee_transfer_ctx, fee_amount)?;
        }
        
        // Update accounting
        token_pair.total_released = token_pair.total_released.checked_add(amount).ok_or(BridgeError::ArithmeticError)?;
        bridge.total_released_tokens = bridge.total_released_tokens.checked_add(amount).ok_or(BridgeError::ArithmeticError)?;
        
        // Mark the nullifier as used (placeholder)
        // mark_nullifier_used(nullifier);
        
        emit!(TokensReleasedEvent {
            recipient: ctx.accounts.recipient.key(),
            token_pair: token_pair.key(),
            amount: release_amount,
            fee: fee_amount,
            source_chain_id,
            nullifier,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Tokens released: {}, fee: {}", release_amount, fee_amount);
        
        Ok(())
    }

    pub fn pause_bridge(ctx: Context<UpdateBridge>) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        require!(bridge.is_active, BridgeError::BridgeAlreadyPaused);
        
        // Only the bridge authority can pause the bridge
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        bridge.is_active = false;
        
        msg!("Bridge paused");
        
        Ok(())
    }

    pub fn resume_bridge(ctx: Context<UpdateBridge>) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        require!(!bridge.is_active, BridgeError::BridgeAlreadyActive);
        
        // Only the bridge authority can resume the bridge
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        bridge.is_active = true;
        
        msg!("Bridge resumed");
        
        Ok(())
    }
}

// Placeholder for proof verification
fn verify_proof(_proof: &[u8], _nullifier: &[u8; 32]) -> bool {
    // In a real implementation, this would call into the zkengine program
    true
}

// Placeholder for nullifier check
fn is_nullifier_used(_nullifier: [u8; 32]) -> bool {
    // In a real implementation, this would check a database of used nullifiers
    false
}

#[derive(Accounts)]
pub struct InitializeBridge<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Bridge::LEN,
        seeds = [b"miya_bridge"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageSupportedChain<'info> {
    #[account(seeds = [b"miya_bridge"], bump = bridge.bump)]
    pub bridge: Account<'info, Bridge>,
    
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + SupportedChain::LEN,
        seeds = [b"miya_chain", &chain_id.to_le_bytes()],
        bump
    )]
    pub supported_chain: Account<'info, SupportedChain>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterTokenPair<'info> {
    #[account(seeds = [b"miya_bridge"], bump = bridge.bump)]
    pub bridge: Account<'info, Bridge>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + TokenPair::LEN,
        seeds = [
            b"miya_token_pair",
            &source_chain_id.to_le_bytes(),
            &target_chain_id.to_le_bytes(),
            target_token_mint.key().as_ref(),
        ],
        bump
    )]
    pub token_pair: Account<'info, TokenPair>,
    
    #[account(
        constraint = supported_source_chain.chain_id == source_chain_id,
        constraint = supported_source_chain.is_active,
    )]
    pub supported_source_chain: Account<'info, SupportedChain>,
    
    #[account(
        constraint = supported_target_chain.chain_id == target_chain_id,
        constraint = supported_target_chain.is_active,
    )]
    pub supported_target_chain: Account<'info, SupportedChain>,
    
    pub target_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockTokens<'info> {
    #[account(
        mut,
        seeds = [b"miya_bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(
        mut,
        seeds = [
            b"miya_token_pair",
            &token_pair.source_chain_id.to_le_bytes(),
            &token_pair.target_chain_id.to_le_bytes(),
            token_pair.target_token_mint.as_ref(),
        ],
        bump = token_pair.bump,
    )]
    pub token_pair: Account<'info, TokenPair>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_token_account.owner == signer.key(),
        constraint = user_token_account.mint == token_pair.target_token_mint,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = bridge_vault.mint == token_pair.target_token_mint,
    )]
    pub bridge_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReleaseTokens<'info> {
    #[account(
        mut,
        seeds = [b"miya_bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    #[account(
        mut,
        seeds = [
            b"miya_token_pair",
            &token_pair.source_chain_id.to_le_bytes(),
            &token_pair.target_chain_id.to_le_bytes(),
            token_pair.target_token_mint.as_ref(),
        ],
        bump = token_pair.bump,
    )]
    pub token_pair: Account<'info, TokenPair>,
    
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    #[account(
        mut,
        constraint = recipient_token_account.owner == recipient.key(),
        constraint = recipient_token_account.mint == token_pair.target_token_mint,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = bridge_vault.mint == token_pair.target_token_mint,
    )]
    pub bridge_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = fee_account.mint == token_pair.target_token_mint,
    )]
    pub fee_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateBridge<'info> {
    #[account(
        mut,
        seeds = [b"miya_bridge"],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct Bridge {
    pub authority: Pubkey,
    pub is_active: bool,
    pub supported_chain_count: u16,
    pub total_locked_tokens: u64,
    pub total_released_tokens: u64,
    pub bump: u8,
}

impl Bridge {
    pub const LEN: usize = 32 + 1 + 2 + 8 + 8 + 1;
}

#[account]
pub struct SupportedChain {
    pub chain_id: u16,
    pub chain_name: String,
    pub adapter_program: Pubkey,
    pub is_active: bool,
    pub total_volume: u64,
}

impl SupportedChain {
    pub const LEN: usize = 2 + 36 + 32 + 1 + 8; // 36 bytes for String (4 + 32)
}

#[account]
pub struct TokenPair {
    pub source_chain_id: u16,
    pub target_chain_id: u16,
    pub source_token_address: Vec<u8>, // External chain token address
    pub target_token_mint: Pubkey,     // Solana token mint
    pub fee_percentage: u16,           // Fee in basis points (1/100 of a percent)
    pub is_active: bool,
    pub total_locked: u64,
    pub total_released: u64,
    pub bump: u8,
}

impl TokenPair {
    pub const LEN: usize = 2 + 2 + 68 + 32 + 2 + 1 + 8 + 8 + 1; // 68 bytes for Vec<u8> (4 + 64)
}

#[derive(Debug)]
struct LockRecord {
    user: Pubkey,
    token_pair: Pubkey,
    amount: u64,
    target_chain_id: u16,
    recipient_address: Vec<u8>,
    commitment: [u8; 32],
    timestamp: i64,
}

#[event]
pub struct ChainSupportedEvent {
    pub chain_id: u16,
    pub adapter_program: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TokenPairRegisteredEvent {
    pub source_chain_id: u16,
    pub target_chain_id: u16,
    pub target_token_mint: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TokensLockedEvent {
    pub user: Pubkey,
    pub token_pair: Pubkey,
    pub amount: u64,
    pub target_chain_id: u16,
    pub commitment: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct TokensReleasedEvent {
    pub recipient: Pubkey,
    pub token_pair: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub source_chain_id: u16,
    pub nullifier: [u8; 32],
    pub timestamp: i64,
}

#[error_code]
pub enum BridgeError {
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Bridge is not active")]
    BridgeInactive,
    
    #[msg("Bridge is already active")]
    BridgeAlreadyActive,
    
    #[msg("Bridge is already paused")]
    BridgeAlreadyPaused,
    
    #[msg("Token pair is not active")]
    TokenPairInactive,
    
    #[msg("Chain ID mismatch")]
    ChainMismatch,
    
    #[msg("Chain name too long")]
    ChainNameTooLong,
    
    #[msg("Fee percentage too high")]
    FeeTooHigh,
    
    #[msg("Invalid recipient address")]
    InvalidRecipientAddress,
    
    #[msg("Zero-knowledge proof verification failed")]
    InvalidProof,
    
    #[msg("Nullifier has already been used")]
    NullifierAlreadyUsed,
    
    #[msg("Arithmetic error")]
    ArithmeticError,
} 