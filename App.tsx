
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { School, Student, Attendance, UserRole, UserSession, Staff, ParentAccount } from './types';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ParentPortal from './pages/ParentPortal';
import SchoolRegistration from './pages/SchoolRegistration';
import Login from './pages/Login';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('schools');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('staff');
    return saved ? JSON.parse(saved) : [];
  });

  const [parentAccounts, setParentAccounts] = useState<ParentAccount[]>(() => {
    const saved = localStorage.getItem('parentAccounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('scolar_sync_session');
    return saved ? JSON.parse(saved) : { role: UserRole.GUEST };
  });

  useEffect(() => {
    localStorage.setItem('schools', JSON.stringify(schools));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('parentAccounts', JSON.stringify(parentAccounts));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('scolar_sync_session', JSON.stringify(session));
  }, [schools, students, staff, parentAccounts, attendance, session]);

  const addSchool = (school: School) => setSchools([...schools, school]);
  
  const deleteSchool = (schoolId: string) => {
    if (window.confirm("Attention : Supprimer cette école effacera TOUS les élèves et le personnel associés. Continuer ?")) {
      setSchools(prev => prev.filter(s => s.id !== schoolId));
      setStudents(prev => prev.filter(s => s.schoolId !== schoolId));
      setStaff(prev => prev.filter(s => s.schoolId !== schoolId));
      const schoolStudentIds = students.filter(s => s.schoolId === schoolId).map(s => s.id);
      setAttendance(prev => prev.filter(a => !schoolStudentIds.includes(a.studentId)));
    }
  };

  const addStudent = (student: Student) => setStudents([...students, student]);
  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };
  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
  };

  const addStaff = (s: Staff) => setStaff([...staff, s]);
  const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));

  const addParentAccount = (p: ParentAccount) => setParentAccounts([...parentAccounts, p]);
  const deleteParentAccount = (id: string) => {
    setParentAccounts(prev => prev.filter(p => p.id !== id));
  };

  const markAttendance = (att: Attendance) => {
    const filtered = attendance.filter(a => !(a.studentId === att.studentId && a.date === att.date));
    setAttendance([...filtered, att]);
  };

  const importDatabase = (dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      if (data.schools) setSchools(data.schools);
      if (data.students) setStudents(data.students);
      if (data.staff) setStaff(data.staff);
      if (data.parentAccounts) setParentAccounts(data.parentAccounts);
      if (data.attendance) setAttendance(data.attendance);
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      return false;
    }
  };

  const resetDatabase = () => {
    if (window.confirm("Réinitialiser toute la base de données ?")) {
      setSchools([]); setStudents([]); setStaff([]); setParentAccounts([]); setAttendance([]);
      setSession({ role: UserRole.GUEST });
      localStorage.clear();
      window.location.reload();
    }
  };

  const isGuest = session.role === UserRole.GUEST;

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        {!isGuest && <Navbar session={session} setSession={setSession} />}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {isGuest ? (
              <Route path="*" element={<Login staff={staff} parentAccounts={parentAccounts} schools={schools} onLogin={(s) => setSession(s)} onImportDB={importDatabase} />} />
            ) : (
              <>
                <Route path="/" element={<Home schools={schools} session={session} onDeleteSchool={deleteSchool} />} />
                <Route path="/register-school" element={<SchoolRegistration onRegister={addSchool} setSession={setSession} />} />
                <Route 
                  path="/admin" 
                  element={
                    (session.role === UserRole.ADMIN || session.role === UserRole.STAFF) ? (
                      <AdminDashboard 
                        session={session} 
                        schools={schools}
                        students={students} 
                        staff={staff}
                        parentAccounts={parentAccounts}
                        attendance={attendance}
                        onAddStudent={addStudent}
                        onUpdateStudent={updateStudent}
                        onDeleteStudent={deleteStudent}
                        onMarkAttendance={markAttendance}
                        onAddStaff={addStaff}
                        onDeleteStaff={deleteStaff}
                        onAddParentAccount={addParentAccount}
                        onDeleteParentAccount={deleteParentAccount}
                        onDeleteSchool={deleteSchool}
                        onResetDatabase={resetDatabase}
                      />
                    ) : (
                      <Navigate to="/parent" replace />
                    )
                  } 
                />
                <Route 
                  path="/parent" 
                  element={
                    <ParentPortal 
                      students={students} 
                      attendance={attendance} 
                      schools={schools}
                      parentId={session.parentId}
                    />
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        <footer className="bg-slate-900 text-white py-12 px-4">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">S</div>
              <span className="text-xl font-black tracking-tight">ScolarSync</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Système de Sync: Prêt</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">
                &copy; 2024 ScolarSync. Xelar Technology.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
