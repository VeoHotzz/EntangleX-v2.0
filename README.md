# EntangleX-v2.0
A Digital Simulation

# EntangleX v2 — User Guide

Slide 1 lets you build, inspect, and compare **unentangled states** and all **4 maximally entangled Bell states** using quantum logic gates.

### 1.1 Controls & Interface Breakdown

1. **6 Quick Preset Cards:**
   - **`|00⟩` (Unentangled):** Both Alice and Bob start at `0`. No gates are active. Both qubits are completely independent.
   - **`|+0⟩` (H Gate Only):** Only the Hadamard gate (`H`) is ON for Alice. Alice becomes a 50/50 superposition of `0` and `1`, while Bob remains `0`. **Important:** Even though Alice is random, the qubits are still **NOT entangled** (`0%`).
   - **`|Φ+⟩` (Bell State):** `H` + `CNOT` ON. Both qubits always match (`00` or `11`) with a `+` phase.
   - **`|Φ−⟩` (Bell State):** `X_A` + `H` + `CNOT` ON. Both qubits always match (`00` or `11`) with a `−` phase.
   - **`|Ψ+⟩` (Bell State):** `X_B` + `H` + `CNOT` ON. Both qubits are always opposite (`01` or `10`) with a `+` phase.
   - **`|Ψ−⟩` (Bell State):** `X_A` + `X_B` + `H` + `CNOT` ON. Both qubits are always opposite (`01` or `10`) with a `−` phase.
   - **`Reset to |00⟩` button:** Turns all gates OFF and returns to the ground state `|00⟩`.

2. **Interactive Quantum Circuit (`Alice q[0] |0⟩` and `Bob q[1] |0⟩`):**
   - **`X_A` / `X_B` (Pauli-X / Bit Flip):** Flips a qubit from `|0⟩` to `|1⟩` before entanglement. Used to switch between `Φ` (matching) and `Ψ` (opposite) or `+` and `−` variants.
   - **`H` (Hadamard Gate):** Places Alice's qubit into an equal 50/50 superposition: $\frac{|0\rangle + |1\rangle}{\sqrt{2}}$.
   - **`CNOT ⊕` (Controlled-NOT Gate):** Uses Alice (`q[0]`) as the control dot and Bob (`q[1]`) as the target (`⊕`). Whenever Alice is `|1⟩`, Bob's bit flips. **This is the gate that creates entanglement once Alice is in superposition.**
   - **`Z_A` (Pauli-Z / Phase Flip):** Flips the sign (`+` ↔ `−`) on the `|1⟩` part of Alice's qubit.

3. **Live Quantum State Equation & Entanglement Pill:**
   - Displays the exact Dirac equation in real time (for example, `|Φ+⟩ = (1/√2)(|00⟩ + |11⟩)`).
   - Shows **Entangled (Strength: 100%)** in violet when entangled, or **Not Entangled (0%)** in gray when separable.

4. **"What just happened?" Banner:**
   - Automatically explains in plain English what your current gate combination just did (for instance, why `H` alone does not entangle, or why `CNOT` alone on `|00⟩` does nothing).

5. **Visual Entanglement Link:**
   - **Broken gray dashed line:** Qubits are unentangled (`C = 0.00 • 0.00 ebit`) — Alice and Bob behave independently.
   - **Glowing animated cyan-violet-emerald wave:** Qubits are entangled (`C = 1.00 • 1.00 ebit`) — Alice and Bob form one linked quantum system.

6. **Outcome Probabilities Cards (`|00⟩`, `|01⟩`, `|10⟩`, `|11⟩`):**
   - Shows the exact `%` probability ($|\alpha|^2$) and wave-function amplitude ($\alpha$) for each of the 4 possible 2-qubit outcomes.

### 1.2 Step-by-Step Walkthrough on Slide 1
1. Click **`|00⟩` (Unentangled)** → See `100.0%` on `|00⟩` and the broken gray link (`Not Entangled`).
2. Click **`H`** on Alice's wire → The state becomes `|+0⟩` with `50.0%` `|00⟩` and `50.0%` `|10⟩`. Notice the link is **still gray/dashed** because superposition alone does not create entanglement.
3. Click **`CNOT ⊕`** on Bob's wire → The link lights up (`Entangled Strength: 100%`), and probabilities shift to `50.0%` `|00⟩` and `50.0%` `|11⟩` (`|Φ+⟩`).
4. Click **`|Ψ+⟩`** → Probabilities shift to `50.0%` `|01⟩` and `50.0%` `|10⟩` (Alice and Bob are now always opposite).

---

## Part 2: Slide 2 — `2. Measure & 1,000 Shots`

Slide 2 demonstrates how **measurement angles**, **single-qubit wave-function collapse**, and **repeated statistical trials (1,000 shots)** behave on an entangled pair.

### 2.1 Controls & Interface Breakdown

1. **State Selector Chips:**
   - Defaults to **`|Φ+⟩ (Default Bell)`**, which directly obeys the classic correlation formulas:
     $$P(00) = P(11) = 0.5\cos^2\!\left(\frac{\theta_A - \theta_B}{2}\right), \qquad P(01) = P(10) = 0.5\sin^2\!\left(\frac{\theta_A - \theta_B}{2}\right)$$
   - You can also choose **`Use Tab 1 State`** (uses whatever circuit you built in Slide 1), **`|00⟩ (Unentangled)`**, **`|Φ−⟩`**, **`|Ψ+⟩`**, or **`|Ψ−⟩`**. Changing states clears old histogram bars.

2. **Quick Angle Experiment Presets:**
   - **`Same Angle (0°, 0°) → 100% Match`:** `P(00) = P(11) = 50%`, `P(01) = P(10) = 0%`.
   - **`45° Apart (0°, 45°) → 85.4% Match`:** `P(00) = P(11) ≈ 42.7%`, `P(01) = P(10) ≈ 7.3%`.
   - **`90° Apart (0°, 90°) → 50% Random`:** All 4 outcomes (`00`, `01`, `10`, `11`) are `25.0%` each.
   - **`Opposite (0°, 180°) → 0% Match`:** `P(01) = P(10) = 50%`, `P(00) = P(11) = 0%`.

3. **Independent Angle Sliders (`θ_A` and `θ_B`):**
   - Adjust Alice's detector angle `θ_A` (`0°–360°`) and Bob's detector angle `θ_B` (`0°–360°`) independently.

4. **Visual Qubit Orbs & `Measurement Status:` Callout:**
   - Before measuring, both orbs show **`?`** (unmeasured superposition).
   - When you measure one qubit, its orb collapses to **`|0⟩`** or **`|1⟩`**, and the **Measurement Status** banner immediately displays the updated conditional probabilities for the other qubit.

5. **Measurement Action Buttons:**
   - **`Measure Alice`:** Samples Alice's qubit (50/50 marginal) and conditionally updates Bob's probabilities. If Bob was already measured, completes the 2-bit shot and adds `1` to the histogram.
   - **`Measure Bob`:** Samples Bob's qubit (symmetrically works whether clicked first or second).
   - **`Run 1,000 Shots`:** Simulates 1,000 independent entangled pairs at the current `θ_A` and `θ_B`, adding all 1,000 outcomes to the histogram.
   - **Reset (`↺`):** Clears only the current single-shot `?` / `|0⟩` / `|1⟩` collapse state.
   - **Trash (`🗑`):** Clears all accumulated histogram counts back to `0`.

6. **4 Metric Boxes & Live 4-Bar Histogram:**
   - **Total Shots:** Cumulative number of measured pairs.
   - **Correlation (Match %):** $\frac{N_{00} + N_{11}}{\text{Total Shots}} \times 100\%$ compared side-by-side with the exact **Expected** theoretical match %.
   - **Angle Difference `|θ_A − θ_B|`:** Shows the relative angle controlling the probabilities.
   - **Expected `P(00) / P(01)`:** Exact theoretical single-outcome percentages.
   - **Histogram Bars:**
     - **Cyan bars (`|00⟩`, `|11⟩`):** Same-bit (correlated) outcomes.
     - **Violet bars (`|01⟩`, `|10⟩`):** Opposite-bit (anti-correlated) outcomes.
     - **Yellow horizontal lines (`━`):** Exact theoretical probability (`P_theory`).

### 2.2 Step-by-Step Walkthrough on Slide 2
1. Click **`Same Angle (0°, 0°) → 100% Match`**.
2. Click **`Measure Alice`** → Alice collapses to `|0⟩` or `|1⟩`, and the status message explains that Bob's probability of matching jumped to **`100.0%`**.
3. Click **`Measure Bob`** → Bob matches Alice, and `Total Shots` increments to `1`.
4. Click **`45° Apart (0°, 45°) → 85.4% Match`** (this clears the old counts) → Click **`Run 1,000 Shots`**.
5. Observe the 4 bars matching the yellow `P_theory` lines (`~42.7%` on `|00⟩`/`|11⟩`, `~7.3%` on `|01⟩`/`|10⟩`) and **Correlation (Match %)** settling near **`85.4%`**.
6. Click **`90° Apart (0°, 90°) → 50% Random`** → Click **`Run 1,000 Shots`** → All 4 bars level around **`25%`** each (**`~50%`** match).
