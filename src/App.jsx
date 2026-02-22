import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut, BookOpen, AlertCircle, X } from 'lucide-react';

// Render Environment üzerinden verileri çekiyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Kitap Kartı Bileşeni (Google API ile Kapak Getirir)
const BookCard = ({ book, onClick }) => {
  const [cover, setCover] = useState(null);

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const query = encodeURIComponent(`${book.title} ${book.author}`);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await res.json();
        const img = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (img) setCover(img.replace("http://", "https://"));
      } catch (e) { /* Hata sessizce geçilir */ }
    };
    fetchCover();
  }, [book.title, book.author]);

  return (
    <div 
      onClick={() => onClick(book, cover)}
      className="group border-b border-[#2c1b18]/10 pb-8 flex gap-6 items-start hover:border-[#2c1b18]/40 transition-all cursor-pointer animate-in fade-in"
    >
      <div className="w-20 h-28 md:w-24 md:h-36 bg-[#2c1b18]/5 border border-[#2c1b18]/10 flex-shrink-0 shadow-sm relative overflow-hidden flex items-center justify-center">
        {cover ? (
          <img src={cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <BookOpen size={24} className="opacity-10" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between h-28 md:h-36">
        <div>
          <h3 className="text-lg md:text-xl font-bold uppercase leading-tight text-[#2c1b18] group-hover:text-[#8b0000] transition-colors">{book.title}</h3>
          <p className="text-sm italic opacity-60 font-serif leading-tight">{book.author}</p>
        </div>
        <div className="flex justify-between items-end">
          <div className="bg-[#2c1b18] text-[#fdf5e6] text-[9px] px-2 py-1 font-mono font-bold flex items-center gap-1 shadow-md uppercase tracking-tighter">
            <MapPin size={10} className="text-[#8b0000]" /> Konum: {book.shelf || "A1A"}
          </div>
          <div className="text-xl md:text-2xl font-bold text-[#8b0000] border-2 border-[#8b0000] px-3 py-0.5 rotate-3 shadow-sm bg-white/40">
            {book.price || 200}₺
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DnGBooks() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState('customer');
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('books').select('*').order('title', { ascending: true });
      if (error) throw error;
      
      const sanitizedData = data.map(b => ({
        ...b,
        price: b.price || 200,
        shelf: b.shelf || (b.title ? b.title.trim().charAt(0).toUpperCase() + "1A" : "A1A")
      }));
      setBooks(sanitizedData);
      setDbError(null);
    } catch (err) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data } = await supabase.from('staff').select('*').eq('username', loginForm.username).eq('password', loginForm.password).single();
    if (data) { setUser(data); setView('customer'); } else { alert("Giriş Başarısız!"); }
  };

  const fuse = new Fuse(books, { keys: ["title", "author"], threshold: 0.3 });
  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 40);

  if (dbError) return (
    <div className="min-h-screen bg-[#fdf5e6] flex items-center justify-center p-10 font-serif">
      <div className="bg-white border-4 border-red-500 p-8 shadow-2xl max-w-md text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Veritabanı Bağlantı Hatası</h2>
        <p className="text-sm opacity-60 mb-6 font-mono bg-gray-100 p-2">{dbError}</p>
        <p className="text-xs italic">Lütfen Render panelindeki Environment Variables (VITE_...) ayarlarını kontrol edin.</p>
        <button onClick={() => window.location.reload()} className="mt-6 underline font-bold">Tekrar Dene</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif">
      {/* Nav */}
      <nav className="border-b border-[#2c1b18]/10 p-5 flex justify-between items-center sticky top-0 bg-[#fdf5e6]/95 backdrop-blur-md z-40">
        <div onClick={() => {setView('customer'); setSearch("");}} className="cursor-pointer">
          <h1 className="text-3xl font-bold italic tracking-tighter uppercase leading-none">DnGBooks</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-sans">Envanter Arşivi</p>
        </div>
        {!user ? (
          <button onClick={() => setView('login')} className="text-xs italic opacity-60 hover:opacity-100 flex items-center gap-1 border border-[#2c1b18]/20 px-2 py-1">Yönetici</button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[10px] opacity-50 uppercase font-bold">{user.username}</span>
            <button onClick={() => setUser(null)} className="text-[#8b0000] text-xs font-bold underline italic">Çıkış</button>
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'login' ? (
          <div className="max-w-sm mx-auto mt-20 p-10 border border-[#2c1b18]/20 bg-white shadow-2xl relative">
            <h2 className="text-2xl mb-8 font-bold text-center underline italic tracking-tighter">Personel Kartı</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-transparent border-b border-[#2c1b18] p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
              <input type="password" placeholder="Şifre" className="w-full bg-transparent border-b border-[#2c1b18] p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              <button className="w-full bg-[#2c1b18] text-[#fdf5e6] py-4 font-bold text-sm tracking-widest hover:bg-black transition-all">GİRİŞ YAP</button>
            </form>
          </div>
        ) : (
          <>
            <div className="relative mb-12 mt-6">
              <input 
                type="text" 
                placeholder="Kitap veya yazar arayınız..." 
                className="w-full bg-transparent border-b-2 border-[#2c1b18]/10 py-6 text-3xl md:text-5xl outline-none focus:border-[#2c1b18] transition-all placeholder:opacity-20 italic font-light tracking-tight"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10" size={32} />
            </div>

            {loading ? (
              <div className="py-20 text-center italic opacity-40 text-2xl animate-pulse">Raflar taranıyor...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                {results.map(book => (
                  <BookCard key={book.id} book={book} onClick={(b, c) => setSelectedBook({...b, cover: c})} />
                ))}
              </div>
            )}
            
            {!loading && results.length === 0 && (
              <div className="text-center py-40 opacity-30 italic text-2xl font-light">Eser kaydı bulunamadı...</div>
            )}
          </>
        )}
      </main>

      {/* Detay Modalı */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1b18]/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#fffdfa] w-full max-w-2xl border-4 border-double border-[#2c1b18]/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
            <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 z-10 p-1 hover:bg-[#8b0000] hover:text-white transition-all"><X size={24} /></button>
            <div className="w-full md:w-1/2 bg-[#2c1b18]/5 p-8 flex items-center justify-center border-r border-[#2c1b18]/10">
              {selectedBook.cover ? (
                <img src={selectedBook.cover} className="shadow-2xl max-h-80" />
              ) : (
                <div className="opacity-20 flex flex-col items-center gap-4"><BookOpen size={64} /> Görsel Yok</div>
              )}
            </div>
            <div className="w-full md:w-1/2 p-10 font-serif flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold uppercase leading-tight mb-2 text-[#8b0000]">{selectedBook.title}</h2>
                <p className="text-xl italic opacity-70 border-b border-[#2c1b18]/10 pb-4 mb-6">{selectedBook.author}</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm italic font-sans opacity-60"><span>Birim Fiyatı</span><span>{selectedBook.price},00 ₺</span></div>
                  <div className="flex justify-between text-sm italic font-sans opacity-60"><span>Dükkan Konumu</span><span className="font-bold font-mono text-[#2c1b18] underline underline-offset-4">{selectedBook.shelf}</span></div>
                </div>
              </div>
              <div className="mt-12 text-[9px] opacity-30 uppercase tracking-[0.3em] text-center border-t border-[#2c1b18]/5 pt-4 italic">DnGBooks Arşiv v3.0</div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-40 p-12 border-t border-[#2c1b18]/5 text-center bg-white/10 italic opacity-30 text-xs">
        © 2026 DnGBooks Dijital Kütüphane • Sahaf Ruhuyla Kodlandı.
      </footer>
    </div>
  );
}
