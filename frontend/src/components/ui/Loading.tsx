import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  text?: string;
}

// Spinner animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Full screen loading container
const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: ${props => props.theme.zIndex.modal};
`;

// Inline loading container
const InlineContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
`;

// Spinner element
const Spinner = styled.div<{ size: 'sm' | 'md' | 'lg'; color?: string }>`
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: ${props => props.color || 'var(--primary-color)'};
  border-right-color: ${props => props.color || 'var(--primary-color)'};
  animation: ${spin} 0.8s linear infinite;
  
  ${props => props.size === 'sm' && `
    width: 20px;
    height: 20px;
  `}
  
  ${props => props.size === 'md' && `
    width: 30px;
    height: 30px;
  `}
  
  ${props => props.size === 'lg' && `
    width: 50px;
    height: 50px;
  `}
`;

// Loading text
const LoadingText = styled.p`
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
`;

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  color,
  fullScreen = false,
  text
}) => {
  const spinner = <Spinner size={size} color={color} />;
  
  if (fullScreen) {
    return (
      <FullScreenContainer>
        {spinner}
        {text && <LoadingText>{text}</LoadingText>}
      </FullScreenContainer>
    );
  }
  
  return (
    <InlineContainer>
      {spinner}
      {text && <LoadingText>{text}</LoadingText>}
    </InlineContainer>
  );
};

export default Loading; 