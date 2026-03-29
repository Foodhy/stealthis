import React from "react";
import { Navbar } from "@/components/Navbar";

interface PasswordGateProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ children, hideNavbar = false }) => {
  if (hideNavbar) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="pt-14">{children}</div>
    </>
  );
};
