import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice';

export default function DashboardLayout({ children, currentTab, setCurrentTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const navLinkClass = (isActive) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50 border border-transparent'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shadow-inner">
                <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600/10" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Clean<span className="text-emerald-600">Slate</span>
              </span>
            </div>
          </div>
          
          <nav className="p-4 flex flex-col gap-2">
            <div 
              onClick={() => setCurrentTab('overview')}
              className={navLinkClass(currentTab === 'overview')}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </div>
            
            <div 
              onClick={() => setCurrentTab('settings')}
              className={navLinkClass(currentTab === 'settings')}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings & Profile</span>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Patient'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-all duration-200 border border-gray-200/60 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
             <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-gray-900">CleanSlate</span>
             </div>
             <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                 <LogOut className="w-5 h-5" />
             </button>
        </div>
        
        {/* Navigation Tabs (Mobile only) */}
        <div className="md:hidden flex border-b border-gray-200 bg-white">
            <button 
               onClick={() => setCurrentTab('overview')} 
               className={`flex-1 py-3 text-sm font-medium text-center ${currentTab === 'overview' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
            >
                Overview
            </button>
            <button 
               onClick={() => setCurrentTab('settings')} 
               className={`flex-1 py-3 text-sm font-medium text-center ${currentTab === 'settings' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
            >
                Settings
            </button>
        </div>

        {children}
      </main>
    </div>
  );
}
