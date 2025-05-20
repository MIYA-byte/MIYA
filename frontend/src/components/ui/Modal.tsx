import React, { useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import Button from './Button';

// Animation for modal
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Backdrop behind modal
const ModalBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${props => props.theme.zIndex.modal};
  animation: ${fadeIn} 0.3s ease;
  transition: opacity 0.3s ease;
  
  ${props => !props.isOpen && css`
    opacity: 0;
    pointer-events: none;
  `}
`;

// Modal container
const ModalContainer = styled.div<{ isOpen: boolean }>`
  background-color: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: ${slideIn} 0.3s ease;
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  ${props => !props.isOpen && css`
    transform: translateY(-50px);
    opacity: 0;
  `}
`;

// Modal header
const ModalHeader = styled.div`
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Modal title
const ModalTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-color);
`;

// Close button
const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-xl);
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--text-primary);
  }
`;

// Modal content
const ModalContent = styled.div`
  padding: var(--spacing-lg);
`;

// Modal footer
const ModalFooter = styled.div`
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
`;

const Modal: React.FC = () => {
  const { isOpen, modalType, modalData, closeModal } = useModal();
  const backdropRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      closeModal();
    }
  };
  
  // Close on escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeModal]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Render different modal content based on modal type
  const renderModalContent = () => {
    switch (modalType) {
      case 'connect-wallet':
        return <div>Connect wallet content</div>;
      case 'transaction-details':
        return <div>Transaction details content</div>;
      case 'settings':
        return <div>Settings content</div>;
      case 'confirm':
        return <div>{modalData?.message || 'Are you sure?'}</div>;
      case 'error':
        return <div>{modalData?.message || 'An error occurred.'}</div>;
      default:
        return null;
    }
  };
  
  if (!modalType) return null;
  
  return (
    <ModalBackdrop 
      ref={backdropRef} 
      isOpen={isOpen} 
      onClick={handleBackdropClick}
    >
      <ModalContainer isOpen={isOpen}>
        <ModalHeader>
          <ModalTitle>{modalData?.title || modalType}</ModalTitle>
          <CloseButton onClick={closeModal}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          {renderModalContent()}
        </ModalContent>
        
        {modalType === 'confirm' && (
          <ModalFooter>
            <Button variant="tertiary" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (modalData?.onConfirm) {
                  modalData.onConfirm();
                }
                closeModal();
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        )}
        
        {modalType === 'error' && (
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              OK
            </Button>
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default Modal; 