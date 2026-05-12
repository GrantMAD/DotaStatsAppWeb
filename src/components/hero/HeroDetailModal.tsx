'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { HeroDetailContent } from './HeroDetailContent';

interface HeroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroId: number | null;
}

export function HeroDetailModal({ isOpen, onClose, heroId }: HeroDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hero Details"
      size="xl"
    >
      <div className="max-h-[85vh] overflow-y-auto pr-2 no-scrollbar">
        {heroId ? (
          <HeroDetailContent heroId={heroId} />
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 font-bold italic">No hero selected</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
