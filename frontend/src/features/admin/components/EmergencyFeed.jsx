import { Radio } from 'lucide-react';
import { timeAgo } from '../../../utils/timeAgo';

function EmergencyFeed({ items, isLoading, error }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Emergency Feed</h2>
        {items.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Live
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading emergency feed...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}
      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-gray-400">No active SOS events right now.</p>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.session_id} className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
            <p className="text-sm font-medium text-rose-800">{item.patient_name}</p>
            {item.last_message && <p className="text-xs text-rose-700/80 truncate">{item.last_message}</p>}
            <p className="text-xs text-rose-500 mt-1">{timeAgo(item.triggered_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmergencyFeed;
