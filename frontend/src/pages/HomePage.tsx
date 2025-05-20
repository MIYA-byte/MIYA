import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { connected } = useWallet();

  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle>Privacy-First Cross-Chain Transfers</HeroTitle>
        <HeroSubtitle>
          MIYA is a revolutionary cross-chain mixing protocol built on the Solana blockchain,
          designed to provide seamless and private cross-chain asset transfers.
        </HeroSubtitle>
        <ButtonGroup>
          {connected ? (
            <PrimaryButton to="/mixer">Launch App</PrimaryButton>
          ) : (
            <ConnectMessage>Connect your wallet to get started</ConnectMessage>
          )}
          <SecondaryButton href="https://docs.miya.baby" target="_blank">
            Learn More
          </SecondaryButton>
        </ButtonGroup>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Key Features</SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Private Asset Pools</FeatureTitle>
            <FeatureDescription>
              Deposit assets and withdraw the equivalent amount at any time, with no traceable
              connection between deposit and withdrawal.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🌉</FeatureIcon>
            <FeatureTitle>Cross-Chain Bridge</FeatureTitle>
            <FeatureDescription>
              Transfer assets securely and privately across chains with a single click,
              maintaining complete anonymity.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔐</FeatureIcon>
            <FeatureTitle>Zero-Knowledge Proof</FeatureTitle>
            <FeatureDescription>
              Advanced cryptographic proofs that ensure privacy without compromising security.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🧰</FeatureIcon>
            <FeatureTitle>Developer SDK</FeatureTitle>
            <FeatureDescription>
              Open API interfaces for building privacy-preserving decentralized applications.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>
    </HomeContainer>
  );
};

// Styled components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding: 40px 0;
`;

const HeroSection = styled.section`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  margin-bottom: 24px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(109, 90, 255, 0.2);
  }
`;

const SecondaryButton = styled.a`
  background: transparent;
  color: var(--text-color);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
`;

const ConnectMessage = styled.div`
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
`;

const FeaturesSection = styled.section`
  padding: 40px 20px;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  text-align: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background: var(--card-background);
  border-radius: 12px;
  padding: 30px;
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
`;

export default HomePage; 