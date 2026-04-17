"use client";

import { useState, useEffect } from "react";
import { FolderKanban, Plus, Terminal, Code2, Rocket, X, Play, Square, Activity, Trash2 } from "lucide-react";

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  agentsActive: number;
  urgency: "Low" | "Medium" | "High";
};

type LogEntry = {
  id: string;
  sender: string;
  text: string;
  color: string;
};

export default function Hub() {
  const [projects, setProjects] = useState<Project[]>([
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
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrgency, setNewProjectUrgency] = useState<"Low" | "Medium" | "High">("Medium");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [missionInputs, setMissionInputs] = useState<Record<string, string>>({});
  const [repoOverrides, setRepoOverrides] = useState<Record<string, string>>({});
  
  const [eventSources, setEventSources] = useState<Record<string, EventSource>>({});
  const [missionLogs, setMissionLogs] = useState<Record<string, LogEntry[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  type AgentStatus = { id: string; role: string; score: number; status: string; };
  const [swarmAgents, setSwarmAgents] = useState<Record<string, AgentStatus[]>>({});

  type TaskState = { id: string; type: string; prompt: string; urgency: number; state: string; block_reason: string | null; };
  const [swarmTasks, setSwarmTasks] = useState<Record<string, TaskState[]>>({});
  const [humanAnswers, setHumanAnswers] = useState<Record<string, string>>({});

  // Load from localStorage safely after hydration
  useEffect(() => {
    const savedProjects = localStorage.getItem("swarm_projects");
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    
    const savedLogs = localStorage.getItem("swarm_logs");
    if (savedLogs) setMissionLogs(JSON.parse(savedLogs));
    
    setIsLoaded(true);
  }, []);

  // Poll for agent status
  useEffect(() => {
    if (!selectedProjectId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8002/api/project/${selectedProjectId}/agents`);
        if (res.ok) {
           const data = await res.json();
           if (data.agents) {
             setSwarmAgents(prev => ({ ...prev, [selectedProjectId]: data.agents }));
           }
        }
        
        const resTasks = await fetch(`http://localhost:8002/api/project/${selectedProjectId}/tasks`);
        if (resTasks.ok) {
           const tasksData = await resTasks.json();
           if (tasksData.tasks) {
             setSwarmTasks(prev => ({ ...prev, [selectedProjectId]: tasksData.tasks }));
           }
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedProjectId]);

  const handleResolveTask = async (projId: string, taskId: string) => {
     const answer = humanAnswers[taskId];
     if (!answer?.trim()) return;
     try {
       await fetch(`http://localhost:8002/api/project/${projId}/tasks/${taskId}/resolve`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ human_answer: answer })
       });
       setHumanAnswers(prev => ({ ...prev, [taskId]: "" }));
     } catch (e) {}
  };

  // Save projects to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("swarm_projects", JSON.stringify(projects));
    }
  }, [projects, isLoaded]);

  // Save logs to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("swarm_logs", JSON.stringify(missionLogs));
    }
  }, [missionLogs, isLoaded]);

  const handleSendMission = async (projId: string) => {
    const text = missionInputs[projId];
    if (!text?.trim()) return;

    const userLog: LogEntry = {
      id: Date.now().toString(),
      sender: "User",
      text,
      color: "text-white"
    };

    setMissionLogs(prev => ({
      ...prev,
      [projId]: [...(prev[projId] || []), userLog]
    }));
    
    // Clear input
    setMissionInputs(prev => ({ ...prev, [projId]: "" }));

    const keysRaw = localStorage.getItem("swarm_api_keys");
    const vaultKeys = keysRaw ? JSON.parse(keysRaw) : {};
    const githubToken = vaultKeys["GitHub Token"];
    const globalRepo = vaultKeys["SandboxRepo"] || "https://github.com/voltxs/Swarm_sandbox.git";
    const targetRepo = repoOverrides[projId] || globalRepo;

    const waitingLog: LogEntry = { id: Date.now().toString()+"w", sender: "System", text: "Dispatching mission to background Swarm...", color: "text-white/40" };
    setMissionLogs(prev => ({ ...prev, [projId]: [...(prev[projId] || []), waitingLog] }));

    try {
      const response = await fetch("http://localhost:8002/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projId,
          mission: text,
          api_keys: vaultKeys,
          github_token: githubToken || "",
          github_repo: targetRepo
        })
      });

      if (!response.ok) throw new Error("Mission dispatch failed.");

      if (!eventSources[projId]) {
        const source = new EventSource(`http://localhost:8002/api/stream/${projId}`);
        
        source.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMissionLogs(prev => ({
              ...prev,
              [projId]: [...(prev[projId] || []), data]
            }));
          } catch(e) {}
        };
        
        source.onerror = () => {
          console.error("SSE Error on", projId);
          source.close();
          setEventSources(prev => {
            const nv = {...prev};
            delete nv[projId];
            return nv;
          });
        };

        setEventSources(prev => ({...prev, [projId]: source}));
      }

    } catch (err) {
       console.error("Backend connection failed", err);
       const errLog: LogEntry = { id: Date.now().toString()+"err", sender: "Error", text: "Could not connect to localhost:8002.", color: "text-red-400" };
       setMissionLogs(prev => ({ ...prev, [projId]: [...(prev[projId] || []), errLog] }));
    }
  };

  const handleStopSwarm = async (projId: string) => {
    try {
      await fetch(`http://localhost:8002/api/project/${projId}/stop`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  // Optional: cleanup event sources on unmount
  useEffect(() => {
    return () => {
      Object.values(eventSources).forEach(source => source.close());
    };
  }, [eventSources]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      status: "INITIALIZATION",
      progress: 0,
      agentsActive: 1,
      urgency: newProjectUrgency,
    };

    setProjects([...projects, newProject]);
    setNewProjectName("");
    setNewProjectUrgency("Medium");
    setIsModalOpen(false);
  };

  const toggleProject = (id: string) => {
    setSelectedProjectId(prev => prev === id ? null : id);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
  };

  return (
    <div className="p-8 max-w-[95%] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            <FolderKanban className="text-indigo-400 w-8 h-8" />
            Project Hub
          </h2>
          <p className="text-white/60">Manage autonomous workspaces and monitor swarm generation.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Idée
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {projects.map(proj => {
          const isSelected = selectedProjectId === proj.id;
          
          return (
            <div 
              key={proj.id} 
              onClick={() => toggleProject(proj.id)}
              className={`bg-white/5 hover:bg-white/10 backdrop-blur-sm border transition-all cursor-pointer group rounded-2xl p-6 ${
                isSelected ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{proj.name}</h3>
                  <button 
                    onClick={(e) => handleDeleteProject(e, proj.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-500 rounded-md transition-all active:scale-95 border border-transparent hover:border-red-500/30"
                    title="Supprimer le projet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  proj.urgency === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                  proj.urgency === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {proj.urgency} Urgency
                </span>
              </div>

              {/* Progress Pipeline */}
              <div className="relative pt-2 pb-6">
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between relative px-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${proj.progress >= 20 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/10 text-white/30'}`}>
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/50">Architect</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${proj.progress >= 65 ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white/10 text-white/30'}`}>
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/50">Code</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${proj.progress >= 100 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 text-white/30'}`}>
                      <Rocket className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/50">Deploy</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-2">
                <div className="flex items-center gap-2 text-sm text-white/60 bg-black/30 w-fit px-4 py-2 rounded-lg">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  {swarmAgents[proj.id] ? swarmAgents[proj.id].length : proj.agentsActive} Agents Actifs
                </div>
                <div className="text-xs text-white/40 font-mono">
                  {proj.status}
                </div>
              </div>

              {/* Expansion Panel */}
              {isSelected && (
                <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left Column: Mission & Panels */}
                    <div className="space-y-6 lg:col-span-1">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Nouvelle Mission / Instruction</label>
                        <textarea 
                          value={missionInputs[proj.id] || ""}
                          onChange={(e) => setMissionInputs(prev => ({ ...prev, [proj.id]: e.target.value }))}
                          className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm resize-none"
                          placeholder="Ex: Refactorise le composant X, connecte la base de données, et crée une PR sur Github..."
                        />
                        <div className="mt-3 flex justify-end">
                          <button 
                            onClick={() => handleSendMission(proj.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                          >
                            <Play className="w-4 h-4 fill-current" /> Envoyer à l'Agent
                          </button>
                        </div>
                      </div>
                      
                      <details className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-black/20 group transition-all">
                        <summary className="px-5 py-3.5 text-sm font-medium text-white/70 cursor-pointer list-none flex justify-between items-center hover:bg-white/5">
                          <span className="flex items-center gap-2"><Rocket className="w-4 h-4 text-white/50" /> Paramètres GitHub (Déploiement)</span>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/50 group-open:hidden">Ouvrir</span>
                        </summary>
                        <div className="p-4 border-t border-white/10 bg-black/40">
                          <label className="block text-sm font-medium text-white/70 mb-2 flex justify-between">
                            <span>Repository Github Spécifique</span>
                          </label>
                          <input 
                            type="text" 
                            value={repoOverrides[proj.id] || ""}
                            onChange={(e) => setRepoOverrides(prev => ({...prev, [proj.id]: e.target.value}))}
                            className="w-full bg-black/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-mono"
                            placeholder="Surcharge (Ex: https://github.com/voltxs/AutreRepo.git)"
                          />
                          <p className="text-[11px] text-white/40 mt-2 ml-1">
                            S'il est vide, le repo Sandbox global du Vault sera utilisé (https://github.com/voltxs/Swarm_sandbox.git).
                          </p>
                        </div>
                      </details>

                      {/* Swarm Organization Dashboard */}
                      {(swarmAgents[proj.id] && swarmAgents[proj.id].length > 0) && (
                        <div className="bg-black/20 border border-white/5 rounded-xl p-5 pt-4 shadow-inner">
                           <h4 className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-4 border-b border-white/10 pb-2">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              Swarm Organization (Online)
                           </h4>
                           <div className="space-y-3">
                              {swarmAgents[proj.id].map(agent => (
                                <div key={agent.id} className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${agent.status === 'Busy' ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                                      <span className="text-sm font-medium text-white">{agent.role}</span>
                                    </div>
                                    <span className="text-xs font-mono text-white/50 px-2 py-0.5 bg-black/40 rounded-full">
                                      {agent.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-end mt-1">
                                    <span className="text-[10px] text-white/40 font-mono tracking-tighter truncate w-32">{agent.id}</span>
                                    <span className={`text-xs font-semibold ${agent.score < 90 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                      Perf: {agent.score}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                      {/* Hand-raising Dashboard */}
                      {(swarmTasks[proj.id] || []).filter(t => t.state === "BLOCKED_NEEDS_HUMAN").length > 0 && (
                        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95 mt-6">
                           <h4 className="flex items-center gap-2 text-sm font-bold text-red-400 mb-4 pb-2 border-b border-red-500/20">
                              <Activity className="w-5 h-5 animate-pulse" />
                              INTERVENTION HUMAINE REQUISE
                           </h4>
                           <div className="space-y-4">
                              {swarmTasks[proj.id].filter(t => t.state === "BLOCKED_NEEDS_HUMAN").map(task => (
                                <div key={task.id} className="flex flex-col gap-3 p-4 rounded-lg bg-black/60 border border-red-500/20 shadow-inner">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-semibold text-white/90">[{task.type}] Bloqué (Urgence : {task.urgency})</span>
                                    <span className="text-xs font-mono text-red-300 px-2 py-0.5 bg-red-500/20 rounded-full border border-red-500/30">MAX_URGENCY_REACHED</span>
                                  </div>
                                  <div className="text-sm text-red-200/80 leading-relaxed bg-red-950/30 p-3 rounded-md border border-red-500/10">
                                    <span className="font-semibold block mb-1">Raison invoquée par l'Agent :</span>
                                    "{task.block_reason}"
                                  </div>
                                  
                                  <div className="flex flex-col gap-2 mt-2">
                                    <label className="text-xs font-medium text-white/60">Fournir une réponse, clé, ou direction pour débloquer :</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={humanAnswers[task.id] || ""}
                                        onChange={e => setHumanAnswers(prev => ({...prev, [task.id]: e.target.value}))}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                                        placeholder="Votre réponse ici..."
                                      />
                                      <button 
                                        onClick={() => handleResolveTask(proj.id, task.id)}
                                        disabled={!humanAnswers[task.id]?.trim()}
                                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg active:scale-95"
                                      >
                                        Résoudre
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Terminal Logs */}
                    <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-5 font-mono text-sm text-emerald-400 h-[600px] overflow-y-auto flex flex-col shadow-inner relative group lg:col-span-2">
                      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none" />
                      
                      <div className="text-white/40 mb-4 flex items-center gap-2 sticky top-0 bg-[#0A0A0A] pb-2 border-b border-white/5 z-10 font-sans font-medium text-sm">
                        <Terminal className="w-4 h-4" />
                        Agent Output Logs
                      </div>
                      
                      <div className="flex-1 space-y-3.5 opacity-90 pb-4">
                        <div>
                          <span className="text-white/30">[System]</span> Initializing swarm protocol for "{proj.name}"...
                        </div>
                        <div>
                          <span className="text-white/30">[GraphRAG]</span> Connected to memory vector DB successfully.
                        </div>
                        <div>
                          <span className="text-cyan-400">[VCS]</span> Default Sandbox Target: github.com/voltxs/Swarm_sandbox.git
                        </div>
                        
                        {(missionLogs[proj.id] || []).map(log => (
                          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <span className={log.color}>[{log.sender}]</span> {log.text}
                          </div>
                        ))}

                        <div className="animate-pulse pt-2 text-white/60">
                          {'>'} Awaiting new mission instructions_
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-xs text-white/40 font-mono">Workspace ID: {proj.id}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleStopSwarm(proj.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20">
                        <Square className="w-4 h-4 fill-current" /> Stop Swarm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Notification / "Nouvelle Idée" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-indigo-400 w-5 h-5" />
              Nouveau Projet Agentique
            </h3>
            
            <form onSubmit={handleAddProject} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nom du projet</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="ex: Trading Bot Orchestrator"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Niveau d'urgence</label>
                <div className="flex gap-3">
                  {(["Low", "Medium", "High"] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewProjectUrgency(level)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        newProjectUrgency === level 
                          ? level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                            : level === 'Medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={!newProjectName.trim()}
                className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all"
              >
                Générer le Swarm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
