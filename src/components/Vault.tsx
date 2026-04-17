"use client";

import { Shield, KeyRound, AlertTriangle, PowerOff } from "lucide-react";
import { useState } from "react";

export default function Vault() {
  const [killSwitch, setKillSwitch] = useState(false);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Shield className="text-emerald-400 w-8 h-8" />
          Security Vault & Budget
        </h2>
        <p className="text-white/60">Manage API keys and global swarm constraints safely.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keys Section */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <KeyRound className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">API Gateways</h3>
          </div>
          
          <div className="space-y-4">
            {["OpenAI", "Anthropic", "GraphRAG (Local)"].map((provider) => (
              <div key={provider} className="flex flex-col gap-2">
                <label className="text-sm text-white/60">{provider} API Key</label>
                <div className="flex relative">
                  <input 
                    type="password" 
                    placeholder="sk-..." 
                    className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-xs font-semibold px-2 py-1 rounded bg-white/10 text-white/50">
                    Encrypted
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all">
            Save Configuration
          </button>
        </div>

        {/* Kill Switch Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-red-950/40 to-black/40 backdrop-blur-md rounded-2xl border border-red-500/20 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-red-400" />
              <h3 className="text-lg font-semibold text-white">Global Restrictions</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-white/80 flex justify-between mb-2">
                  <span>Daily Budget Limit</span>
                  <span className="text-emerald-400">$10.00</span>
                </label>
                <input type="range" className="w-full accent-emerald-500" min="1" max="100" defaultValue="10" />
              </div>

              <div className="pt-6 border-t border-red-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-semibold flex items-center gap-2">Circuit Breaker (Kill-Switch)</h4>
                    <p className="text-sm text-white/50 mt-1">Stops all agents and orchestration instantly.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setKillSwitch(!killSwitch)}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                    killSwitch 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25" 
                      : "bg-white/5 hover:bg-white/10 text-red-400 border border-red-500/30"
                  }`}
                >
                  <PowerOff className={killSwitch ? "animate-pulse" : ""} />
                  {killSwitch ? "SYSTEM OFFLINE - CLICK TO RESTORE" : "ENGAGE KILL-SWITCH"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
