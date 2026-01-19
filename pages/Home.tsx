
import React, { useMemo } from 'react';
import { School, UserRole, UserSession } from '../types';
import { Link } from 'react-router-dom';

interface HomeProps {
  schools: School[];
  session: UserSession;
  onDeleteSchool?: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ schools, session, onDeleteSchool }) => {
  const isGlobalAdmin = session.role === UserRole.ADMIN;

  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }, [schools]);

  return (
    <div className="space-y-12">
      <section className="text-center py-16 px-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Bienvenue sur <span className="text-blue-600">ScolarSync</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            La base de données scolaire interactive. Suivez les présences et la progression de vos élèves en temps réel.
          </p>
          
          {isGlobalAdmin && (
            <div className="mt-10">
              <Link 
                to="/register-school" 
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-200 transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Enregistrer une École
              </Link>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Nos Établissements</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Base de données active</p>
          </div>
          <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-black">{sortedSchools.length} ÉCOLES</span>
        </div>

        {sortedSchools.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold text-lg mb-6">Aucune école enregistrée.</p>
            {isGlobalAdmin && (
              <Link to="/register-school" className="text-blue-600 font-black hover:underline">
                Ajouter une école
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedSchools.map((school) => (
              <div key={school.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="h-56 overflow-hidden relative">
                  <img src={school.photoUrl} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-8">
                    <h3 className="text-white font-black text-2xl">{school.name}</h3>
                  </div>
                  {isGlobalAdmin && (
                    <button 
                      onClick={() => onDeleteSchool?.(school.id)}
                      className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-rose-500 transition-colors border border-white/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {school.location}
                  </p>
                  <div className="flex gap-3">
                    {session.role === UserRole.PARENT ? (
                      <Link to="/parent" className="flex-1 bg-blue-600 text-white text-center py-4 rounded-2xl font-black shadow-lg shadow-blue-100">Mon Espace</Link>
                    ) : (
                      <Link to="/admin" className="flex-1 bg-slate-900 text-white text-center py-4 rounded-2xl font-black shadow-lg">Administration</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
