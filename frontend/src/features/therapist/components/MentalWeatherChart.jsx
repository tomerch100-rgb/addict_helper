import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LINE_COLORS = ['#f59e0b', '#f43f5e', '#0ea5e9', '#8b5cf6', '#ec4899'];

function buildChartData(trend) {
  if (!trend || !trend.dates) return [];
  return trend.dates.map((date, i) => {
    const point = { date, average: trend.average[i] };
    trend.series.forEach((s) => {
      point[s.patient_name] = s.scores[i];
    });
    return point;
  });
}

function MentalWeatherChart({ trend, isLoading, error }) {
  const data = buildChartData(trend);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Mental Weather Chart</h2>

      {isLoading && <p className="text-sm text-gray-400">Loading sentiment trend...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}

      {!isLoading && !error && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" name="Group Avg Mood" stroke="#059669" strokeWidth={2} dot={false} />
              {trend?.series?.map((s, idx) => (
                <Line
                  key={s.patient_id}
                  type="monotone"
                  dataKey={s.patient_name}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MentalWeatherChart;
