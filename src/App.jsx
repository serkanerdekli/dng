import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';
import { Search, Lock, MapPin, LogOut, BookOpen, X } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BookCard = ({ book, onClick }) => {
  const [cover, setCover] = useState(null);
  useEffect(() => {
    const fetchCover = async () => {
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}&maxResults=1`);
        const data = await res.json();
        const img = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (img) setCover(img.replace("http://", "https://"));
      } catch (e) {}
    };
    fetchCover();
  }, [book.title, book.author]);

  return (
    <div onClick={() => onClick(book, cover)} className="border-b border-ink/10 pb-8 flex gap-6 items-start hover:border-ink/40 cursor-pointer animate-in fade-in">
      <div className="w-20 h-28 bg-ink/5 border flex-shrink-0 flex items-center justify-center overflow-hidden">
        {cover ? <img src={cover} className="w-full h-full object-cover" /> : <BookOpen size={20} className="opacity-10" />}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold uppercase text-ink">{book.title}</h3>
        <p className="italic opacity-60 mb-4">{book.author}</p>
        <div className="flex justify-between items-center">
          <span className="bg-ink text-paper text-[10px] px-2 py-1 font-mono uppercase tracking-tighter">Konum: {book.shelf}</span>
          <span className="text-xl font-bold text-stamp border-2 border-stamp px-2 rotate-3">{book.price}₺</span>
        </div>
      </div>
    </div>
  );
};

export default function DnGBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      const { data, error } = await supabase.from('books').select('*');
      if (!error) setBooks(data);
      setLoading(false);
    }
    fetchBooks();
  }, []);

  const fuse = new Fuse(books, { keys: ["title", "author"], threshold: 0.3 });
  const results = search ? fuse.search(search).map(r => r.item) : books.slice(0, 40);

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2c1b18] font-serif p-6">
      <header className="max-w-5xl mx-auto mb-12 border-b border-ink/10 pb-4">
        <h1 className="text-4xl font-bold italic tracking-tighter uppercase">DnGBooks</h1>
        <p className="text-xs opacity-40 uppercase tracking-widest font-sans">Envanter Arşivi Canlı</p>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="relative mb-12">
          <input 
            type="text" placeholder="Kitap veya yazar arayınız..." 
            className="w-full bg-transparent border-b-2 border-ink/10 py-6 text-3xl outline-none focus:border-ink italic"
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10" size={32} />
        </div>

        {loading ? (
          <div className="text-center py-20 italic opacity-40 text-xl animate-pulse">Raflar taranıyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {results.map(book => <BookCard key={book.id} book={book} onClick={(b, c) => console.log(b)} />)}
          </div>
        )}
      </main>
    </div>
  );
}
