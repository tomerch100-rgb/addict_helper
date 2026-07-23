import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, AlertTriangle, PhoneCall, Trophy } from 'lucide-react';

import StatCard from '../../component/StatCard';
import PatientTable from './components/PatientTable';
import CrisisTimeline from './components/CrisisTimeline';
import MentalWeatherChart from './components/MentalWeatherChart';
import AIInsights from './components/AIInsights';
import PatientFilePanel from './components/PatientFilePanel';

import {
  getDashboardSummary,
  getAssignedPatients,
  getCrisisTimeline,
  getSentimentTrend,
  getPatientFile,
  resolveSession,
} from '../../services/therapistService';

function TherapistDashboard() {
  const user = useSelector((state) => state.auth.user);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const [trend, setTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState(null);

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      setSummary(await getDashboardSummary());
      setSummaryError(null);
    } catch (err) {
      setSummaryError(err.response?.data?.detail || 'Failed to load dashboard summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    setPatientsLoading(true);
    try {
      setPatients(await getAssignedPatients());
      setPatientsError(null);
    } catch (err) {
      setPatientsError(err.response?.data?.detail || 'Failed to load patients.');
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      setEvents(await getCrisisTimeline());
      setEventsError(null);
    } catch (err) {
      setEventsError(err.response?.data?.detail || 'Failed to load crisis timeline.');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadTrend = useCallback(async () => {
    setTrendLoading(true);
    try {
      setTrend(await getSentimentTrend(7));
      setTrendError(null);
    } catch (err) {
      setTrendError(err.response?.data?.detail || 'Failed to load sentiment trend.');
    } finally {
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      await Promise.all([loadSummary(), loadPatients(), loadEvents(), loadTrend()]);
    }
    loadDashboard();
  }, [loadSummary, loadPatients, loadEvents, loadTrend]);

  useEffect(() => {
    let cancelled = false;

    async function loadFile() {
      if (!selectedPatientId) {
        setFile(null);
        return;
      }
      setFileLoading(true);
      setFileError(null);
      try {
        const data = await getPatientFile(selectedPatientId);
        if (!cancelled) setFile(data);
      } catch (err) {
        if (!cancelled) setFileError(err.response?.data?.detail || 'Failed to load patient file.');
      } finally {
        if (!cancelled) setFileLoading(false);
      }
    }
    loadFile();

    return () => { cancelled = true; };
  }, [selectedPatientId]);

  const handleResolve = async (sessionId) => {
    setIsResolving(true);
    try {
      await resolveSession(sessionId);
      await Promise.all([loadPatients(), loadEvents(), loadSummary()]);
      if (selectedPatientId) {
        setFile(await getPatientFile(selectedPatientId));
      }
    } catch (err) {
      setFileError(err.response?.data?.detail || 'Failed to resolve session.');
    } finally {
      setIsResolving(false);
    }
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. {user?.username || ''}</h1>
          <p className="text-sm text-gray-500">
            {today} &middot; {summary?.active_patients ?? '—'} active patients under your care
          </p>
        </div>
        {summary?.active_sos > 0 && (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200">
            {summary.active_sos} Active SOS
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Patients" value={summaryLoading ? '—' : summary?.active_patients ?? 0} tone="emerald" />
        <StatCard icon={AlertTriangle} label="High-Risk Patients" value={summaryLoading ? '—' : summary?.high_risk_patients ?? 0} tone="amber" />
        <StatCard icon={PhoneCall} label="Active SOS Triggers" value={summaryLoading ? '—' : summary?.active_sos ?? 0} tone="rose" />
        <StatCard icon={Trophy} label="Overall Success Rate" value={summaryLoading ? '—' : `${summary?.success_rate ?? 0}%`} tone="teal" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PatientTable
            patients={patients}
            isLoading={patientsLoading}
            error={patientsError}
            selectedId={selectedPatientId}
            onSelect={setSelectedPatientId}
          />
        </div>
        <CrisisTimeline events={events} isLoading={eventsLoading} error={eventsError} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <MentalWeatherChart trend={trend} isLoading={trendLoading} error={trendError} />
        </div>
        <AIInsights insights={summary?.ai_insights || []} isLoading={summaryLoading} error={summaryError} />
      </div>

      <PatientFilePanel
        file={file}
        isLoading={fileLoading}
        error={fileError}
        onResolve={handleResolve}
        isResolving={isResolving}
      />
    </div>
  );
}

export default TherapistDashboard;
