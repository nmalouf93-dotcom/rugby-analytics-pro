import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TackleQualityData {
  dominant: number;
  neutral: number;
  lost: number;
}

interface TackleQualityChartProps {
  data: TackleQualityData;
}

const COLORS = {
  dominant: "hsl(160, 70%, 45%)",
  neutral: "hsl(38, 95%, 55%)",
  lost: "hsl(0, 72%, 55%)",
};

const TackleQualityChart = ({ data }: TackleQualityChartProps) => {
  const chartData = [
    { name: "Dominant", value: data.dominant, color: COLORS.dominant },
    { name: "Neutral", value: data.neutral, color: COLORS.neutral },
    { name: "Lost", value: data.lost, color: COLORS.lost },
  ];

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="mb-4 text-lg font-semibold">Tackle Quality Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "8px",
                color: "hsl(60, 10%, 95%)",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TackleQualityChart;
