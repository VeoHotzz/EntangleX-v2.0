import { describe, expect, it } from 'vitest';
import {
  BELL_PRESETS,
  CLASSICAL_LIMIT,
  TSIRELSON_BOUND,
  computeChsh,
  computeConcurrence,
  computeCorrelationFromProbs,
  computeEntanglementEntropy,
  computeMeasurementProbabilities,
  describeState,
  evaluateCircuit,
  getBobConditionalGivenAlice,
  runShots,
} from './math';

describe('Bell State Lab quantum math', () => {
  it('generates |00⟩ and all 4 Bell states from circuit gates', () => {
    const g00 = evaluateCircuit(BELL_PRESETS['00'].config);
    expect(g00).toEqual([1, 0, 0, 0]);
    expect(describeState(g00).id).toBe('00');
    expect(computeConcurrence(g00)).toBeCloseTo(0, 6);

    const phiPlus = evaluateCircuit(BELL_PRESETS['phi+'].config);
    expect(phiPlus[0]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(phiPlus[1]).toBeCloseTo(0, 6);
    expect(phiPlus[2]).toBeCloseTo(0, 6);
    expect(phiPlus[3]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(describeState(phiPlus).id).toBe('phi+');
    expect(computeConcurrence(phiPlus)).toBeCloseTo(1, 6);
    expect(computeEntanglementEntropy(computeConcurrence(phiPlus))).toBeCloseTo(1, 6);

    const phiMinus = evaluateCircuit(BELL_PRESETS['phi-'].config);
    expect(phiMinus[0]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(phiMinus[3]).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(describeState(phiMinus).id).toBe('phi-');
    expect(computeConcurrence(phiMinus)).toBeCloseTo(1, 6);

    const psiPlus = evaluateCircuit(BELL_PRESETS['psi+'].config);
    expect(psiPlus[1]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(psiPlus[2]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(describeState(psiPlus).id).toBe('psi+');
    expect(computeConcurrence(psiPlus)).toBeCloseTo(1, 6);

    const psiMinus = evaluateCircuit(BELL_PRESETS['psi-'].config);
    expect(psiMinus[1]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(psiMinus[2]).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(describeState(psiMinus).id).toBe('psi-');
    expect(computeConcurrence(psiMinus)).toBeCloseTo(1, 6);
  });

  it('keeps |+0⟩ unentangled when H is active without CNOT', () => {
    const plusZero = evaluateCircuit(BELL_PRESETS['+0'].config);
    const info = describeState(plusZero);
    expect(info.id).toBe('+0');
    expect(info.isEntangled).toBe(false);
    expect(info.concurrence).toBeCloseTo(0, 6);
  });
});

describe('Independent Measurement & Shots probabilities', () => {
  it('matches P(00)=P(11)=0.5*cos^2((θ_A-θ_B)/2) and P(01)=P(10)=0.5*sin^2((θ_A-θ_B)/2) for |Φ+⟩', () => {
    const phiPlus = evaluateCircuit(BELL_PRESETS['phi+'].config);
    const pairs = [
      [0, 0],
      [0, 90],
      [45, 135],
      [30, 210],
      [120, 45],
    ];

    for (const [thetaA, thetaB] of pairs) {
      const probs = computeMeasurementProbabilities(phiPlus, thetaA, thetaB);
      const halfDiff = ((thetaA - thetaB) * Math.PI) / 360;
      const expectedSame = 0.5 * Math.cos(halfDiff) ** 2;
      const expectedDiff = 0.5 * Math.sin(halfDiff) ** 2;

      expect(probs['00']).toBeCloseTo(expectedSame, 10);
      expect(probs['11']).toBeCloseTo(expectedSame, 10);
      expect(probs['01']).toBeCloseTo(expectedDiff, 10);
      expect(probs['10']).toBeCloseTo(expectedDiff, 10);
      expect(probs['00'] + probs['01'] + probs['10'] + probs['11']).toBeCloseTo(1, 10);
      expect(computeCorrelationFromProbs(probs)).toBeCloseTo(
        Math.cos(((thetaA - thetaB) * Math.PI) / 180),
        10
      );
    }
  });

  it('collapses Bob conditional distribution after measuring Alice', () => {
    const phiPlus = evaluateCircuit(BELL_PRESETS['phi+'].config);
    const probs = computeMeasurementProbabilities(phiPlus, 45, 45);
    expect(getBobConditionalGivenAlice(probs, 0)[0]).toBeCloseTo(1, 10);
    expect(getBobConditionalGivenAlice(probs, 0)[1]).toBeCloseTo(0, 10);
    expect(getBobConditionalGivenAlice(probs, 1)[0]).toBeCloseTo(0, 10);
    expect(getBobConditionalGivenAlice(probs, 1)[1]).toBeCloseTo(1, 10);
  });

  it('samples exact requested shot count', () => {
    const phiPlus = evaluateCircuit(BELL_PRESETS['phi+'].config);
    const probs = computeMeasurementProbabilities(phiPlus, 0, 60);
    const counts = runShots(probs, 1000);
    expect(counts['00'] + counts['01'] + counts['10'] + counts['11']).toBe(1000);
  });
});

describe('CHSH Bell Test', () => {
  it('achieves Tsirelson bound 2*sqrt(2) ≈ 2.828 for |Φ+⟩ at optimal angles', () => {
    const phiPlus = evaluateCircuit(BELL_PRESETS['phi+'].config);
    const res = computeChsh(phiPlus, { a0: 0, a1: 90, b0: 45, b1: 135 });
    expect(res.theoreticalS).toBeCloseTo(TSIRELSON_BOUND, 6);
    expect(res.violatesClassical).toBe(true);
    expect(res.theoreticalS).toBeGreaterThan(CLASSICAL_LIMIT);
  });

  it('respects classical bound S <= 2 for unentangled |00⟩', () => {
    const g00 = evaluateCircuit(BELL_PRESETS['00'].config);
    const res = computeChsh(g00, { a0: 0, a1: 90, b0: 45, b1: 135 });
    expect(res.theoreticalS).toBeLessThanOrEqual(CLASSICAL_LIMIT + 1e-9);
    expect(res.violatesClassical).toBe(false);
  });
});
