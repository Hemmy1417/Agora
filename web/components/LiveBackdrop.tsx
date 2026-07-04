"use client";

// Agora — Ferrari red on graphite. Perspective wireframe grid receding
// toward the horizon, a knowledge-network constellation of nodes with
// pulsing connection lines, occasional verification bolts firing between
// nodes, and a horizontal Ferrari-red scanline sweep. Precision-engineered
// energy, not soft.

export function LiveBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="agr-void" />
      <div className="agr-perspective" />

      {/* Node constellation + connection lines */}
      <svg className="agr-net" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="agr-node-glow">
            <stop offset="0%"  stopColor="#da291c" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#da291c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#da291c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* connection lines — always visible, subtle */}
        <g className="agr-links" stroke="#da291c" strokeOpacity="0.18" strokeWidth="1" fill="none">
          <line x1="180" y1="140" x2="420" y2="240" />
          <line x1="420" y1="240" x2="700" y2="180" />
          <line x1="700" y1="180" x2="960" y2="300" />
          <line x1="180" y1="140" x2="320" y2="440" />
          <line x1="320" y1="440" x2="560" y2="500" />
          <line x1="560" y1="500" x2="780" y2="440" />
          <line x1="780" y1="440" x2="960" y2="300" />
          <line x1="420" y1="240" x2="560" y2="500" />
          <line x1="700" y1="180" x2="780" y2="440" />
          <line x1="320" y1="440" x2="500" y2="640" />
          <line x1="500" y1="640" x2="760" y2="660" />
          <line x1="760" y1="660" x2="960" y2="540" />
          <line x1="560" y1="500" x2="500" y2="640" />
        </g>

        {/* verification bolts — brighter pulse along the same paths */}
        <g className="agr-bolts" stroke="#da291c" strokeWidth="2" fill="none" strokeOpacity="0">
          <line x1="180" y1="140" x2="420" y2="240" className="agr-bolt agr-bolt-0" />
          <line x1="700" y1="180" x2="960" y2="300" className="agr-bolt agr-bolt-1" />
          <line x1="320" y1="440" x2="560" y2="500" className="agr-bolt agr-bolt-2" />
          <line x1="560" y1="500" x2="780" y2="440" className="agr-bolt agr-bolt-3" />
          <line x1="500" y1="640" x2="760" y2="660" className="agr-bolt agr-bolt-4" />
        </g>

        {/* nodes — filled dot + soft radial halo */}
        {[
          [180, 140], [420, 240], [700, 180], [960, 300],
          [320, 440], [560, 500], [780, 440],
          [500, 640], [760, 660],
        ].map(([x, y], i) => (
          <g key={i} className={`agr-node agr-n${i}`}>
            <circle cx={x} cy={y} r="18" fill="url(#agr-node-glow)" />
            <circle cx={x} cy={y} r="3"  fill="#da291c" />
          </g>
        ))}
      </svg>

      {/* horizontal scanline sweep */}
      <div className="agr-scan" />

      {/* corner vignette + Ferrari accents */}
      <div className="agr-vignette" />

      <style jsx>{`
        .agr-void {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% 30%,
              rgba(218, 41, 28, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 100%,
              rgba(218, 41, 28, 0.04) 0%, transparent 55%);
        }

        /* Perspective grid — CSS 3D transform */
        .agr-perspective {
          position: absolute;
          left: -20%; right: -20%; bottom: -30%;
          height: 90vh;
          background-image:
            linear-gradient(to right,  rgba(218, 41, 28, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(218, 41, 28, 0.14) 1px, transparent 1px);
          background-size: 72px 72px;
          transform: perspective(600px) rotateX(65deg);
          transform-origin: center bottom;
          mask-image: linear-gradient(to top,
            black 0%, black 40%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top,
            black 0%, black 40%, transparent 100%);
          animation: agrGridPan 20s linear infinite;
        }
        @keyframes agrGridPan {
          from { background-position: 0 0;      }
          to   { background-position: 0 72px;   }
        }

        .agr-net {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
        }
        .agr-node { animation: agrNodePulse 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .agr-n0 { animation-delay: 0.0s; }
        .agr-n1 { animation-delay: 0.4s; }
        .agr-n2 { animation-delay: 0.8s; }
        .agr-n3 { animation-delay: 1.2s; }
        .agr-n4 { animation-delay: 1.6s; }
        .agr-n5 { animation-delay: 2.0s; }
        .agr-n6 { animation-delay: 2.4s; }
        .agr-n7 { animation-delay: 2.8s; }
        .agr-n8 { animation-delay: 3.2s; }
        @keyframes agrNodePulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }

        .agr-bolt {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: agrBoltFire 5s ease-out infinite;
          filter: drop-shadow(0 0 6px #da291c);
        }
        .agr-bolt-0 { animation-delay: 0s;   }
        .agr-bolt-1 { animation-delay: 1s;   }
        .agr-bolt-2 { animation-delay: 2s;   }
        .agr-bolt-3 { animation-delay: 3s;   }
        .agr-bolt-4 { animation-delay: 4s;   }
        @keyframes agrBoltFire {
          0%   { stroke-dashoffset: 400; stroke-opacity: 0;   }
          15%  { stroke-opacity: 1;   }
          40%  { stroke-dashoffset: 0;   stroke-opacity: 0.9; }
          60%  { stroke-opacity: 0;   }
          100% { stroke-dashoffset: -400; stroke-opacity: 0; }
        }

        .agr-scan {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(218, 41, 28, 0.03) 45%,
            rgba(218, 41, 28, 0.12) 50%,
            rgba(218, 41, 28, 0.03) 55%,
            transparent 100%);
          background-size: 100% 400%;
          animation: agrScan 12s linear infinite;
          mix-blend-mode: screen;
        }
        @keyframes agrScan {
          from { background-position: 0 -100%; }
          to   { background-position: 0 200%;  }
        }

        .agr-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 100% 100% at 50% 50%,
            transparent 40%,
            rgba(0, 0, 0, 0.55) 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .agr-perspective, .agr-node, .agr-bolt, .agr-scan { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
