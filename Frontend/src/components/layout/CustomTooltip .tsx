import { TooltipProps } from "recharts";

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="recharts-default-tooltip"
      style={{
        padding: 10,
        borderRadius: 8,
        border: "1px solid #ccc",
        backgroundColor: "white",
        minWidth: 120,
      }}
    >
      <p
        className="recharts-tooltip-label"
        style={{ margin: 0, fontWeight: "bold" }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={`item-${index}`}
          className="recharts-tooltip-item"
          style={{
            margin: "4px 0 0 0",
            fontWeight: "bold",
            color: entry.color,
            whiteSpace: "normal", // Allow wrapping if needed
            display: "block",     // Stack vertically
          }}
        >
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default CustomTooltip;
