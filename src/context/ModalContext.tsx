'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'player' | 'hero' | null;

interface ModalContextType {
  modalType: ModalType;
  modalId: string | null;
  openModal: (type: ModalType, id: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalId, setModalId] = useState<string | null>(null);

  const openModal = (type: ModalType, id: string) => {
    setModalType(type);
    setModalId(id);
  };

  const closeModal = () => {
    setModalType(null);
    setModalId(null);
  };

  return (
    <ModalContext.Provider value={{ modalType, modalId, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
