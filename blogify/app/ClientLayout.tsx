"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import DarkModeWrapper from "./actions/DarkMode";
import SessionWrapper from "./Components/sessionWrapper";
import AiChatSidebar from "./Components/AiChatSidebar";
import BottomNav from "./Components/BottomNav";
import AiToolkitButton from "./Components/AiButton";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SessionWrapper>
      <DarkModeWrapper>
        <div className="bg-black min-h-[100vh]">
          {" "}
          <Navbar />
          <main className="pt-[85px] pb-24">
            {children}
            <BottomNav />
<AiToolkitButton setIsSidebarOpen={setIsSidebarOpen} />

            <AiChatSidebar
              isOpen={isSidebarOpen}
              onClose={() => {
                setIsSidebarOpen(false);
                document.body.style.overflow = "";
              }}
            />
          </main>
        </div>
        <Footer />
      </DarkModeWrapper>
    </SessionWrapper>
  );
}
