"use client";

import { FolderKanban, Plus, Terminal, Code2, Rocket } from "lucide-react";

export default function Hub() {
  const projects = [
    {
      id: "proj-1",
      name: "NeoBanking Agentic MVP",
      status: "CODE_REVIEW",
      progress: 65,
      agentsActive: 14,
      urgency: "High"
    },
    {
      id: "proj-2",
      name: "Legacy Migration Tool",
      status: "ARCHITECTURE",
      progress: 20,
      agentsActive: 3,
      urgency: "Low"
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            <FolderKanban className="text-indigo-400 w-8 h-8" />
            Project Hub
          </h2>
          <p className="text-white/60">Manage autonomous workspaces and monitor swarm generation.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all">
          <Plus className="w-5 h-5" />
          Nouvelle Idée
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(proj => (
          <div key={proj.id} className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{proj.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                proj.urgency === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {proj.urgency} Urgency
              </span>
            </div>

            {/* Progress Pipeline */}
            <div className="relative pt-2 pb-6">
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" 
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
              
              <div className="flex justify-between relative px-2">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${proj.progress >= 20 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/30'}`}>
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-white/50">Architect</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${proj.progress >= 65 ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/30'}`}>
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-white/50">Code</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${proj.progress >= 100 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/30'}`}>
                    <Rocket className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-white/50">Deploy</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60 bg-black/30 w-fit px-4 py-2 rounded-lg mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {proj.agentsActive} Agents Actifs
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
