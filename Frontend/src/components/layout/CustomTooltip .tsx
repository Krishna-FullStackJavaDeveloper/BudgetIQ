import { TooltipProps } from 'recharts';

type CustomTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string | number;
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

return (
  <div
    className="recharts-default-tooltip"
    style={{
      padding: 10,
    //   borderRadius: 8,
      border: "1px solid #ccc",
      backgroundColor: "white",
    }}
  >
    <p className="recharts-tooltip-label" style={{ margin: 0 }}>
      {label}
    </p>
    {payload.map((entry, index) => (
      <p
        key={`item-${index}`}
        className="recharts-tooltip-item"
        style={{
          margin: 0,
          fontWeight: "bold",
          whiteSpace: "nowrap", // Prevent wrapping
          display: "inline-block",
          color: entry.color,    // Use the color of the bar/line
        }}
      >
        {entry.name}: {entry.value}
      </p>
    ))}
  </div>
);
};

export default CustomTooltip;