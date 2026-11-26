import { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  XCircle,
} from 'lucide-react';

interface ConceptCard {
  title: string;
  badge: string;
  summary: string;
  nuance: string;
}

interface VivaItem {
  q: string;
  a: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const MODEL_STEPS = [
  {
    step: '1. Prepare (Tab 1)',
    title: 'Create Superposition + Link',
    detail:
      'Both qubits start at |00⟩. The Hadamard gate (H) puts Alice into a 50/50 superposition (|+0⟩), and the CNOT gate copies Alice’s state onto Bob—creating the entangled Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2.',
  },
  {
    step: '2. Rotate (Tab 2)',
    title: 'Choose Independent Angles',
    detail:
      'Alice rotates her detector to θ_A and Bob rotates his to θ_B. Our simulation projects the shared state onto those two angles using Born’s rule: P(00)=P(11)=0.5·cos²((θ_A−θ_B)/2) and P(01)=P(10)=0.5·sin²((θ_A−θ_B)/2).',
  },
  {
    step: '3. Collapse & Sample (Tab 2)',
    title: 'Single Collapse vs. 1,000 Shots',
    detail:
      'Clicking Measure Alice collapses one qubit randomly (50/50) and immediately updates Bob’s conditional probability. Clicking Run 1,000 Shots repeats this experiment 1,000 times so the 4-bar histogram converges to the theoretical probabilities.',
  },
];

const NUANCED_CONCEPTS: ConceptCard[] = [
  {
    title: 'Superposition ≠ Entanglement',
    badge: 'Key Nuance',
    summary:
      'Turning ON only the H gate creates |+0⟩ = (|00⟩ + |10⟩)/√2. Alice is 50/50 random, yet entanglement is still 0%.',
    nuance:
      'Why? Because Bob is always |0⟩ regardless of what Alice gets. Entanglement only exists when Bob’s state cannot be written separately from Alice’s (which requires CNOT).',
  },
  {
    title: 'What Entanglement Actually Links',
    badge: 'Core Concept',
    summary:
      'An entangled pair acts like one shared system rather than two independent coins.',
    nuance:
      'In |Φ+⟩, neither qubit has a predetermined 0 or 1 before measurement—only their relationship (“we will match at the same angle”) is fixed.',
  },
  {
    title: 'Why No Faster-Than-Light Messaging?',
    badge: 'Common Trap',
    summary:
      'Even though measuring Alice instantly collapses Bob’s conditional state, Alice cannot send a message to Bob.',
    nuance:
      'Because Alice’s own outcome is always completely random (50% 0, 50% 1), Bob’s local statistics stay 50/50 until Alice sends her result over a normal classical channel.',
  },
  {
    title: 'Why Angle Difference (θ_A − θ_B) Matters',
    badge: 'Tab 2 Physics',
    summary:
      'Match % drops smoothly from 100% (Δθ=0°) → 85.4% (45°) → 50% (90°) → 0% (180°).',
    nuance:
      'Notice that only the difference θ_A − θ_B matters for |Φ+⟩: rotating both Alice and Bob by the same amount (e.g. 30° and 30°) still gives 100% match!',
  },
  {
    title: 'Matching vs. Opposite Bell States (Φ vs Ψ)',
    badge: '4 Bell States',
    summary:
      '|Φ+⟩ and |Φ−⟩ always produce matching bits (00 or 11); |Ψ+⟩ and |Ψ−⟩ always produce opposite bits (01 or 10).',
    nuance:
      'The + or − sign is the relative quantum phase. At 0°, |Φ+⟩ and |Φ−⟩ look identical in computational basis counts, but their correlations flip differently when measured at rotated angles!',
  },
  {
    title: 'Shot Noise in 1,000 Shots',
    badge: 'Simulation',
    summary:
      'At 90° apart, theory says 25% per bar, but 1,000 shots might show 24.1%, 25.7%, 26.8%, 23.4%.',
    nuance:
      'Each measurement shot is a true probabilistic sample (binomial noise). Running more shots shrinks the gap between the bars and the yellow P_theory lines.',
  },
];

const VIVA_QUESTIONS: VivaItem[] = [
  {
    q: '1. What is quantum entanglement in one simple sentence?',
    a: 'Quantum entanglement is a correlation where two or more qubits form a single joint quantum state, so measuring one qubit immediately determines the conditional state of the other regardless of distance.',
  },
  {
    q: '2. Why does the circuit start with H followed by CNOT?',
    a: 'H puts Qubit A into superposition (|0⟩+|1⟩)/√2, and CNOT uses Qubit A as the control to flip Qubit B—turning |00⟩+|10⟩ into |00⟩+|11⟩. Without H, CNOT on |00⟩ does nothing; without CNOT, H produces unentangled |+0⟩.',
  },
  {
    q: '3. How can you tell in your simulation that |+0⟩ is NOT entangled?',
    a: 'In Tab 1, when only H is ON, Alice is 50% |0⟩ and 50% |1⟩, while Bob is always |0⟩ (|00⟩ and |10⟩ at 50% each). The entanglement link stays dashed/gray (Concurrence = 0%) because Bob’s bit is independent of Alice.',
  },
  {
    q: '4. What is the difference between |Φ+⟩, |Φ−⟩, |Ψ+⟩, and |Ψ−⟩?',
    a: 'All four are maximally entangled Bell states (100% entanglement). |Φ±⟩ give matching outcomes (00 or 11) while |Ψ±⟩ give opposite outcomes (01 or 10); the + and − denote relative phase.',
  },
  {
    q: '5. Explain the probability formulas used in Tab 2.',
    a: 'For |Φ+⟩ measured at angles θ_A and θ_B, P(00)=P(11)=0.5·cos²((θ_A−θ_B)/2) and P(01)=P(10)=0.5·sin²((θ_A−θ_B)/2). Matching probability is cos²((θ_A−θ_B)/2), which is 100% at 0°, 85.4% at 45°, 50% at 90°, and 0% at 180°.',
  },
  {
    q: '6. What happens internally when we click "Measure Alice" before "Measure Bob"?',
    a: 'First, Alice is sampled from her marginal probability (50/50). Next, Bob’s probability distribution collapses conditionally using P(b | A=a) = P(ab) / P_A(a). Finally, clicking Measure Bob samples from that collapsed distribution.',
  },
  {
    q: '7. Does entanglement violate Einstein’s speed-of-light limit (can it transmit messages)?',
    a: 'No. Alice’s individual measurement result is always random (50/50), and Bob’s local marginal probabilities remain 50/50 no matter what angle Alice chooses. Information requires a classical channel to compare outcomes.',
  },
  {
    q: '8. Why do we run 1,000 shots instead of just 1 shot?',
    a: 'A single quantum measurement gives only one random outcome (e.g., |11⟩) and cannot reveal probabilities. Repeating 1,000 independent shots lets the observed bar percentages converge to the theoretical curve.',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which two quantum gates create the Bell state |Φ+⟩ starting from |00⟩?',
    options: [
      'CNOT followed by Z',
      'Hadamard (H) on Qubit A followed by CNOT (A → B)',
      'Two Hadamard gates (H on A and H on B)',
      'Pauli-X on A followed by Pauli-X on B',
    ],
    correctIndex: 1,
    explanation: 'H puts Alice into (|0⟩+|1⟩)/√2, and CNOT entangles Bob with Alice to yield (|00⟩+|11⟩)/√2.',
  },
  {
    id: 2,
    question: 'If you turn ON only the Hadamard (H) gate in Tab 1 (with CNOT OFF), what state is created?',
    options: [
      'Maximally entangled |Φ+⟩',
      'Unentangled |00⟩',
      'Superposition |+0⟩, which is NOT entangled',
      'Opposite Bell state |Ψ+⟩',
    ],
    correctIndex: 2,
    explanation: '|+0⟩ = (|00⟩+|10⟩)/√2 factors cleanly as ((|0⟩+|1⟩)/√2) ⊗ |0⟩, so Bob stays independent.',
  },
  {
    id: 3,
    question: 'For the Bell state |Φ+⟩ = (1/√2)(|00⟩ + |11⟩), what are the possible outcomes when both qubits are measured at 0°?',
    options: [
      '|01⟩ or |10⟩ (50% each)',
      '|00⟩ or |11⟩ (50% each)',
      'Always |00⟩ (100%)',
      'All four states at 25% each',
    ],
    correctIndex: 1,
    explanation: 'At Δθ = 0°, cos²(0) = 1 and sin²(0) = 0, so P(00) = P(11) = 0.5 and P(01) = P(10) = 0.',
  },
  {
    id: 4,
    question: 'Which Bell state ALWAYS gives opposite measurement bits (|01⟩ or |10⟩) at matching angles?',
    options: [
      '|Φ+⟩',
      '|Φ−⟩',
      '|Ψ+⟩ (and |Ψ−⟩)',
      '|00⟩',
    ],
    correctIndex: 2,
    explanation: '|Ψ±⟩ = (|01⟩ ± |10⟩)/√2 only has amplitude in |01⟩ and |10⟩, so Alice and Bob always disagree.',
  },
  {
    id: 5,
    question: 'In Tab 2 on |Φ+⟩, if θ_A = 0° and θ_B = 90°, what is the expected Correlation (Match %)?',
    options: [
      '100%',
      '85.4%',
      '50%',
      '0%',
    ],
    correctIndex: 2,
    explanation: 'At Δθ = 90°, (θ_A−θ_B)/2 = 45°, so P(00)=P(11)=0.5·cos²(45°)=25% each → 50% total match.',
  },
  {
    id: 6,
    question: 'What happens to the histogram bars when θ_A = 0° and θ_B = 45° on |Φ+⟩?',
    options: [
      'Match % is ~85.4% (|00⟩ and |11⟩ ~42.7% each)',
      'Match % is 100%',
      'Match % is 0%',
      'Only |00⟩ appears',
    ],
    correctIndex: 0,
    explanation: '0.5·cos²(22.5°) ≈ 0.4268 (42.7% each for 00 and 11), giving 85.4% matching outcomes.',
  },
  {
    id: 7,
    question: 'If Alice measures her |Φ+⟩ qubit at 0° and gets |1⟩, what happens to Bob’s qubit at 0°?',
    options: [
      'Bob stays 50% |0⟩ and 50% |1⟩',
      'Bob’s probability collapses to 100% |1⟩',
      'Bob’s probability collapses to 100% |0⟩',
      'Bob’s qubit disappears',
    ],
    correctIndex: 1,
    explanation: 'From |Φ+⟩ = (|00⟩+|11⟩)/√2, observing Alice = |1⟩ projects the joint state onto |11⟩.',
  },
  {
    id: 8,
    question: 'Why does changing θ_A from 0° to 60° and θ_B from 0° to 60° keep the Match % at 100%?',
    options: [
      'Because |Φ+⟩ probabilities depend only on the difference θ_A − θ_B',
      'Because 60° turns off entanglement',
      'Because CNOT resets angles to 0°',
      'Because Bob ignores θ_B',
    ],
    correctIndex: 0,
    explanation: 'Since θ_A − θ_B = 60° − 60° = 0°, cos²(0) = 1 remains unchanged.',
  },
  {
    id: 9,
    question: 'If Alice and Bob share |Φ+⟩, can Alice send a secret bit to Bob faster than light just by rotating θ_A?',
    options: [
      'Yes, Bob sees the angle change immediately',
      'Yes, if she runs 1,000 shots at once',
      'No, Bob’s local outcomes always remain 50/50 random without classical communication',
      'Only when θ_A = 180°',
    ],
    correctIndex: 2,
    explanation: 'Bob’s marginal probability P(0) = P(00)+P(10) = 0.5 regardless of θ_A (no-signaling theorem).',
  },
  {
    id: 10,
    question: 'In the Tab 2 histogram, what do the yellow horizontal lines (━) represent?',
    options: [
      'The maximum shot count ever recorded',
      'The exact theoretical probability P_theory predicted by quantum mechanics',
      'Measurement error margin',
      'Classical limit 50%',
    ],
    correctIndex: 1,
    explanation: 'The yellow markers show exact Born-rule P_theory so you can visually compare simulated shots against theory.',
  },
  {
    id: 11,
    question: 'What is the expected Match % for |Φ+⟩ when θ_A = 0° and θ_B = 180° (Opposite)?',
    options: [
      '100%',
      '50%',
      '25%',
      '0% (100% opposite: |01⟩ or |10⟩)',
    ],
    correctIndex: 3,
    explanation: 'At Δθ = 180°, (θ_A−θ_B)/2 = 90°, so cos²(90°) = 0 and sin²(90°) = 1 → P(01)=P(10)=50%.',
  },
  {
    id: 12,
    question: 'Why does the 1,000-shot Match % at 90° sometimes show 48.2% or 51.4% instead of exactly 50.0%?',
    options: [
      'A bug in the CNOT gate',
      'Natural statistical shot noise from finite random sampling',
      'Because θ_A drifted during the run',
      'Because entanglement decays after 500 shots',
    ],
    correctIndex: 1,
    explanation: 'Quantum measurements are probabilistic; finite samples fluctuate around 50% by ~±1.6% for N = 1,000.',
  },
];

export function LearnVivaQuizTab() {
  const [openVivaIdx, setOpenVivaIdx] = useState<number | null>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const resetQuiz = () => {
    setAnswers({});
  };

  return (
    <div className="stack">
      {/* Section 1: How the whole model works */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <Cpu size={18} color="var(--cyan)" />
              How the EntangleX v2 Simulation Works (Big Picture)
            </h2>
            <p className="panel-subtitle">
              A 3-step summary connecting Tab 1 (State Creation) and Tab 2 (Measurement &amp; 1,000 Shots).
            </p>
          </div>
        </div>

        <div className="three-col-grid">
          {MODEL_STEPS.map((item) => (
            <div key={item.step} className="metric-box" style={{ padding: '16px' }}>
              <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--cyan)', fontWeight: 700, marginBottom: '4px' }}>
                {item.step}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: '8px' }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Nuanced but Basic Entanglement Concepts */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <Lightbulb size={18} color="var(--amber)" />
              Core &amp; Nuanced Concepts of Quantum Entanglement
            </h2>
            <p className="panel-subtitle">
              Simple intuition for the subtle points examiners love to test.
            </p>
          </div>
        </div>

        <div className="grid-2">
          {NUANCED_CONCEPTS.map((card) => (
            <div key={card.title} className="slider-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{card.title}</strong>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'var(--violet-soft)',
                    color: '#e9d5ff',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {card.badge}
                </span>
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--cyan)' }}>{card.summary}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {card.nuance}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Viva Questions & Answers */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <BookOpen size={18} color="var(--violet)" />
              Viva Questions &amp; Ready Answers ({VIVA_QUESTIONS.length} Questions)
            </h2>
            <p className="panel-subtitle">
              Click any question to expand a crisp, examiner-ready answer.
            </p>
          </div>
        </div>

        <div className="stack" style={{ gap: '10px' }}>
          {VIVA_QUESTIONS.map((item, idx) => {
            const isOpen = openVivaIdx === idx;
            return (
              <div key={item.q} className="viva-item">
                <button
                  type="button"
                  className="viva-trigger"
                  onClick={() => setOpenVivaIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </button>
                {isOpen && (
                  <div className="viva-answer">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Interactive 12-Question Quiz */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <HelpCircle size={18} color="var(--emerald)" />
              Self-Check Quiz ({QUIZ_QUESTIONS.length} Questions)
            </h2>
            <p className="panel-subtitle">
              Test your understanding before your viva. Click an option for instant feedback.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="state-pill entangled" style={{ background: 'var(--emerald-soft)', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#a7f3d0' }}>
              <Award size={15} />
              <span className="mono">
                Score: {correctCount} / {QUIZ_QUESTIONS.length} ({answeredCount} answered)
              </span>
            </div>
            <button type="button" className="btn" onClick={resetQuiz}>
              <RotateCcw size={15} />
              Reset Quiz
            </button>
          </div>
        </div>

        <div className="stack" style={{ gap: '14px' }}>
          {QUIZ_QUESTIONS.map((q) => {
            const picked = answers[q.id];
            const isAnswered = picked !== undefined;
            const isCorrect = picked === q.correctIndex;

            return (
              <div key={q.id} className="slider-card">
                <div style={{ fontWeight: 600, fontSize: '0.94rem', marginBottom: '12px' }}>
                  <span className="mono" style={{ color: 'var(--cyan)', marginRight: '8px' }}>
                    Q{q.id}.
                  </span>
                  {q.question}
                </div>

                <div className="quiz-options">
                  {q.options.map((opt, optIdx) => {
                    let cls = 'quiz-option';
                    if (isAnswered) {
                      if (optIdx === q.correctIndex) cls += ' correct';
                      else if (optIdx === picked) cls += ' wrong';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cls}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                      >
                        <span className="mono" style={{ opacity: 0.75, marginRight: '8px' }}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div
                    className={`quiz-feedback ${isCorrect ? 'ok' : 'bad'}`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <XCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div>
                      <strong>{isCorrect ? 'Correct! ' : 'Not quite. '}</strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
