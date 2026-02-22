import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut, BookOpen, UserPlus, X, Info, ExternalLink } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Kitap Kartı Bileşeni (Kapak Görselini Akıllıca Yükler)
const BookCard = ({ book, onClick }) => {
  const [cover, setCover] = useState(null);

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}&maxResults=1`);
        const data = await res.json();
        const img = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (img) setCover(img.replace("http://", "https://"));
      } catch (e) { console.error("Kapak yüklenemedi"); }
    };
    fetchCover();
  }, [book.title, book.author]);

  return (
    <div 
      onClick={() => onClick(book, cover)}
      className="group border-b border-ink/10 pb-10 flex gap-8 items-start hover:border-ink/40 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="w-24 h-36 md:w-28 md:h-40 bg-ink/5 border border-ink/10 flex-shrink-0 shadow-lg relative overflow-hidden flex items-center justify-center">
        {cover ? (
          <img src={cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="text-[10px] text-center p-3 opacity-20 uppercase font-mono leading-none flex flex-col items-center gap-2">
            <BookOpen size={16} /> Görsel Aranıyor...
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between h-36 md:h-40">
        <div>
          <h3 className="text-xl md:text-2xl font-bold uppercase leading-tight mb-1 group-hover:text-stamp transition-colors tracking-tight">{book.title}</h3>
          <p className="text-md md:text-lg italic opacity-60 font-serif leading-tight">{book.author}</p>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-sans opacity-40 uppercase tracking-widest">Raf Konumu</span>
             <div className="bg-ink text-paper text-[10px] px-3 py-1 font-mono font-bold flex items-center gap-2 shadow-md w-fit">
                <MapPin size={10} className="text-stamp" /> {book.shelf}
             </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-stamp border-b-4 border-double border-stamp px-1 tracking-tighter shadow-sm">
            {book.price},00 ₺
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
  const [view, setView] = useState('customer'); // 'customer', 'login'
  const [selectedBook, setSelectedBook] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*').order('title', { ascending: true });
    if (!error) {
      const sanitizedData = data.map(b => ({
        ...b,
        price: b.price || 200,
        shelf: b.shelf || (b.title ? b.title.trim().charAt(0).toUpperCase() + "1A" : "A1A")
      }));
      setBooks(sanitizedData);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data } = await supabase.from('staff').select('*').eq('username', loginForm.username).eq('password', loginForm.password).single();
    if (data) { setUser(data); setView('customer'); } else { alert("Geçersiz Kimlik!"); }
  };

  const addStaff = async () => {
    const user_name = prompt("Personel Kullanıcı Adı:");
    const pass = prompt("Şifre:");
    if(user_name && pass) {
      const { error } = await supabase.from('staff').insert([{ username: user_name, password: pass, role: 'staff' }]);
      if(!error) alert("Personel Yetkilendirildi!");
    }
  };

  const fuse = new Fuse(books, { keys: ["title", "author"], threshold: 0.3 });
  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 20);

  if (loading) return <div className="min-h-screen bg-[#fdf5e6] flex flex-col items-center justify-center font-serif italic gap-4">
    <div className="w-12 h-12 border-4 border-ink border-t-stamp rounded-full animate-spin"></div>
    <p className="text-xl opacity-50">Tozlu Raflar Aralanıyor...</p>
  </div>;

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif selection:bg-stamp/10">
      {/* Header */}
      <nav className="border-b border-ink/10 p-5 flex justify-between items-center sticky top-0 bg-[#fdf5e6]/95 backdrop-blur-md z-40">
        <div onClick={() => {setView('customer'); setSearch("");}} className="cursor-pointer group">
          <h1 className="text-3xl font-bold italic tracking-tighter uppercase group-hover:text-stamp transition-colors">DnGBooks</h1>
          <p className="text-[9px] tracking-[0.4em] uppercase opacity-40 font-sans">Milli Kütüphane Arşivi v3.0</p>
        </div>
        <div className="flex gap-4 items-center">
          {user?.role === 'admin' && (
            <button onClick={addStaff} className="text-[10px] bg-ink text-white px-3 py-1.5 uppercase tracking-widest font-bold hover:bg-stamp transition-all">Personel Ekle</button>
          )}
          {!user ? (
            <button onClick={() => setView('login')} className="text-xs italic opacity-60 hover:opacity-100 flex items-center gap-1 border border-ink/20 px-2 py-1">Giriş</button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[10px] opacity-50 uppercase font-bold">{user.username}</span>
              <button onClick={() => setUser(null)} className="text-stamp text-xs font-bold underline italic">Çıkış</button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'login' ? (
          <div className="max-w-sm mx-auto mt-20 p-10 border border-ink/20 bg-white shadow-2xl relative">
            <h2 className="text-2xl mb-8 font-bold text-center underline italic italic tracking-tighter">Kimlik Doğrulama</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-transparent border-b border-ink p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
              <input type="password" placeholder="Şifre" className="w-full bg-transparent border-b border-ink p-2 outline-none font-mono" onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              <button className="w-full bg-ink text-paper py-4 font-bold text-sm tracking-widest hover:bg-black transition-all">SİSTEME GİR</button>
            </form>
          </div>
        ) : (
          <>
            <div className="relative mb-16 mt-6">
              <input 
                type="text" 
                placeholder="Kitap ismi, yazar veya raf kodu yazınız..." 
                className="w-full bg-transparent border-b-2 border-ink/10 py-8 text-3xl md:text-5xl outline-none focus:border-ink transition-all placeholder:opacity-20 italic font-light tracking-tight"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10" size={48} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
              {results.map(book => (
                <BookCard key={book.id} book={book} onClick={(b, c) => setSelectedBook({...b, cover: c})} />
              ))}
            </div>
            
            {results.length === 0 && (
              <div className="text-center py-40 opacity-30 italic text-3xl font-light">Eser kaydı bulunamadı...</div>
            )}
          </>
        )}
      </main>

      {/* Detay Modalı (Eski Kartotek Görünümü) */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#fffdfa] w-full max-w-2xl border-4 border-double border-ink/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
            <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 z-10 p-1 hover:bg-stamp hover:text-white transition-all"><X size={24} /></button>
            
            <div className="w-full md:w-1/2 bg-ink/5 p-8 flex items-center justify-center">
              {selectedBook.cover ? (
                <img src={selectedBook.cover} className="shadow-2xl max-h-64 md:max-h-80" />
              ) : (
                <div className="opacity-20 flex flex-col items-center gap-4"><BookOpen size={64} /> Görsel Yok</div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-8 font-serif flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold uppercase leading-tight mb-2 text-stamp">{selectedBook.title}</h2>
                <p className="text-xl italic opacity-70 border-b border-ink/10 pb-4 mb-6">{selectedBook.author}</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm italic font-sans opacity-60"><span>Fiyat</span><span>{selectedBook.price},00 ₺</span></div>
                  <div className="flex justify-between text-sm italic font-sans opacity-60"><span>Konum</span><span className="font-bold font-mono text-ink underline">{selectedBook.shelf}</span></div>
                </div>
              </div>
              <div className="mt-12 text-[10px] opacity-30 uppercase tracking-[0.3em] text-center border-t border-ink/5 pt-4">DnGBooks Arşiv Kaydı No: {selectedBook.id}</div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-60 p-20 border-t border-ink/5 text-center bg-white/10 italic opacity-30 text-xs">
        DnGBooks Envanter & Raf Takip Sistemi • Render & Supabase Hibrit Altyapı
      </footer>
    </div>
  );
}
