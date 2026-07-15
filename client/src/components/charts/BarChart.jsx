// Grouped bar chart (completed vs created per day) rendered as plain SVG.
// data: [{ date: "2026-07-09", completed: n, created: n }]
export default function BarChart({ data = [] }) {
  const width = 640;
  const height = 240;
  const padding = { top: 16, right: 12, bottom: 34, left: 28 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map((d) => Math.max(d.completed, d.created)));
  // Round the axis max up to a sensible tick
  const axisMax = Math.max(max, 2);

  const groupWidth = innerW / Math.max(data.length, 1);
  const barWidth = Math.min(14, groupWidth / 3);

  const y = (v) => padding.top + innerH - (v / axisMax) * innerH;

  // A few horizontal gridlines
  const ticks = 4;
  const gridValues = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((axisMax / ticks) * i)
  );

  const labelFor = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // With many days (month view), only label every Nth tick to avoid crowding
  const labelEvery = data.length > 10 ? Math.ceil(data.length / 8) : 1;

  return (
    <div className="barchart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        {/* gridlines */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text x={4} y={y(v) + 4} className="axis-text">
              {v}
            </text>
          </g>
        ))}

        {/* bars */}
        {data.map((d, i) => {
          const gx = padding.left + i * groupWidth + groupWidth / 2;
          return (
            <g key={d.date}>
              <rect
                x={gx - barWidth - 1}
                y={y(d.completed)}
                width={barWidth}
                height={padding.top + innerH - y(d.completed)}
                rx={3}
                fill="#6366f1"
              />
              <rect
                x={gx + 1}
                y={y(d.created)}
                width={barWidth}
                height={padding.top + innerH - y(d.created)}
                rx={3}
                fill="#334155"
              />
              {i % labelEvery === 0 && (
                <text x={gx} y={height - 12} className="axis-text" textAnchor="middle">
                  {labelFor(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="chart-legend">
        <span>
          <i className="dot" style={{ background: "#6366f1" }} /> Completed
        </span>
        <span>
          <i className="dot" style={{ background: "#334155" }} /> Created
        </span>
      </div>
    </div>
  );
}
