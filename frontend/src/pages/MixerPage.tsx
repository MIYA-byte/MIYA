import React, { useState } from 'react';
import styled from 'styled-components';
import { useWallet } from '@solana/wallet-adapter-react';

const MixerPage: React.FC = () => {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedChain, setSelectedChain] = useState('solana');

  // This would be populated from actual available pools
  const availablePools = [
    { name: 'SOL', sizes: [0.1, 1, 10, 100] },
    { name: 'USDC', sizes: [10, 100, 1000, 10000] },
    { name: 'USDT', sizes: [10, 100, 1000, 10000] },
  ];

  // This would be populated from actual supported chains
  const supportedChains = [
    { id: 'solana', name: 'Solana' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'bsc', name: 'BSC' },
  ];

  const [selectedPool, setSelectedPool] = useState(availablePools[0]);
  const [selectedSize, setSelectedSize] = useState(selectedPool.sizes[0]);

  const handleDeposit = () => {
    // Implementation would connect to the Solana program
    console.log('Depositing', selectedSize, selectedPool.name);
  };

  const handleWithdraw = () => {
    // Implementation would connect to the Solana program
    console.log('Withdrawing to', recipient);
  };

  return (
    <PageContainer>
      <PageTitle>MIYA Mixer</PageTitle>
      
      {!connected ? (
        <NotConnectedMessage>Please connect your wallet to use the mixer</NotConnectedMessage>
      ) : (
        <>
          <TabContainer>
            <Tab 
              isActive={activeTab === 'deposit'} 
              onClick={() => setActiveTab('deposit')}
            >
              Deposit
            </Tab>
            <Tab 
              isActive={activeTab === 'withdraw'} 
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </Tab>
          </TabContainer>

          <MixerCard>
            {activeTab === 'deposit' ? (
              // Deposit Form
              <FormContainer>
                <FormGroup>
                  <Label>Select token</Label>
                  <TokenSelector>
                    {availablePools.map(pool => (
                      <TokenOption 
                        key={pool.name}
                        isSelected={selectedPool.name === pool.name}
                        onClick={() => {
                          setSelectedPool(pool);
                          setSelectedSize(pool.sizes[0]);
                        }}
                      >
                        {pool.name}
                      </TokenOption>
                    ))}
                  </TokenSelector>
                </FormGroup>

                <FormGroup>
                  <Label>Select amount</Label>
                  <AmountSelector>
                    {selectedPool.sizes.map(size => (
                      <AmountOption 
                        key={size}
                        isSelected={selectedSize === size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size} {selectedPool.name}
                      </AmountOption>
                    ))}
                  </AmountSelector>
                </FormGroup>

                <ActionButton onClick={handleDeposit}>
                  Deposit {selectedSize} {selectedPool.name}
                </ActionButton>
              </FormContainer>
            ) : (
              // Withdraw Form
              <FormContainer>
                <FormGroup>
                  <Label>Target chain</Label>
                  <TokenSelector>
                    {supportedChains.map(chain => (
                      <TokenOption 
                        key={chain.id}
                        isSelected={selectedChain === chain.id}
                        onClick={() => setSelectedChain(chain.id)}
                      >
                        {chain.name}
                      </TokenOption>
                    ))}
                  </TokenSelector>
                </FormGroup>

                <FormGroup>
                  <Label>Recipient address</Label>
                  <Input 
                    type="text"
                    placeholder="Enter recipient address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </FormGroup>

                <ActionButton 
                  onClick={handleWithdraw}
                  disabled={!recipient}
                >
                  Withdraw
                </ActionButton>
              </FormContainer>
            )}
          </MixerCard>

          <DisclaimerText>
            MIYA Mixer uses zero-knowledge proofs to ensure complete privacy.
            No connection between deposits and withdrawals can be traced.
          </DisclaimerText>
        </>
      )}
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NotConnectedMessage = styled.div`
  background: var(--card-background);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 18px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

interface ActiveProps {
  isActive: boolean;
}

const Tab = styled.button<ActiveProps>`
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
  position: relative;
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-color);
    transform: scaleX(${props => props.isActive ? 1 : 0});
    transition: transform 0.3s ease;
  }
`;

const MixerCard = styled.div`
  background: var(--card-background);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-secondary);
`;

const TokenSelector = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const TokenOption = styled.button<ActiveProps>`
  background: ${props => props.isSelected ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isSelected ? 'white' : 'var(--text-secondary)'};
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isSelected ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const AmountSelector = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const AmountOption = styled.button<ActiveProps>`
  background: ${props => props.isSelected ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isSelected ? 'white' : 'var(--text-secondary)'};
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isSelected ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--text-color);
  font-size: 16px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(109, 90, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DisclaimerText = styled.p`
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
`;

export default MixerPage; 