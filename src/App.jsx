import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut } from 'lucide-react';
import rawBooks from './inventory.json';

const books = rawBooks.map((book, index) => ({
  ...book,
  id: index,
  price: 200,
  shelf: book["Kitap İsmi"] ? book["Kitap İsmi"].trim().charAt(0).toUpperCase() + "1A" : "A1A"
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
      setUser('admin'); setView('customer');
    } else if (loginForm.username === 'personel01' && loginForm.password === 'test1234') {
      setUser('staff'); setView('customer');
    } else { alert("Giriş Başarısız!"); }
  };

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif p-4 md:p-8">
      <nav className="max-w-5xl mx-auto flex justify-between items-center mb-12 border-b border-[#2c1b18]/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold italic tracking-tighter">DnGBooks</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50">Envanter Takip Sistemi</p>
        </div>
        {!user ? (
          <button onClick={() => setView('login')} className="flex items-center gap-2 text-sm italic hover:underline">
            <Lock size={14} /> Yönetici Girişi
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="bg-[#2c1b18] text-[#fdf5e6] px-2 py-1 text-[10px] uppercase font-bold">{user}</span>
            <button onClick={() => setUser(null)} className="text-[#8b0000] text-sm flex items-center gap-1 hover:underline italic">
              <LogOut size={14} /> Çıkış
            </button>
          </div>
        )}
      </nav>

      {view === 'login' ? (
        <div className="max-w-sm mx-auto mt-20 p-8 border border-[#2c1b18]/20 shadow-2xl bg-[#fffcf5]">
          <h2 className="text-xl font-bold mb-6 text-center underline italic">Yetki Girişi</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-transparent border-b border-[#2c1b18] p-2 outline-none" onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
            <input type="password" placeholder="Şifre" className="w-full bg-transparent border-b border-[#2c1b18] p-2 outline-none" onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            <button className="w-full bg-[#2c1b18] text-[#fdf5e6] py-3 font-bold">GİRİŞ YAP</button>
            <button onClick={() => setView('customer')} className="w-full text-xs opacity-40 mt-4 italic">Vazgeç</button>
          </form>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="relative mb-16">
            <input 
              type="text" placeholder="Kitap veya yazar ismi yazınız..." 
              className="w-full bg-transparent border-b-2 border-[#2c1b18]/20 py-4 text-3xl outline-none focus:border-[#2c1b18] italic transition-all"
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20" size={32} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {results.map(book => (
              <div key={book.id} className="border-b border-[#2c1b18]/10 pb-8 flex justify-between items-end group">
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-1 group-hover:text-[#8b0000] transition-colors">{book["Kitap İsmi"]}</h3>
                  <p className="text-lg italic opacity-60 mb-4">{book["Yazar"]}</p>
                  <span className="bg-[#2c1b18]/5 px-2 py-1 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                    <MapPin size={10} /> KONUM: {book.shelf}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#8b0000] border-2 border-[#8b0000] px-3 py-1 rotate-6 bg-white shadow-sm">
                    {book.price},00 ₺
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
