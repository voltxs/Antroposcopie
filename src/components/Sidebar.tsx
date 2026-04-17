"use client";

import { LayoutGrid, Network, ShieldAlert, BookOpen } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "hub", label: "Project Hub", icon: LayoutGrid },
    { id: "philosophy", label: "Philosophie", icon: BookOpen },
    { id: "observatory", label: "Observatoire", icon: Network },
    { id: "vault", label: "Vault & Kill-Switch", icon: ShieldAlert },
  ];

  return (
    <div className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(52,211,153,0.5)] flex items-center justify-center">
          <Network className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
          SwarmFramework
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id
                ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase">Engine Live</span>
        </div>
      </div>
    </div>
  );
}
