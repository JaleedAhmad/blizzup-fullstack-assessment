import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BikeCard = ({ bike }) => {
  const formattedPrice = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(bike.price);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img 
          src={bike.thumbnail} 
          alt={bike.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
          {bike.model}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
          {bike.name}
        </h3>
        <p className="text-sm text-slate-500 mb-4">{bike.model}</p>
        
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Starting at</span>
            <span className="text-xl font-bold text-blue-600">{formattedPrice}</span>
          </div>
          
          <Link 
            to={`/bike/${bike._id}`}
            className="p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 group/btn"
          >
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BikeCard;
