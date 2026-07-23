import { AlertTriangle, Clock, TrendingUp, Sparkles } from 'lucide-react';

const INSIGHT_STYLES = {
  high_risk_flag: { icon: AlertTriangle, tone: 'bg-rose-50 border-rose-100 text-rose-700', label: 'High-Risk Flag' },
  low_engagement: { icon: Clock, tone: 'bg-amber-50 border-amber-100 text-amber-700', label: 'Low Engagement' },
  positive_trend: { icon: TrendingUp, tone: 'bg-emerald-50 border-emerald-100 text-emerald-700', label: 'Positive Trend' },
};

function AIInsights({ insights, isLoading, error }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <h2 className="font-semibold text-gray-900">AI Insights</h2>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Analyzing recent check-ins...</p>}
      {error && !isLoading && <p className="text-sm text-rose-500">{error}</p>}
      {!isLoading && !error && insights.length === 0 && (
        <p className="text-sm text-gray-400">No flags right now — everything looks stable.</p>
      )}

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.positive_trend;
          const Icon = style.icon;
          return (
            <div key={`${insight.patient_id}-${idx}`} className={`rounded-xl border p-3 ${style.tone}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className="w-4 h-4" />
                {style.label} &middot; {insight.patient_name}
              </div>
              <p className="text-xs mt-1 opacity-90">{insight.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIInsights;
