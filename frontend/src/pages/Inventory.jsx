import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BikeCard from '../components/BikeCard';
import { Search, SlidersHorizontal, AlertTriangle, Loader2 } from 'lucide-react';

const Inventory = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const response = await axios.get('/api/bikes');
        setBikes(response.data);
      } catch (err) {
        console.error("Error fetching bikes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  const filteredBikes = bikes.filter(bike => 
    bike.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bike.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.1),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Premium <span className="text-blue-500 italic">Bikes</span> Collection
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover the best ride for your lifestyle. From urban commuters to performance machines, our curated collection has it all.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute top-1/2 left-5 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by name or model..." 
              className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Available Inventory
              <span className="text-sm font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{filteredBikes.length} Units</span>
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-600">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-500 font-medium animate-pulse">Loading amazing bikes...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Connection Issues</h3>
              <p className="text-slate-500 max-w-sm mx-auto">{error}</p>
            </div>
          ) : filteredBikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBikes.map((bike) => (
                <BikeCard key={bike._id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <p className="text-lg italic">No bikes found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;
