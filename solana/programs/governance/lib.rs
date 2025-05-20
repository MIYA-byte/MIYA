use anchor_lang::prelude::*;

declare_id!("Governance111111111111111111111111111111111");

#[program]
pub mod miya_governance {
    use super::*;

    pub fn initialize_dao(ctx: Context<InitializeDao>, name: String, min_voting_period: i64, max_voting_period: i64) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.name = name;
        dao.min_voting_period = min_voting_period;
        dao.max_voting_period = max_voting_period;
        dao.proposal_count = 0;
        dao.is_active = true;
        
        msg!("DAO initialized: {}", name);
        
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        actions: Vec<ProposalAction>,
        voting_period: i64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        let proposer = &ctx.accounts.proposer;
        
        // Ensure the DAO is active
        require!(dao.is_active, GovernanceError::DaoInactive);
        
        // Validate proposal parameters
        require!(!title.is_empty(), GovernanceError::EmptyTitle);
        require!(!description.is_empty(), GovernanceError::EmptyDescription);
        require!(!actions.is_empty(), GovernanceError::NoActions);
        
        // Validate voting period
        require!(
            voting_period >= dao.min_voting_period && voting_period <= dao.max_voting_period,
            GovernanceError::InvalidVotingPeriod
        );
        
        // Calculate proposal end time
        let current_time = Clock::get()?.unix_timestamp;
        let end_time = current_time.checked_add(voting_period).ok_or(GovernanceError::ArithmeticError)?;
        
        // Setup the proposal
        proposal.dao = dao.key();
        proposal.proposer = proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.actions = actions;
        proposal.created_at = current_time;
        proposal.ends_at = end_time;
        proposal.is_executed = false;
        proposal.is_canceled = false;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.abstain_votes = 0;
        proposal.id = dao.proposal_count;
        
        // Increment proposal count
        dao.proposal_count = dao.proposal_count.checked_add(1).ok_or(GovernanceError::ArithmeticError)?;
        
        emit!(ProposalCreatedEvent {
            dao: dao.key(),
            proposal: proposal.key(),
            proposer: proposer.key(),
            id: proposal.id,
            timestamp: current_time,
        });
        
        msg!("Proposal created: {}", title);
        
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote: Vote,
        vote_weight: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = &ctx.accounts.voter;
        let vote_record = &mut ctx.accounts.vote_record;
        
        // Ensure the proposal is active
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time < proposal.ends_at,
            GovernanceError::VotingEnded
        );
        require!(
            !proposal.is_executed && !proposal.is_canceled,
            GovernanceError::ProposalNotActive
        );
        
        // Prevent double voting
        require!(
            !vote_record.has_voted,
            GovernanceError::AlreadyVoted
        );
        
        // Record the vote
        vote_record.proposal = proposal.key();
        vote_record.voter = voter.key();
        vote_record.vote = vote;
        vote_record.weight = vote_weight;
        vote_record.has_voted = true;
        vote_record.timestamp = current_time;
        
        // Update vote totals
        match vote {
            Vote::For => {
                proposal.for_votes = proposal.for_votes.checked_add(vote_weight).ok_or(GovernanceError::ArithmeticError)?;
            },
            Vote::Against => {
                proposal.against_votes = proposal.against_votes.checked_add(vote_weight).ok_or(GovernanceError::ArithmeticError)?;
            },
            Vote::Abstain => {
                proposal.abstain_votes = proposal.abstain_votes.checked_add(vote_weight).ok_or(GovernanceError::ArithmeticError)?;
            },
        }
        
        emit!(VoteCastEvent {
            dao: proposal.dao,
            proposal: proposal.key(),
            voter: voter.key(),
            vote,
            weight: vote_weight,
            timestamp: current_time,
        });
        
        msg!("Vote cast: {:?}", vote);
        
        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        
        // Ensure voting has ended
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time >= proposal.ends_at,
            GovernanceError::VotingNotEnded
        );
        
        // Ensure the proposal hasn't been executed or canceled
        require!(
            !proposal.is_executed && !proposal.is_canceled,
            GovernanceError::ProposalNotActive
        );
        
        // Check if proposal passed (simple majority)
        require!(
            proposal.for_votes > proposal.against_votes,
            GovernanceError::ProposalRejected
        );
        
        // Mark proposal as executed
        proposal.is_executed = true;
        
        // Execute the proposal actions (in a real implementation)
        // This would involve cross-program invocation to execute various actions
        // For this prototype, we just emit an event
        
        emit!(ProposalExecutedEvent {
            dao: proposal.dao,
            proposal: proposal.key(),
            executor: ctx.accounts.executor.key(),
            timestamp: current_time,
        });
        
        msg!("Proposal executed: {}", proposal.title);
        
        Ok(())
    }

    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let dao = &ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        
        // Ensure the proposal hasn't been executed
        require!(
            !proposal.is_executed && !proposal.is_canceled,
            GovernanceError::ProposalNotActive
        );
        
        // Only the proposer or DAO authority can cancel
        let is_proposer = ctx.accounts.canceler.key() == proposal.proposer;
        let is_authority = ctx.accounts.canceler.key() == dao.authority;
        require!(
            is_proposer || is_authority,
            GovernanceError::Unauthorized
        );
        
        // Mark proposal as canceled
        proposal.is_canceled = true;
        
        emit!(ProposalCanceledEvent {
            dao: dao.key(),
            proposal: proposal.key(),
            canceler: ctx.accounts.canceler.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Proposal canceled: {}", proposal.title);
        
        Ok(())
    }

    pub fn update_dao_settings(
        ctx: Context<UpdateDaoSettings>,
        name: Option<String>,
        min_voting_period: Option<i64>,
        max_voting_period: Option<i64>,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        
        // Only the DAO authority can update settings
        require!(
            ctx.accounts.authority.key() == dao.authority,
            GovernanceError::Unauthorized
        );
        
        // Update provided settings
        if let Some(new_name) = name {
            dao.name = new_name;
        }
        
        if let Some(new_min) = min_voting_period {
            dao.min_voting_period = new_min;
        }
        
        if let Some(new_max) = max_voting_period {
            dao.max_voting_period = new_max;
        }
        
        // Validate voting periods
        require!(
            dao.min_voting_period <= dao.max_voting_period,
            GovernanceError::InvalidVotingPeriod
        );
        
        emit!(DaoUpdatedEvent {
            dao: dao.key(),
            authority: dao.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("DAO settings updated: {}", dao.name);
        
        Ok(())
    }

    pub fn transfer_dao_authority(
        ctx: Context<TransferDaoAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        
        // Only the current DAO authority can transfer authority
        require!(
            ctx.accounts.authority.key() == dao.authority,
            GovernanceError::Unauthorized
        );
        
        // Update the authority
        let old_authority = dao.authority;
        dao.authority = new_authority;
        
        emit!(AuthorityTransferredEvent {
            dao: dao.key(),
            old_authority,
            new_authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("DAO authority transferred to: {}", new_authority);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Dao::LEN,
        seeds = [b"miya_dao", name.as_bytes()],
        bump
    )]
    pub dao: Account<'info, Dao>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        seeds = [b"miya_dao", dao.name.as_bytes()],
        bump
    )]
    pub dao: Account<'info, Dao>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::LEN,
        seeds = [
            b"miya_proposal",
            dao.key().as_ref(),
            &dao.proposal_count.to_le_bytes(),
        ],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::LEN,
        seeds = [
            b"miya_vote",
            proposal.key().as_ref(),
            voter.key().as_ref(),
        ],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    pub executor: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    pub dao: Account<'info, Dao>,
    
    #[account(
        mut,
        constraint = proposal.dao == dao.key()
    )]
    pub proposal: Account<'info, Proposal>,
    
    pub canceler: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateDaoSettings<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferDaoAuthority<'info> {
    #[account(mut)]
    pub dao: Account<'info, Dao>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct Dao {
    pub authority: Pubkey,
    pub name: String,
    pub min_voting_period: i64,
    pub max_voting_period: i64,
    pub proposal_count: u64,
    pub is_active: bool,
}

impl Dao {
    pub const LEN: usize = 32 + 36 + 8 + 8 + 8 + 1; // 36 bytes for String (4 + 32)
}

#[account]
pub struct Proposal {
    pub dao: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub actions: Vec<ProposalAction>,
    pub created_at: i64,
    pub ends_at: i64,
    pub is_executed: bool,
    pub is_canceled: bool,
    pub for_votes: u64,
    pub against_votes: u64,
    pub abstain_votes: u64,
    pub id: u64,
}

impl Proposal {
    pub const LEN: usize = 32 + 32 + 36 + 256 + 512 + 8 + 8 + 1 + 1 + 8 + 8 + 8 + 8;
    // 36 bytes for title String (4 + 32)
    // 256 bytes for description String (4 + 252)
    // 512 bytes for actions Vector (4 + ~508)
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: Vote,
    pub weight: u64,
    pub has_voted: bool,
    pub timestamp: i64,
}

impl VoteRecord {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 1 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Vote {
    For,
    Against,
    Abstain,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProposalAction {
    pub program_id: Pubkey,
    pub accounts: Vec<ActionAccount>,
    pub data: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ActionAccount {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

#[event]
pub struct ProposalCreatedEvent {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub proposer: Pubkey,
    pub id: u64,
    pub timestamp: i64,
}

#[event]
pub struct VoteCastEvent {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: Vote,
    pub weight: u64,
    pub timestamp: i64,
}

#[event]
pub struct ProposalExecutedEvent {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub executor: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProposalCanceledEvent {
    pub dao: Pubkey,
    pub proposal: Pubkey,
    pub canceler: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DaoUpdatedEvent {
    pub dao: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AuthorityTransferredEvent {
    pub dao: Pubkey,
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("DAO is not active")]
    DaoInactive,
    
    #[msg("Proposal title cannot be empty")]
    EmptyTitle,
    
    #[msg("Proposal description cannot be empty")]
    EmptyDescription,
    
    #[msg("Proposal must have at least one action")]
    NoActions,
    
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,
    
    #[msg("Voting has already ended")]
    VotingEnded,
    
    #[msg("Voting period has not ended yet")]
    VotingNotEnded,
    
    #[msg("Proposal is not active")]
    ProposalNotActive,
    
    #[msg("Voter has already voted on this proposal")]
    AlreadyVoted,
    
    #[msg("Proposal was rejected")]
    ProposalRejected,
    
    #[msg("Arithmetic error")]
    ArithmeticError,
} 