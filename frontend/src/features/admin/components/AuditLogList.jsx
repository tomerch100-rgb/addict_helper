import { ShieldCheck } from 'lucide-react';
import { timeAgo } from '../../../utils/timeAgo';

function AuditLogList({ logs, isLoading, error }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <h2 className="font-semibold text-gray-900">Audit Logs</h2>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading audit logs...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}
      {!isLoading && !error && logs.length === 0 && (
        <p className="text-sm text-gray-400">No audited actions recorded yet.</p>
      )}

      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="text-sm border-b border-gray-50 pb-2 last:border-0">
            <p className="text-gray-800">
              <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
              {log.target_name && <> &middot; {log.target_name}</>}
            </p>
            {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
            <p className="text-xs text-gray-400">
              {log.actor_name ? `by ${log.actor_name} · ` : ''}{timeAgo(log.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AuditLogList;
