"use client";

// Agora — Ferrari red. Slow red velvet pulse from centre, tessellating
// triangle mesh drifting (knowledge crystal), floating quote-mark glyphs.

export function LiveBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="agr-velvet" />
      <div className="agr-mesh" />
      <div className="agr-crystals">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`agr-crystal agr-x${i}`} />
        ))}
      </div>
      <div className="agr-quotes">
        {["“", "”", "“", "”", "“", "”"].map((c, i) => (
          <span key={i} className={`agr-quote agr-q${i}`}>{c}</span>
        ))}
      </div>

      <style jsx>{`
        .agr-velvet {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(220, 30, 50, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 20%,
              rgba(160, 20, 40, 0.10) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 80% 80%,
              rgba(200, 40, 60, 0.08) 0%, transparent 55%);
          animation: agrPulse 10s ease-in-out infinite;
        }
        @keyframes agrPulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1;   }
        }

        .agr-mesh {
          position: absolute; inset: -10%;
          background-image:
            linear-gradient(60deg,  rgba(220,30,50,0.06) 25%, transparent 25.5%, transparent 74.5%, rgba(220,30,50,0.06) 75%),
            linear-gradient(-60deg, rgba(220,30,50,0.06) 25%, transparent 25.5%, transparent 74.5%, rgba(220,30,50,0.06) 75%);
          background-size: 60px 104px;
          animation: agrMeshDrift 60s linear infinite;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 90%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 90%);
        }
        @keyframes agrMeshDrift {
          from { background-position: 0 0;         }
          to   { background-position: 60px 104px;  }
        }

        .agr-crystals { position: absolute; inset: 0; }
        .agr-crystal {
          position: absolute;
          width: 0; height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 20px solid rgba(220, 30, 50, 0.35);
          filter: drop-shadow(0 0 8px rgba(220, 30, 50, 0.4));
          animation: agrSpin linear infinite;
          will-change: transform;
        }
        @keyframes agrSpin {
          from { transform: translate(0, 0)         rotate(0deg);   }
          to   { transform: translate(var(--dx, 40px), var(--dy, -60px)) rotate(360deg); }
        }
        .agr-x0 { top: 12%; left: 10%; --dx:  40px; --dy: -50px; animation-duration: 22s; animation-delay: 0s;  }
        .agr-x1 { top: 22%; left: 78%; --dx: -40px; --dy:  50px; animation-duration: 28s; animation-delay: 3s;  }
        .agr-x2 { top: 40%; left: 22%; --dx:  30px; --dy:  40px; animation-duration: 24s; animation-delay: 6s;  }
        .agr-x3 { top: 52%; left: 66%; --dx: -50px; --dy: -30px; animation-duration: 26s; animation-delay: 9s;  }
        .agr-x4 { top: 68%; left: 14%; --dx:  50px; --dy: -60px; animation-duration: 23s; animation-delay: 1s;  }
        .agr-x5 { top: 76%; left: 84%; --dx: -30px; --dy: -40px; animation-duration: 30s; animation-delay: 4s;  }
        .agr-x6 { top: 30%; left: 42%; --dx:  20px; --dy:  60px; animation-duration: 27s; animation-delay: 7s;  }
        .agr-x7 { top: 84%; left: 50%; --dx: -20px; --dy: -80px; animation-duration: 25s; animation-delay: 2s;  }

        .agr-quotes { position: absolute; inset: 0; }
        .agr-quote {
          position: absolute; bottom: -40px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 40px;
          color: rgba(220, 60, 80, 0.18);
          animation: agrFloat linear infinite;
        }
        @keyframes agrFloat {
          0%   { transform: translateY(0)      rotate(0deg);   opacity: 0; }
          10%  { opacity: 0.55; }
          90%  { opacity: 0.55; }
          100% { transform: translateY(-115vh) rotate(-8deg);  opacity: 0; }
        }
        .agr-q0 { left:  8%; animation-duration: 34s; animation-delay:  0s;  font-size: 36px; }
        .agr-q1 { left: 26%; animation-duration: 40s; animation-delay:  6s;  font-size: 48px; }
        .agr-q2 { left: 44%; animation-duration: 36s; animation-delay:  3s;  font-size: 32px; }
        .agr-q3 { left: 60%; animation-duration: 42s; animation-delay:  9s;  font-size: 44px; }
        .agr-q4 { left: 76%; animation-duration: 38s; animation-delay:  5s;  font-size: 40px; }
        .agr-q5 { left: 90%; animation-duration: 44s; animation-delay: 12s;  font-size: 36px; }

        @media (prefers-reduced-motion: reduce) {
          .agr-velvet, .agr-mesh, .agr-crystal, .agr-quote { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
