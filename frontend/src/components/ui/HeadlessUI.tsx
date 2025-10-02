'use client';

import React from 'react';

interface HeadlessUIProps {
  children: React.ReactNode;
  className?: string;
}

// Simple modal implementation without Headless UI
export function Dialog({ children, ...props }: HeadlessUIProps & { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}

Dialog.Panel = function DialogPanel({ children, className = '' }: HeadlessUIProps) {
  return (
    <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ${className}`}>
      {children}
    </div>
  );
};

Dialog.Title = function DialogTitle({ children, className = '' }: HeadlessUIProps) {
  return (
    <h3 className={`text-lg font-medium leading-6 text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

// Transition component (simplified)
export function Transition({ show, children, ...props }: { show: boolean; children: React.ReactNode; [key: string]: any }) {
  if (!show) return null;
  return <>{children}</>;
}

Transition.Child = function TransitionChild({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return <>{children}</>;
};
