"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Hub from "@/components/Hub";
import Vault from "@/components/Vault";
import Observatory from "@/components/Observatory";

export default function Home() {
  const [activeTab, setActiveTab] = useState("hub");

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-hidden relative flex">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto w-full relative z-10 flex">
          {activeTab === "hub" && <Hub />}
          {activeTab === "vault" && <Vault />}
          {activeTab === "observatory" && <Observatory />}
        </div>
      </div>
    </main>
  );
}
