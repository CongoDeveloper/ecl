
import React, { useState, useRef } from 'react';
import { UserRole, UserSession, Staff, ParentAccount, School } from '../types';

interface LoginProps {
  staff: Staff[];
  parentAccounts: ParentAccount[];
  schools: School[];
  onLogin: (session: UserSession) => void;
  onImportDB: (data: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ staff, parentAccounts, schools, onLogin, onImportDB }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loginType, setLoginType] = useState<'admin_parent' | 'staff'>('admin_parent');
  const [error, setError] = useState('');
  const [showSync, setShowSync] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDatabaseEmpty = schools.length === 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Accès Super-Admin Xelar (Toujours disponible pour configurer)
    if (name.trim() === 'Xelar' && password === 'Xelar137$kN') {
      onLogin({ role: UserRole.ADMIN, userName: 'Administrateur Xelar' });
      return;
    }

    if (isDatabaseEmpty) {
      setError("Ce téléphone n'a aucune donnée. Importez le fichier .scsync de l'administrateur.");
      return;
    }

    const cleanName = name.trim();
    const cleanSchool = schoolName.trim().toLowerCase();

    if (loginType === 'staff') {
      const targetSchool = schools.find(s => s.name.toLowerCase().trim() === cleanSchool);
      if (!targetSchool) {
        setError("École non trouvée sur cet appareil.");
        return;
      }
      const sAccount = staff.find(s => s.userName === cleanName && s.password === password && s.schoolId === targetSchool.id);
      if (sAccount) {
        onLogin({ role: UserRole.STAFF, userName: sAccount.userName, schoolId: targetSchool.id });
        return;
      }
    } else {
      const pAccount = parentAccounts.find(p => p.userName === cleanName && p.password === password);
      if (pAccount) {
        onLogin({ role: UserRole.PARENT, userName: pAccount.userName, parentId: pAccount.id });
        return;
      }
    }

    setError('Identifiants incorrects.');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (onImportDB(content)) {
        alert("TERMINÉ ! Les données sont synchronisées. Vous pouvez maintenant vous connecter.");
        setShowSync(false);
        setError('');
      } else {
        alert("Fichier invalide. Utilisez le fichier envoyé par l'Admin.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
        {/* Décoration de fond */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-50 blur-2xl"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.8rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-2xl shadow-blue-200">S</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ScolarSync</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Gestion Scolaire Mobile</p>
          
          <div className="flex bg-slate-50 p-1 rounded-2xl mt-8 border border-slate-100">
            <button 
              onClick={() => setLoginType('admin_parent')} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginType === 'admin_parent' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              Admin/Parent
            </button>
            <button 
              onClick={() => setLoginType('staff')} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginType === 'staff' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              Personnel
            </button>
          </div>
        </div>

        {!showSync ? (
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {isDatabaseEmpty && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl animate-pulse cursor-pointer" onClick={() => setShowSync(true)}>
                <p className="text-[10px] font-black text-blue-700 leading-tight uppercase text-center">
                  📱 NOUVEAU TÉLÉPHONE DÉTECTÉ<br/>Cliquez ici pour synchroniser
                </p>
              </div>
            )}

            <div className="space-y-4">
               <input 
                 required 
                 className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:border-blue-500 transition-all bg-slate-50/50" 
                 placeholder="Nom d'utilisateur" 
                 value={name} 
                 onChange={e => setName(e.target.value)} 
               />
               
               <input 
                 required 
                 type="password" 
                 className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:border-blue-500 transition-all bg-slate-50/50" 
                 placeholder="Mot de passe" 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
               />

               {loginType === 'staff' && (
                 <input 
                   required 
                   className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:border-blue-500 transition-all bg-slate-50/50 animate-in slide-in-from-top-2" 
                   placeholder="Nom de l'école exacte" 
                   value={schoolName} 
                   onChange={e => setSchoolName(e.target.value)} 
                 />
               )}
            </div>

            {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center bg-rose-50 py-3 rounded-xl">{error}</p>}
            
            <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition active:scale-95 text-xs uppercase tracking-widest hover:bg-blue-600">
              Se Connecter
            </button>
            
            <div className="pt-6 border-t border-slate-50 text-center">
               <button type="button" onClick={() => setShowSync(true)} className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 Synchroniser cet appareil
               </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-300 relative z-10">
            <div className="text-center">
               <h2 className="text-2xl font-black text-slate-900 mb-2">Synchronisation</h2>
               <p className="text-slate-500 text-[11px] font-bold leading-relaxed">
                 1. Demandez le fichier <span className="text-blue-600">.scsync</span> à l'Admin.<br/>
                 2. Sélectionnez-le ci-dessous.
               </p>
            </div>
            
            <input type="file" accept=".scsync" ref={fileInputRef} className="hidden" onChange={handleFileImport} />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-4 border-dashed border-blue-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:bg-blue-50 transition-all bg-white group"
            >
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
               </div>
               <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-600 tracking-widest">Choisir le fichier .scsync</span>
            </button>
            
            <button type="button" onClick={() => setShowSync(false)} className="w-full text-[10px] font-black text-slate-400 uppercase py-2 tracking-widest hover:text-slate-600">
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
