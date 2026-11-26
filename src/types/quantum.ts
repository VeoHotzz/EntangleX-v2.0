export type BasisOutcome = '00' | '01' | '10' | '11';

export type StateVector = [number, number, number, number];

export type BellPresetId = '00' | '+0' | 'phi+' | 'phi-' | 'psi+' | 'psi-';

export interface CircuitConfig {
  xA: boolean;
  xB: boolean;
  hA: boolean;
  cnotAB: boolean;
  zA: boolean;
}

export interface StateInfo {
  id: BellPresetId | 'custom';
  symbol: string;
  name: string;
  equation: string;
  isEntangled: boolean;
  concurrence: number;
  entropyEbits: number;
  vector: StateVector;
}

export interface JointProbabilities {
  '00': number;
  '01': number;
  '10': number;
  '11': number;
}

export interface ShotCounts {
  '00': number;
  '01': number;
  '10': number;
  '11': number;
}

export interface CorrelationStats {
  total: number;
  agreementPct: number;
  correlationE: number;
}

export interface ChshAngles {
  a0: number;
  a1: number;
  b0: number;
  b1: number;
}

export interface ChshPairResult {
  label: string;
  aliceAngle: number;
  bobAngle: number;
  sign: 1 | -1;
  theoreticalE: number;
  probs: JointProbabilities;
  simulatedE?: number;
  counts?: ShotCounts;
}

export interface ChshResult {
  pairs: [ChshPairResult, ChshPairResult, ChshPairResult, ChshPairResult];
  theoreticalS: number;
  simulatedS?: number;
  classicalLimit: number;
  tsirelsonBound: number;
  violatesClassical: boolean;
}
