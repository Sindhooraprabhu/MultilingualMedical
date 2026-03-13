import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  UserPlusIcon, 
  MicIcon, 
  BeakerIcon, 
  ClipboardCheckIcon,
  UsersIcon,
  ActivitySquareIcon,
  LogOutIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Patient Registration', href: '/register', icon: UserPlusIcon },
  { name: 'Consultation', href: '/consultation', icon: MicIcon },
  { name: 'Pharmacy', href: '/pharmacy', icon: ClipboardCheckIcon },
  { name: 'Laboratory', href: '/laboratory', icon: BeakerIcon },
  { name: 'Patient Records', href: '/records', icon: UsersIcon },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 print:hidden">
      <div className="flex h-16 shrink-0 items-center px-6 bg-primary-dark">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
           <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
           </svg>
           MEDIFLOW<span className="text-blue-400">AI</span>
        </h1>
      </div>
      <nav className="flex flex-1 flex-col px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          return (
             <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-3">
                 <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
              </span>
              {item.name}
            </NavLink>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                {user.name ? user.name.substring(0, 2) : 'MD'}
              </div>
            )}
            <div className="text-sm overflow-hidden">
               <p className="font-semibold text-gray-900 truncate">{user.name || 'Medical Staff'}</p>
               <p className="text-gray-500 text-xs truncate">{user.email || 'Department'}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOutIcon className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
