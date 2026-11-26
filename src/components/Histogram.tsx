import type { BasisOutcome, JointProbabilities, ShotCounts } from '../types/quantum';

interface HistogramProps {
  counts: ShotCounts;
  theoreticalProbs: JointProbabilities;
}

const OUTCOMES: BasisOutcome[] = ['00', '01', '10', '11'];

export function Histogram({ counts, theoreticalProbs }: HistogramProps) {
  const total = counts['00'] + counts['01'] + counts['10'] + counts['11'];

  return (
    <div>
      <div className="histogram-grid">
        {OUTCOMES.map((outcome) => {
          const count = counts[outcome];
          const observedPct = total > 0 ? (count / total) * 100 : 0;
          const theoryPct = theoreticalProbs[outcome] * 100;
          const isCorrelated = outcome === '00' || outcome === '11';

          return (
            <div key={outcome} className="bar-col">
              <div className="bar-count">
                {count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({observedPct.toFixed(1)}%)</span>
              </div>
              <div className="bar-track" title={`Observed: ${observedPct.toFixed(1)}% | Theory: ${theoryPct.toFixed(1)}%`}>
                <div
                  className={`bar-fill ${isCorrelated ? 'corr' : 'anti'}`}
                  style={{ height: `${Math.min(100, observedPct)}%` }}
                />
                <div
                  className="theory-marker"
                  style={{ bottom: `${Math.min(100, theoryPct)}%` }}
                />
              </div>
              <div className="bar-label">|{outcome}⟩</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '10px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          <span style={{ color: 'var(--cyan)' }}>■</span> Same-bit outcomes (|00⟩, |11⟩)
        </span>
        <span>
          <span style={{ color: 'var(--violet)' }}>■</span> Opposite-bit outcomes (|01⟩, |10⟩)
        </span>
        <span>
          <span style={{ color: 'var(--amber)' }}>━</span> Theoretical probability P_theory
        </span>
      </div>
    </div>
  );
}
