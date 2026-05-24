'use client';

import React from 'react';
import { useModal } from '@/context/ModalContext';
import { PlayerDetailModal } from '@/components/profile/PlayerDetailModal';
import { HeroDetailModal } from '@/components/hero/HeroDetailModal';

export function GlobalModalContainer() {
  const { modalType, modalId, closeModal } = useModal();

  return (
    <>
      <PlayerDetailModal
        isOpen={modalType === 'player'}
        onClose={closeModal}
        accountId={modalId}
      />
      <HeroDetailModal
        isOpen={modalType === 'hero'}
        onClose={closeModal}
        heroId={modalId ? parseInt(modalId) : null}
      />
    </>
  );
}
