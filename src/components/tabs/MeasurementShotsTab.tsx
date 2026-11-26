import { useMemo, useState } from 'react';
import { Info, Play, RotateCcw, Sliders, Trash2, Zap } from 'lucide-react';
import {
  BELL_PRESETS,
  computeAgreementFromProbs,
  computeCorrelationStats,
  computeMeasurementProbabilities,
  emptyCounts,
  evaluateCircuit,
  getAliceConditionalGivenBob,
  getAliceMarginal,
  getBobConditionalGivenAlice,
  getBobMarginal,
  mergeCounts,
  runShots,
  sampleBit,
} from '../../quantum/math';
import type { BasisOutcome, BellPresetId, ShotCounts, StateInfo } from '../../types/quantum';
import { EntanglementLink } from '../EntanglementLink';
import { Histogram } from '../Histogram';

interface MeasurementShotsTabProps {
  labStateInfo: StateInfo;
}

const ANGLE_EXPERIMENTS = [
  { label: 'Same Angle (0°, 0°) → 100% Match', a: 0, b: 0 },
  { label: '45° Apart (0°, 45°) → 85.4% Match', a: 0, b: 45 },
  { label: '90° Apart (0°, 90°) → 50% Random', a: 0, b: 90 },
  { label: 'Opposite (0°, 180°) → 0% Match', a: 0, b: 180 },
];

const STATE_OPTIONS: Array<{ id: 'phi+' | 'lab' | '00' | 'phi-' | 'psi+' | 'psi-'; label: string }> = [
  { id: 'phi+', label: '|Φ+⟩ (Default Bell)' },
  { id: 'lab', label: 'Use Tab 1 State' },
  { id: '00', label: '|00⟩ (Unentangled)' },
  { id: 'phi-', label: '|Φ−⟩' },
  { id: 'psi+', label: '|Ψ+⟩' },
  { id: 'psi-', label: '|Ψ−⟩' },
];

export function MeasurementShotsTab({ labStateInfo }: MeasurementShotsTabProps) {
  const [selectedSource, setSelectedSource] = useState<'lab' | BellPresetId>('phi+');
  const [thetaA, setThetaA] = useState<number>(0);
  const [thetaB, setThetaB] = useState<number>(45);
  const [counts, setCounts] = useState<ShotCounts>(emptyCounts);

  const [aliceOutcome, setAliceOutcome] = useState<0 | 1 | null>(null);
  const [bobOutcome, setBobOutcome] = useState<0 | 1 | null>(null);
  const [collapseNote, setCollapseNote] = useState<string>(
    'Click "Measure Alice" or "Measure Bob" to see single-shot collapse, or click "Run 1,000 Shots" to test the probability law.'
  );

  const activeVector = useMemo(() => {
    if (selectedSource === 'lab') return labStateInfo.vector;
    return evaluateCircuit(BELL_PRESETS[selectedSource].config);
  }, [selectedSource, labStateInfo.vector]);

  const activeSymbol =
    selectedSource === 'lab' ? labStateInfo.symbol : BELL_PRESETS[selectedSource].symbol;
  const isPhiPlus =
    selectedSource === 'phi+' || (selectedSource === 'lab' && labStateInfo.id === 'phi+');

  const probs = useMemo(
    () => computeMeasurementProbabilities(activeVector, thetaA, thetaB),
    [activeVector, thetaA, thetaB]
  );

  const theoreticalMatchPct = computeAgreementFromProbs(probs);
  const observedStats = computeCorrelationStats(counts);

  const resetRound = () => {
    setAliceOutcome(null);
    setBobOutcome(null);
    setCollapseNote('Ready for a new measurement round. Measure Alice or Bob in any order.');
  };

  const recordSingleShot = (a: 0 | 1, b: 0 | 1) => {
    const key = `${a}${b}` as BasisOutcome;
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const handleMeasureAlice = () => {
    if (aliceOutcome !== null && bobOutcome !== null) {
      const [pA0] = getAliceMarginal(probs);
      const a = sampleBit(pA0);
      const [pB0GivenA] = getBobConditionalGivenAlice(probs, a);
      setAliceOutcome(a);
      setBobOutcome(null);
      setCollapseNote(
        `Alice measured |${a}⟩ at θ_A=${thetaA}°. Instantly, Bob's chance of getting |0⟩ became ${(pB0GivenA * 100).toFixed(1)}% and |1⟩ became ${((1 - pB0GivenA) * 100).toFixed(1)}%.`
      );
      return;
    }

    if (aliceOutcome !== null) return;

    if (bobOutcome === null) {
      const [pA0] = getAliceMarginal(probs);
      const a = sampleBit(pA0);
      const [pB0GivenA] = getBobConditionalGivenAlice(probs, a);
      setAliceOutcome(a);
      setCollapseNote(
        `Alice measured |${a}⟩ at θ_A=${thetaA}°. Instantly, Bob's chance of getting |0⟩ became ${(pB0GivenA * 100).toFixed(1)}% and |1⟩ became ${((1 - pB0GivenA) * 100).toFixed(1)}%.`
      );
    } else {
      const [pA0GivenB] = getAliceConditionalGivenBob(probs, bobOutcome);
      const a = sampleBit(pA0GivenB);
      setAliceOutcome(a);
      recordSingleShot(a, bobOutcome);
      setCollapseNote(
        `Alice measured |${a}⟩ (after Bob got |${bobOutcome}⟩). Shot |${a}${bobOutcome}⟩ added to histogram!`
      );
    }
  };

  const handleMeasureBob = () => {
    if (aliceOutcome !== null && bobOutcome !== null) {
      const [pB0] = getBobMarginal(probs);
      const b = sampleBit(pB0);
      const [pA0GivenB] = getAliceConditionalGivenBob(probs, b);
      setBobOutcome(b);
      setAliceOutcome(null);
      setCollapseNote(
        `Bob measured |${b}⟩ at θ_B=${thetaB}°. Instantly, Alice's chance of getting |0⟩ became ${(pA0GivenB * 100).toFixed(1)}% and |1⟩ became ${((1 - pA0GivenB) * 100).toFixed(1)}%.`
      );
      return;
    }

    if (bobOutcome !== null) return;

    if (aliceOutcome === null) {
      const [pB0] = getBobMarginal(probs);
      const b = sampleBit(pB0);
      const [pA0GivenB] = getAliceConditionalGivenBob(probs, b);
      setBobOutcome(b);
      setCollapseNote(
        `Bob measured |${b}⟩ at θ_B=${thetaB}°. Instantly, Alice's chance of getting |0⟩ became ${(pA0GivenB * 100).toFixed(1)}% and |1⟩ became ${((1 - pA0GivenB) * 100).toFixed(1)}%.`
      );
    } else {
      const [pB0GivenA] = getBobConditionalGivenAlice(probs, aliceOutcome);
      const b = sampleBit(pB0GivenA);
      setBobOutcome(b);
      recordSingleShot(aliceOutcome, b);
      setCollapseNote(
        `Bob measured |${b}⟩ (after Alice got |${aliceOutcome}⟩). Shot |${aliceOutcome}${b}⟩ added to histogram!`
      );
    }
  };

  const handleRun1000Shots = () => {
    const batch = runShots(probs, 1000);
    setCounts((prev) => mergeCounts(prev, batch));
    setAliceOutcome(null);
    setBobOutcome(null);
    setCollapseNote(
      `Ran 1,000 independent shots at θ_A=${thetaA}° and θ_B=${thetaB}°. Compare the bars to the yellow expected lines!`
    );
  };

  const handleClearCounts = () => {
    setCounts(emptyCounts());
    resetRound();
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <Sliders size={18} color="var(--cyan)" />
              Step 1: Set Alice &amp; Bob Detector Angles (θ_A &amp; θ_B)
            </h2>
            <p className="panel-subtitle">
              {isPhiPlus
                ? 'Formula for |Φ+⟩: P(00) = P(11) = 0.5·cos²((θ_A − θ_B)/2)   |   P(01) = P(10) = 0.5·sin²((θ_A − θ_B)/2)'
                : `Active state ${activeSymbol}: probabilities follow Born's rule for your chosen angles.`}
            </p>
          </div>

          <div className="preset-row">
            {STATE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`chip-btn ${selectedSource === opt.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSource(opt.id);
                  setCounts(emptyCounts());
                  resetRound();
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="preset-row" style={{ marginBottom: '14px' }}>
          {ANGLE_EXPERIMENTS.map((exp) => (
            <button
              key={exp.label}
              type="button"
              className={`chip-btn ${thetaA === exp.a && thetaB === exp.b ? 'active' : ''}`}
              onClick={() => {
                setThetaA(exp.a);
                setThetaB(exp.b);
                setCounts(emptyCounts());
                resetRound();
              }}
            >
              {exp.label}
            </button>
          ))}
        </div>

        <div className="grid-2">
          <div className="slider-card">
            <div className="slider-head">
              <span style={{ fontWeight: 600, color: 'var(--cyan)' }}>Alice Detector Angle (θ_A)</span>
              <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {thetaA}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={thetaA}
              aria-label="Alice measurement angle theta A"
              onChange={(e) => {
                setThetaA(Number(e.target.value));
                resetRound();
              }}
            />
          </div>

          <div className="slider-card">
            <div className="slider-head">
              <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>Bob Detector Angle (θ_B)</span>
              <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {thetaB}°
              </span>
            </div>
            <input
              type="range"
              className="bob-range"
              min={0}
              max={360}
              step={1}
              value={thetaB}
              aria-label="Bob measurement angle theta B"
              onChange={(e) => {
                setThetaB(Number(e.target.value));
                resetRound();
              }}
            />
          </div>
        </div>
      </section>

      <EntanglementLink
        concurrence={selectedSource === '00' ? 0 : selectedSource === 'lab' ? labStateInfo.concurrence : 1}
        entropyEbits={selectedSource === '00' ? 0 : selectedSource === 'lab' ? labStateInfo.entropyEbits : 1}
        aliceLabel={aliceOutcome === null ? '?' : `|${aliceOutcome}⟩`}
        bobLabel={bobOutcome === null ? '?' : `|${bobOutcome}⟩`}
        aliceAngleDeg={thetaA}
        bobAngleDeg={thetaB}
      />

      <div className="callout-box">
        <Info size={17} color="var(--violet)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Measurement Status: </strong>
          <span style={{ color: 'var(--text-secondary)' }}>{collapseNote}</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <Zap size={17} color="var(--violet)" />
              Step 2: Measure Single Qubits or Run 1,000 Shots
            </h3>
          </div>

          <div className="preset-row">
            <button
              type="button"
              className="btn btn-alice"
              onClick={handleMeasureAlice}
              disabled={aliceOutcome !== null && bobOutcome === null}
            >
              Measure Alice {aliceOutcome !== null ? `(=${aliceOutcome})` : ''}
            </button>
            <button
              type="button"
              className="btn btn-bob"
              onClick={handleMeasureBob}
              disabled={bobOutcome !== null && aliceOutcome === null}
            >
              Measure Bob {bobOutcome !== null ? `(=${bobOutcome})` : ''}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleRun1000Shots}>
              <Play size={15} />
              Run 1,000 Shots
            </button>
            <button type="button" className="btn" onClick={resetRound} title="Reset single shot">
              <RotateCcw size={15} />
            </button>
            <button type="button" className="btn" onClick={handleClearCounts} title="Clear histogram">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="metrics-row" style={{ marginBottom: '16px' }}>
          <div className="metric-box">
            <div className="metric-label">Total Shots</div>
            <div className="metric-value">{observedStats.total.toLocaleString()}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Correlation (Match %)</div>
            <div className="metric-value" style={{ color: 'var(--cyan)' }}>
              {observedStats.total > 0 ? `${observedStats.agreementPct.toFixed(1)}%` : '—'}
            </div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Expected: {theoreticalMatchPct.toFixed(1)}%
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Angle Difference |θ_A − θ_B|</div>
            <div className="metric-value">{Math.abs(thetaA - thetaB)}°</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Expected P(00) / P(01)</div>
            <div className="metric-value" style={{ fontSize: '0.95rem' }}>
              {(probs['00'] * 100).toFixed(1)}% / {(probs['01'] * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <Histogram counts={counts} theoreticalProbs={probs} />
      </section>
    </div>
  );
}
