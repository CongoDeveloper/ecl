
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserSession, UserRole } from '../types';

interface NavbarProps {
  session: UserSession;
  setSession: (s: UserSession) => void;
}

const Navbar: React.FC<NavbarProps> = ({ session, setSession }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setSession({ role: UserRole.GUEST });
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm shadow-slate-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">S</div>
          <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            ScolarSync
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-black uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition">Accueil</Link>
          
          {session.role === UserRole.ADMIN && (
            <Link to="/admin" className="hover:text-blue-600 transition">Dashboard Admin</Link>
          )}
          
          {session.role === UserRole.PARENT && (
            <Link to="/parent" className="hover:text-blue-600 transition">Mes Enfants</Link>
          )}

          <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Connecté en tant que</p>
              <p className="text-slate-900 font-black text-xs">{session.userName || 'Utilisateur'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-rose-50 text-rose-600 p-2.5 rounded-2xl hover:bg-rose-100 transition"
              title="Se déconnecter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <button onClick={handleLogout} className="text-rose-600 font-black text-xs uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl">Quitter</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
