export function AgoraMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Open book / knowledge gate — two angular pages meeting at center */}
      <path d="M50 20 L15 40 L15 80 L50 65 Z" fill="#da291c" opacity="0.9" />
      <path d="M50 20 L85 40 L85 80 L50 65 Z" fill="#da291c" opacity="0.6" />
      {/* Spine line */}
      <line x1="50" y1="20" x2="50" y2="65" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

export function AgoraWordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <AgoraMark size={26} />
      <span style={{
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "2.5px",
        textTransform: "uppercase" as const,
        color: "#ffffff",
      }}>
        AGORA
      </span>
    </div>
  );
}
