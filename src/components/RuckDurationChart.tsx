import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface RuckDurationData {
  under3s: number;
  threeToFive: number;
  fiveToEight: number;
  over8s: number;
}

interface RuckDurationChartProps {
  data: RuckDurationData;
}

const RuckDurationChart = ({ data }: RuckDurationChartProps) => {
  const chartData = [
    { name: "<3s", value: data.under3s, color: "hsl(160, 70%, 45%)" },
    { name: "3-5s", value: data.threeToFive, color: "hsl(160, 60%, 40%)" },
    { name: "5-8s", value: data.fiveToEight, color: "hsl(38, 95%, 55%)" },
    { name: ">8s", value: data.over8s, color: "hsl(0, 72%, 55%)" },
  ];

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="mb-4 text-lg font-semibold">Ruck Duration Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 15%, 18%)",
                borderRadius: "8px",
                color: "hsl(60, 10%, 95%)",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Rucks"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RuckDurationChart;
