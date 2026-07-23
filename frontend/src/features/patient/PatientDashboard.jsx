import React, { useState } from 'react';
import DashboardLayout from '../../component/DashboardLayout';
import TelegramConnectButton from '../../component/TelegramConnectButton';

export default function PatientDashboard() {
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <div className="p-6">
        {currentTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-emerald-800">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome to your dashboard. Here you can view your progress and sessions.</p>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Settings & Integrations</h2>
            
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Telegram Connection</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Connect your Telegram account to receive instant notifications and support directly through the app.
                </p>
                <TelegramConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
