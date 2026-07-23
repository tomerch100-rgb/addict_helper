import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageCircle, ExternalLink, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function TelegramConnectButton() {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If user already has a telegram_id, display connected status
  if (user?.telegram_id) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Telegram Connected</span>
      </div>
    );
  }

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/telegram/generate-telegram-token');
      const url = response.data.telegram_url;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to Telegram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-medium transition-colors disabled:opacity-70"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{loading ? 'Connecting...' : 'Connect Telegram'}</span>
        {!loading && <ExternalLink className="w-4 h-4 ml-1" />}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
