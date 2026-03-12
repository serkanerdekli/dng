
import React, { useState } from 'react';
import { Plus, Tag, Trash2, Power, Percent, CircleDollarSign, Edit3, X, Check, Search, Book as BookIcon } from 'lucide-react';
import { Campaign, CampaignType, Book } from '../types';

interface CampaignManagerProps {
  campaigns: Campaign[];
  onSave: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  books: Book[];
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ campaigns, onSave, onDelete, onToggle, books }) => {
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookSearch, setBookSearch] = useState('');

  const handleOpenNew = () => {
    setEditingCampaign({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: CampaignType.PERCENTAGE,
      value: 0,
      active: true,
      bookIds: []
    });
    setShowModal(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign({ ...campaign });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingCampaign || !editingCampaign.name || editingCampaign.value <= 0) {
      alert("Lütfen tüm alanları geçerli şekilde doldurun.");
      return;
    }

    onSave(editingCampaign);
    setShowModal(false);
  };

  const toggleBookInCampaign = (bookId: string) => {
    if (!editingCampaign) return;
    const isIncluded = editingCampaign.bookIds.includes(bookId);
    const newBookIds = isIncluded 
      ? editingCampaign.bookIds.filter(id => id !== bookId)
      : [...editingCampaign.bookIds, bookId];
    
    setEditingCampaign({ ...editingCampaign, bookIds: newBookIds });
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
    b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-700 uppercase tracking-tight">KAMPANYA MERKEZİ</h3>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> Yeni Kampanya
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className={`bg-white border-2 rounded-[2.5rem] p-6 shadow-sm transition-all group ${campaign.active ? 'border-emerald-100' : 'border-gray-100 opacity-60'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${campaign.active ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                {campaign.type === CampaignType.PERCENTAGE ? <Percent size={24} /> : <CircleDollarSign size={24} />}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(campaign)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                <button onClick={() => onDelete(campaign.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
            <h4 className="font-black text-gray-800 text-lg mb-1 uppercase tracking-tight">{campaign.name}</h4>
            <p className="text-sm font-bold text-emerald-600 mb-4">
              {campaign.type === CampaignType.PERCENTAGE ? `%${campaign.value} İndirim` : `${campaign.value} TL İndirim`}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{campaign.bookIds.length} KİTAP DAHİL</span>
              <button 
                onClick={() => onToggle(campaign.id)}
                className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${campaign.active ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {campaign.active ? 'AKTİF' : 'PASİF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && editingCampaign && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-8 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">KAMPANYA DÜZENLE</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Form Side */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Kampanya Başlığı</label>
                  <input 
                    type="text" 
                    value={editingCampaign.name}
                    onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                    placeholder="Örn: Bahar Fırsatı"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">İndirim Türü ve Değeri</label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                      onClick={() => setEditingCampaign({...editingCampaign, type: CampaignType.PERCENTAGE})}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black transition-all ${editingCampaign.type === CampaignType.PERCENTAGE ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                      <Percent size={20} /> Yüzde
                    </button>
                    <button 
                      onClick={() => setEditingCampaign({...editingCampaign, type: CampaignType.FIXED_AMOUNT})}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black transition-all ${editingCampaign.type === CampaignType.FIXED_AMOUNT ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                      <CircleDollarSign size={20} /> Sabit TL
                    </button>
                  </div>
                  <input 
                    type="number" 
                    value={editingCampaign.value}
                    onChange={(e) => setEditingCampaign({...editingCampaign, value: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-2xl text-blue-600 transition-all"
                  />
                </div>

                <div className="pt-6">
                   <button 
                    onClick={handleSave}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"
                   >
                    Kampanyayı Kaydet
                   </button>
                </div>
              </div>

              {/* Book Selection Side */}
              <div className="space-y-4 flex flex-col h-[500px]">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Kapsama Dahil Edilecek Kitaplar</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Kitaplarda ara..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-bold"
                  />
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                  {filteredBooks.map(book => {
                    const isSelected = editingCampaign.bookIds.includes(book.id);
                    return (
                      <div 
                        key={book.id}
                        onClick={() => toggleBookInCampaign(book.id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-50 hover:border-gray-200'}`}
                      >
                        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                          {book.imageUrl ? <img src={book.imageUrl} className="w-full h-full object-cover" /> : <BookIcon className="text-gray-200" size={16} />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-black text-gray-800 truncate">{book.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{book.author}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-200 text-transparent'}`}>
                          <Check size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
