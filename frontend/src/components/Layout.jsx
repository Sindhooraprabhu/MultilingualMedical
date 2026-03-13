import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex bg-gray-50 text-gray-900 font-sans min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header Placeholder */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 print:hidden">
            <h2 className="text-xl font-semibold text-gray-800">Hospital Administration</h2>
            
            <div className="flex items-center gap-4">
               <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                 <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                 🔔
               </button>
            </div>
        </header>

        {/* Main Workspace Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 print:overflow-visible print:bg-white">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
