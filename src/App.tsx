/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Calendar, 
  Share2, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Globe, 
  Search, 
  Coffee, 
  Mountain, 
  Utensils, 
  Palette,
  ExternalLink,
  Copy,
  Check,
  Plane,
  Home,
  Phone,
  Wallet,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Navigation,
  Info,
  Clock,
  Menu,
  X,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Spot, Itinerary, DayPlan, FlightInfo, AccommodationInfo, ExpenseItem, WeatherInfo } from './types';
import { JEJU_SPOTS } from './data/spots';
import { getShareUrl, decodeItinerary } from './utils/sharing';

const MOCK_WEATHER: Record<string, WeatherInfo> = {
  '2026-06-19': { temp: 24, condition: 'sunny', description: '晴朗舒適' },
  '2026-06-20': { temp: 26, condition: 'cloudy', description: '多雲時晴' },
  '2026-06-21': { temp: 22, condition: 'rainy', description: '局部陣雨' },
  '2026-06-22': { temp: 25, condition: 'windy', description: '海邊風大' },
  '2026-06-23': { temp: 23, condition: 'sunny', description: '晴朗' },
};

const INITIAL_ITINERARY: Itinerary = {
  id: crypto.randomUUID(),
  title: '濟州島夏季之旅 🏖️',
  startDate: '2026-06-19',
  endDate: '2026-06-23',
  days: [
    { day: 1, date: '2026-06-19', weather: MOCK_WEATHER['2026-06-19'], items: [] },
    { day: 2, date: '2026-06-20', weather: MOCK_WEATHER['2026-06-20'], items: [] },
    { day: 3, date: '2026-06-21', weather: MOCK_WEATHER['2026-06-21'], items: [] },
    { day: 4, date: '2026-06-22', weather: MOCK_WEATHER['2026-06-22'], items: [] },
    { day: 5, date: '2026-06-23', weather: MOCK_WEATHER['2026-06-23'], items: [] },
  ],
  flights: {
    outbound: { airline: '德威航空', flightNo: 'TW688', depTime: '14:30', arrTime: '17:30' },
    inbound: { airline: '德威航空', flightNo: 'TW687', depTime: '12:20', arrTime: '01:25' },
  },
  accommodations: [
    { name: '濟州新羅酒店', address: '西歸浦市中文觀光路72街75', checkIn: '15:00', checkOut: '11:00', reservationNo: 'SH-20260619' }
  ],
  expenses: []
};

export default function App() {
  const [itinerary, setItinerary] = useState<Itinerary>(INITIAL_ITINERARY);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'info' | 'search'>('itinerary');
  const [activeDay, setActiveDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Spot['category'] | 'all'>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Persistence logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get('p');
    if (hash) {
      const decoded = decodeItinerary(hash);
      if (decoded) setItinerary(decoded);
    } else {
      const saved = localStorage.getItem('jeju_itinerary_v2');
      if (saved) try { setItinerary(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jeju_itinerary_v2', JSON.stringify(itinerary));
  }, [itinerary]);

  const addSpotToDay = (spot: Spot, dayNum: number) => {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => 
        d.day === dayNum 
          ? { ...d, items: [...d.items, { ...spot, id: `${spot.id}-${Date.now()}` }] } 
          : d
      )
    }));
    setActiveTab('itinerary');
  };

  const removeSpotFromDay = (spotId: string, dayNum: number) => {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => 
        d.day === dayNum 
          ? { ...d, items: d.items.filter(i => i.id !== spotId) } 
          : d
      )
    }));
  };

  const shareLink = () => {
    const url = getShareUrl(itinerary);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-orange-400" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-orange-400" />;
      case 'windy': return <Wind className="w-5 h-5 text-teal-400" />;
      default: return <Sun className="w-5 h-5 text-orange-400" />;
    }
  };

  const filteredSpots = JEJU_SPOTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || s.category === filter;
    return matchesSearch && matchesFilter;
  });

  const currentDay = itinerary.days.find(d => d.day === activeDay);

  return (
    <div className="flex flex-col h-screen bg-[#FFFBFA] text-[#2D2D2D] selection:bg-orange-100 selection:text-orange-900 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-[#FFFBFA]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.2em] mb-1">Jeju Tangerine Planner 🍊</span>
            <input 
              type="text" 
              value={itinerary.title}
              onChange={(e) => setItinerary(prev => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-serif font-bold bg-transparent border-none focus:ring-0 p-0"
              placeholder="旅行名稱..."
            />
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            <Share2 className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {activeTab === 'itinerary' && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {itinerary.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={`flex flex-col items-center min-w-[64px] py-3 rounded-2xl transition-all border ${
                  activeDay === day.day 
                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-80 mb-1">Day</span>
                <span className="text-lg font-bold">{day.day}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'itinerary' && (
            <motion.div 
              key="itinerary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{currentDay?.date}</h3>
                    <p className="text-xs text-slate-400 font-medium">六月大韓民國</p>
                  </div>
                </div>
                {currentDay?.weather && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                    {getWeatherIcon(currentDay.weather.condition)}
                    <span className="text-xs font-bold">{currentDay.weather.temp}°C</span>
                  </div>
                )}
              </div>

              {/* Day Items */}
              <div className="space-y-4">
                {currentDay?.items.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-200">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">還沒有安排行程</p>
                      <button 
                        onClick={() => setActiveTab('search')}
                        className="mt-2 text-orange-600 text-sm font-bold hover:underline"
                      >
                        去搜尋景點 →
                      </button>
                    </div>
                  </div>
                ) : (
                  currentDay?.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {index + 1}
                          </div>
                          {index !== currentDay.items.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-100 rounded-full my-1" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.category === 'food' ? 'bg-orange-50 text-orange-600' :
                              item.category === 'cafe' ? 'bg-amber-50 text-amber-600' :
                              item.category === 'nature' ? 'bg-teal-50 text-teal-600' :
                              'bg-indigo-50 text-indigo-600'
                            }`}>
                              {item.category}
                            </span>
                            <button 
                              onClick={() => removeSpotFromDay(item.id, activeDay)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <h4 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{item.name}</h4>
                          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.address}
                          </p>
                          
                          {/* AI Guide Labels */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.mustEat && (
                              <span className="px-2 py-1 bg-[#FFF4F2] text-[#FF5A5F] text-[10px] font-bold border border-[#FFE0E0] rounded-lg">
                                必吃：{item.mustEat}
                              </span>
                            )}
                            {item.mustBuy && (
                              <span className="px-2 py-1 bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold border border-[#E0E7FF] rounded-lg">
                                必買：{item.mustBuy}
                              </span>
                            )}
                            {item.reservationCode && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 rounded-lg">
                                預約：{item.reservationCode}
                              </span>
                            )}
                          </div>

                          {/* Reveal Section */}
                          <div className="p-3 bg-slate-50 rounded-2xl mb-4 text-[10px] leading-relaxed">
                            <p className="text-slate-500 italic mb-2">“{item.story}”</p>
                            <p className="text-slate-700 font-medium">💡 攻略：{item.tips}</p>
                          </div>

                          {/* Navigation Button */}
                          <a 
                            href={item.naverMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-[0.98]"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            開始導航 (Naver Map)
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Flights */}
              <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold mb-4">
                  <Plane className="w-5 h-5 text-orange-600" />
                  航班資訊
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Outbound */}
                  <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase text-slate-300">Outbound</span>
                      <span className="text-xs font-bold text-orange-600">{itinerary.flights.outbound.airline} {itinerary.flights.outbound.flightNo}</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <div className="text-center">
                        <p className="text-2xl font-black">{itinerary.flights.outbound.depTime}</p>
                        <p className="text-[10px] font-bold text-slate-400">TPE</p>
                      </div>
                      <div className="flex-1 mx-4 border-b-2 border-dashed border-slate-200 relative">
                        <Plane className="w-4 h-4 text-slate-300 absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black">{itinerary.flights.outbound.arrTime}</p>
                        <p className="text-[10px] font-bold text-slate-400">CJU</p>
                      </div>
                    </div>
                  </div>
                  {/* Inbound */}
                  <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase text-slate-300">Inbound</span>
                      <span className="text-xs font-bold text-orange-600">{itinerary.flights.inbound.airline} {itinerary.flights.inbound.flightNo}</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <div className="text-center">
                        <p className="text-2xl font-black">{itinerary.flights.inbound.depTime}</p>
                        <p className="text-[10px] font-bold text-slate-400">CJU</p>
                      </div>
                      <div className="flex-1 mx-4 border-b-2 border-dashed border-slate-200 relative">
                        <Plane className="w-4 h-4 text-slate-300 absolute left-1/2 -top-2 -translate-x-1/2 -rotate-90" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black">{itinerary.flights.inbound.arrTime}</p>
                        <p className="text-[10px] font-bold text-slate-400">TPE</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Accommodations */}
              <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold mb-4">
                  <Home className="w-5 h-5 text-orange-600" />
                  住宿資訊
                </h3>
                {itinerary.accommodations.map((acc, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold mb-1">{acc.name}</h4>
                    <p className="text-xs text-slate-500 mb-4">{acc.address}</p>
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Check In</p>
                        <p className="font-black text-slate-800">{acc.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Check Out</p>
                        <p className="font-black text-slate-800">{acc.checkOut}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">預約代號</span>
                      <span className="text-sm font-black text-orange-600">{acc.reservationNo}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Budget / Expenses */}
              <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold mb-4">
                  <Wallet className="w-5 h-5 text-orange-600" />
                  記帳 / 預算表
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-end p-4 bg-orange-600 text-white rounded-2xl">
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-80">總支出</p>
                      <p className="text-2xl font-black">₩ {itinerary.expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                    </div>
                    <CreditCard className="w-10 h-10 opacity-20" />
                  </div>
                  {itinerary.expenses.map(expense => (
                    <div key={expense.id} className="flex justify-between items-center p-3 border-b border-slate-50">
                      <div>
                        <p className="text-sm font-bold">{expense.description}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{expense.category}</p>
                      </div>
                      <p className="font-bold text-slate-700">₩ {expense.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                        const desc = prompt('描述 (例如: 午餐)');
                        const amount = prompt('金額 (KRW)');
                        if (desc && amount) {
                            setItinerary(prev => ({
                                ...prev,
                                expenses: [...prev.expenses, { id: crypto.randomUUID(), category: 'General', description: desc, amount: parseInt(amount) || 0 }]
                            }));
                        }
                    }}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    + 新增支出
                  </button>
                </div>
              </section>

              {/* Emergency */}
              <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold mb-4">
                  <Phone className="w-5 h-5 text-red-500" />
                  緊急聯絡
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">119 緊急救援</span>
                    <a href="tel:119" className="p-2 bg-red-50 text-red-600 rounded-lg"><Phone className="w-4 h-4" /></a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">1330 旅遊諮詢 (中/日/英)</span>
                    <a href="tel:1330" className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Phone className="w-4 h-4" /></a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">台北駐韓代表處</span>
                    <a href="tel:+82-2-399-2800" className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Phone className="w-4 h-4" /></a>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6"
            >
              <div className="sticky top-0 z-10 pt-2 bg-[#FDFDFD]">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="找景點、餐廳、咖啡廳..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {(['all', 'nature', 'cafe', 'food', 'culture'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-6 py-2 rounded-2xl text-xs font-bold capitalize whitespace-nowrap border transition-all ${
                        filter === cat 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {cat === 'all' ? '全部' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredSpots.map(spot => (
                  <div key={spot.id} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={spot.imageUrl} 
                        alt={spot.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-slate-800 shadow-lg">
                          {spot.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-2">{spot.name}</h4>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-2">{spot.description}</p>
                      <button 
                        onClick={() => addSpotToDay(spot, activeDay)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" />
                        加入 Day {activeDay}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-3 pb-8 flex items-center justify-between">
        <button 
          onClick={() => setActiveTab('itinerary')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'itinerary' ? 'text-orange-600' : 'text-slate-300'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'itinerary' ? 'bg-orange-50' : ''}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold">行程</span>
        </button>

        <button 
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'search' ? 'text-orange-600' : 'text-slate-300'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'search' ? 'bg-orange-50' : ''}`}>
            <Search className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold">探索</span>
        </button>

        <button 
          onClick={() => setActiveTab('info')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'info' ? 'text-orange-600' : 'text-slate-300'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'info' ? 'bg-orange-50' : ''}`}>
            <Info className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold">資訊</span>
        </button>
      </nav>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-orange-100">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">分享你的旅程</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  發送行程網址給旅伴，他們就能直接存取完整內容。
                </p>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 mb-8">
                  <Globe className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-500 truncate flex-1">{getShareUrl(itinerary).substring(0, 30)}...</span>
                  <button 
                    onClick={shareLink}
                    className={`p-2 rounded-xl transition-all active:scale-90 ${
                      copied ? 'bg-green-500 text-white' : 'bg-white text-orange-600 shadow-sm'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                >
                  好的，知道了
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
