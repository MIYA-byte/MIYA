import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styled from 'styled-components';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoContainer>
          <Link to="/">
            <Logo>MIYA</Logo>
            <LogoText>Protocol</LogoText>
          </Link>
        </LogoContainer>
        
        <Navigation>
          <NavLink isActive={location.pathname === '/'}>
            <Link to="/">Home</Link>
          </NavLink>
          <NavLink isActive={location.pathname === '/mixer'}>
            <Link to="/mixer">Mixer</Link>
          </NavLink>
          <NavLink isActive={location.pathname === '/about'}>
            <Link to="/about">About</Link>
          </NavLink>
        </Navigation>
        
        <WalletContainer>
          <WalletMultiButton />
        </WalletContainer>
      </HeaderContent>
    </HeaderContainer>
  );
};

// Styled components
const HeaderContainer = styled.header`
  background-color: rgba(10, 14, 23, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  
  a {
    display: flex;
    align-items: center;
  }
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
`;

const LogoText = styled.span`
  margin-left: 6px;
  font-size: 18px;
  color: var(--text-color);
`;

const Navigation = styled.nav`
  display: flex;
  gap: 32px;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

interface NavLinkProps {
  isActive: boolean;
}

const NavLink = styled.div<NavLinkProps>`
  font-size: 16px;
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: ${({ isActive }) => (isActive ? '100%' : '0')};
    height: 2px;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const WalletContainer = styled.div`
  .wallet-adapter-button {
    background-color: var(--primary-color);
    border-radius: 8px;
    height: 40px;
    
    &:hover {
      background-color: var(--primary-color);
      opacity: 0.9;
    }
  }
`;

export default Header; 