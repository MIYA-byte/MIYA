import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import styled from 'styled-components';

// Import providers
import { ThemeProvider, ModalProvider, NotificationProvider } from './contexts';

// Import components
import { Header, Footer, Modal, Notification } from './components';

// Import pages
import HomePage from './pages/HomePage';
import MixerPage from './pages/MixerPage';
import AboutPage from './pages/AboutPage';

// Import wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Main app component
const App: React.FC = () => {
  // Setup Solana network and wallet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ThemeProvider>
      <ModalProvider>
        <NotificationProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <AppContainer>
                  <Header />
                  <MainContent>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/mixer" element={<MixerPage />} />
                      <Route path="/about" element={<AboutPage />} />
                    </Routes>
                  </MainContent>
                  <Footer />
                  <Modal />
                  <Notification />
                </AppContainer>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </NotificationProvider>
      </ModalProvider>
    </ThemeProvider>
  );
};

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

export default App; 