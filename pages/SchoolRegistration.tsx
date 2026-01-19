
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, UserRole, UserSession } from '../types';

interface SchoolRegistrationProps {
  onRegister: (school: School) => void;
  setSession: (s: UserSession) => void;
}

const SchoolRegistration: React.FC<SchoolRegistrationProps> = ({ onRegister, setSession }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    adminEmail: '',
    photoUrl: 'https://picsum.photos/seed/' + Math.random() + '/800/600'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchool: School = {
      id: Date.now().toString(),
      ...formData
    };
    onRegister(newSchool);
    setSession({ role: UserRole.ADMIN, schoolId: newSchool.id });
    navigate('/admin');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Enregistrer votre école</h2>
        <p className="text-slate-500">Créez votre espace admin pour commencer à gérer vos élèves.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de l'école</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Ex: École Excellence"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Localisation / Adresse</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Ex: Abidjan, Cocody"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Administrateur</label>
          <input 
            required
            type="email" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="votre@email.com"
            value={formData.adminEmail}
            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">URL Photo de l'école</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              value={formData.photoUrl}
              onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setFormData({...formData, photoUrl: `https://picsum.photos/seed/${Math.random()}/800/600`})}
              className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition"
            >
              Générer
            </button>
          </div>
          <div className="mt-4 rounded-xl overflow-hidden h-40 border border-slate-100">
            <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transform active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
        >
          Créer l'Espace École
        </button>
      </form>
    </div>
  );
};

export default SchoolRegistration;
