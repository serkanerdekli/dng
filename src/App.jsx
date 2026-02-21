import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut, ChevronRight } from 'lucide-react';
import rawBooks from './inventory.json';

const books = rawBooks.map((book, index) => ({
  ...book,
  id: index,
  price: 200,
  shelf: book["Kitap İsmi"] ? book["Kitap İsmi"].charAt(0).toUpperCase() + "1A" : "A1A"
}));

export default function DnGBooks() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [view, setView] = useState('customer');

  const fuse = new Fuse(books, {
    keys: ["Kitap İsmi", "Yazar"],
    threshold: 0.3
  });

  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 30);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'yapk1489') {
      setUser('admin');
      setView('customer');
    } else if (loginForm.username === 'personel01' && loginForm.password === 'test1234') {
      setUser('staff');
      setView('customer');
    } else {
      alert("Geçersiz giriş bilgileri!");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif">
      {/* Üst Bilgi Paneli */}
      <nav className="border-b border-[#2c1b18]/10 p-4 flex justify-between items-center bg-[#fdf5e6]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tighter uppercase italic">DnGBooks</span>
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">Envanter & Raf Takip Sistemi</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!user ? (
            <button onClick={() => setView('login')} className="flex items-center gap-2 text-sm hover:underline italic">
              <Lock size={14} /> Yönetici Girişi
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm bg-[#2c1b18] text-[#fdf5e6] px-2 py-1 uppercase text-[10px] tracking-widest">{user}</span>
              <button onClick={() => setUser(null)} className="text-[#8b0000] text-sm hover:underline flex items-center gap-1 italic">
                <LogOut size={14} /> Güvenli Çıkış
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {view === 'login' ? (
          <div className="max-w-xs mx-auto mt-20 border border-[#2c1b18]/20 p-8 bg-[#fffcf5] shadow-2xl relative">
            <div className="absolute -top-3 -right-3 bg-[#8b0000] text-white p-2 rotate-12 text-[10px] font-bold">GİZLİ</div>
            <h2 className="text-xl mb-6 font-bold text-center underline italic tracking-tight">Giriş Yetkilendirme</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-50">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  className="w-full p-1 bg-transparent border-b border-[#2c1b18] focus:outline-none font-mono"
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-50">Şifre Kodu</label>
                <input 
                  type="password" 
                  className="w-full p-1 bg-transparent border-b border-[#2c1b18] focus:outline-none font-mono"
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
              <button className="w-full bg-[#2c1b18] text-[#fdf5e6] py-3 text-sm font-bold hover:tracking-widest transition-all">SİSTEME ERİŞ</button>
              <button type="button" onClick={() => setView('customer')} className="w-full text-xs opacity-50 hover:opacity-100">Geri Dön</button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {/* Arama Kutusu */}
            <div className="relative mb-16 mt-8">
              <input 
                type="text" 
                placeholder="Aradığınız kitabın ismini veya yazarını yazınız..." 
                className="w-full py-6 bg-transparent border-b-2 border-[#2c1b18]/20 text-3xl focus:border-[#2c1b18] outline-none transition-all placeholder:italic placeholder:text-xl"
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <Search className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20" size={32} />
            </div>

            {/* Kitaplar Listesi */}
            <div className="space-y-12">
              {results.length > 0 ? results.map((book) => (
                <div key={book.id} className="group flex justify-between items-end border-b border-[#2c1b18]/5 pb-8 hover:border-[#2c1b18]/20 transition-all">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold leading-none mb-2 group-hover:translate-x-2 transition-transform duration-300 uppercase tracking-tight">{book["Kitap İsmi"]}</h3>
                    <p className="text-lg italic opacity-70 mb-4">{book["Yazar"]}</p>
                    <div className="inline-flex items-center gap-2 bg-[#2c1b18]/5 px-3 py-1 rounded-sm text-[11px] font-mono font-bold tracking-tighter">
                      <MapPin size={12} className="text-[#8b0000]" /> RAF KONUMU: {book.shelf}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="relative">
                       <div className="text-2xl font-bold text-[#8b0000] border-2 border-[#8b0000] px-4 py-1 rotate-3 shadow-sm bg-white/50">
                        {book.price},00 ₺
                      </div>
                    </div>
                    {user === 'admin' && (
                      <button className="text-[10px] uppercase tracking-tighter opacity-30 hover:opacity-100 underline mt-2">Kaydı Düzenle</button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 opacity-40 italic text-xl">Aradığınız kriterde bir kitap bulunamadı...</div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="mt-40 p-12 border-t border-[#2c1b18]/5 text-center">
        <p className="text-[10px] tracking-[0.4em] opacity-30 uppercase">DnGBooks • Sahaf Ruhlu Dijital Envanter • 2024</p>
      </footer>
    </div>
  );
}
