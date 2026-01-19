
import React, { useState, useMemo } from 'react';
import { UserSession, UserRole, Student, School, Attendance, Staff, ParentAccount } from '../types';

interface AdminDashboardProps {
  session: UserSession;
  schools: School[];
  students: Student[];
  staff: Staff[];
  parentAccounts: ParentAccount[];
  attendance: Attendance[];
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onMarkAttendance: (a: Attendance) => void;
  onAddStaff: (s: Staff) => void;
  onDeleteStaff: (id: string) => void;
  onAddParentAccount: (p: ParentAccount) => void;
  onDeleteParentAccount: (id: string) => void;
  onDeleteSchool?: (id: string) => void;
  onResetDatabase?: () => void;
}

const BASE_GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '1s', '2s', '3s', '4s'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  session, schools, students, staff, parentAccounts, attendance, 
  onAddStudent, onUpdateStudent, onDeleteStudent, onMarkAttendance, 
  onAddStaff, onDeleteStaff, onAddParentAccount, onDeleteParentAccount, 
  onDeleteSchool, onResetDatabase 
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'accounts' | 'system'>('students');
  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formState, setFormState] = useState({ name: '', level: BASE_GRADES[0], section: SECTIONS[0], parentId: '' });
  const [accountForm, setAccountForm] = useState({ userName: '', password: '', type: 'staff' as 'staff' | 'parent', schoolId: session.schoolId || (schools[0]?.id || '') });

  const isGlobalAdmin = session.role === UserRole.ADMIN;
  const currentSchoolId = session.schoolId;

  const weekDates = useMemo(() => {
    const dates = [];
    const day = referenceDate.getDay();
    const diff = referenceDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(referenceDate);
    monday.setDate(diff);
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [referenceDate]);

  const school = schools.find(s => s.id === currentSchoolId) || schools[0];
  
  const schoolStudents = useMemo(() => 
    isGlobalAdmin ? students : students.filter(s => s.schoolId === currentSchoolId),
    [students, currentSchoolId, isGlobalAdmin]
  );

  const filteredStudents = useMemo(() => {
    return schoolStudents
      .filter(s => {
        const matchesLevel = selectedLevelFilter === 'all' || s.grade.startsWith(selectedLevelFilter);
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLevel && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }, [schoolStudents, selectedLevelFilter, searchQuery]);

  const exportDatabase = () => {
    const data = { schools, students, staff, parentAccounts, attendance };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScolarSync_Data_${new Date().toISOString().split('T')[0]}.scsync`;
    a.click();
    alert("Fichier généré ! PARTAGEZ-LE maintenant via WhatsApp avec votre personnel pour qu'ils puissent se connecter.");
  };

  const togglePresence = (studentId: string, date: string) => {
    const existing = attendance.find(a => a.studentId === studentId && a.date === date);
    onMarkAttendance({
      id: existing?.id || `ATT${Date.now()}-${studentId}-${date}`,
      studentId, date, status: existing?.status === 'present' ? 'absent' : 'present',
      aspect: 'bien', conduite: 'bien', abcd: 'A'
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{isGlobalAdmin ? "Console Maître" : school?.name}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gestion Administrative</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {['students', 'attendance', 'accounts', isGlobalAdmin && 'system'].filter(Boolean).map((t) => (
            <button 
              key={t as string}
              onClick={() => setActiveTab(t as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t === 'students' ? 'Élèves' : t === 'attendance' ? 'Registre' : t === 'accounts' ? 'Comptes' : 'Partage'}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'system' && isGlobalAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Synchroniser le Staff</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pour que votre personnel se connecte sur un autre téléphone, vous devez lui envoyer ce fichier.
            </p>
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center text-center gap-4">
               <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               </div>
               <button onClick={exportDatabase} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition">
                  Exporter la Database (.scsync)
               </button>
               <p className="text-[9px] font-bold text-blue-400 uppercase">Partagez ce fichier via WhatsApp</p>
            </div>
            <button onClick={onResetDatabase} className="w-full text-rose-500 text-[10px] font-black uppercase tracking-widest pt-4 hover:underline">Réinitialiser tout l'appareil</button>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center gap-8 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-blue-400 text-5xl font-black">{students.length}</p>
                <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">Élèves Enregistrés</p>
             </div>
             <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-xl font-bold">{schools.length}</p>
                   <p className="text-[8px] font-black uppercase opacity-40">Écoles</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-xl font-bold">{staff.length}</p>
                   <p className="text-[8px] font-black uppercase opacity-40">Staff</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
          </div>
        </div>
      )}

      {/* Les autres onglets restent fonctionnels avec le tri A-Z... */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between">
              <input className="bg-slate-50 px-5 py-3 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10 w-full md:w-64" placeholder="Rechercher un élève..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button onClick={() => { setEditingStudent(null); setFormState({name: '', level: BASE_GRADES[0], section: SECTIONS[0], parentId: ''}); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition hover:scale-105 active:scale-95">Ajouter Élève</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    <tr><th className="px-8 py-4">Nom de l'Élève</th><th className="px-8 py-4">Classe</th><th className="px-8 py-4 text-right">Actions</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition">
                         <td className="px-8 py-4 flex items-center gap-3"><img src={s.photoUrl} className="w-8 h-8 rounded-lg object-cover" /><span className="font-bold text-slate-800">{s.name}</span></td>
                         <td className="px-8 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">{s.grade}</span></td>
                         <td className="px-8 py-4 text-right">
                            <button onClick={() => { setEditingStudent(s); setFormState({ name: s.name, level: s.grade.slice(0,-1), section: s.grade.slice(-1), parentId: s.parentId }); setShowModal(true); }} className="text-blue-600 font-black text-[10px] uppercase mr-4">Editer</button>
                            <button onClick={() => onDeleteStudent(s.id)} className="text-rose-500 font-black text-[10px] uppercase">Suppr.</button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Registre Quotidien</h3>
              <div className="flex gap-2">
                 <button onClick={() => { const d = new Date(referenceDate); d.setDate(d.getDate()-7); setReferenceDate(d); }} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition">◀</button>
                 <button onClick={() => setReferenceDate(new Date())} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Aujourd'hui</button>
                 <button onClick={() => { const d = new Date(referenceDate); d.setDate(d.getDate()+7); setReferenceDate(d); }} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition">▶</button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    <tr><th className="px-8 py-4 sticky left-0 bg-slate-50 z-10">Élève</th>{WEEK_DAYS.map(d => <th key={d} className="px-4 py-4 text-center">{d}</th>)}</tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map(s => (
                      <tr key={s.id}>
                         <td className="px-8 py-4 font-bold text-slate-700 sticky left-0 bg-white z-10">{s.name}</td>
                         {weekDates.map(date => {
                           const isPresent = attendance.find(a => a.studentId === s.id && a.date === date)?.status === 'present';
                           return (
                             <td key={date} className="px-4 py-4 text-center">
                                <button onClick={() => togglePresence(s.id, date)} className={`w-8 h-8 rounded-lg border-2 transition-all ${isPresent ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-transparent'}`}>✓</button>
                             </td>
                           );
                         })}
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personnel de l'École</h3>
                 <button onClick={() => { setAccountForm({ ...accountForm, type: 'staff' }); setShowAccountModal(true); }} className="text-blue-600 font-black text-[10px] uppercase">+ Nouveau</button>
              </div>
              <div className="space-y-3">
                 {staff.filter(s => isGlobalAdmin || s.schoolId === currentSchoolId).map(s => (
                   <div key={s.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group transition hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-50">
                      <div>
                         <p className="font-black text-slate-800 text-sm">{s.userName}</p>
                         <p className="text-[8px] font-black uppercase opacity-40">{schools.find(sch => sch.id === s.schoolId)?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-bold">{s.password}</span>
                         <button onClick={() => onDeleteStaff(s.id)} className="text-rose-500 p-2 opacity-40 group-hover:opacity-100 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Comptes Parents</h3>
                 <button onClick={() => { setAccountForm({ ...accountForm, type: 'parent' }); setShowAccountModal(true); }} className="text-blue-600 font-black text-[10px] uppercase">+ Nouveau</button>
              </div>
              <div className="space-y-3">
                 {parentAccounts.map(p => (
                   <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group transition hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-50">
                      <p className="font-black text-slate-800 text-sm">{p.userName}</p>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-bold">{p.password}</span>
                         <button onClick={() => onDeleteParentAccount(p.id)} className="text-rose-500 p-2 opacity-40 group-hover:opacity-100 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* MODALS SANS CHANGEMENT LOGIQUE MAIS AVEC DESIGN AMÉLIORÉ */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={(e) => { e.preventDefault(); if (accountForm.type === 'staff') onAddStaff({ id: 'STF' + Date.now(), ...accountForm }); else onAddParentAccount({ id: 'PAR' + Date.now(), ...accountForm }); setShowAccountModal(false); }} className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl space-y-5 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest text-center">Nouveau Compte</h3>
            <div className="space-y-3">
              <select className="w-full px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={accountForm.type} onChange={e => setAccountForm({ ...accountForm, type: e.target.value as any })}>
                <option value="staff">Personnel Scolaire</option>
                <option value="parent">Parent d'Élève</option>
              </select>
              <input required placeholder="Nom Utilisateur" className="w-full px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={accountForm.userName} onChange={e => setAccountForm({ ...accountForm, userName: e.target.value })} />
              <input required placeholder="Mot de Passe" className="w-full px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={accountForm.password} onChange={e => setAccountForm({ ...accountForm, password: e.target.value })} />
              {accountForm.type === 'staff' && (
                <select className="w-full px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={accountForm.schoolId} onChange={e => setAccountForm({ ...accountForm, schoolId: e.target.value })}>
                  {schools.map(sch => <option key={sch.id} value={sch.id}>{sch.name}</option>)}
                </select>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowAccountModal(false)} className="flex-1 font-black text-slate-400 text-xs uppercase">Annuler</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={(e) => { e.preventDefault(); const grade = `${formState.level}${formState.section}`; if (editingStudent) onUpdateStudent({ ...editingStudent, name: formState.name, grade, parentId: formState.parentId }); else onAddStudent({ id: 'STD' + Date.now(), name: formState.name, grade, parentId: formState.parentId, schoolId: currentSchoolId || schools[0]?.id, photoUrl: `https://picsum.photos/seed/${Math.random()}/200/200` }); setShowModal(false); }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest text-center">{editingStudent ? 'Modifier Élève' : 'Nouvel Élève'}</h3>
            <div className="space-y-4">
              <input required placeholder="Nom Complet de l'Élève" className="w-full px-5 py-4 rounded-2xl border-none bg-slate-50 font-black text-sm" value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={formState.level} onChange={e => setFormState({ ...formState, level: e.target.value })}>
                  {BASE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select className="px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={formState.section} onChange={e => setFormState({ ...formState, section: e.target.value })}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <select className="w-full px-5 py-4 rounded-2xl border-none bg-slate-50 font-bold text-sm" value={formState.parentId} onChange={e => setFormState({ ...formState, parentId: e.target.value })}>
                <option value="">Associer à un Parent</option>
                {parentAccounts.map(p => <option key={p.id} value={p.id}>{p.userName}</option>)}
              </select>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-black text-slate-400 text-xs uppercase">Annuler</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100">Confirmer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
