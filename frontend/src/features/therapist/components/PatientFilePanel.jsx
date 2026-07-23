import { PhoneCall, MessageCircle, Bot, User as UserIcon } from 'lucide-react';
import { timeAgo } from '../../../utils/timeAgo';

const SENDER_STYLES = {
  patient: 'bg-gray-100 text-gray-800 self-start',
  helper: 'bg-emerald-100 text-emerald-900 self-end',
  ai: 'bg-sky-100 text-sky-900 self-end',
};

function PatientFilePanel({ file, isLoading, error, onResolve, isResolving }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
        Loading patient file...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-rose-500">
        {error}
      </div>
    );
  }

  if (!file) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
        Select a patient from the table above to open their file.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Patient File &mdash; {file.name}</h2>
          <p className="text-xs text-gray-500">{file.clean_days} clean days &middot; {file.status}</p>
        </div>
        {file.is_sos && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            SOS Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Chat Archive</h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {file.messages.length === 0 && (
              <p className="text-sm text-gray-400">No messages recorded yet.</p>
            )}
            {file.messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] rounded-xl px-3 py-2 text-sm ${SENDER_STYLES[m.sender] || 'bg-gray-100 text-gray-800 self-start'}`}
              >
                <div className="flex items-center gap-1.5 text-xs opacity-70 mb-0.5">
                  {m.sender === 'ai' ? <Bot className="w-3 h-3" /> : m.sender === 'patient' ? <UserIcon className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                  <span className="capitalize">{m.sender}</span>
                  <span>&middot; {timeAgo(m.timestamp)}</span>
                </div>
                {m.text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">AI Handover Summary</h3>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-sm text-gray-700 mb-4">
            {file.ai_summary || 'No AI summary available for this patient yet.'}
          </div>

          <div className="flex gap-2">
            {file.is_sos && file.active_session_id && (
              <button
                onClick={() => onResolve(file.active_session_id)}
                disabled={isResolving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-60"
              >
                <PhoneCall className="w-4 h-4" />
                {isResolving ? 'Resolving...' : 'Respond Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientFilePanel;
