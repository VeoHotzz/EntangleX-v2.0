interface EntanglementLinkProps {
  concurrence: number;
  entropyEbits: number;
  aliceLabel?: string;
  bobLabel?: string;
  aliceAngleDeg?: number;
  bobAngleDeg?: number;
}

export function EntanglementLink({
  concurrence,
  entropyEbits,
  aliceLabel = 'q[0]',
  bobLabel = 'q[1]',
  aliceAngleDeg,
  bobAngleDeg,
}: EntanglementLinkProps) {
  const isEntangled = concurrence > 0.01;
  const strokeOpacity = isEntangled ? 0.45 + 0.55 * concurrence : 0.25;

  return (
    <div className="link-card">
      <div className="link-stage">
        <div className="qubit-node">
          <div className="qubit-orb alice">{aliceLabel}</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Alice (Qubit A)</div>
          {aliceAngleDeg !== undefined && (
            <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--cyan)' }}>
              θ_A = {aliceAngleDeg}°
            </div>
          )}
        </div>

        <div className="link-bridge">
          <span className={`link-status ${isEntangled ? 'on' : 'off'}`}>
            {isEntangled
              ? `ENTANGLED • C = ${concurrence.toFixed(2)} • ${entropyEbits.toFixed(2)} ebit`
              : 'UNENTANGLED • SEPARABLE'}
          </span>

          <svg
            viewBox="0 0 320 64"
            width="100%"
            height="64"
            aria-label={isEntangled ? 'Active quantum entanglement link' : 'No entanglement link'}
          >
            <defs>
              <linearGradient id="entangleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {isEntangled ? (
              <>
                <path
                  d="M 8 32 Q 48 8, 88 32 T 168 32 T 248 32 T 312 32"
                  fill="none"
                  stroke="url(#entangleGrad)"
                  strokeWidth={4}
                  strokeOpacity={strokeOpacity}
                  className="entangle-wave"
                />
                <path
                  d="M 8 32 Q 48 56, 88 32 T 168 32 T 248 32 T 312 32"
                  fill="none"
                  stroke="url(#entangleGrad)"
                  strokeWidth={2}
                  strokeOpacity={0.65 * strokeOpacity}
                />
                <circle cx="8" cy="32" r="4" fill="#22d3ee" />
                <circle cx="160" cy="32" r="5" fill="#a855f7" />
                <circle cx="312" cy="32" r="4" fill="#34d399" />
              </>
            ) : (
              <>
                <line
                  x1="12"
                  y1="32"
                  x2="308"
                  y2="32"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeOpacity="0.45"
                />
                <circle cx="12" cy="32" r="3.5" fill="#64748b" />
                <circle cx="308" cy="32" r="3.5" fill="#64748b" />
              </>
            )}
          </svg>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isEntangled
              ? 'Non-local quantum correlation active across Alice & Bob'
              : 'Product state: measuring Alice gives no conditional information about Bob'}
          </span>
        </div>

        <div className="qubit-node">
          <div className="qubit-orb bob">{bobLabel}</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Bob (Qubit B)</div>
          {bobAngleDeg !== undefined && (
            <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--emerald)' }}>
              θ_B = {bobAngleDeg}°
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
