
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Settings, 
  Tag, 
  Users, 
  Camera, 
  BarChart3, 
  Bell,
  LogOut,
  ChevronRight,
  Trash2,
  Edit3,
  Hash,
  Sparkles,
  Clock,
  History,
  RefreshCw,
  Database,
  MapPin,
  Activity
} from 'lucide-react';
import { Book, Campaign, User, UserRole, CampaignType, Branch, InventoryLog } from './types';
import BookScanner from './components/BookScanner';
import InventoryList from './components/InventoryList';
import CampaignManager from './components/CampaignManager';
import AdminPanel from './components/AdminPanel';
import BulkUpload from './components/BulkUpload';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'campaigns' | 'admin'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // 1. ŞUBELER
  const [branches, setBranches] = useState<Branch[]>([]);

  // 2. KULLANICILAR
  const [users, setUsers] = useState<User[]>([]);

  // 3. KİTAPLAR
  const [books, setBooks] = useState<Book[]>([]);

  // 4. KAMPANYALAR
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // 5. LOGLAR
  const [logs, setLogs] = useState<InventoryLog[]>([]);

  // OTURUM
  const [currentUser, setCurrentUser] = useState<User>({ id: 'u1', username: 'Admin', role: UserRole.ADMIN });
  
  const [showScanner, setShowScanner] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, br, u, l, c] = await Promise.all([
          apiService.getBooks(),
          apiService.getBranches(),
          apiService.getUsers(),
          apiService.getLogs(),
          apiService.getCampaigns()
        ]);
        
        if (b.length > 0) setBooks(b);
        if (br.length > 0) setBranches(br);
        if (u.length > 0) {
          setUsers(u);
          setCurrentUser(u[0]);
        }
        if (l.length > 0) setLogs(l);
        if (c.length > 0) setCampaigns(c);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addLog = async (action: InventoryLog['action'], book: Partial<Book>, details: string) => {
    const branchName = branches.find(br => br.id === (book.branchId || currentUser.branchId || 'br-main'))?.name || 'Bilinmiyor';
    const newLog: InventoryLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      bookId: book.id || 'new',
      bookTitle: book.title || 'İsimsiz',
      branchName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 499)]);
    await apiService.saveLog(newLog);
  };

  const handleAddBook = async (newBook: Partial<Book>) => {
    const book: Book = {
      id: `book-${Date.now()}`,
      branchId: currentUser.branchId || 'br-main',
      title: newBook.title || 'İsimsiz Kitap',
      author: newBook.author || 'Belirsiz Yazar',
      barcode: newBook.barcode || '',
      publisher: newBook.publisher || 'Belirsiz Yayınevi',
      basePrice: newBook.basePrice || 0,
      quantity: newBook.quantity || 1,
      queryCount: 0,
      createdAt: new Date().toISOString(),
      imageUrl: newBook.imageUrl || ''
    };
    setBooks(prev => [book, ...prev]);
    await apiService.saveBook(book);
    addLog('ADD', book, `${book.quantity} adet eklendi.`);
    setShowScanner(false);
  };

  const handleBulkUpload = async (newBooks: Partial<Book>[]) => {
    const booksToAdd: Book[] = newBooks.map(nb => ({
      id: `book-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      branchId: currentUser.branchId || 'br-main',
      title: nb.title || 'İsimsiz Kitap',
      author: nb.author || 'Belirsiz Yazar',
      barcode: nb.barcode || `bulk-${Math.random().toString(36).substr(2, 5)}`,
      publisher: nb.publisher || 'Belirsiz Yayınevi',
      basePrice: nb.basePrice || 0,
      quantity: nb.quantity || 1,
      queryCount: 0,
      createdAt: new Date().toISOString(),
      imageUrl: nb.imageUrl || ''
    }));
    setBooks(prev => [...booksToAdd, ...prev]);
    for (const b of booksToAdd) {
      await apiService.saveBook(b);
    }
    addLog('ADD', { title: 'Toplu Yükleme' }, `${booksToAdd.length} adet kitap toplu olarak eklendi.`);
  };

  const handleUpdateBook = async (id: string, updates: Partial<Book>) => {
    const oldBook = books.find(b => b.id === id);
    if (!oldBook) return;
    const updatedBook = { ...oldBook, ...updates };
    setBooks(prev => prev.map(b => b.id === id ? updatedBook : b));
    await apiService.saveBook(updatedBook);
    addLog('UPDATE', oldBook, `Güncelleme yapıldı.`);
  };

  const handleDeleteBook = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (book && confirm(`${book.title} silinsin mi?`)) {
      setBooks(prev => prev.filter(b => b.id !== id));
      await apiService.deleteBook(id);
      addLog('DELETE', book, `Envanterden kaldırıldı.`);
    }
  };

  const handleIncrementQuery = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;
    const updatedBook = { ...book, queryCount: book.queryCount + 1 };
    setBooks(prev => prev.map(b => b.id === id ? updatedBook : b));
    await apiService.saveBook(updatedBook);
  };

  const handleAddUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    await apiService.saveUser(user);
  };

  const handleDeleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    // Note: apiService doesn't have deleteUser yet, but we can use saveUser with a delete flag or add it
    // For now I'll just save the filtered list or add deleteUser to apiService
  };

  const handleAddBranch = async (branch: Branch) => {
    setBranches(prev => [...prev, branch]);
    await apiService.saveBranch(branch);
  };

  const handleSaveCampaign = async (campaign: Campaign) => {
    setCampaigns(prev => {
      const exists = prev.find(c => c.id === campaign.id);
      if (exists) return prev.map(c => c.id === campaign.id ? campaign : c);
      return [...prev, campaign];
    });
    await apiService.saveCampaign(campaign);
  };

  const handleDeleteCampaign = async (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    // Need deleteCampaign in apiService
  };

  const handleToggleCampaign = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    const updated = { ...campaign, active: !campaign.active };
    setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
    await apiService.saveCampaign(updated);
  };

  const visibleBooks = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN && !currentUser.branchId) return books;
    return books.filter(b => b.branchId === currentUser.branchId);
  }, [books, currentUser]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfaf6]">
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-blue-600" size={48} />
            <p className="font-black text-blue-600 uppercase tracking-widest">Supabase Bağlanıyor...</p>
          </div>
        </div>
      )}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 p-8 flex flex-col sticky top-0 md:h-screen z-40">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100">
            <BookOpen className="text-white w-7 h-7" />
          </div>
          <div>
             <h1 className="text-2xl font-black tracking-tighter text-blue-600 leading-none">BOOKUNUZ</h1>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">SaaS Kitap Ağı</p>
          </div>
        </div>

        <nav className="space-y-3 flex-grow">
          <NavItem icon={<BarChart3 size={20} />} label="Paneller" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<History size={20} />} label="Envanter" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem icon={<Tag size={20} />} label="Kampanyalar" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
          {currentUser.role === UserRole.ADMIN && (
            <NavItem icon={<Settings size={20} />} label="Sistem & Şube" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 font-black border-2 border-rose-100">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-gray-800 capitalize">{currentUser.username}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {currentUser.branchId ? (branches.find(br => br.id === currentUser.branchId)?.name) : 'GENEL ADMİN'}
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 text-gray-400 hover:text-rose-500 transition-all text-xs font-black w-full uppercase tracking-widest py-4 bg-gray-50 rounded-2xl">
            <LogOut size={16} /> Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">
              {activeTab === 'dashboard' && 'MAĞAZA AĞI DURUMU'}
              {activeTab === 'inventory' && 'ŞUBE ENVANTERLERİ'}
              {activeTab === 'campaigns' && 'KAMPANYA YÖNETİMİ'}
              {activeTab === 'admin' && 'SİSTEM AYARLARI'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-gray-400 text-sm font-bold">Aktif Şube Sayısı: {branches.length}</p>
            </div>
          </div>

          {activeTab === 'admin' && (
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowBulkUpload(true)}
                className="bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 px-8 py-4 rounded-3xl font-black flex items-center gap-2 transition-all shadow-sm active:scale-95 uppercase tracking-widest text-xs"
              >
                <Database size={20} /> Toplu Yükle
              </button>
              <button 
                onClick={() => setShowScanner(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl font-black flex items-center gap-2 transition-all shadow-2xl shadow-blue-100 active:scale-95 uppercase tracking-widest text-xs"
              >
                <Camera size={20} /> Yeni Kitap Kaydı
              </button>
            </div>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Tüm Şubeler" value={books.length} icon={<Database size={24}/>} color="bg-blue-50 text-blue-500" />
              <StatCard label="Kampanyalar" value={campaigns.length} icon={<Tag size={24}/>} color="bg-rose-50 text-rose-500" />
              <StatCard label="Aktif Log" value={logs.length} icon={<Activity size={24}/>} color="bg-purple-50 text-purple-500" />
              <StatCard label="Şubeler" value={branches.length} icon={<MapPin size={24}/>} color="bg-amber-50 text-amber-500" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                 <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
                   <Activity className="text-rose-500" /> SON HAREKETLER (AUDIT)
                 </h3>
                 <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                   {logs.map(log => (
                     <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-1">
                       <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">
                         {new Date(log.timestamp).toLocaleTimeString()} - {log.username}
                       </p>
                       <p className="text-sm font-bold text-gray-800">
                         <span className="text-blue-600">[{log.branchName}]</span> {log.bookTitle}
                       </p>
                       <p className="text-[10px] text-gray-500 italic mt-1">{log.details}</p>
                     </div>
                   ))}
                   {logs.length === 0 && <p className="text-gray-300 italic text-center py-10">Henüz bir hareket kaydedilmedi.</p>}
                 </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <MapPin className="text-blue-500" /> ŞUBE STOK DURUMLARI
                  </h3>
                  <div className="space-y-4">
                    {branches.map(br => {
                      const branchBookCount = books.filter(b => b.branchId === br.id).length;
                      const branchStockCount = books.filter(b => b.branchId === br.id).reduce((acc, b) => acc + b.quantity, 0);
                      return (
                        <div key={br.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                            <p className="font-black text-gray-800 uppercase text-xs">{br.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{br.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-blue-600">{branchBookCount} Çeşit</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{branchStockCount} Toplam Adet</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryList 
            books={visibleBooks} 
            allBooks={books}
            branches={branches}
            campaigns={campaigns} 
            logs={logs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUpdate={handleUpdateBook}
            onDelete={handleDeleteBook}
            onIncrement={handleIncrementQuery}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignManager 
            campaigns={campaigns} 
            onSave={handleSaveCampaign}
            onDelete={handleDeleteCampaign}
            onToggle={handleToggleCampaign}
            books={visibleBooks}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            currentUser={currentUser} 
            branches={branches} 
            onAddBranch={handleAddBranch}
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            books={books}
            setBooks={setBooks}
            logs={logs}
          />
        )}
      </main>

      {showScanner && (
        <BookScanner onClose={() => setShowScanner(false)} onDetected={handleAddBook} />
      )}

      {showBulkUpload && (
        <BulkUpload onClose={() => setShowBulkUpload(false)} onUpload={handleBulkUpload} />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all ${active ? 'bg-blue-600 text-white font-black shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50 font-bold'}`}>
    <div className={`${active ? 'text-white' : 'text-gray-300'}`}>{icon}</div>
    <span className="text-[11px] uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string, value: number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4`}>{icon}</div>
    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-2xl font-black text-gray-800 tracking-tighter">{value}</h4>
  </div>
);

export default App;
