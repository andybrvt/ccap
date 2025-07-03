import { useState } from "react";
import { Navigation } from "./AdminNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
