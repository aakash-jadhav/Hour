type BottomWaveProps = {
  /** `fixed` — viewport footer (main app). `layer` — absolute inside a positioned fullscreen parent. */
  variant?: "fixed" | "layer";
};

/** Decorative wave; sits behind UI (z-index 0, pointer-events none). */
export function BottomWave({ variant = "fixed" }: BottomWaveProps) {
  const rootClass = variant === "layer" ? "bottom-wave bottom-wave--layer" : "bottom-wave";
  return (
    <div className={rootClass} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="bottom-wave__svg bottom-wave__svg--stretch"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffd700"
          fillOpacity={1}
          d="M0,32L34.3,48C68.6,64,137,96,206,106.7C274.3,117,343,107,411,85.3C480,64,549,32,617,21.3C685.7,11,754,21,823,42.7C891.4,64,960,96,1029,117.3C1097.1,139,1166,149,1234,138.7C1302.9,128,1371,96,1406,80L1440,64L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
        />
      </svg>
    </div>
  );
}
