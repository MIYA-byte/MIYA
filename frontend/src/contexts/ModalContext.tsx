import React, { createContext, useState, useContext, ReactNode } from 'react';

type ModalType = 'connect-wallet' | 'transaction-details' | 'settings' | 'confirm' | 'error';

interface ModalData {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  [key: string]: any; // For any additional data
}

interface ModalContextType {
  isOpen: boolean;
  modalType: ModalType | null;
  modalData: ModalData | null;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const openModal = (type: ModalType, data: ModalData = {}) => {
    setModalType(type);
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setModalType(null);
      setModalData(null);
    }, 300); // Match transition duration
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalType,
        modalData,
        openModal,
        closeModal
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  
  return context;
}; 