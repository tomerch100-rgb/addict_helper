import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, Trophy, TrendingDown, Clock } from 'lucide-react';

import StatCard from '../../component/StatCard';
import SuccessRelapseChart from './components/SuccessRelapseChart';
import PatientOutcomesChart from './components/PatientOutcomesChart';
import EmergencyFeed from './components/EmergencyFeed';
import ApprovalQueue from './components/ApprovalQueue';
import AuditLogList from './components/AuditLogList';

import {
  getStats,
  getSuccessRelapseTrend,
  getPatientOutcomes,
  getEmergencyFeed,
  getPendingUsers,
  approveUser,
  getAuditLogs,
} from '../../services/adminService';

function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState(null);

  const [outcomes, setOutcomes] = useState(null);
  const [outcomesLoading, setOutcomesLoading] = useState(true);
  const [outcomesError, setOutcomesError] = useState(null);

  const [emergencyItems, setEmergencyItems] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(true);
  const [emergencyError, setEmergencyError] = useState(null);

  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await getStats());
      setStatsError(null);
    } catch (err) {
      setStatsError(err.response?.data?.detail || 'Failed to load stats.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadTrend = useCallback(async () => {
    setTrendLoading(true);
    try {
      setTrend(await getSuccessRelapseTrend(6));
      setTrendError(null);
    } catch (err) {
      setTrendError(err.response?.data?.detail || 'Failed to load trend.');
    } finally {
      setTrendLoading(false);
    }
  }, []);

  const loadOutcomes = useCallback(async () => {
    setOutcomesLoading(true);
    try {
      setOutcomes(await getPatientOutcomes());
      setOutcomesError(null);
    } catch (err) {
      setOutcomesError(err.response?.data?.detail || 'Failed to load outcomes.');
    } finally {
      setOutcomesLoading(false);
    }
  }, []);

  const loadEmergencyFeed = useCallback(async () => {
    setEmergencyLoading(true);
    try {
      setEmergencyItems(await getEmergencyFeed());
      setEmergencyError(null);
    } catch (err) {
      setEmergencyError(err.response?.data?.detail || 'Failed to load emergency feed.');
    } finally {
      setEmergencyLoading(false);
    }
  }, []);

  const loadPendingUsers = useCallback(async () => {
    setPendingLoading(true);
    try {
      setPendingUsers(await getPendingUsers());
      setPendingError(null);
    } catch (err) {
      setPendingError(err.response?.data?.detail || 'Failed to load pending users.');
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      setAuditLogs(await getAuditLogs(25));
      setAuditError(null);
    } catch (err) {
      setAuditError(err.response?.data?.detail || 'Failed to load audit logs.');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      await Promise.all([
        loadStats(),
        loadTrend(),
        loadOutcomes(),
        loadEmergencyFeed(),
        loadPendingUsers(),
        loadAuditLogs(),
      ]);
    }
    loadDashboard();
  }, [loadStats, loadTrend, loadOutcomes, loadEmergencyFeed, loadPendingUsers, loadAuditLogs]);

  const handleApprove = async (userId) => {
    setApprovingId(userId);
    try {
      await approveUser(userId);
      await Promise.all([loadPendingUsers(), loadAuditLogs()]);
    } catch (err) {
      setPendingError(err.response?.data?.detail || 'Failed to approve user.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Command Center</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.username || 'Admin'} &middot; {emergencyItems.length} live SOS events
        </p>
      </div>

      {statsError && !statsLoading && (
        <p className="text-sm text-rose-500">{statsError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={statsLoading ? '—' : stats?.total_patients ?? 0} tone="emerald" />
        <StatCard icon={Trophy} label="Success Rate" value={statsLoading ? '—' : `${stats?.success_rate ?? 0}%`} tone="teal" />
        <StatCard icon={TrendingDown} label="Relapse Rate" value={statsLoading ? '—' : `${stats?.relapse_rate ?? 0}%`} tone="rose" />
        <StatCard
          icon={Clock}
          label="Avg. SOS Response"
          value={statsLoading ? '—' : (stats?.avg_sos_response_minutes != null ? `${stats.avg_sos_response_minutes}m` : 'N/A')}
          tone="sky"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SuccessRelapseChart trend={trend} isLoading={trendLoading} error={trendError} />
        </div>
        <EmergencyFeed items={emergencyItems} isLoading={emergencyLoading} error={emergencyError} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ApprovalQueue
          users={pendingUsers}
          isLoading={pendingLoading}
          error={pendingError}
          onApprove={handleApprove}
          approvingId={approvingId}
        />
        <PatientOutcomesChart outcomes={outcomes} isLoading={outcomesLoading} error={outcomesError} />
        <AuditLogList logs={auditLogs} isLoading={auditLoading} error={auditError} />
      </div>
    </div>
  );
}

export default AdminDashboard;
