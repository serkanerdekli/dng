import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Lock, User, Package, MapPin, LogOut } from 'lucide-react';

// Sabit Veri Örneği (7.000 kitaba otomatik raf ve fiyat atayan motor)
import rawBooks from './inventory.json'; 

const books = rawBooks.map((book, index) => ({
  ...book,
  id: index,
  price: 200,
  shelf: book["Kitap İsmi"].charAt(0).toUpperCase() + "1A" // Sıkı Alfabetik: A1A, B1A...
}));

export default function DnGBooks() {
  const [user, setUser] = useState(null); // 'admin', 'staff', or null
  const [search, setSearch] = useState("");
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [view, setView] = useState('customer'); // 'customer', 'admin_panel'

  // Hızlı Arama Motoru (Fuse.js)
  const fuse = new Fuse(books, {
    keys: ["Kitap İsmi", "Yazar"],
    threshold: 0.3
  });

  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 20);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'yapk1489') {
      setUser('admin');
      setView('admin_panel');
    } else if (loginForm.username === 'personel01' && loginForm.password === 'test1234') {
      setUser('staff');
      setView('customer');
    } else {
      alert("Hatalı giriş!");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-serif selection:bg-sepia/20">
      {/* Üst Bar */}
      <nav className="border-b border-ink/10 p-4 flex justify-between items-center bg-paper/50 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="text-3xl font-bold tracking-tighter">DnGBooks</h1>
        <div className="space-x-4">
          {!user ? (
            <button onClick={() => setView('login')} className="flex items-center gap-2 hover:underline">
              <Lock size={18} /> Yönetici Girişi
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm italic">Hoş geldin, {user}</span>
              <button onClick={() => {setUser(null); setView('customer');}} className="text-stamp hover:underline flex items-center gap-1">
                <LogOut size={16} /> Çıkış
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Ana İçerik */}
      <main className="max-w-5xl mx-auto p-6">
        {view === 'login' ? (
          <div className="max-w-md mx-auto mt-20 border border-ink/20 p-8 shadow-xl bg-[#fffcf5]">
            <h2 className="text-2xl mb-6 font-bold text-center underline italic">Personel Giriş Kartı</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="text" placeholder="Kullanıcı Adı" 
                className="w-full p-2 bg-transparent border-b border-ink focus:outline-none"
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              />
              <input 
                type="password" placeholder="Şifre" 
                className="w-full p-2 bg-transparent border-b border-ink focus:outline-none"
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
              <button className="w-full bg-ink text-paper py-3 font-bold hover:bg-sepia transition-colors">GİRİŞ MÜHRÜNÜ BAS</button>
            </form>
          </div>
        ) : (
          <>
            {/* Arama Alanı */}
            <div className="relative mb-12">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input 
                type="text" 
                placeholder="Kitap ismi veya yazar ara..." 
                className="w-full pl-12 pr-4 py-6 bg-transparent border-2 border-ink/20 rounded-none text-2xl focus:border-ink outline-none transition-all placeholder:italic"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Kitap Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map(book => (
                <div key={book.id} className="group relative border-b border-ink/10 pb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold leading-tight group-hover:text-sepia transition-colors">{book["Kitap İsmi"]}</h3>
                    <p className="italic text-ink/70 mb-2">{book["Yazar"]}</p>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sepia">
                      <MapPin size={14} /> Raf: {book.shelf}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="border-2 border-stamp/40 text-stamp px-3 py-1 font-bold rounded-full rotate-12 shadow-sm text-lg">
                      {book.price} ₺
                    </div>
                    {user === 'admin' && <button className="mt-4 text-[10px] underline text-ink/40">Düzenle</button>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="mt-20 p-8 border-t border-ink/10 text-center opacity-40 text-xs tracking-widest uppercase">
        © 2024 DnGBooks Envanter Sistemi • Render.com Static Deployment
      </footer>
    </div>
  );
}
