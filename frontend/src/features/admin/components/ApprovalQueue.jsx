import { Check, Loader2 } from 'lucide-react';

function ApprovalQueue({ users, isLoading, error, onApprove, approvingId }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Approval Queue</h2>

      {isLoading && <p className="text-sm text-gray-400">Loading pending users...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}
      {!isLoading && !error && users.length === 0 && (
        <p className="text-sm text-gray-400">No pending approvals.</p>
      )}

      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{u.username}</p>
              <p className="text-xs text-gray-500 capitalize">{u.role} &middot; {u.phone}</p>
            </div>
            <button
              onClick={() => onApprove(u.id)}
              disabled={approvingId === u.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-60"
            >
              {approvingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Approve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ApprovalQueue;
