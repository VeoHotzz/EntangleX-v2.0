import type {
  BasisOutcome,
  BellPresetId,
  ChshAngles,
  ChshPairResult,
  ChshResult,
  CircuitConfig,
  CorrelationStats,
  JointProbabilities,
  ShotCounts,
  StateInfo,
  StateVector,
} from '../types/quantum';

export const SQRT1_2 = Math.SQRT1_2;
export const TSIRELSON_BOUND = 2 * Math.SQRT2;
export const CLASSICAL_LIMIT = 2;

export const BELL_PRESETS: Record<
  BellPresetId,
  { symbol: string; name: string; equation: string; config: CircuitConfig }
> = {
  '00': {
    symbol: '|00⟩',
    name: 'Unentangled Ground State',
    equation: '|ψ⟩ = |00⟩',
    config: { xA: false, xB: false, hA: false, cnotAB: false, zA: false },
  },
  '+0': {
    symbol: '|+0⟩',
    name: 'Unentangled Superposition',
    equation: '|ψ⟩ = (1/√2)(|00⟩ + |10⟩)',
    config: { xA: false, xB: false, hA: true, cnotAB: false, zA: false },
  },
  'phi+': {
    symbol: '|Φ+⟩',
    name: 'Bell State Φ+',
    equation: '|Φ+⟩ = (1/√2)(|00⟩ + |11⟩)',
    config: { xA: false, xB: false, hA: true, cnotAB: true, zA: false },
  },
  'phi-': {
    symbol: '|Φ-⟩',
    name: 'Bell State Φ−',
    equation: '|Φ−⟩ = (1/√2)(|00⟩ − |11⟩)',
    config: { xA: true, xB: false, hA: true, cnotAB: true, zA: false },
  },
  'psi+': {
    symbol: '|Ψ+⟩',
    name: 'Bell State Ψ+',
    equation: '|Ψ+⟩ = (1/√2)(|01⟩ + |10⟩)',
    config: { xA: false, xB: true, hA: true, cnotAB: true, zA: false },
  },
  'psi-': {
    symbol: '|Ψ-⟩',
    name: 'Bell State Ψ−',
    equation: '|Ψ−⟩ = (1/√2)(|01⟩ − |10⟩)',
    config: { xA: true, xB: true, hA: true, cnotAB: true, zA: false },
  },
};

export function normalizeVector(v: StateVector): StateVector {
  const norm = Math.hypot(v[0], v[1], v[2], v[3]);
  if (norm < 1e-12) return [1, 0, 0, 0];
  return [v[0] / norm, v[1] / norm, v[2] / norm, v[3] / norm];
}

export function applyPauliXA(v: StateVector): StateVector {
  return [v[2], v[3], v[0], v[1]];
}

export function applyPauliXB(v: StateVector): StateVector {
  return [v[1], v[0], v[3], v[2]];
}

export function applyHadamardA(v: StateVector): StateVector {
  return [
    SQRT1_2 * (v[0] + v[2]),
    SQRT1_2 * (v[1] + v[3]),
    SQRT1_2 * (v[0] - v[2]),
    SQRT1_2 * (v[1] - v[3]),
  ];
}

export function applyCnotAB(v: StateVector): StateVector {
  return [v[0], v[1], v[3], v[2]];
}

export function applyPauliZA(v: StateVector): StateVector {
  return [v[0], v[1], -v[2], -v[3]];
}

export function evaluateCircuit(config: CircuitConfig): StateVector {
  let state: StateVector = [1, 0, 0, 0];
  if (config.xA) state = applyPauliXA(state);
  if (config.xB) state = applyPauliXB(state);
  if (config.hA) state = applyHadamardA(state);
  if (config.cnotAB) state = applyCnotAB(state);
  if (config.zA) state = applyPauliZA(state);
  return normalizeVector(state);
}

export function computeConcurrence(v: StateVector): number {
  const raw = 2 * Math.abs(v[0] * v[3] - v[1] * v[2]);
  return Math.min(1, Math.max(0, raw));
}

export function computeEntanglementEntropy(concurrence: number): number {
  const c = Math.min(1, Math.max(0, concurrence));
  const disc = Math.sqrt(Math.max(0, 1 - c * c));
  const lp = 0.5 * (1 + disc);
  const lm = 0.5 * (1 - disc);
  const h = (x: number) => (x > 1e-12 ? -x * Math.log2(x) : 0);
  return h(lp) + h(lm);
}

const BASIS_LABELS: BasisOutcome[] = ['00', '01', '10', '11'];

export function formatAmplitude(amp: number): string {
  if (Math.abs(amp - SQRT1_2) < 1e-5) return '1/√2';
  if (Math.abs(amp + SQRT1_2) < 1e-5) return '−1/√2';
  if (Math.abs(amp - 1) < 1e-5) return '1';
  if (Math.abs(amp + 1) < 1e-5) return '−1';
  return amp.toFixed(3).replace('-', '−');
}

export function formatStateEquation(v: StateVector, lhs = '|ψ⟩'): string {
  const terms: string[] = [];
  v.forEach((amp, idx) => {
    if (Math.abs(amp) < 1e-6) return;
    const ket = `|${BASIS_LABELS[idx]}⟩`;
    const isNeg = amp < 0;
    const absAmp = Math.abs(amp);
    const magStr =
      Math.abs(absAmp - 1) < 1e-5
        ? ''
        : Math.abs(absAmp - SQRT1_2) < 1e-5
          ? '(1/√2)'
          : absAmp.toFixed(3);

    if (terms.length === 0) {
      terms.push(`${isNeg ? '−' : ''}${magStr}${ket}`);
    } else {
      terms.push(`${isNeg ? '−' : '+'} ${magStr}${ket}`);
    }
  });

  if (terms.length === 0) return `${lhs} = 0`;

  // Factor common 1/√2 when exactly two equal-magnitude ±1/√2 terms exist
  const nonZero = v.filter((x) => Math.abs(x) > 1e-6);
  if (
    nonZero.length === 2 &&
    nonZero.every((x) => Math.abs(Math.abs(x) - SQRT1_2) < 1e-5)
  ) {
    const inner: string[] = [];
    v.forEach((amp, idx) => {
      if (Math.abs(amp) < 1e-6) return;
      const ket = `|${BASIS_LABELS[idx]}⟩`;
      if (inner.length === 0) {
        inner.push(`${amp < 0 ? '−' : ''}${ket}`);
      } else {
        inner.push(`${amp < 0 ? '−' : '+'} ${ket}`);
      }
    });
    return `${lhs} = (1/√2)(${inner.join(' ')})`;
  }

  return `${lhs} = ${terms.join(' ')}`;
}

function vectorsMatchUpToGlobalPhase(a: StateVector, b: StateVector): boolean {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  return Math.abs(Math.abs(dot) - 1) < 1e-5;
}

const CANONICAL_VECTORS: Record<BellPresetId, StateVector> = {
  '00': [1, 0, 0, 0],
  '+0': [SQRT1_2, 0, SQRT1_2, 0],
  'phi+': [SQRT1_2, 0, 0, SQRT1_2],
  'phi-': [SQRT1_2, 0, 0, -SQRT1_2],
  'psi+': [0, SQRT1_2, SQRT1_2, 0],
  'psi-': [0, SQRT1_2, -SQRT1_2, 0],
};

export function describeState(v: StateVector): StateInfo {
  const normV = normalizeVector(v);
  const concurrence = computeConcurrence(normV);
  const entropyEbits = computeEntanglementEntropy(concurrence);
  const isEntangled = concurrence > 1e-4;

  for (const id of Object.keys(CANONICAL_VECTORS) as BellPresetId[]) {
    if (vectorsMatchUpToGlobalPhase(normV, CANONICAL_VECTORS[id])) {
      const preset = BELL_PRESETS[id];
      return {
        id,
        symbol: preset.symbol,
        name: preset.name,
        equation: formatStateEquation(normV, preset.symbol),
        isEntangled,
        concurrence,
        entropyEbits,
        vector: normV,
      };
    }
  }

  return {
    id: 'custom',
    symbol: '|ψ⟩',
    name: isEntangled ? 'Entangled Two-Qubit State' : 'Separable Product State',
    equation: formatStateEquation(normV, '|ψ⟩'),
    isEntangled,
    concurrence,
    entropyEbits,
    vector: normV,
  };
}

/**
 * Joint measurement probabilities in rotated linear bases θ_A (Alice) and θ_B (Bob).
 * Eigenstates: |0_θ⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩, |1_θ⟩ = -sin(θ/2)|0⟩ + cos(θ/2)|1⟩.
 * For |Φ+⟩, this yields:
 *   P(00) = P(11) = 0.5 * cos²((θ_A - θ_B) / 2)
 *   P(01) = P(10) = 0.5 * sin²((θ_A - θ_B) / 2)
 */
export function computeMeasurementProbabilities(
  state: StateVector,
  thetaADeg: number,
  thetaBDeg: number
): JointProbabilities {
  const a = (thetaADeg * Math.PI) / 180;
  const b = (thetaBDeg * Math.PI) / 180;

  const basisA: [[number, number], [number, number]] = [
    [Math.cos(a / 2), Math.sin(a / 2)],
    [-Math.sin(a / 2), Math.cos(a / 2)],
  ];
  const basisB: [[number, number], [number, number]] = [
    [Math.cos(b / 2), Math.sin(b / 2)],
    [-Math.sin(b / 2), Math.cos(b / 2)],
  ];

  const prob = (u: 0 | 1, v: 0 | 1) => {
    const amp =
      basisA[u][0] * basisB[v][0] * state[0] +
      basisA[u][0] * basisB[v][1] * state[1] +
      basisA[u][1] * basisB[v][0] * state[2] +
      basisA[u][1] * basisB[v][1] * state[3];
    return Math.max(0, amp * amp);
  };

  return {
    '00': prob(0, 0),
    '01': prob(0, 1),
    '10': prob(1, 0),
    '11': prob(1, 1),
  };
}

export function getAliceMarginal(probs: JointProbabilities): [number, number] {
  return [probs['00'] + probs['01'], probs['10'] + probs['11']];
}

export function getBobMarginal(probs: JointProbabilities): [number, number] {
  return [probs['00'] + probs['10'], probs['01'] + probs['11']];
}

export function getBobConditionalGivenAlice(
  probs: JointProbabilities,
  aliceOutcome: 0 | 1
): [number, number] {
  const pA = aliceOutcome === 0 ? probs['00'] + probs['01'] : probs['10'] + probs['11'];
  if (pA < 1e-12) return [0.5, 0.5];
  if (aliceOutcome === 0) {
    return [probs['00'] / pA, probs['01'] / pA];
  }
  return [probs['10'] / pA, probs['11'] / pA];
}

export function getAliceConditionalGivenBob(
  probs: JointProbabilities,
  bobOutcome: 0 | 1
): [number, number] {
  const pB = bobOutcome === 0 ? probs['00'] + probs['10'] : probs['01'] + probs['11'];
  if (pB < 1e-12) return [0.5, 0.5];
  if (bobOutcome === 0) {
    return [probs['00'] / pB, probs['10'] / pB];
  }
  return [probs['01'] / pB, probs['11'] / pB];
}

export function sampleBit(probZero: number, rng: () => number = Math.random): 0 | 1 {
  return rng() < probZero ? 0 : 1;
}

export function sampleOutcome(
  probs: JointProbabilities,
  rng: () => number = Math.random
): BasisOutcome {
  const r = rng();
  const c0 = probs['00'];
  const c1 = c0 + probs['01'];
  const c2 = c1 + probs['10'];
  if (r < c0) return '00';
  if (r < c1) return '01';
  if (r < c2) return '10';
  return '11';
}

export function emptyCounts(): ShotCounts {
  return { '00': 0, '01': 0, '10': 0, '11': 0 };
}

export function runShots(
  probs: JointProbabilities,
  count: number,
  rng: () => number = Math.random
): ShotCounts {
  const counts = emptyCounts();
  for (let i = 0; i < count; i++) {
    const outcome = sampleOutcome(probs, rng);
    counts[outcome] += 1;
  }
  return counts;
}

export function mergeCounts(a: ShotCounts, b: ShotCounts): ShotCounts {
  return {
    '00': a['00'] + b['00'],
    '01': a['01'] + b['01'],
    '10': a['10'] + b['10'],
    '11': a['11'] + b['11'],
  };
}

export function computeCorrelationFromProbs(probs: JointProbabilities): number {
  return probs['00'] + probs['11'] - probs['01'] - probs['10'];
}

export function computeAgreementFromProbs(probs: JointProbabilities): number {
  return (probs['00'] + probs['11']) * 100;
}

export function computeCorrelationStats(counts: ShotCounts): CorrelationStats {
  const total = counts['00'] + counts['01'] + counts['10'] + counts['11'];
  if (total === 0) {
    return { total: 0, agreementPct: 0, correlationE: 0 };
  }
  const same = counts['00'] + counts['11'];
  const diff = counts['01'] + counts['10'];
  return {
    total,
    agreementPct: (same / total) * 100,
    correlationE: (same - diff) / total,
  };
}

export function computeChsh(
  state: StateVector,
  angles: ChshAngles,
  shotsPerPair = 0,
  rng: () => number = Math.random
): ChshResult {
  const specs: Array<{
    label: string;
    aliceAngle: number;
    bobAngle: number;
    sign: 1 | -1;
  }> = [
    { label: 'E(a₀, b₀)', aliceAngle: angles.a0, bobAngle: angles.b0, sign: 1 },
    { label: 'E(a₀, b₁)', aliceAngle: angles.a0, bobAngle: angles.b1, sign: -1 },
    { label: 'E(a₁, b₀)', aliceAngle: angles.a1, bobAngle: angles.b0, sign: 1 },
    { label: 'E(a₁, b₁)', aliceAngle: angles.a1, bobAngle: angles.b1, sign: 1 },
  ];

  const pairs = specs.map((spec): ChshPairResult => {
    const probs = computeMeasurementProbabilities(state, spec.aliceAngle, spec.bobAngle);
    const theoreticalE = computeCorrelationFromProbs(probs);
    if (shotsPerPair > 0) {
      const counts = runShots(probs, shotsPerPair, rng);
      const { correlationE } = computeCorrelationStats(counts);
      return {
        ...spec,
        probs,
        theoreticalE,
        simulatedE: correlationE,
        counts,
      };
    }
    return {
      ...spec,
      probs,
      theoreticalE,
    };
  }) as [ChshPairResult, ChshPairResult, ChshPairResult, ChshPairResult];

  const theoreticalS = Math.abs(
    pairs.reduce((acc, p) => acc + p.sign * p.theoreticalE, 0)
  );
  const simulatedS =
    shotsPerPair > 0
      ? Math.abs(pairs.reduce((acc, p) => acc + p.sign * (p.simulatedE ?? 0), 0))
      : undefined;

  return {
    pairs,
    theoreticalS,
    simulatedS,
    classicalLimit: CLASSICAL_LIMIT,
    tsirelsonBound: TSIRELSON_BOUND,
    violatesClassical: theoreticalS > CLASSICAL_LIMIT + 1e-6,
  };
}
