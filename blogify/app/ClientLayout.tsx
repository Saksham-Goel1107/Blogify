"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import DarkModeWrapper from "./actions/DarkMode";
import SessionWrapper from "./Components/sessionWrapper";
import AiChatSidebar from "./Components/AiChatSidebar";
import BottomNav from "./Components/BottomNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SessionWrapper>
      <DarkModeWrapper>
        <div className="bg-black min-h-[100vh]">          <Navbar />
          <main className="pt-[85px] pb-24">
            {children}
            <BottomNav />
            <button 
              onClick={() => {
                setIsSidebarOpen(true);
                document.body.style.overflow = "hidden";
              }}
              className="fixed bottom-17 right-4 bg-gray-800 h-[3rem] w-[3rem] p-1 flex items-center justify-center z-50 shadow-lg hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label="Open AI Assistant"
            >
              <Image src="/gemini.png" alt="Gemini" width={30} height={30} />
            </button>
            <AiChatSidebar 
              isOpen={isSidebarOpen} 
              onClose={() => {setIsSidebarOpen(false)
                  document.body.style.overflow=""
              }} 
            />
          </main>
        </div>
        <Footer />
      </DarkModeWrapper>
    </SessionWrapper>
  );
}
