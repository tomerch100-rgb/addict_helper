import { Phone, FolderOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { timeAgo } from '../../../utils/timeAgo';

const STATUS_STYLES = {
  'SOS Active': 'bg-rose-50 text-rose-700 border-rose-200',
  'At Risk': 'bg-amber-50 text-amber-700 border-amber-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-gray-50 text-gray-600 border-gray-200',
  Relapsed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const TREND_ICON = {
  improving: <TrendingUp className="w-4 h-4 text-emerald-600" />,
  declining: <TrendingDown className="w-4 h-4 text-rose-600" />,
  stable: <Minus className="w-4 h-4 text-gray-400" />,
};

function PatientTable({ patients, isLoading, error, selectedId, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Patient Management</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Clean Days</th>
              <th className="px-4 py-3 font-medium">Last Contact</th>
              <th className="px-4 py-3 font-medium">Mood</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-400">Loading patients...</td></tr>
            )}
            {error && !isLoading && (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-rose-500">{error}</td></tr>
            )}
            {!isLoading && !error && patients.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-400">No patients assigned yet.</td></tr>
            )}
            {patients.map((patient) => (
              <tr
                key={patient.patient_id}
                onClick={() => onSelect(patient.patient_id)}
                className={`border-t border-gray-50 cursor-pointer transition-colors ${
                  selectedId === patient.patient_id ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                } ${patient.status === 'SOS Active' ? 'bg-rose-50/40' : ''}`}
              >
                <td className="px-6 py-3 font-medium text-gray-800">{patient.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[patient.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{patient.clean_days}</td>
                <td className="px-4 py-3 text-gray-500">{timeAgo(patient.last_contact)}</td>
                <td className="px-4 py-3">{TREND_ICON[patient.mood_trend] || TREND_ICON.stable}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(patient.patient_id); }}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="Open patient file"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                    {patient.status === 'SOS Active' && (
                      <span className="p-1.5 rounded-lg text-rose-600 bg-rose-50" title="Active SOS">
                        <Phone className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientTable;
