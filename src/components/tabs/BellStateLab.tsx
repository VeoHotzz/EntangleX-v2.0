import { Info, RotateCcw, Sparkles } from 'lucide-react';
import {
  BELL_PRESETS,
  evaluateCircuit,
  formatAmplitude,
} from '../../quantum/math';
import type { BellPresetId, CircuitConfig, StateInfo } from '../../types/quantum';
import { EntanglementLink } from '../EntanglementLink';

interface BellStateLabProps {
  config: CircuitConfig;
  stateInfo: StateInfo;
  onUpdateConfig: (next: CircuitConfig) => void;
  onSelectPreset: (id: BellPresetId) => void;
}

const PRESET_CARDS: Array<{
  id: BellPresetId;
  tag: string;
  plainDesc: string;
}> = [
  { id: '00', tag: 'Unentangled', plainDesc: 'Both qubits stay 0' },
  { id: '+0', tag: 'H Gate Only', plainDesc: 'Alice 50/50, NOT entangled' },
  { id: 'phi+', tag: 'Bell State', plainDesc: 'Always matches (00 or 11, +)' },
  { id: 'phi-', tag: 'Bell State', plainDesc: 'Always matches (00 or 11, −)' },
  { id: 'psi+', tag: 'Bell State', plainDesc: 'Always opposite (01 or 10, +)' },
  { id: 'psi-', tag: 'Bell State', plainDesc: 'Always opposite (01 or 10, −)' },
];

const BASIS_STATES = ['00', '01', '10', '11'] as const;

function getPlainExplanation(info: StateInfo, config: CircuitConfig): string {
  if (info.id === '00') {
    return 'Both gates H and CNOT are OFF. Alice and Bob are independent and always stay in |00⟩.';
  }
  if (info.id === '+0') {
    return 'Only the Hadamard (H) gate is ON. Alice is now in a 50/50 superposition, but Bob is still |0⟩ — so they are NOT entangled yet.';
  }
  if (info.id === 'phi+') {
    return 'H created superposition on Alice, and CNOT linked Bob to Alice. Now they are entangled in |Φ+⟩ and will always give matching bits (00 or 11).';
  }
  if (info.id === 'phi-') {
    return 'Entangled Bell State |Φ−⟩: Alice and Bob still always give matching bits (00 or 11), with a negative (−) relative phase on |11⟩.';
  }
  if (info.id === 'psi+') {
    return 'Entangled Bell State |Ψ+⟩: Because Bob was flipped before/with CNOT, Alice and Bob will always give opposite bits (01 or 10).';
  }
  if (info.id === 'psi-') {
    return 'Entangled Singlet State |Ψ−⟩: Alice and Bob are always opposite (01 or 10) with a negative (−) phase.';
  }
  if (!info.isEntangled && config.cnotAB && !config.hA) {
    return 'CNOT alone without H cannot create entanglement from computational basis states — turn ON H first to put Alice into superposition!';
  }
  return info.isEntangled
    ? 'Active gates have entangled Alice and Bob into a shared two-qubit state.'
    : 'This is a separable (unentangled) product state — Alice and Bob behave independently.';
}

export function BellStateLab({
  config,
  stateInfo,
  onUpdateConfig,
  onSelectPreset,
}: BellStateLabProps) {
  const toggle = (key: keyof CircuitConfig) => {
    onUpdateConfig({ ...config, [key]: !config[key] });
  };

  const vector = evaluateCircuit(config);
  const explanation = getPlainExplanation(stateInfo, config);

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <Sparkles size={18} color="var(--cyan)" />
              Step 1: Choose a Preset or Toggle Gates (H &amp; CNOT)
            </h2>
            <p className="panel-subtitle">
              Start at Unentangled |00⟩, turn ON <strong>H</strong> for superposition, then turn ON <strong>CNOT</strong> to entangle both qubits.
            </p>
          </div>
          <button type="button" className="btn" onClick={() => onSelectPreset('00')}>
            <RotateCcw size={15} />
            Reset to |00⟩
          </button>
        </div>

        <div className="preset-grid" style={{ marginBottom: '16px' }}>
          {PRESET_CARDS.map((card) => {
            const preset = BELL_PRESETS[card.id];
            const isActive = stateInfo.id === card.id;
            return (
              <button
                key={card.id}
                type="button"
                className={`preset-card ${isActive ? 'active' : ''}`}
                onClick={() => onSelectPreset(card.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="mono" style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {preset.symbol}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--cyan)' : 'var(--text-muted)' }}>
                    {card.tag}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  {card.plainDesc}
                </div>
              </button>
            );
          })}
        </div>

        <div className="circuit-box">
          <div className="circuit-wires">
            {/* Qubit A wire */}
            <div className="wire-row">
              <div className="wire-label mono">Alice q[0] |0⟩</div>
              <div className="gate-slot">
                <button
                  type="button"
                  className={`gate-toggle ${config.xA ? 'on' : ''}`}
                  onClick={() => toggle('xA')}
                  title="Optional Bit Flip (X) on Alice before H"
                >
                  X_A
                </button>
              </div>
              <div className="gate-slot">
                <button
                  type="button"
                  className={`gate-toggle ${config.hA ? 'on' : ''}`}
                  onClick={() => toggle('hA')}
                  title="Hadamard Gate (Superposition)"
                >
                  H
                </button>
              </div>
              <div className="gate-slot">
                <div
                  className={`cnot-dot ${config.cnotAB ? 'on' : ''}`}
                  title="CNOT Control (Alice)"
                />
              </div>
              <div className="gate-slot">
                <button
                  type="button"
                  className={`gate-toggle zgate ${config.zA ? 'on' : ''}`}
                  onClick={() => toggle('zA')}
                  title="Optional Phase Flip (Z) on Alice"
                >
                  Z_A
                </button>
              </div>
              <div className="wire-end mono">Alice</div>
            </div>

            {/* Qubit B wire */}
            <div className="wire-row">
              <div className="wire-label mono">Bob q[1] |0⟩</div>
              <div className="gate-slot">
                <button
                  type="button"
                  className={`gate-toggle ${config.xB ? 'on' : ''}`}
                  onClick={() => toggle('xB')}
                  title="Optional Bit Flip (X) on Bob before CNOT"
                >
                  X_B
                </button>
              </div>
              <div className="gate-slot">
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  — I —
                </span>
              </div>
              <div className="gate-slot">
                <button
                  type="button"
                  className={`gate-toggle cnot ${config.cnotAB ? 'on' : ''}`}
                  onClick={() => toggle('cnotAB')}
                  title="CNOT Gate (Entangles Alice and Bob)"
                >
                  CNOT ⊕
                </button>
              </div>
              <div className="gate-slot">
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  — I —
                </span>
              </div>
              <div className="wire-end mono">Bob</div>
            </div>
          </div>
        </div>
      </section>

      <section className="equation-card">
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Live Quantum State Equation ({stateInfo.name})
          </div>
          <div className="equation-main">{stateInfo.equation}</div>
        </div>

        <div className={`state-pill ${stateInfo.isEntangled ? 'entangled' : 'separable'}`}>
          <span className="pill-dot" />
          <span>
            {stateInfo.isEntangled
              ? `Entangled (Strength: ${(stateInfo.concurrence * 100).toFixed(0)}%)`
              : 'Not Entangled (0%)'}
          </span>
        </div>
      </section>

      <div className="callout-box">
        <Info size={17} color="var(--cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>What just happened? </strong>
          <span style={{ color: 'var(--text-secondary)' }}>{explanation}</span>
        </div>
      </div>

      <EntanglementLink
        concurrence={stateInfo.concurrence}
        entropyEbits={stateInfo.entropyEbits}
      />

      <section className="panel">
        <div className="panel-header" style={{ marginBottom: '12px' }}>
          <h3 className="panel-title">Outcome Probabilities for {stateInfo.symbol}</h3>
        </div>
        <div className="metrics-row">
          {BASIS_STATES.map((basis, idx) => {
            const amp = vector[idx];
            const probPct = amp * amp * 100;
            return (
              <div key={basis} className="metric-box">
                <div className="metric-label">State |{basis}⟩</div>
                <div className="metric-value" style={{ color: probPct > 0 ? 'var(--cyan)' : 'var(--text-muted)' }}>
                  {probPct.toFixed(1)}%
                </div>
                <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Amplitude α = {formatAmplitude(amp)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
