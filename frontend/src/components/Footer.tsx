import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterLogo>
          <Link to="/">
            <LogoText>MIYA Protocol</LogoText>
          </Link>
          <FooterTagline>Privacy-First Cross-Chain Transfers</FooterTagline>
        </FooterLogo>

        <FooterNavigation>
          <FooterColumn>
            <FooterTitle>Protocol</FooterTitle>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/mixer">Mixer</FooterLink>
            <FooterLink to="/about">About</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <FooterTitle>Resources</FooterTitle>
            <FooterExternalLink href="https://docs.miya.baby" target="_blank">Documentation</FooterExternalLink>
            <FooterExternalLink href="https://github.com/MIYA-byte/MIYA" target="_blank">GitHub</FooterExternalLink>
            <FooterExternalLink href="https://discord.gg/miya" target="_blank">Discord</FooterExternalLink>
          </FooterColumn>

          <FooterColumn>
            <FooterTitle>Legal</FooterTitle>
            <FooterLink to="/terms">Terms of Service</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
          </FooterColumn>
        </FooterNavigation>
      </FooterContent>

      <FooterBottom>
        <Copyright>© {currentYear} MIYA Protocol. All rights reserved.</Copyright>
        <SocialLinks>
          <SocialLink href="https://twitter.com/MI_YA_190" target="_blank" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 4.01C21.9978 3.09643 21.2589 2.35752 20.3454 2.35529C19.9693 2.3544 19.6037 2.47737 19.3 2.7C18.1 3.58008 16.97 3.92008 16 4.01C14.36 2.35856 12.04 2.35856 10.4 4.01C9.39961 3.91721 8.33552 3.53528 7.4 2.9C6.75777 2.48453 5.99314 2.32992 5.22638 2.45528C4.52242 2.57116 3.88233 2.92564 3.42877 3.45636C2.97521 3.98708 2.73661 4.65967 2.76 5.35C2.76 5.82 2.76 6.48016 3.16 7.25H3.07C2.31654 7.25 1.63161 7.65353 1.29319 8.30663C0.954771 8.95973 1.01728 9.74706 1.46 10.33C1.79677 10.8019 2.28786 11.1332 2.84 11.27C2.65576 11.6301 2.56083 12.0338 2.56578 12.4435C2.57072 12.8533 2.67536 13.2542 2.8699 13.6098C3.06444 13.9654 3.3447 14.2643 3.68335 14.4818C4.02199 14.6992 4.40932 14.8284 4.81 14.8569C4.20071 15.6684 3.99582 16.7107 4.25219 17.6906C4.50855 18.6705 5.2031 19.486 6.14 19.9C5.01553 20.3034 3.81036 20.4824 2.6 20.43C2.30257 20.4298 2.0226 20.5387 1.81238 20.7348C1.60216 20.9308 1.48005 21.2019 1.47 21.49C1.46619 21.641 1.49483 21.7908 1.55385 21.931C1.61287 22.0712 1.70076 22.1989 1.81237 22.3058C1.92397 22.4127 2.05699 22.4967 2.20337 22.553C2.34974 22.6093 2.50588 22.6369 2.66 22.6337C6.97651 22.6327 11.0443 20.5999 13.4467 17.1974C15.8491 13.7948 16.3175 9.47387 14.69 5.64C15.85 5.64 17.36 5.29 19.08 4.01C19.6271 3.61101 19.953 2.99862 19.97 2.35C20.0186 2.33529 20.0684 2.32778 20.12 2.33C21.1408 2.37464 21.9617 3.19982 22 4.22V4.01Z" fill="currentColor"/>
            </svg>
          </SocialLink>
          <SocialLink href="https://github.com/MIYA-byte/MIYA" target="_blank" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 16.4183 4.95369 20.1574 9 21.4922V18.5C9 18.0052 9 17.5 9 17C6.5 17.5 5.5 16 5.5 16C5 15 4.5 14.5 4.5 14.5C3.5 14 4.5 14 4.5 14C5.5 14 6 15 6 15C7 16.5 8.5 16 9 15.5C9.07513 15.0522 9.14202 14.7773 9.33467 14.5L9.37394 14.4502C9.45639 14.3337 9.5611 14.2103 9.75 14.1274C9.84999 14.0841 9.92426 14.0443 10 14.0113C7 13.5 5.5 12 5.5 9.5C5.5 8.5 6 7.5 6.5 7C6.43566 6.83338 6.32141 6.29505 6.5 5.5C6.5 5.5 7.3115 5.28465 9 6.5C9.93579 6.16485 10.952 6 12 6C13.048 6 14.0642 6.16485 15 6.5C16.6885 5.28465 17.5 5.5 17.5 5.5C17.6786 6.29505 17.5643 6.83338 17.5 7C18 7.5 18.5 8.5 18.5 9.5C18.5 12 17 13.5 14 14C14.5 14.5 14.9884 15.0541 14.9884 16.25L15 18.5C15 19.577 15 21 15 21C19.0463 20.1574 22 16.4183 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
            </svg>
          </SocialLink>
          <SocialLink href="https://discord.gg/miya" target="_blank" aria-label="Discord">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.36999C18.7873 3.66914 17.147 3.16732 15.4319 2.89999C15.4007 2.89471 15.3695 2.90816 15.3497 2.93267C15.1484 3.29366 14.9222 3.76143 14.7611 4.13267C12.9243 3.88466 11.0983 3.88466 9.29614 4.13267C9.13494 3.75277 8.89956 3.29366 8.69699 2.93267C8.6772 2.90942 8.646 2.89596 8.61481 2.89999C6.90082 3.16608 5.26045 3.6679 3.7308 4.36999C3.7142 4.3763 3.69999 4.38786 3.69059 4.40318C0.940694 8.7467 0.0631215 12.9833 0.509831 17.1633C0.512323 17.1911 0.529242 17.2168 0.552337 17.2333C2.47994 18.6445 4.35104 19.5321 6.18935 20.1259C6.22054 20.1353 6.25414 20.1238 6.27393 20.0981C6.7326 19.4466 7.14239 18.7588 7.49074 18.0345C7.51536 17.983 7.49074 17.9231 7.43649 17.9034C6.78779 17.6649 6.17302 17.3737 5.58034 17.0424C5.52008 17.0078 5.51527 16.9237 5.57073 16.8828C5.68661 16.7977 5.80254 16.7085 5.91358 16.6192C5.9358 16.601 5.96621 16.597 5.99262 16.6087C9.91245 18.4275 14.1996 18.4275 18.0722 16.6087C18.0986 16.5957 18.129 16.5996 18.1526 16.6179C18.2636 16.7071 18.3795 16.7977 18.4967 16.8828C18.5522 16.9237 18.5488 17.0078 18.4885 17.0424C17.8958 17.3793 17.281 17.6649 16.6309 17.9021C16.5767 17.9218 16.5535 17.983 16.5781 18.0345C16.9351 18.7575 17.3449 19.4452 17.7935 20.0967C17.8119 20.1238 17.8469 20.1353 17.8781 20.1259C19.7277 19.5321 21.5988 18.6445 23.5264 17.2333C23.5508 17.2168 23.5664 17.1925 23.569 17.1647C24.1052 12.3253 22.6968 8.12836 20.3867 4.4045C20.3786 4.38786 20.3644 4.3763 20.3478 4.36999H20.317ZM7.94319 14.5325C6.77156 14.5325 5.80736 13.4599 5.80736 12.1456C5.80736 10.8313 6.75035 9.75866 7.94319 9.75866C9.14846 9.75866 10.1038 10.8425 10.079 12.1456C10.079 13.4599 9.14365 14.5325 7.94319 14.5325ZM16.1024 14.5325C14.9307 14.5325 13.9665 13.4599 13.9665 12.1456C13.9665 10.8313 14.9095 9.75866 16.1024 9.75866C17.3076 9.75866 18.263 10.8425 18.2382 12.1456C18.2382 13.4599 17.3076 14.5325 16.1024 14.5325Z" fill="currentColor"/>
            </svg>
          </SocialLink>
        </SocialLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: var(--card-background);
  padding: 60px 20px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const FooterLogo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LogoText = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color);
`;

const FooterTagline = styled.p`
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
`;

const FooterNavigation = styled.div`
  display: flex;
  gap: 60px;
  
  @media (max-width: 768px) {
    gap: 40px;
    flex-wrap: wrap;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FooterTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-color);
`;

const FooterLink = styled(Link)`
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const FooterExternalLink = styled.a`
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 60px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const Copyright = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
`;

const SocialLink = styled.a`
  color: var(--text-secondary);
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

export default Footer; 