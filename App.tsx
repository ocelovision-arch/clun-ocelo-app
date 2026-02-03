
import React, { useState, useEffect } from 'react';
import { AppRole, AppConfig, Product, User, PointEntry } from './types';
import { INITIAL_CONFIG, MOCK_PRODUCTS, MOCK_CUSTOMERS } from './constants';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { 
  Shield, 
  User as UserIcon, 
  X, 
  LogIn, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck,
  Loader2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

const App: React.FC = () => {
  // --- LÓGICA DE BASE DE DATOS (LocalStorage) ---
  const loadFromDB = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(`ocelo_db_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key} from DB`, e);
      return defaultValue;
    }
  };

  const [config, setConfig] = useState<AppConfig>(() => loadFromDB('config', INITIAL_CONFIG));
  const [products, setProducts] = useState<Product[]>(() => loadFromDB('products', MOCK_PRODUCTS));
  const [customers, setCustomers] = useState<User[]>(() => loadFromDB('customers', MOCK_CUSTOMERS));

  // Efecto para inyectar colores de marca dinámicamente
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
  }, [config]);

  // Sincronización automática con LocalStorage
  useEffect(() => {
    localStorage.setItem('ocelo_db_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('ocelo_db_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ocelo_db_customers', JSON.stringify(customers));
  }, [customers]);

  // --- ESTADOS DE SESIÓN Y UI ---
  const [role, setRole] = useState<AppRole>(AppRole.USER);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  
  const [userLoginData, setUserLoginData] = useState({ email: '', password: '' });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', password: '', referralCode: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mantener al usuario actual sincronizado con los cambios en la lista de clientes
  useEffect(() => {
    if (currentUser) {
      const updated = customers.find(c => c.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [customers]);

  const handleAdminToggle = () => {
    if (role === AppRole.ADMIN) {
      setRole(AppRole.USER);
    } else {
      if (isAdminAuthenticated) {
        setRole(AppRole.ADMIN);
      } else {
        setShowAdminLoginModal(true);
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginForm.username === 'adminsanbran' && adminLoginForm.password === 'vase2016') {
      setIsAdminAuthenticated(true);
      setRole(AppRole.ADMIN);
      setShowAdminLoginModal(false);
      setShowAdminPassword(false);
      setAdminLoginForm({ username: '', password: '' });
      setError('');
    } else {
      setError('Credenciales de administrador incorrectas');
    }
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = customers.find(c => 
      c.email.toLowerCase() === userLoginData.email.toLowerCase() && 
      c.password === userLoginData.password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setError('');
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (customers.some(c => c.email.toLowerCase() === regForm.email.toLowerCase())) {
      setError('Este correo ya está registrado.');
      return;
    }
    setError('');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsVerifying(true);
      setShowEmailNotification(true);
      setTimeout(() => setShowEmailNotification(false), 10000);
    }, 1500);
  };

  const handleVerifyAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== '123456') {
      setError('Código inválido.');
      return;
    }

    const newUserId = `user_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    setCustomers(prev => {
      const updatedCustomers = [...prev];
      if (regForm.referralCode) {
        const ownerIndex = updatedCustomers.findIndex(
          c => c.referralCode.trim().toUpperCase() === regForm.referralCode.trim().toUpperCase()
        );

        if (ownerIndex !== -1) {
          const referralBonus: PointEntry = {
            id: `bonus_ref_${Date.now()}`,
            amount: 5000,
            type: 'referral',
            date: today,
            expiryDate: expiry,
            status: 'active',
            description: `Bono por referir a ${regForm.name}`
          };
          updatedCustomers[ownerIndex] = {
            ...updatedCustomers[ownerIndex],
            totalPoints: updatedCustomers[ownerIndex].totalPoints + 5000,
            pointsDetail: [referralBonus, ...updatedCustomers[ownerIndex].pointsDetail],
            referrals: [...updatedCustomers[ownerIndex].referrals, newUserId]
          };
        }
      }

      const newUser: User = {
        id: newUserId,
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        phone: regForm.phone,
        referralCode: `OCELO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        totalPoints: regForm.referralCode ? 500 : 0,
        history: [],
        pointsDetail: regForm.referralCode ? [{
          id: `welcome_${Date.now()}`,
          amount: 500,
          type: 'referral',
          date: today,
          expiryDate: expiry,
          status: 'active',
          description: 'Bono de bienvenida por referido'
        }] : [],
        referrals: []
      };
      return [...updatedCustomers, newUser];
    });

    setSuccess('¡Registro exitoso!');
    setIsRegistering(false);
    setIsVerifying(false);
    setShowRegPassword(false);
    setUserLoginData({ email: regForm.email, password: regForm.password });
    setRegForm({ name: '', email: '', phone: '', password: '', referralCode: '' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserLoginData({ email: '', password: '' });
    setShowUserPassword(false);
  };

  if (role === AppRole.USER && !currentUser) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto transition-colors duration-500" style={{ backgroundColor: config.primaryColor }}>
        {showEmailNotification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm animate-in slide-in-from-top-full duration-500">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border-l-4 border-orange-500 flex items-start gap-4">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Mail size={24} /></div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-400 uppercase mb-1">Ocelo Vision</p>
                <p className="text-sm font-bold text-slate-800">Tu código es: <span className="text-orange-600 font-black text-lg">123456</span></p>
              </div>
              <button onClick={() => setShowEmailNotification(false)}><X size={16} /></button>
            </div>
          </div>
        )}

        <div className="fixed top-6 right-6 z-50">
           <button onClick={handleAdminToggle} className="text-white/40 hover:text-orange-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
             <Shield size={12} /> Acceso Staff
           </button>
        </div>

        <div className="w-full max-w-md my-8">
           <div className="text-center mb-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/10 overflow-hidden">
                 <img src={config.logoUrl} className="w-full h-full object-contain p-2" alt="Ocelo" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Ocelo Vision</h1>
              <p className="text-white/40 font-medium mt-2 uppercase tracking-[0.2em] text-[10px] font-bold">
                Fidelidad & Beneficios Premium
              </p>
           </div>

           <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-3xl border border-white/20 relative overflow-hidden">
              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500 mb-4" size={56} />
                  <p className="font-black text-slate-900 tracking-widest uppercase text-xs">Guardando en DB...</p>
                </div>
              )}

              {isVerifying ? (
                <form onSubmit={handleVerifyAndCreate} className="space-y-8 animate-in fade-in duration-500">
                  <div className="text-center">
                    <ShieldCheck size={48} className="mx-auto text-orange-500 mb-4" />
                    <h2 className="text-2xl font-black text-slate-800">Verifica tu Mail</h2>
                  </div>
                  <input type="text" maxLength={6} value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="w-full text-center p-6 bg-slate-50 border-2 rounded-2xl font-mono text-4xl font-black tracking-[0.4em] text-orange-600" placeholder="000000" required />
                  <button type="submit" className="w-full text-white py-6 rounded-[2rem] font-black shadow-2xl transition-all" style={{ backgroundColor: config.accentColor }}>ACTIVAR CUENTA</button>
                </form>
              ) : isRegistering ? (
                <form onSubmit={handleStartRegistration} className="space-y-4 animate-in slide-in-from-right-10 duration-500">
                  <div className="flex items-center gap-4 mb-2">
                    <button type="button" onClick={() => setIsRegistering(false)} className="p-2 bg-slate-100 rounded-xl"><ArrowLeft size={20} /></button>
                    <h3 className="text-2xl font-black text-slate-800">Registro</h3>
                  </div>
                  <input type="text" required placeholder="Nombre Completo" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                  <input type="email" required placeholder="Email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="tel" placeholder="Celular" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                    <input type="text" placeholder="Cód. Referido" value={regForm.referralCode} onChange={e => setRegForm({...regForm, referralCode: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold uppercase" />
                  </div>
                  <div className="relative">
                    <input 
                      type={showRegPassword ? "text" : "password"} 
                      required 
                      placeholder="Crear Clave" 
                      value={regForm.password} 
                      onChange={e => setRegForm({...regForm, password: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl font-bold pr-12" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowRegPassword(!showRegPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <button type="submit" className="w-full text-white py-5 rounded-[2rem] font-black shadow-xl mt-4" style={{ backgroundColor: config.accentColor }}>CREAR CUENTA</button>
                </form>
              ) : (
                <form onSubmit={handleUserLogin} className="space-y-6 animate-in fade-in duration-500">
                   {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase text-center">{error}</div>}
                   {success && <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase text-center">{success}</div>}
                   <input type="email" required value={userLoginData.email} onChange={e => setUserLoginData({...userLoginData, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="email@ejemplo.com" />
                   <div className="relative">
                    <input 
                      type={showUserPassword ? "text" : "password"} 
                      required 
                      value={userLoginData.password} 
                      onChange={e => setUserLoginData({...userLoginData, password: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl font-bold pr-12" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowUserPassword(!showUserPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showUserPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                   </div>
                   <button type="submit" className="w-full text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3" style={{ backgroundColor: config.accentColor }}>Ingresar <LogIn size={22} /></button>
                   <div className="pt-6 border-t border-slate-100"><button type="button" onClick={() => setIsRegistering(true)} className="w-full text-[11px] font-black uppercase flex items-center justify-center gap-2 tracking-widest" style={{ color: config.accentColor }}>¿No tienes cuenta? Regístrate</button></div>
                </form>
              )}
           </div>
        </div>

        {showAdminLoginModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-sm:max-w-xs max-w-sm rounded-[3rem] shadow-4xl p-10 space-y-5 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black">Staff Login</h3>
                <button onClick={() => { setShowAdminLoginModal(false); setShowAdminPassword(false); }}><X size={24} /></button>
              </div>
              <input type="text" placeholder="Usuario" value={adminLoginForm.username} onChange={e => setAdminLoginForm({...adminLoginForm, username: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
              <div className="relative">
                <input 
                  type={showAdminPassword ? "text" : "password"} 
                  placeholder="Clave" 
                  value={adminLoginForm.password} 
                  onChange={e => setAdminLoginForm({...adminLoginForm, password: e.target.value})} 
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold pr-12" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowAdminPassword(!showAdminPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button onClick={handleAdminLogin} className="w-full text-white py-5 rounded-[1.5rem] font-black shadow-2xl" style={{ backgroundColor: config.accentColor }}>ENTRAR AL PANEL</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#F8FAFC] overflow-hidden">
      <div className="fixed bottom-8 right-8 z-[100]">
        <button
          onClick={role === AppRole.ADMIN ? handleAdminToggle : handleLogout}
          className={`flex items-center gap-3 px-8 py-4 rounded-full shadow-4xl font-black text-[10px] uppercase tracking-[0.2em] border ${role === AppRole.ADMIN ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
        >
          {role === AppRole.ADMIN ? <><UserIcon size={18} /> Salir Admin</> : <><X size={18} /> Cerrar Sesión</>}
        </button>
      </div>
      <main className="h-full w-full">
        {role === AppRole.ADMIN ? (
          <AdminDashboard 
            config={config} 
            setConfig={setConfig} 
            products={products} 
            setProducts={setProducts} 
            customers={customers} 
            setCustomers={setCustomers} 
          />
        ) : (
          currentUser && <UserDashboard config={config} user={currentUser} products={products} allUsers={customers} setCustomers={setCustomers} />
        )}
      </main>
    </div>
  );
};

export default App;
