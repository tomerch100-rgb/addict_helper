import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = { Active: '#0d9488', Completed: '#6366f1', Relapsed: '#e11d48' };

function PatientOutcomesChart({ outcomes, isLoading, error }) {
  const data = outcomes
    ? [
        { name: 'Active', value: outcomes.active },
        { name: 'Completed', value: outcomes.completed },
        { name: 'Relapsed', value: outcomes.relapsed },
      ]
    : [];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Patient Outcomes</h2>

      {isLoading && <p className="text-sm text-gray-400">Loading outcomes...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}

      {!isLoading && !error && (
        <div className="h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {data.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-20px' }}>
            <span className="text-2xl font-bold text-gray-900">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientOutcomesChart;
