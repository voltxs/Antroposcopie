"use client";

import { BrainCircuit, Network, Database, GitBranch, Shield } from "lucide-react";

export default function Philosophy() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <BrainCircuit className="text-indigo-400 w-8 h-8" />
          Philosophie & Concepts
        </h2>
        <p className="text-white/60">Comprendre l'architecture décentralisée et bio-inspirée du framework Swarm.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Stigmérgie */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
              <Network className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Stigmérgie (Interaction Indirecte)</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Contrairement aux architectures classiques "Master/Worker", les agents de ce Swarm n'ont pas de contrôleur central. Ils interagissent horizontalement en laissant des "traces" dans leur environnement (le code, le terminal, ou le GraphRAG).
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Comme des fourmis construisant une colonie, un agent architecte laisse un diagramme ou un brouillon. Un agent codeur voit cette trace et commence spontanément à l'implémenter lorsqu'un seuil d'urgence est atteint.
          </p>
        </div>

        {/* Card 2: GraphRAG Memory */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Mémoire GraphRAG Décentralisée</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Pour qu'un agent puisse reprendre le travail d'un autre sans communication directe, le système utilise un Graph de Connaissances Vectoriel (GraphRAG). 
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Chaque modification, dictionnaire de données, ou décision architecturale est encodée comme un nœud dans le graphe. Lorsqu'un agent est invoqué, il effectue une recherche sémantique sur ce graphe pour retrouver immédiatement le contexte ("Où en est la base de données NeoBanking ?").
          </p>
        </div>

        {/* Card 3: Agentic CI/CD */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
              <GitBranch className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">CI/CD Agentique Autonome</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            L'évolution du code ne s'arrête pas à la génération. Les agents effectuent eux-mêmes leurs tests de non-régression. Si un test échoue, ce log d'échec devient un stimulus d'urgence "High".
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Un agent de débogage est alors automatiquement réveillé, consulte la trace d'erreur GitHub ou locale, corrige le code, et relance un `git push` autonome grâce au token GitHub intégré dans le Vault.
          </p>
        </div>

        {/* Card 4: Sécurité & Isolation */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl group hover:border-red-500/50 transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
            <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Isolation & Sécurité Multi-Tenant</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Laisser des LLM modifier du code pose des risques majeurs. C'est pourquoi chaque projet vit dans une bulle Sandbox (un dépôt GitHub isolé ou un conteneur local).
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Le Kill-Switch du Vault permet de figer le réseau instantanément. De plus, aucune clé API (Gemini, Github...) n'est stockée côté serveur ; l'interface agit comme un orchestrateur purement local en garantissant que les clés ne fuient pas dans les "traces" Github.
          </p>
        </div>

      </div>
    </div>
  );
}
