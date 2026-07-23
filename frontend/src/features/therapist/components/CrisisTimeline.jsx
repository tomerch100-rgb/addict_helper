import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { timeAgo } from '../../../utils/timeAgo';

function CrisisTimeline({ events, isLoading, error }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Crisis Timeline</h2>

      {isLoading && <p className="text-sm text-gray-400">Loading events...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}
      {!isLoading && !error && events.length === 0 && (
        <p className="text-sm text-gray-400">No SOS activity to show.</p>
      )}

      <ul className="space-y-4">
        {events.map((event, idx) => (
          <li key={`${event.patient_id}-${event.timestamp}-${idx}`} className="flex gap-3">
            <div className="mt-0.5">
              {event.type === 'sos_triggered' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-medium">
                  {event.type === 'sos_triggered' ? 'SOS Triggered' : 'Resolved'}
                </span>{' '}
                &middot; {event.patient_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{event.message}</p>
              <p className="text-xs text-gray-400">{timeAgo(event.timestamp)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CrisisTimeline;
