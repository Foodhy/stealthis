import React from 'react';
import { Navbar } from '@/components/Navbar';

interface PasswordGateProps {
  children: React.ReactNode;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="pt-14">{children}</div>
    </>
  );
};
