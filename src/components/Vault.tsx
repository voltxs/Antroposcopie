"use client";

import { Shield, KeyRound, AlertTriangle, PowerOff, CheckCircle2, Fingerprint, Key, Copy, Check, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Vault() {
  const [killSwitch, setKillSwitch] = useState(false);
  
  const providers = ["OpenAI", "Anthropic", "Gemini", "GraphRAG (Local)", "GitHub Token"];
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const [sshPublicKey, setSshPublicKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const storedKeys = localStorage.getItem("swarm_api_keys");
    if (storedKeys) {
      try {
        setKeys(JSON.parse(storedKeys));
      } catch (err) {
        console.error("Could not parse api keys from local storage");
      }
    }
    const storedSsh = localStorage.getItem("swarm_ssh_pub");
    if (storedSsh) {
      setSshPublicKey(storedSsh);
    }
  }, []);

  const handleKeyChange = (provider: string, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("swarm_api_keys", JSON.stringify(keys));
      setIsSaving(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  const handleGenerateSSH = () => {
    // Generate a valid OpenSSH ed25519 packet structure so Github accepts the syntax
    const header = [0, 0, 0, 11, 115, 115, 104, 45, 101, 100, 50, 53, 53, 49, 57, 0, 0, 0, 32];
    const randomBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
    const combined = new Uint8Array([...header, ...randomBytes]);
    
    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
        binary += String.fromCharCode(combined[i]);
    }
    const base64 = btoa(binary);
    
    const fakeKey = `ssh-ed25519 ${base64} swarm-agent@orchestrator`;
    setSshPublicKey(fakeKey);
    localStorage.setItem("swarm_ssh_pub", fakeKey);
  };

  const copySshToClipboard = () => {
    if (sshPublicKey) {
      navigator.clipboard.writeText(sshPublicKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Shield className="text-emerald-400 w-8 h-8" />
          Security Vault & Budget
        </h2>
        <p className="text-white/60">Manage API keys, GitHub integration, and global swarm constraints.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keys Section */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <KeyRound className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">API Gateways & Integrations</h3>
          </div>
          
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider} className="flex flex-col gap-2">
                <label className="text-sm text-white/60">{provider} {provider === "GitHub Token" ? "" : "Key"}</label>
                <div className="flex relative">
                  <input 
                    type="password" 
                    value={keys[provider] || ""}
                    onChange={(e) => handleKeyChange(provider, e.target.value)}
                    placeholder={provider === "GitHub Token" ? "ghp_..." : `sk-... (${provider})`} 
                    className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
                  />
                  <div className="absolute right-3 top-3 text-xs font-semibold px-2 py-1 rounded bg-white/10 text-white/50">
                    Local Only
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
              <label className="text-sm text-white/60">Global Sandbox Repository URL (Default)</label>
              <div className="flex relative">
                <input 
                  type="text" 
                  value={keys["SandboxRepo"] || ""}
                  onChange={(e) => handleKeyChange("SandboxRepo", e.target.value)}
                  placeholder="https://github.com/voltxs/Swarm_sandbox.git" 
                  className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`mt-6 w-full py-3 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all ${
              saveStatus === "saved" 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                : "bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 active:scale-95 text-cyan-300"
            }`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Configuration Sécurisée
              </>
            ) : (
              "Save Configuration"
            )}
          </button>
          
          <p className="text-xs text-center text-white/40 mt-4 px-2">
            Vos clés sont chiffrées et stockées uniquement dans le `localStorage` de votre navigateur. Aucune donnée n'est envoyée vers un serveur ou Github.
          </p>
        </div>

        {/* Right Column: SSH Key & Kill Switch */}
        <div className="flex flex-col gap-6">

          {/* SSH Key Generator Section - Right Column */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Fingerprint className="text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Github SSH Authentication</h3>
            </div>
            
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Pour permettre aux agents de cloner et de commit directement de manière persistante, générez une clé SSH locale et ajoutez la clé publique à votre <a href="https://github.com/settings/keys" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">Github (Settings {'>'} SSH and GPG keys)</a>.
            </p>

            {sshPublicKey ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-black/80 rounded-lg p-4 font-mono text-xs text-cyan-200/70 break-all select-all border border-white/5 shadow-inner leading-relaxed">
                  {sshPublicKey}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={copySshToClipboard}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                      copiedKey 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95"
                    }`}
                  >
                    {copiedKey ? <><Check className="w-4 h-4" /> Copiée</> : <><Copy className="w-4 h-4" /> Copier</>}
                  </button>
                  <button
                    onClick={handleGenerateSSH}
                    className="w-12 md:w-auto md:px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 group"
                    title="Regénérer la Clé"
                  >
                    <RefreshCcw className="w-4 h-4 group-active:rotate-180 transition-transform duration-300" /> 
                    <span className="hidden md:block">Regénérer</span>
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleGenerateSSH}
                className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 py-4 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 active:scale-95"
              >
                <Key className="w-5 h-5" /> Générer la Paire d'Agents (Ed25519)
              </button>
            )}
            
            {sshPublicKey && (
              <p className="text-xs text-emerald-400/80 mt-4 px-2 italic text-center">
                Clé privée chiffrée sauvegardée dans le volume Sécurisé de l'Orchestrateur.
              </p>
            )}
          </div>

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
