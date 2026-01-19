
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Attendance, School, StatusLevel, GradeABCD } from '../types';
import { getAttendanceInsights } from '../services/geminiService';

interface ParentPortalProps {
  students: Student[];
  attendance: Attendance[];
  schools: School[];
  parentId?: string;
}

interface Alert {
  id: string;
  studentName: string;
  type: 'absence' | 'behavior' | 'aspect' | 'grade';
  message: string;
  severity: 'high' | 'medium';
}

const ParentPortal: React.FC<ParentPortalProps> = ({ students, attendance, schools, parentId }) => {
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Strict filtering: Parents only see students linked to their unique parentId
  const myChildren = useMemo(() => 
    students
      .filter(s => s.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })),
    [students, parentId]
  );

  // Filtered list based on search bar input
  const filteredChildren = useMemo(() => {
    return myChildren.filter(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myChildren, searchQuery]);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const alerts = useMemo(() => {
    if (myChildren.length === 0) return [];

    const detectedAlerts: Alert[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    myChildren.forEach(child => {
      const childAttendance = attendance
        .filter(a => a.studentId === child.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      const latest = childAttendance[0];
      if (!latest) return;

      if (latest.status === 'absent' && (latest.date === todayStr)) {
        detectedAlerts.push({
          id: `abs-${child.id}-${latest.date}`,
          studentName: child.name,
          type: 'absence',
          message: `${child.name} a été marqué absent aujourd'hui.`,
          severity: 'high'
        });
      }

      if (latest.status === 'present') {
        if (latest.conduite === 'mauvais') {
          detectedAlerts.push({
            id: `beh-${child.id}-${latest.date}`,
            studentName: child.name,
            type: 'behavior',
            message: `Attention : La conduite de ${child.name} a été jugée insatisfaisante aujourd'hui.`,
            severity: 'high'
          });
        }
        if (latest.abcd === 'D') {
          detectedAlerts.push({
            id: `grd-${child.id}-${latest.date}`,
            studentName: child.name,
            type: 'grade',
            message: `Alerte : ${child.name} a reçu une note D aujourd'hui.`,
            severity: 'high'
          });
        }
        if (latest.aspect === 'mauvais') {
          detectedAlerts.push({
            id: `asp-${child.id}-${latest.date}`,
            studentName: child.name,
            type: 'aspect',
            message: `Note : La tenue de ${child.name} nécessite un suivi.`,
            severity: 'medium'
          });
        }
      }
    });

    return detectedAlerts.filter(a => !dismissedAlerts.includes(a.id));
  }, [myChildren, attendance, dismissedAlerts]);

  const showStats = async (child: Student) => {
    setSelectedChild(child);
    setLoadingInsight(true);
    const childAttendance = attendance.filter(a => a.studentId === child.id);
    const presentCount = childAttendance.filter(a => a.status === 'present').length;
    
    const text = await getAttendanceInsights(child.name, presentCount, 20); 
    setInsight(text || null);
    setLoadingInsight(false);
  };

  const getLevelLabel = (type: 'aspect' | 'conduite', level?: StatusLevel) => {
    return type === 'aspect' 
      ? (level === 'bien' ? 'Très propre' : level === 'moyen' ? 'Passable' : 'Tenue à revoir')
      : (level === 'bien' ? 'Exemplaire' : level === 'moyen' ? 'Correct' : 'À surveiller');
  };

  const getLevelColor = (level?: StatusLevel) => {
    if (level === 'bien') return 'text-emerald-500';
    if (level === 'moyen') return 'text-amber-500';
    if (level === 'mauvais') return 'text-rose-500';
    return 'text-slate-400';
  };

  const getABCDColor = (grade?: GradeABCD) => {
    if (grade === 'A') return 'text-blue-600';
    if (grade === 'B') return 'text-emerald-500';
    if (grade === 'C') return 'text-amber-500';
    if (grade === 'D') return 'text-rose-600';
    return 'text-slate-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Espace Famille</h1>
          <p className="text-blue-600 font-bold text-sm mt-1">{currentDate}</p>
        </div>
        
        {/* Search Bar for Children */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Rechercher un enfant..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Alertes Importantes</h2>
          </div>
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-sm ${alert.severity === 'high' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
              <div className="flex items-center gap-3">
                <p className="font-bold text-sm md:text-base">{alert.message}</p>
              </div>
              <button onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])} className="opacity-40 hover:opacity-100 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredChildren.map(child => {
          const school = schools.find(sch => sch.id === child.schoolId);
          return (
            <div key={child.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-5 hover:shadow-xl transition-all duration-300">
              <img src={child.photoUrl} className="w-24 h-24 rounded-3xl object-cover border border-slate-50 shadow-sm" alt={child.name} />
              <div className="flex-grow">
                <h3 className="text-xl font-black text-slate-900">{child.name}</h3>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">{school?.name || 'École Inconnue'}</p>
                <div className="flex items-center gap-2 mt-1 mb-4">
                   <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">CLASSE {child.grade}</span>
                </div>
                <button onClick={() => showStats(child)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-lg shadow-slate-200">
                  Rapport Complet
                </button>
              </div>
            </div>
          );
        })}
        {myChildren.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            Aucun enfant associé à cet identifiant parent.
          </div>
        ) : filteredChildren.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400">
            Aucun enfant trouvé pour "{searchQuery}".
          </div>
        )}
      </div>

      {selectedChild && (
        <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">Suivi Quotidien : {selectedChild.name}</h3>
                <p className="text-blue-100/80 text-sm mt-1">Dernière mise à jour : {currentDate}</p>
              </div>
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest hidden sm:block">EN DIRECT</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-widest font-black opacity-70">Présence</p>
                <p className="text-3xl font-black">
                  {attendance.filter(a => a.studentId === selectedChild.id && a.status === 'present').length} j
                </p>
              </div>
              
              {(() => {
                const lastAttendance = attendance
                  .filter(a => a.studentId === selectedChild.id && a.status === 'present')
                  .sort((a, b) => b.date.localeCompare(a.date))[0];
                
                return (
                  <>
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                      <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-widest font-black opacity-70">Note ABCD</p>
                      <p className={`text-3xl font-black ${getABCDColor(lastAttendance?.abcd)} bg-white/20 inline-block px-4 py-0.5 rounded-xl`}>
                        {lastAttendance?.abcd || 'A'}
                      </p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                      <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-widest font-black opacity-70">Dernier Aspect</p>
                      <p className={`text-sm font-black ${getLevelColor(lastAttendance?.aspect)} bg-white/20 inline-block px-3 py-1.5 rounded-xl mt-1`}>
                        {getLevelLabel('aspect', lastAttendance?.aspect || 'bien')}
                      </p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                      <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-widest font-black opacity-70">Dernière Conduite</p>
                      <p className={`text-sm font-black ${getLevelColor(lastAttendance?.conduite)} bg-white/20 inline-block px-3 py-1.5 rounded-xl mt-1`}>
                        {getLevelLabel('conduite', lastAttendance?.conduite || 'bien')}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-white text-slate-800 p-8 rounded-[2.5rem] shadow-inner relative">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-2xl">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM6.464 14.95a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z"></path></svg>
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em]">Recommandations ScolarSync</span>
              </div>
              {loadingInsight ? (
                <div className="flex items-center gap-3 animate-pulse py-4">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animation-delay-200"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animation-delay-400"></div>
                  <span className="text-slate-400 font-bold text-sm ml-2">Analyse des données en cours...</span>
                </div>
              ) : (
                <p className="leading-relaxed text-slate-600 font-medium italic text-lg">"{insight}"</p>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-white/5 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
