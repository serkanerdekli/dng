import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut, BookOpen, UserPlus } from 'lucide-react';

// Supabase Bağlantısı
const supabase = createClient(
  "https://ubvlckmxzkniwhetbicx.supabase.co",
  "sb_publishable_kU78ZAd9Bo8SjhGtRXcrOw_nw9Pof" // Sizin verdiğiniz key
);

export default function DnGBooks() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState('customer');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // 1. Verileri Supabase'den Çek
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase.from('books').select('*').order('title', { ascending: true });
    if (!error) setBooks(data);
  };

  // 2. Google Books'tan Kapak Görseli Getir (Envanter Zenginleştirme)
  const getCover = async (title, author) => {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}`);
      const data = await res.json();
      return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || null;
    } catch (e) { return null; }
  };

  // 3. Giriş Kontrolü (DB tabanlı)
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
      alert("Yetkisiz erişim! Bilgileri kontrol edin.");
    }
  };

  // Arama Motoru
  const fuse = new Fuse(books, { keys: ["title", "author"], threshold: 0.3 });
  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 20);

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif">
      {/* Header */}
      <nav className="border-b border-[#2c1b18]/10 p-4 flex justify-between items-center sticky top-0 bg-[#fdf5e6]/90 backdrop-blur-sm z-50">
        <div>
          <h1 className="text-3xl font-bold italic tracking-tighter">DnGBooks</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] opacity-50 font-sans">Dynamic Inventory System v2.0</p>
        </div>
        <div className="flex gap-4 items-center">
          {user?.role === 'admin' && (
            <button onClick={() => alert("Personel Yönetimi Yakında!")} className="text-xs flex items-center gap-1 border border-ink/20 px-2 py-1">
              <UserPlus size={14} /> Personel Ekle
            </button>
          )}
          {!user ? (
            <button onClick={() => setView('login')} className="text-sm italic hover:underline flex items-center gap-1"><Lock size={14} /> Giriş</button>
          ) : (
            <button onClick={() => setUser(null)} className="text-stamp text-sm flex items-center gap-1 font-bold italic"><LogOut size={14} /> Çıkış ({user.username})</button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'login' ? (
          <div className="max-w-sm mx-auto mt-20 p-8 border border-ink/20 bg-white shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-center underline italic">Güvenli Erişim</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-transparent border-b border-ink p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
              <input type="password" placeholder="Şifre" className="w-full bg-transparent border-b border-ink p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              <button className="w-full bg-[#2c1b18] text-[#fdf5e6] py-3 font-bold hover:bg-black transition-all">MÜHRÜ ONAYLA</button>
              <button type="button" onClick={() => setView('customer')} className="w-full text-xs opacity-40 italic mt-2">Ziyaretçi Olarak Devam Et</button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in duration-1000">
            {/* Arama */}
            <div className="relative mb-12 mt-4">
              <input 
                type="text" placeholder="Kitap, yazar veya raf kodu ara..." 
                className="w-full bg-transparent border-b-2 border-ink/10 py-6 text-4xl outline-none focus:border-ink transition-all placeholder:opacity-20 italic font-light"
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10" size={40} />
            </div>

            {/* Sonuçlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              {results.map(book => (
                <div key={book.id} className="group border-b border-ink/5 pb-8 flex gap-6 items-start">
                  <div className="w-24 h-36 bg-ink/5 border border-ink/10 flex-shrink-0 shadow-inner flex items-center justify-center relative overflow-hidden">
                    <BookOpen size={24} className="opacity-10 absolute" />
                    {/* Kitap kapağı alanı - Gerçek API ile beslenebilir */}
                    <div className="text-[8px] text-center p-2 opacity-20 uppercase font-mono">Görsel Yükleniyor...</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl font-bold uppercase leading-tight mb-1 group-hover:text-stamp transition-colors">{book.title}</h3>
                      <p className="text-sm italic opacity-60 font-sans">{book.author}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-end">
                      <div className="bg-ink text-paper text-[10px] px-2 py-1 font-mono font-bold flex items-center gap-1 shadow-sm">
                        <MapPin size={10} /> {book.shelf}
                      </div>
                      <div className="text-2xl font-bold text-stamp border-b-2 border-stamp px-1">
                        {book.price},00 ₺
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {results.length === 0 && (
              <div className="text-center py-20 opacity-20 italic text-2xl">Arşivde böyle bir kayıt bulunamadı...</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
