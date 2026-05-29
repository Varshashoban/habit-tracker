function ProgressRing({ label, percentage, size = 168 }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.07] p-6">
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
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
        <text
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize="30"
          fontWeight="700"
          textAnchor="middle"
          x="50%"
          y="50%"
        >
          {percentage}%
        </text>
      </svg>
      <p className="mt-4 text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}

export default ProgressRing;
