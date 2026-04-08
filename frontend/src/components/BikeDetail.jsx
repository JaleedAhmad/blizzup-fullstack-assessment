import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Fuel, 
  Settings, 
  Palette, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const BikeDetail = () => {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const response = await axios.get(`/api/bikes/${id}`);
        setBike(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bike details');
      } finally {
        setLoading(false);
      }
    };
    fetchBike();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <Link to="/" className="btn-primary">Back to Inventory</Link>
      </div>
    );
  }

  const specGroups = [
    { label: "Engine Power", value: `${bike.engine_cc} CC`, icon: Zap },
    { label: "Fuel Average", value: `${bike.fuel_avg} KM/L`, icon: Fuel },
    { label: "Model", value: bike.model, icon: Settings },
  ];

  const displayImages = bike.images && bike.images.length > 0 ? bike.images : [bike.thumbnail];

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          {/* Left Column: Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 group">
              <img 
                src={displayImages[activeImage]} 
                alt={bike.name} 
                className="w-full h-full object-cover transition-all duration-500"
              />
              {/* Gallery Controls */}
              {displayImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                    className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImage((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                    className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {displayImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2 uppercase tracking-wide">
                <span>Certified Pre-Owned</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{bike.name}</h1>
              <p className="text-lg text-slate-500 font-medium">{bike.model}</p>
            </div>

            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Starting at</div>
              <div className="text-4xl font-black text-slate-900">
                {new Intl.NumberFormat('en-PK', {
                  style: 'currency',
                  currency: 'PKR',
                  maximumFractionDigits: 0,
                }).format(bike.price)}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {specGroups.map((spec, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col items-center text-center group hover:bg-blue-50 transition-colors">
                  <spec.icon className="w-5 h-5 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">{spec.label}</span>
                  <span className="text-sm font-bold text-slate-800">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Color Swatches */}
            <div className="mb-10">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-500" />
                Color Options
              </h4>
              <div className="flex gap-4">
                {bike.colors.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 shadow-sm p-0.5 group-hover:border-blue-500 transition-all">
                      <div className="w-full h-full rounded-full bg-slate-800" title={color}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-auto pt-6 flex gap-4">
              <button className="flex-1 btn-primary py-4 text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Inquire Now
              </button>
              <button className="px-6 py-4 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 text-slate-600">
                Book Test Ride
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetail;
