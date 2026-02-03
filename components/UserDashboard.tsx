
import React, { useState, useMemo } from 'react';
import { 
  Home, 
  History, 
  Share2, 
  Gift, 
  HelpCircle, 
  Copy, 
  CheckCircle2,
  Calendar,
  ArrowRight,
  User as UserIcon,
  Bell,
  Star,
  Info,
  X,
  CreditCard,
  ChevronRight,
  Clock,
  ShoppingBag,
  ArrowUpRight,
  AlertCircle,
  ArrowLeft,
  Trophy,
  BookOpen,
  Users
} from 'lucide-react';
import { AppConfig, User, Product, PointEntry } from '../types';

interface UserDashboardProps {
  config: AppConfig;
  user: User;
  products: Product[];
  allUsers: User[];
  setCustomers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ config, user, products, allUsers, setCustomers }) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'history' | 'rewards' | 'product_detail' | 'info_view' | 'my_referrals'>('home');
  const [infoType, setInfoType] = useState<'system' | 'conditions'>('system');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redemptionStep, setRedemptionStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Usar los puntos del objeto 'user' que viene de App.tsx (sincronizado con DB)
  const expiringSoon = useMemo(() => {
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + 60);

    return user.pointsDetail
      .filter(p => p.status === 'active')
      .filter(p => {
        if (!p.expiryDate) return false;
        const expiry = new Date(p.expiryDate);
        return expiry <= limitDate;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [user.pointsDetail]);

  const totalExpiring = expiringSoon.reduce((sum, p) => sum + p.amount, 0);

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `¡Hola! Te comparto mi código de Ocelo Vision: ${user.referralCode}. Usalo en tu primera compra para obtener beneficios exclusivos. 👓✨`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const processRedemption = () => {
    let cost = selectedProduct ? selectedProduct.price : user.totalPoints;
    let desc = selectedProduct ? `Canje: ${selectedProduct.name}` : 'Canje de saldo total por cupón';

    if (user.totalPoints < cost) {
      setRedeemError(`Faltan ${(cost - user.totalPoints).toLocaleString()} pts.`);
      return;
    }

    setTimeout(() => {
      const newTransaction: PointEntry = {
        id: `red_${Date.now()}`,
        amount: -cost,
        type: 'redemption',
        date: new Date().toISOString().split('T')[0],
        expiryDate: '',
        status: 'used',
        description: desc
      };

      // ACTUALIZAR ESTADO GLOBAL (DATABASE)
      setCustomers(prev => prev.map(c => 
        c.id === user.id 
          ? { ...c, totalPoints: c.totalPoints - cost, pointsDetail: [newTransaction, ...c.pointsDetail] }
          : c
      ));

      setRedemptionStep('success');
      setRedeemError(null);
    }, 1000);
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full bg-[#F8FAFC] pb-32 relative lg:max-w-6xl lg:px-12 lg:py-12">
        <header className="px-6 pt-6 pb-2 flex justify-between items-center lg:px-0">
          <div onClick={() => setActiveView('home')} className="cursor-pointer group">
            <p className="text-slate-500 text-sm">Hola,</p>
            <h1 className="text-xl font-bold text-slate-900">{user.name.split(' ')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tu Saldo</p>
              <p className="text-sm font-black text-[#001B3D]">{user.totalPoints.toLocaleString()} pts</p>
            </div>
            <button className="p-2.5 bg-white rounded-full text-slate-400 shadow-sm"><Bell size={20} /></button>
            <button className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden"><img src={`https://ui-avatars.com/api/?name=${user.name}&background=001B3D&color=fff`} alt="Profile" className="w-full h-full object-cover" /></button>
          </div>
        </header>

        {activeView === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 mt-6 lg:px-0 lg:grid lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#001B3D] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 opacity-80">
                      <Star size={16} className="text-orange-400 fill-orange-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">Puntos Acumulados</span>
                    </div>
                    <h2 className="text-6xl lg:text-7xl font-black mb-8 tracking-tight">{user.totalPoints.toLocaleString()}</h2>
                    <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-60 leading-none mb-1">Equivalente en Pesos</p>
                        <p className="text-2xl font-black text-orange-400">$ {(user.totalPoints * 1).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 group">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Crecé con Ocelo</h3>
                      <p className="text-slate-500 mt-2 leading-relaxed max-w-sm">Referí amigos y sumá <span className="text-orange-600 font-black">5.000 pts</span> por cada uno que use tu código.</p>
                    </div>
                    <div className="p-5 bg-orange-50 rounded-3xl text-orange-500 shadow-inner group-hover:scale-110 transition-transform"><Trophy size={32} /></div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Tu Código Personal</p>
                      <p className="text-2xl font-black text-slate-800 tracking-[0.1em] font-mono">{user.referralCode}</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <button onClick={shareWhatsApp} className="w-full bg-[#25D366] text-white px-8 py-4 rounded-[1.75rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl">Compartir <Share2 size={22} /></button>
                        <button onClick={() => setActiveView('my_referrals')} className="text-[11px] font-black text-[#001B3D] uppercase tracking-widest flex items-center justify-center gap-2 py-2"><Users size={14} /> Ver mi red</button>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="mt-8 lg:mt-0 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-orange-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-orange-50 rounded-[1.5rem] text-orange-600 shadow-inner"><Calendar size={24} /></div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Vencimientos</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-500 font-bold leading-none">Por vencer</span>
                      <span className="font-black text-orange-600 text-3xl leading-none">{totalExpiring.toLocaleString()} <span className="text-xs">pts</span></span>
                    </div>
                    <button onClick={() => { setSelectedProduct(null); setRedemptionStep('select'); setShowRedeemModal(true); }} className="w-full mt-6 bg-orange-500 text-white py-5 rounded-[2rem] text-lg font-black shadow-2xl flex items-center justify-center gap-3">Canjear Ahora <ArrowRight size={22} /></button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="font-black text-slate-800 text-sm mb-6 px-2 uppercase tracking-widest opacity-40">Ayuda y Soporte</h4>
                  <div className="space-y-2">
                    <button onClick={() => { setInfoType('system'); setActiveView('info_view'); }} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl text-left"><BookOpen size={20} className="text-slate-400" /><span className="text-sm font-bold text-slate-600">Cómo funciona</span></button>
                    <button onClick={() => { setInfoType('conditions'); setActiveView('info_view'); }} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl text-left"><Info size={20} className="text-slate-400" /><span className="text-sm font-bold text-slate-600">Condiciones</span></button>
                  </div>
                </div>
              </aside>
            </div>

            <section className="px-6 mt-16 lg:px-0">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Actividad Reciente</h3>
                <button onClick={() => setActiveView('history')} className="text-[11px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-5 py-2.5 rounded-xl">Ver Todo</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.pointsDetail.length > 0 ? (
                  user.pointsDetail.slice(0, 3).map(entry => <ActivityItem key={entry.id} entry={entry} />)
                ) : (
                  <p className="text-center py-10 text-slate-400 italic col-span-full">No hay actividad registrada en la DB.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ... El resto de las vistas se mantienen, usando 'user' en lugar de 'localUser' ... */}
        {activeView === 'my_referrals' && (
          <div className="px-6 mt-6 lg:px-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setActiveView('home')} className="flex items-center gap-3 text-slate-400 font-black mb-10 hover:text-slate-800 transition-colors group">
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> VOLVER AL INICIO
            </button>
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-10 md:p-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-blue-50 text-blue-600 rounded-[2rem] shadow-inner"><Users size={40} /></div>
                    <div><h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">Mi Red</h2><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Referidos Directos</p></div>
                </div>
                <div className="bg-[#001B3D] text-white px-8 py-5 rounded-[2.5rem] flex items-center gap-4">
                    <Trophy size={20} className="text-orange-400" /><p className="text-xl font-black">{user.referrals.length} Referidos</p>
                </div>
              </div>
              <div className="space-y-4">
                {user.referrals.length > 0 ? user.referrals.map(refId => {
                        const referredUser = allUsers.find(u => u.id === refId);
                        return (
                            <div key={refId} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:border-blue-500 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-[#001B3D] text-white rounded-2xl flex items-center justify-center font-black">{referredUser?.name.charAt(0) || 'U'}</div>
                                    <div><p className="text-lg font-black text-slate-800 leading-none group-hover:text-blue-600 transition-colors">{referredUser?.name || 'Amigo Ocelo'}</p><p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Suscripción Exitosa</p></div>
                                </div>
                                <div className="text-right"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Recompensa</p><p className="text-lg font-black text-green-500">+5.000 pts</p></div>
                            </div>
                        );
                    }) : <div className="py-24 text-center bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">Sin referidos aún. ¡Empieza a invitar!</div>
                }
              </div>
            </div>
          </div>
        )}

        {/* MODAL CANJE MODIFICADO PARA USAR EL ESTADO GLOBAL */}
        {showRedeemModal && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-xl rounded-t-[4rem] sm:rounded-[4rem] shadow-4xl overflow-hidden animate-in slide-in-from-bottom duration-500">
              <div className="p-10 lg:p-12">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{redemptionStep === 'confirm' ? 'Confirmar Canje' : '¿Qué canjeamos hoy?'}</h3>
                  <button onClick={() => { setShowRedeemModal(false); setRedeemError(null); }} className="p-4 bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                </div>

                {redemptionStep === 'select' && (
                  <div className="space-y-8">
                    <div className="bg-[#001B3D] p-8 rounded-[2.5rem] flex items-center justify-between text-white">
                      <div><p className="text-[10px] text-blue-300 font-black uppercase mb-1">Disponible</p><p className="text-3xl font-black">{user.totalPoints.toLocaleString()} pts</p></div>
                      <Star size={32} className="text-orange-400 fill-orange-400" />
                    </div>
                    <div className="space-y-4">
                      <button onClick={() => { setSelectedProduct(null); setRedemptionStep('confirm'); }} className="w-full flex items-center justify-between p-6 bg-white border rounded-[2rem] hover:border-orange-500 group"><div className="flex items-center gap-6"><div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 rounded-xl transition-all"><CreditCard size={28} /></div><div><p className="text-xl font-black">Cupón de Descuento</p><p className="text-sm text-slate-400 uppercase tracking-tight">Efectivo para tu compra</p></div></div><ChevronRight size={20} className="text-slate-300" /></button>
                      <button onClick={() => { setShowRedeemModal(false); setActiveView('rewards'); }} className="w-full flex items-center justify-between p-6 bg-white border rounded-[2rem] hover:border-orange-500 group"><div className="flex items-center gap-6"><div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 rounded-xl transition-all"><Gift size={28} /></div><div><p className="text-xl font-black">Canje de Producto</p><p className="text-sm text-slate-400 uppercase tracking-tight">Ver Catálogo Premium</p></div></div><ChevronRight size={20} className="text-slate-300" /></button>
                    </div>
                  </div>
                )}

                {redemptionStep === 'confirm' && (
                  <div className="text-center py-6 space-y-10">
                    <div className="w-28 h-28 bg-orange-50 text-orange-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner border border-orange-100">{selectedProduct ? <ShoppingBag size={48} /> : <CreditCard size={48} />}</div>
                    <div><h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight px-6">{selectedProduct ? `¿Canjeas ${selectedProduct.name}?` : '¿Generar cupón con todo tu saldo?'}</h4><div className="bg-slate-50 mt-6 mx-8 py-4 px-6 rounded-2xl border border-slate-100"><p className="text-sm text-slate-500 font-bold">Descontaremos <span className="text-[#001B3D] font-black">{selectedProduct ? selectedProduct.price.toLocaleString() : user.totalPoints.toLocaleString()} pts</span></p></div></div>
                    {redeemError && <p className="text-red-500 font-black uppercase text-xs animate-shake">{redeemError}</p>}
                    <div className="flex gap-4"><button onClick={() => { setRedemptionStep('select'); setRedeemError(null); }} className="flex-1 py-6 rounded-[2rem] font-black text-slate-400 bg-slate-100 uppercase tracking-widest text-xs">Cancelar</button><button onClick={processRedemption} className="flex-1 py-6 rounded-[2rem] font-black text-white bg-orange-500 shadow-2xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs">Confirmar</button></div>
                  </div>
                )}

                {redemptionStep === 'success' && (
                  <div className="text-center py-8 space-y-10 animate-in zoom-in duration-500">
                    <CheckCircle2 size={64} className="mx-auto text-green-500 animate-bounce" />
                    <div><h4 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">¡Realizado!</h4><p className="text-slate-500 font-medium px-10">Tu canje ha sido registrado en la base de datos de Ocelo.</p></div>
                    <div className="bg-[#001B3D] p-10 rounded-[3rem] relative group border border-white/10 shadow-3xl shadow-blue-900/40"><p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-4">Código de Canje</p><p className="text-5xl font-black text-orange-400 tracking-[0.2em] font-mono leading-none">DB-{Math.floor(1000 + Math.random() * 9000)}</p><div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl"><Copy size={20} /></div></div>
                    <button onClick={() => { setShowRedeemModal(false); setActiveView('home'); }} className="w-full py-6 rounded-[2.5rem] font-black text-white bg-slate-900 hover:bg-black transition-all shadow-xl">Finalizar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View: Rewards Catalog */}
        {activeView === 'rewards' && (
          <div className="px-6 mt-6 lg:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-[#001B3D] to-[#002b5c] rounded-[3.5rem] p-10 lg:p-16 text-white mb-12 shadow-3xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-orange-500 text-white rounded-[1.5rem] shadow-xl"><ShoppingBag size={28} /></div>
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Catálogo</h2>
                </div>
                <div className="inline-flex flex-col bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
                    <p className="text-[11px] uppercase font-bold opacity-60 tracking-widest mb-2">Puntos Disponibles</p>
                    <p className="text-5xl font-black text-orange-400">{user.totalPoints.toLocaleString()} pts</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map(product => (
                <div key={product.id} onClick={() => { setSelectedProduct(product); setActiveView('product_detail'); }} className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-4xl transition-all duration-700 group cursor-pointer h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-slate-50"><img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /></div>
                  <div className="p-10 flex-1 flex flex-col justify-between">
                    <h4 className="font-black text-slate-800 text-2xl leading-tight mb-5 group-hover:text-orange-600 transition-colors">{product.name}</h4>
                    <div className="flex justify-between items-center pt-8 border-t border-slate-50"><span className="text-3xl font-black text-slate-900 tracking-tighter">{product.price.toLocaleString()} pts</span><div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner"><ArrowUpRight size={24} /></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'info_view' && (
          <div className="px-6 mt-6 lg:px-0 animate-in fade-in slide-in-from-right-4 duration-500">
             <button onClick={() => setActiveView('home')} className="flex items-center gap-3 text-slate-400 font-black mb-10 hover:text-slate-800 transition-colors group">
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> VOLVER
            </button>
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-10 md:p-16">
              <div className="flex items-center gap-6 mb-12"><div className="p-5 bg-orange-50 text-orange-500 rounded-[2rem]">{infoType === 'system' ? <BookOpen size={40} /> : <AlertCircle size={40} />}</div><h2 className="text-4xl font-black text-slate-900 tracking-tighter">{infoType === 'system' ? 'Cómo funciona' : 'Condiciones'}</h2></div>
              <p className="text-slate-500 text-xl leading-relaxed whitespace-pre-wrap font-medium">{infoType === 'system' ? config.systemGuide : config.redeemConditions}</p>
              <div className="mt-16 pt-10 border-t border-slate-100"><button onClick={() => setActiveView('home')} className="w-full bg-[#001B3D] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl">Entendido</button></div>
            </div>
          </div>
        )}

        {activeView === 'product_detail' && selectedProduct && (
          <div className="px-6 mt-6 lg:px-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setActiveView('rewards')} className="flex items-center gap-3 text-slate-400 font-black mb-10 hover:text-slate-800 group"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> CATÁLOGO</button>
            <div className="bg-white rounded-[4rem] shadow-4xl border border-slate-100 overflow-hidden lg:flex min-h-[600px]">
              <div className="lg:w-1/2 relative bg-slate-50"><img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover lg:absolute inset-0" /></div>
              <div className="p-12 lg:w-1/2 flex flex-col justify-between">
                <div><h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-8">{selectedProduct.name}</h2><div className="h-2 w-24 bg-orange-500 rounded-full mb-10" /><p className="text-slate-500 text-xl leading-relaxed mb-12 font-medium">{selectedProduct.description || "Calidad Ocelo Vision para tu salud visual diaria."}</p></div>
                <div className="space-y-8 pt-10 border-t border-slate-100"><div className="grid grid-cols-2 gap-6"><div className="bg-slate-50 p-6 rounded-[2rem] border shadow-inner"><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Costo</p><p className="text-3xl font-black text-slate-900">{selectedProduct.price.toLocaleString()} pts</p></div><div className="bg-blue-50/50 p-6 rounded-[2rem] border shadow-inner"><p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2">Tu Saldo</p><p className="text-3xl font-black text-blue-600">{user.totalPoints.toLocaleString()} pts</p></div></div>
                  {user.totalPoints >= selectedProduct.price ? (
                    <button onClick={() => { setRedemptionStep('confirm'); setShowRedeemModal(true); setRedeemError(null); }} className="w-full bg-orange-500 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-[1.02] active:scale-[0.98] transition-all">Confirmar Canje</button>
                  ) : (
                    <div className="bg-red-50 text-red-600 p-8 rounded-[2.5rem] flex items-center gap-6 border border-red-100"><AlertCircle size={40} /><div><p className="text-lg font-black uppercase tracking-tight leading-none">Saldo Insuficiente</p><p className="text-sm font-medium opacity-80 mt-2">Faltan {(selectedProduct.price - user.totalPoints).toLocaleString()} pts.</p></div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="px-6 mt-6 lg:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-12"><div className="flex items-center gap-5"><div className="p-5 bg-white rounded-[2rem] shadow-sm border text-slate-800"><History size={32} /></div><h2 className="text-3xl font-black text-slate-900 tracking-tight">Tu Historial</h2></div></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.pointsDetail.length > 0 ? user.pointsDetail.map(entry => <ActivityItem key={entry.id} entry={entry} />) : <div className="col-span-full text-center py-24 bg-white rounded-[4rem] border border-slate-100 shadow-inner text-slate-400 font-bold italic">Sin movimientos registrados aún.</div>}
             </div>
          </div>
        )}

        {/* Navigation (Mobile Only) */}
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-around px-8 lg:hidden z-50">
          <button onClick={() => setActiveView('home')} className={`flex flex-col items-center justify-center gap-2 transition-all ${activeView === 'home' || activeView === 'info_view' || activeView === 'my_referrals' ? 'text-orange-500 scale-110' : 'text-slate-300'}`}><Home size={26} /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Inicio</span></button>
          <button onClick={() => setActiveView('rewards')} className={`flex flex-col items-center justify-center gap-2 transition-all ${activeView === 'rewards' || activeView === 'product_detail' ? 'text-orange-500 scale-110' : 'text-slate-300'}`}><ShoppingBag size={26} /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Canjes</span></button>
          <button onClick={() => setActiveView('history')} className={`flex flex-col items-center justify-center gap-2 transition-all ${activeView === 'history' ? 'text-orange-500 scale-110' : 'text-slate-300'}`}><History size={26} /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Historial</span></button>
        </nav>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ entry: PointEntry }> = ({ entry }) => (
  <div className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
    <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 ${entry.type === 'referral' ? 'bg-orange-50 text-orange-500' : entry.type === 'redemption' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
      {entry.type === 'referral' ? <Share2 size={24} /> : entry.type === 'redemption' ? <ShoppingBag size={24} /> : <Gift size={24} />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-lg font-black text-slate-800 truncate leading-none mb-2">{entry.description}</p>
      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{entry.date}</p>
    </div>
    <div className="text-right">
      <p className={`text-2xl font-black ${entry.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{entry.amount > 0 ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()}</p>
      <p className="text-[9px] text-slate-300 uppercase font-black tracking-tight">puntos</p>
    </div>
  </div>
);

export default UserDashboard;
