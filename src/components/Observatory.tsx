"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { Activity } from "lucide-react";

// dynamic import to avoid SSR errors with react-force-graph
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function Observatory() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef(null);

  // Generate mock stigmergic data
  useEffect(() => {
    // 3 Tasks (bigger nodes), 15 Agents (smaller nodes)
    const nodes = [
      { id: "T1", group: "task", name: "Build Auth API", val: 20, urgency: 80 },
      { id: "T2", group: "task", name: "Database Schema", val: 15, urgency: 40 },
      { id: "T3", group: "task", name: "UI Components", val: 25, urgency: 95 },
    ];
    
    // Add agents (Boids)
    for (let i = 1; i <= 20; i++) {
        // threshold behavior diff : hyperactive vs reserve
        const isHyper = i < 8; // ~40% hyperactive
        nodes.push({
            id: `A${i}`,
            group: isHyper ? "agent_hyper" : "agent_reserve",
            name: `Agent ${i}`,
            val: 4
        });
    }

    // Links to simulate attraction
    const links = [
      { source: "A1", target: "T1" },
      { source: "A2", target: "T1" },
      { source: "A3", target: "T3" },
      { source: "A4", target: "T3" },
      { source: "A5", target: "T3" },
      { source: "A6", target: "T2" },
    ];

    setGraphData({ nodes, links } as any);
  }, []);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700">
      <div className="absolute z-10 p-8 pointers-event-none">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Activity className="text-cyan-400 w-8 h-8" />
          Observatoire Stigmérgique
        </h2>
        <p className="text-white/60">Real-time simulation of agents clustering around urgent tasks.</p>
        
        <div className="mt-6 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 w-fit pointer-events-auto">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-white/80">Tâche Emergente (Rouge = Urgence forte)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"></div><span className="text-sm text-white/80">Tâche Normale</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-[3px] bg-emerald-400"></div><span className="text-sm text-white/80">Agent (40% Hyperactifs)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-[3px] bg-white/20"></div><span className="text-sm text-white/80">Agent (60% Réserve)</span></div>
        </div>
      </div>

      <div className="flex-grow w-full h-full bg-gradient-to-b from-black to-slate-950">
        {graphData.nodes.length > 0 && typeof window !== "undefined" && (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => {
              if (node.group === "task") return node.urgency > 50 ? "#ef4444" : "#3b82f6";
              if (node.group === "agent_hyper") return "#10b981";
              return "rgba(255,255,255,0.2)";
            }}
            nodeRelSize={6}
            nodeVal={(node: any) => node.val}
            linkColor={() => "rgba(255,255,255,0.1)"}
            backgroundColor="#00000000"
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.2}
          />
        )}
      </div>
    </div>
  );
}
