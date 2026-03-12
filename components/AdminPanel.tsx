
import React, { useState } from 'react';
import { User, UserRole, Book, Branch, InventoryLog } from '../types';
import { 
  Shield as ShieldIcon, 
  UserPlus as UserPlusIcon, 
  Trash2 as TrashIcon, 
  Database as DbIcon, 
  RefreshCcw as RefreshIcon, 
  AlertTriangle as AlertIcon, 
  MapPin as MapIcon, 
  Plus as PlusIcon 
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  branches: Branch[];
  onAddBranch: (branch: Branch) => void;
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  logs: InventoryLog[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, 
  branches, 
  onAddBranch, 
  users, 
  onAddUser, 
  onDeleteUser, 
  books, 
  setBooks, 
  logs 
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.STAFF);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchLoc, setNewBranchLoc] = useState('');

  const handleAddUser = () => {
    if (!newUsername) return;
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: newUsername,
      role: newRole,
      branchId: selectedBranchId || undefined
    };
    onAddUser(newUser);
    setNewUsername('');
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert("Kendi hesabınızı silemezsiniz.");
      return;
    }
    onDeleteUser(id);
  };

  const handleAddBranch = () => {
    if (!newBranchName) return;
    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      name: newBranchName,
      location: newBranchLoc
    };
    onAddBranch(newBranch);
    setNewBranchName('');
    setNewBranchLoc('');
  };

  // AGRESİF KURTARMA: Tarayıcıdaki tüm anahtarları gez ve kitap benzeri objeleri topla
  const handleManualRecovery = () => {
    let recoveredCount = 0;
    const allRecovered: Book[] = [];

    // Bilinen tüm anahtarları kontrol et
    const potentialKeys = ['books', 'inventory', 'bookunuz_books', 'inventory_v1', 'my_books'];
    
    potentialKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item.title || item.barcode) {
                const book: Book = {
                  ...item,
                  id: item.id || `rec-${Math.random().toString(36).substr(2, 5)}`,
                  branchId: item.branchId || 'br-main'
                };
                // Tekilleştirme kontrolü
                if (!allRecovered.find(b => b.barcode === book.barcode && b.title === book.title)) {
                  allRecovered.push(book);
                  recoveredCount++;
                }
              }
            });
          }
        } catch (e) {}
      }
    });

    if (recoveredCount > 0) {
      setBooks(prev => {
        const combined = [...prev, ...allRecovered];
        // Nihai tekilleştirme
        return Array.from(new Map(combined.map(item => [item.barcode + item.title, item])).values());
      });
      alert(`${recoveredCount} farklı kayıt bulundu ve sisteme entegre edildi.`);
    } else {
      alert("Taranan hiçbir anahtarda kurtarılabilir veri bulunamadı.");
    }
  };

  const handleFullReset = () => {
    if (confirm("DİKKAT! Tüm şubeler, kitaplar, kullanıcılar ve loglar silinecek. Bu işlem geri alınamaz!")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl space-y-12 pb-20">
      {/* Şube Yönetimi */}
      <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <MapIcon size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Şube Yönetimi</h3>
            <p className="text-gray-400 text-sm font-bold">Mağaza ağınızı genişletin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <input type="text" placeholder="Şube Adı..." value={newBranchName} onChange={e => setNewBranchName(e.target.value)} className="px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" />
          <input type="text" placeholder="Konum..." value={newBranchLoc} onChange={e => setNewBranchLoc(e.target.value)} className="px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold" />
          <button onClick={handleAddBranch} className="bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all">
            <PlusIcon size={18} /> Şube Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(br => (
            <div key={br.id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex justify-between items-center transition-all hover:bg-white hover:shadow-md">
              <div>
                <p className="font-black text-gray-800 uppercase tracking-tight">{br.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase">{br.location}</p>
              </div>
              <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">ID: {br.id}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Kullanıcı Atama */}
      <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
            <ShieldIcon size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Yetkili Kullanıcılar</h3>
            <p className="text-gray-400 text-sm font-bold">Personel ataması ve şube yetkilendirme.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <input type="text" placeholder="Kullanıcı adı..." value={newUsername} onChange={e => setNewUsername(e.target.value)} className="px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none font-bold" />
          <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none font-black text-[10px] uppercase">
            <option value={UserRole.STAFF}>Personel</option>
            <option value={UserRole.ADMIN}>Yönetici</option>
          </select>
          <select value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} className="px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none font-black text-[10px] uppercase">
            <option value="">Merkez (Genel)</option>
            {branches.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
          </select>
          <button onClick={handleAddUser} className="bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-50 hover:bg-purple-700 transition-all">
            <UserPlusIcon size={18} /> Kaydet
          </button>
        </div>

        <div className="space-y-4">
          {users.map(u => (
            <div key={u.id} className="p-6 bg-gray-50/50 rounded-3xl flex justify-between items-center border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-purple-600 border border-purple-100">
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-gray-800 uppercase text-sm tracking-tight">{u.username}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {u.role} — {branches.find(b => b.id === u.branchId)?.name || 'GENEL YETKİ'}
                  </p>
                </div>
              </div>
              {u.id !== currentUser.id && (
                <button onClick={() => deleteUser(u.id)} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <TrashIcon size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Veri Araçları */}
      <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <DbIcon size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Gelişmiş Veri Araçları</h3>
            <p className="text-gray-400 text-sm font-bold">Veri kurtarma ve sistem temizleme.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-amber-50/30 rounded-[2.5rem] border-2 border-dashed border-amber-100 flex flex-col justify-between">
            <div className="mb-6">
              <p className="font-black text-amber-800 uppercase text-lg mb-2">Eski Verileri Kurtar</p>
              <p className="text-xs text-amber-700 font-medium leading-relaxed italic">Herhangi bir anahtarda (books, inventory vb.) veri kalıntısı varsa hepsini bulup Merkez Şube'ye taşır.</p>
            </div>
            <button onClick={handleManualRecovery} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-600 transition-all uppercase tracking-widest text-[10px]">
              <RefreshIcon size={18} /> Derin Tarama Başlat
            </button>
          </div>

          <div className="p-8 bg-rose-50/30 rounded-[2.5rem] border-2 border-dashed border-rose-100 flex flex-col justify-between">
            <div className="mb-6">
              <p className="font-black text-rose-800 uppercase text-lg mb-2">Sistemi Sıfırla</p>
              <p className="text-xs text-rose-700 font-medium leading-relaxed italic">Tüm tarayıcı hafızasını siler. Uygulamayı ilk kez açıyormuşsunuz gibi yapar.</p>
            </div>
            <button onClick={handleFullReset} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-600 transition-all uppercase tracking-widest text-[10px]">
              <AlertIcon size={18} /> Her Şeyi Temizle
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
