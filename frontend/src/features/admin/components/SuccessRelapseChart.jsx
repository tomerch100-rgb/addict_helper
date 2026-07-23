import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SuccessRelapseChart({ trend, isLoading, error }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Success vs. Relapse Trends</h2>

      {isLoading && <p className="text-sm text-gray-400">Loading analytics...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}

      {!isLoading && !error && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" name="Success" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="relapse" name="Relapse" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default SuccessRelapseChart;
