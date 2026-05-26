'use client'

import React from 'react';
import { AlertCircle, RefreshCw } from './Icons';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { AnimationWrapper } from './AnimationWrapper';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export function ErrorCard({ 
  title = "Something went wrong", 
  message, 
  onRetry, 
  icon 
}: ErrorCardProps) {
  return (
    <AnimationWrapper animationType="fade-in">
      <GlassCard className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-8 border-red-500/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          {icon || <AlertCircle className="w-8 h-8 text-red-500" />}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          {message}
        </p>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="primary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </GlassCard>
    </AnimationWrapper>
  );
}
