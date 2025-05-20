import React from 'react';
import styled from 'styled-components';

const AboutPage: React.FC = () => {
  return (
    <AboutContainer>
      <AboutHeader>
        <AboutTitle>About MIYA Protocol</AboutTitle>
        <AboutSubtitle>
          The First Cross-Chain Mixer Protocol Built on Solana
        </AboutSubtitle>
      </AboutHeader>

      <AboutSection>
        <SectionTitle>Our Mission</SectionTitle>
        <SectionContent>
          At MIYA Protocol, we believe that privacy is a fundamental right in the digital age. 
          Our mission is to provide a secure, efficient, and user-friendly platform that enables 
          private cross-chain asset transfers while maintaining the highest standards of security 
          and decentralization.
        </SectionContent>
      </AboutSection>

      <AboutSection>
        <SectionTitle>Technology</SectionTitle>
        <SectionContent>
          MIYA leverages cutting-edge zero-knowledge proof technology to ensure complete privacy 
          for users. Our protocol is built on the Solana blockchain, which provides high throughput, 
          low transaction costs, and fast confirmation times. The architecture includes:
          
          <FeatureList>
            <FeatureItem>
              <FeatureName>Private Asset Pools</FeatureName>
              <FeatureDescription>
                Secure mixing of assets using cryptographic commitments and zero-knowledge proofs.
              </FeatureDescription>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureName>Cross-Chain Bridge</FeatureName>
              <FeatureDescription>
                Seamless transfers between different blockchains while maintaining privacy.
              </FeatureDescription>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureName>ZK-Proof Engine</FeatureName>
              <FeatureDescription>
                Advanced cryptographic verification system to validate transactions without revealing user information.
              </FeatureDescription>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureName>Governance System</FeatureName>
              <FeatureDescription>
                Community-driven decision making through a decentralized autonomous organization (DAO).
              </FeatureDescription>
            </FeatureItem>
          </FeatureList>
        </SectionContent>
      </AboutSection>

      <AboutSection>
        <SectionTitle>Roadmap</SectionTitle>
        <Timeline>
          <TimelineItem>
            <TimelinePhase>Phase 1: Infrastructure (Q2 2025)</TimelinePhase>
            <TimelineContent>
              <TimelinePoint>Complete core mixer protocol</TimelinePoint>
              <TimelinePoint>Launch Solana testnet version</TimelinePoint>
              <TimelinePoint>Establish initial liquidity pool</TimelinePoint>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelinePhase>Phase 2: Feature Expansion (Q3 2025)</TimelinePhase>
            <TimelineContent>
              <TimelinePoint>Enable cross-chain functionality (ETH, BSC)</TimelinePoint>
              <TimelinePoint>Release mobile wallet app</TimelinePoint>
              <TimelinePoint>Improve UI/UX</TimelinePoint>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelinePhase>Phase 3: Ecosystem Growth (Q4 2025)</TimelinePhase>
            <TimelineContent>
              <TimelinePoint>Launch developer API and SDK</TimelinePoint>
              <TimelinePoint>Start DApp ecosystem incentive plan</TimelinePoint>
              <TimelinePoint>Introduce full community governance</TimelinePoint>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelinePhase>Phase 4: Scaling (2026)</TimelinePhase>
            <TimelineContent>
              <TimelinePoint>Support more blockchains</TimelinePoint>
              <TimelinePoint>Release institutional-grade privacy solutions</TimelinePoint>
              <TimelinePoint>Build global community and educational programs</TimelinePoint>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </AboutSection>

      <AboutSection>
        <SectionTitle>Team</SectionTitle>
        <SectionContent>
          MIYA Protocol is being developed by a team of experienced blockchain developers, 
          cryptographers, and security experts who are passionate about privacy and decentralization. 
          Our team members have backgrounds in computer science, cryptography, and distributed systems.
        </SectionContent>
      </AboutSection>

      <ContactSection>
        <SectionTitle>Contact Us</SectionTitle>
        <ContactInfo>
          <ContactItem>
            <ContactLabel>Email:</ContactLabel>
            <ContactValue>support@miya.baby</ContactValue>
          </ContactItem>
          <ContactItem>
            <ContactLabel>Discord:</ContactLabel>
            <ContactValue>discord.gg/miya</ContactValue>
          </ContactItem>
          <ContactItem>
            <ContactLabel>Twitter:</ContactLabel>
            <ContactValue>@MI_YA_190</ContactValue>
          </ContactItem>
          <ContactItem>
            <ContactLabel>GitHub:</ContactLabel>
            <ContactValue>github.com/MIYA-byte/MIYA</ContactValue>
          </ContactItem>
        </ContactInfo>
      </ContactSection>
    </AboutContainer>
  );
};

// Styled components
const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const AboutHeader = styled.header`
  text-align: center;
  margin-bottom: 60px;
`;

const AboutTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AboutSubtitle = styled.p`
  font-size: 18px;
  color: var(--text-secondary);
`;

const AboutSection = styled.section`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: var(--primary-color);
`;

const SectionContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color);
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 20px 0 0;
`;

const FeatureItem = styled.li`
  margin-bottom: 24px;
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const FeatureName = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  color: var(--text-secondary);
`;

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--primary-color);
  }
`;

const TimelineItem = styled.div`
  padding-left: 50px;
  position: relative;
  margin-bottom: 30px;
  
  &::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--primary-color);
  }
`;

const TimelinePhase = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
`;

const TimelineContent = styled.div`
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const TimelinePoint = styled.p`
  margin: 8px 0;
  color: var(--text-secondary);
  position: relative;
  padding-left: 20px;
  
  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--primary-color);
  }
`;

const ContactSection = styled.section`
  margin-bottom: 40px;
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
`;

const ContactLabel = styled.span`
  font-weight: 600;
  margin-right: 10px;
  color: var(--primary-color);
`;

const ContactValue = styled.span`
  color: var(--text-secondary);
`;

export default AboutPage; 