import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut, BookOpen, UserPlus, Settings, Save } from 'lucide-react';

// Render Environment Variables üzerinden bağlantı
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function DnGBooks() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState('customer');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(true);

  // 1. Verileri Canlı Çek
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*').order('title', { ascending: true });
    if (!error) {
      // Eğer veritabanında fiyat veya raf boşsa otomatik ata (İlk yükleme için)
      const sanitizedData = data.map(b => ({
        ...b,
        price: b.price || 200,
        shelf: b.shelf || (b.title ? b.title.trim().charAt(0).toUpperCase() + "1A" : "A1A")
      }));
      setBooks(sanitizedData);
    }
    setLoading(false);
  };

  // 2. Dinamik Giriş (Supabase Personel Tablosu)
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('username', loginForm.username)
      .eq('password', loginForm.password)
      .single();

    if (data) {
      setUser(data);
      setView('customer');
    } else {
      alert("Hatalı Giriş!");
    }
  };

  // 3. Admin: Personel Ekleme Fonksiyonu
  const addStaff = async () => {
    const name = prompt("Personel Adı:");
    const user_name = prompt("Kullanıcı Adı:");
    const pass = prompt("Şifre:");
    if(name && user_name && pass) {
      const { error } = await supabase.from('staff').insert([{ full_name: name, username: user_name, password: pass, role: 'staff' }]);
      if(!error) alert("Yeni personel başarıyla eklendi!");
    }
  };

  // Arama Ayarları
  const fuse = new Fuse(books, { keys: ["title", "author"], threshold: 0.3 });
  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 30);

  if (loading) return <div className="min-h-screen bg-[#fdf5e6] flex items-center justify-center font-serif italic text-2xl opacity-50 animate-pulse">Arşiv rafları taranıyor...</div>;

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif">
      {/* Navigasyon */}
      <nav className="border-b border-[#2c1b18]/10 p-5 flex justify-between items-center sticky top-0 bg-[#fdf5e6]/95 backdrop-blur-md z-50 shadow-sm">
        <div onClick={() => setView('customer')} className="cursor-pointer">
          <h1 className="text-3xl font-bold italic tracking-tighter uppercase">DnGBooks</h1>
          <p className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-sans">Envanter Yönetimi</p>
        </div>
        
        <div className="flex items-center gap-6">
          {user?.role === 'admin' && (
            <button onClick={addStaff} className="text-[10px] bg-[#2c1b18] text-white px-3 py-1 uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-black transition-all">
              <UserPlus size={14} /> Personel Tanımla
            </button>
          )}
          {!user ? (
            <button onClick={() => setView('login')} className="flex items-center gap-2 text-sm italic opacity-70 hover:opacity-100"><Lock size={14} /> Sisteme Giriş</button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[10px] border border-ink/20 px-2 py-1 uppercase font-bold">{user.username}</span>
              <button onClick={() => setUser(null)} className="text-[#8b0000] text-sm font-bold italic underline">Çıkış</button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'login' ? (
          <div className="max-w-sm mx-auto mt-20 p-10 border border-ink/20 bg-white shadow-2xl relative">
            <div className="absolute top-0 right-0 p-2 text-[10px] font-mono opacity-20 rotate-90">SECURE LOGIN</div>
            <h2 className="text-2xl mb-8 font-bold text-center underline italic tracking-tighter">Personel Kartı</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-transparent border-b border-ink p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
              <input type="password" placeholder="Şifre" className="w-full bg-transparent border-b border-ink p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              <button className="w-full bg-[#2c1b18] text-[#fdf5e6] py-4 font-bold text-sm tracking-widest hover:tracking-[0.3em] transition-all uppercase">Mührü Bas</button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Arama Alanı */}
            <div className="relative mb-16 mt-6">
              <input 
                type="text" 
                placeholder="Kitap ismi, yazar veya raf kodu yazınız..." 
                className="w-full bg-transparent border-b-2 border-ink/10 py-8 text-4xl outline-none focus:border-ink transition-all placeholder:opacity-20 italic font-light tracking-tight"
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10" size={48} />
            </div>

            {/* Kitaplar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
              {results.map(book => (
                <div key={book.id} className="group border-b border-ink/10 pb-10 flex gap-8 items-start hover:border-ink/30 transition-all">
                  {/* Kitap Kapağı Alanı */}
                  <div className="w-28 h-40 bg-ink/5 border border-ink/10 flex-shrink-0 shadow-lg relative overflow-hidden flex items-center justify-center">
                    <BookOpen size={24} className="opacity-10 absolute" />
                    <div className="text-[10px] text-center p-3 opacity-20 uppercase font-mono leading-none">Görsel Kaydı Bekleniyor</div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-40">
                    <div>
                      <h3 className="text-2xl font-bold uppercase leading-none mb-2 group-hover:text-stamp transition-colors">{book.title}</h3>
                      <p className="text-lg italic opacity-60 font-serif leading-tight">{book.author}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-sans opacity-40 uppercase tracking-widest">Mağaza Konumu</span>
                         <div className="bg-ink text-paper text-xs px-3 py-1 font-mono font-bold flex items-center gap-2 shadow-md w-fit">
                            <MapPin size={12} className="text-stamp" /> {book.shelf}
                         </div>
                      </div>
                      <div className="text-3xl font-bold text-stamp border-b-4 border-double border-stamp px-1 tracking-tighter">
                        {book.price},00 ₺
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {results.length === 0 && (
              <div className="text-center py-40 opacity-30 italic text-3xl font-light">Aradığınız eser arşivde bulunamadı...</div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-60 p-20 border-t border-ink/5 text-center bg-white/30">
        <p className="text-[10px] tracking-[0.5em] opacity-30 uppercase font-bold">DnGBooks • Sahaf Ruhu, Dijital Güç • 2026</p>
      </footer>
    </div>
  );
}
