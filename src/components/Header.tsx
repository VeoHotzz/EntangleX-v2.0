import { Atom, BarChart3, BookOpen, GitBranch } from 'lucide-react';
import type { StateInfo } from '../types/quantum';

export type TabId = 'bell-lab' | 'measurement' | 'learn';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  stateInfo: StateInfo;
}

const TABS: Array<{ id: TabId; label: string; icon: typeof Atom }> = [
  { id: 'bell-lab', label: '1. Bell State Lab (Create)', icon: GitBranch },
  { id: 'measurement', label: '2. Measure & 1,000 Shots', icon: BarChart3 },
  { id: 'learn', label: '3. Concepts, Viva & Quiz', icon: BookOpen },
];

export function Header({ activeTab, onSelectTab, stateInfo }: HeaderProps) {
  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Atom size={22} />
          </div>
          <div>
            <h1 className="brand-title">EntangleX v2</h1>
            <p className="brand-sub">Simple Two-Qubit Quantum Entanglement Simulator</p>
          </div>
        </div>

        <div className="header-right">
          <div className={`state-pill ${stateInfo.isEntangled ? 'entangled' : 'separable'}`}>
            <span className="pill-dot" />
            <span className="mono">{stateInfo.symbol}</span>
            <span>{stateInfo.isEntangled ? 'Entangled' : 'Not Entangled'}</span>
          </div>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Simulation Modes">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
