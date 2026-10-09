import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AskUniSphereDrawer } from '../assistant/AskUniSphereDrawer';

export const DashboardLayout: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F7FF] flex flex-col">
      <Navbar onOpenAssistant={() => setIsAssistantOpen(true)} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <AskUniSphereDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};
