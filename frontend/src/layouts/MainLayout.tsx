import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Header, Footer } from '../components';
import { useMediaQuery } from '../hooks';

interface MainLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  padding?: string;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main<{ maxWidth?: string; padding?: string }>`
  flex: 1;
  max-width: ${props => props.maxWidth || '1200px'};
  padding: ${props => props.padding || '20px'};
  margin: 0 auto;
  width: 100%;
`;

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  maxWidth,
  padding
}) => {
  const isMobile = useMediaQuery('(max-width: 575px)');
  
  // Adjust padding for mobile
  const responsivePadding = isMobile ? '12px' : padding;
  
  return (
    <LayoutContainer>
      <Header />
      <MainContent maxWidth={maxWidth} padding={responsivePadding}>
        {children}
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
};

export default MainLayout; 