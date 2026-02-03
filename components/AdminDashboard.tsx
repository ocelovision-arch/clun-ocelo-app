
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Award,
  DollarSign,
  Search,
  X,
  UserPlus,
  RefreshCw,
  Package,
  Image as ImageIcon,
  Tag,
  Coins,
  Layers,
  FileText,
  PlusCircle,
  Save,
  Info,
  Database,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppConfig, Product, User } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AdminDashboardProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: User[];
  setCustomers: React.Dispatch<React.SetStateAction<User[]>>;
}

type AdminTab = 'dashboard' | 'customers' | 'catalog' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, setConfig, products, setProducts, customers, setCustomers }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dbStatus, setDbStatus] = useState<'synced' | 'saving'>('synced');
  
  // Efecto para simular guardado visual en la base de datos
  useEffect(() => {
    setDbStatus('saving');
    const timer = setTimeout(() => setDbStatus('synced'), 600);
    return () => clearTimeout(timer);
  }, [config, products, customers]);

  // --- ESTADOS CLIENTES ---
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [customerFormData, setCustomerFormData] = useState<Partial<User>>({
    name: '', email: '', password: '', phone: '', referralCode: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS CATÁLOGO ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: '', category: 'Sol', price: 0, stock: 0, imageUrl: '', description: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- ESTADOS CONFIGURACIÓN ---
  const [settingsForm, setSettingsForm] = useState<AppConfig>(config);
  const [logoPreview, setLogoPreview] = useState<string>(config.logoUrl);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // --- FILTROS ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  // --- LÓGICA PRODUCTOS ---
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData(product);
      setImagePreview(product.imageUrl);
    } else {
      setEditingProduct(null);
      setProductFormData({ name: '', category: 'Sol', price: 0, stock: 0, imageUrl: '', description: '' });
      setImagePreview(null);
    }
    setShowProductModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProductFormData(prev => ({ ...prev, imageUrl: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productFormData } as Product : p));
    } else {
      const newProduct: Product = {
        ...productFormData,
        id: `prod_${Date.now()}`,
      } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto de la base de datos?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- LÓGICA CONFIGURACIÓN ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSettingsForm(prev => ({ ...prev, logoUrl: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setConfig(settingsForm);
      setIsSavingSettings(false);
      // Feedback visual adicional para confirmar persistencia
    }, 1000);
  };

  // --- LÓGICA CLIENTES ---
  const handleOpenCustomerModal = (customer?: User) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerFormData(customer);
    } else {
      setEditingCustomer(null);
      setCustomerFormData({ name: '', email: '', password: '', phone: '', referralCode: '' });
    }
    setShowCustomerPassword(false);
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente de la base de datos?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...customerFormData } as User : c));
    } else {
      const newCustomer: User = {
        ...customerFormData,
        id: `user_${Date.now()}`,
        totalPoints: 0,
        history: [],
        pointsDetail: [],
        referrals: [],
        referralCode: customerFormData.referralCode || `OCELO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      } as User;
      setCustomers(prev => [...prev, newCustomer]);
    }
    setShowCustomerModal(false);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setCustomerFormData(prev => ({ ...prev, password: pass }));
    setShowCustomerPassword(true); // Mostrar para que el admin vea la clave generada
  };

  const chartData = [
    { name: 'Lun', ventas: 4000 }, { name: 'Mar', ventas: 3000 }, { name: 'Mie', ventas: 2000 },
    { name: 'Jue', ventas: 2780 }, { name: 'Vie', ventas: 1890 }, { name: 'Sab', ventas: 2390 }, { name: 'Dom', ventas: 3490 },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#001B3D] text-white flex flex-col hidden lg:flex border-r border-white/5 h-full">
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
              <img src={config.logoUrl} className="w-full h-full object-contain p-1" alt="Logo" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-tight">Ocelo Admin</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Panel de Control</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 mt-4 px-6 space-y-2">
          <NavItem icon={<LayoutDashboard size={22} />} label="Métricas" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<ShoppingBag size={22} />} label="Catálogo" active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} />
          <NavItem icon={<Users size={22} />} label="Clientes" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <NavItem icon={<Settings size={22} />} label="Configuración" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-8 border-t border-white/5">
           <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${dbStatus === 'synced' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
             {dbStatus === 'synced' ? <Database size={14} /> : <RefreshCw size={14} className="animate-spin" />}
             {dbStatus === 'synced' ? 'DB Sincronizada' : 'Guardando...'}
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 flex-shrink-0">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {activeTab === 'catalog' ? 'Gestión de Catálogo' : activeTab === 'customers' ? 'Base de Datos de Clientes' : activeTab === 'settings' ? 'Configuración Global' : 'Métricas del Sistema'}
          </h2>
          <div className="px-4 py-2 bg-green-50 rounded-xl text-[10px] font-black text-green-600 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dbStatus === 'synced' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} /> 
            {dbStatus === 'synced' ? 'STORAGE ACTIVO' : 'ACTUALIZANDO LOCALSTORAGE...'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <StatCard icon={<Users className="text-blue-600" />} label="Clientes" value={customers.length.toString()} trend="+4" trendUp={true} />
                <StatCard 
                  icon={<Package className="text-orange-600" />} 
                  label="Productos" 
                  value={products.length.toString()} 
                  trend="Ver Catálogo" 
                  trendUp={true} 
                  onClick={() => setActiveTab('catalog')}
                />
                <StatCard icon={<Award className="text-purple-600" />} label="Canjes Totales" value="142" trend="+12%" trendUp={true} />
                <StatCard icon={<DollarSign className="text-green-600" />} label="Valor Puntos" value="1.2M" trend="Pts" trendUp={true} />
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-[450px]">
                <h3 className="text-xl font-black text-slate-900 mb-10">Flujo de Puntos Semanal</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="ventas" stroke={config.accentColor} fill={config.accentColor} fillOpacity={0.1} strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Package size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Inventario de Canjes</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Administra tus productos premium</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenProductModal()}
                  className="text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: config.accentColor }}
                >
                  <PlusCircle size={22} /> Nuevo Producto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => handleOpenProductModal(product)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-blue-600 shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-red-600 shadow-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-black text-slate-900 leading-tight flex-1">{product.name}</h4>
                        <span className="text-2xl font-black leading-none" style={{ color: config.accentColor }}>{product.price.toLocaleString()} <span className="text-[10px] text-slate-400">PTS</span></span>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium">{product.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                          <span className="text-[10px] font-black text-slate-400 uppercase">Stock: {product.stock} un.</span>
                        </div>
                        <button onClick={() => handleOpenProductModal(product)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Editar Ficha</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => handleOpenProductModal()}
                  className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 flex flex-col items-center justify-center gap-6 group hover:border-orange-500 hover:bg-orange-50/30 transition-all min-h-[350px]"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:text-orange-500 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <Plus size={40} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-400 group-hover:text-orange-600 transition-colors uppercase tracking-tight">Agregar Producto</p>
                    <p className="text-xs text-slate-300 font-bold uppercase mt-1 tracking-widest">Crear nueva entrada en el catálogo</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                     <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold outline-none" />
                  </div>
                  <button onClick={() => handleOpenCustomerModal()} className="text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all" style={{ backgroundColor: config.accentColor }}><UserPlus size={22} /> Agregar Cliente</button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b">
                        <tr>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre / Email</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Referidos</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Saldo DB</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map(c => (
                           <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-900 leading-none">{c.name}</p>
                                 <p className="text-xs text-slate-400 mt-1.5 font-bold">{c.email}</p>
                              </td>
                              <td className="px-8 py-6 text-center font-black text-slate-800">{c.referrals.length}</td>
                              <td className="px-8 py-6 text-center">
                                 <p className="text-xl font-black" style={{ color: config.accentColor }}>{c.totalPoints.toLocaleString()} <span className="text-[10px]">pts</span></p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button onClick={() => handleOpenCustomerModal(c)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteCustomer(c.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
              <form onSubmit={handleSaveSettings} className="space-y-10">
                <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-4 bg-blue-50 text-slate-900 rounded-2xl"><ImageIcon size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none">Identidad de Marca</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">Logo y apariencia visual</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <div className="relative group">
                      <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-500">
                        <img src={logoPreview} className="w-full h-full object-contain p-2" alt="App Logo" />
                      </div>
                      <label className="absolute -bottom-4 -right-4 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-all" style={{ backgroundColor: config.accentColor }}>
                        <Edit size={20} />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-slate-800 text-lg mb-2 tracking-tight">Logo de la Óptica</h4>
                      <p className="text-slate-500 text-sm font-medium mb-6">El logo se guardará en la base de datos local como Base64. Formatos: PNG, JPG.</p>
                      <label className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-black transition-all">
                        Seleccionar Archivo
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Fondo (Login)</label>
                      <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border">
                        <input type="color" value={settingsForm.primaryColor} onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})} className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent" />
                        <input type="text" value={settingsForm.primaryColor} onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})} className="flex-1 bg-transparent font-mono font-bold text-slate-600 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Acento (Botones)</label>
                      <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border">
                        <input type="color" value={settingsForm.accentColor} onChange={e => setSettingsForm({...settingsForm, accentColor: e.target.value})} className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent" />
                        <input type="text" value={settingsForm.accentColor} onChange={e => setSettingsForm({...settingsForm, accentColor: e.target.value})} className="flex-1 bg-transparent font-mono font-bold text-slate-600 outline-none" />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Info size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none">Reglas del Sistema</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">Textos para clientes</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guía del Sistema</label>
                      <textarea rows={4} value={settingsForm.systemGuide} onChange={e => setSettingsForm({...settingsForm, systemGuide: e.target.value})} className="w-full p-6 bg-slate-50 border rounded-3xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condiciones de Canje</label>
                      <textarea rows={4} value={settingsForm.redeemConditions} onChange={e => setSettingsForm({...settingsForm, redeemConditions: e.target.value})} className="w-full p-6 bg-slate-50 border rounded-3xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none" />
                    </div>
                  </div>
                </section>

                <div className="pb-20">
                  <button type="submit" disabled={isSavingSettings} className="w-full text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4" style={{ backgroundColor: config.accentColor }}>
                    {isSavingSettings ? <RefreshCw className="animate-spin" size={28} /> : (isSavingSettings ? <CheckCircle size={28} /> : <><Save size={28} /> GUARDAR EN BASE DE DATOS</>)}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALES --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-4xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tight">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-1">Inventario Persistente</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen del Producto</label>
                  <div className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => setImagePreview(null)} className="p-4 bg-red-500 text-white rounded-2xl shadow-xl"><Trash2 size={24} /></button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-4">
                        <div className="p-6 bg-white rounded-3xl shadow-lg text-slate-300 group-hover:text-orange-500 transition-all"><ImageIcon size={48} /></div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input type="text" required placeholder="Ej: Ray-Ban Aviator" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2" style={{ focusRingColor: config.accentColor }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                    <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none">
                      <option value="Sol">Sol</option>
                      <option value="Receta">Receta</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Puntos</label>
                    <input type="number" required placeholder="0" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                  <input type="number" required placeholder="0" value={productFormData.stock} onChange={e => setProductFormData({...productFormData, stock: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea required rows={3} placeholder="Detalles..." value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none resize-none" />
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full text-white py-6 rounded-3xl font-black text-xl shadow-2xl transition-all" style={{ backgroundColor: config.accentColor }}>
                  {editingProduct ? 'ACTUALIZAR EN DB' : 'GUARDAR EN DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
              <h3 className="text-3xl font-black">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setShowCustomerModal(false)}><X size={32} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-10 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <input type="text" required placeholder="Nombre" value={customerFormData.name} onChange={e => setCustomerFormData({...customerFormData, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" required placeholder="Email" value={customerFormData.email} onChange={e => setCustomerFormData({...customerFormData, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type={showCustomerPassword ? "text" : "password"} 
                      required 
                      placeholder="Clave" 
                      value={customerFormData.password} 
                      onChange={e => setCustomerFormData({...customerFormData, password: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl font-mono font-bold text-orange-600 outline-none pr-12" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCustomerPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <button type="button" onClick={generatePassword} className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><RefreshCw size={24} /></button>
                </div>
              </div>
              <button type="submit" className="w-full text-white py-6 rounded-3xl font-black text-xl shadow-xl transition-all" style={{ backgroundColor: config.accentColor }}>
                GUARDAR CAMBIOS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 px-8 py-6 rounded-[2.25rem] transition-all ${active ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
    {icon}<span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, trend, trendUp, onClick }: { icon: React.ReactNode, label: string, value: string, trend: string, trendUp: boolean, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white p-8 rounded-[3rem] border flex flex-col justify-between group transition-all ${onClick ? 'cursor-pointer hover:shadow-xl' : 'hover:shadow-lg'}`}>
    <div className="flex justify-between items-start mb-8">
      <div className={`p-4 rounded-2xl transition-colors ${onClick ? 'bg-orange-50 text-orange-600' : 'bg-slate-50'}`}>{icon}</div>
      <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{trend}</div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  </div>
);

export default AdminDashboard;
