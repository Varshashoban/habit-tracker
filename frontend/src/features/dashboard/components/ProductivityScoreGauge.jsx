function ProductivityScoreGauge({ score }) {
  const size = 220;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section className="flex h-full flex-col items-center justify-center rounded-lg border border-teal-200/20 bg-gradient-to-br from-teal-300/12 via-white/[0.07] to-sky-300/10 p-6 shadow-[0_24px_100px_rgba(20,184,166,0.14)]">
      <p className="text-sm font-semibold uppercase text-teal-200">
        Daily Score Engine
      </p>
      <div className="mt-5">
        <svg height={size} width={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke="#5eead4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth={stroke}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              transition: "stroke-dashoffset 900ms ease",
            }}
          />
          <text
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="42"
            fontWeight="700"
            textAnchor="middle"
            x="50%"
            y="48%"
          >
            {score}
          </text>
          <text
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
            x="50%"
            y="61%"
          >
            / 100
          </text>
        </svg>
      </div>
    </section>
  );
}

export default ProductivityScoreGauge;
