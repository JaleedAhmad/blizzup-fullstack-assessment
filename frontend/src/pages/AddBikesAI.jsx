import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AddBikesAI = () => {
  const [names, setNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddBikes = async () => {
    if (!names.trim()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    const bikeNames = names.split(',').map(n => n.trim()).filter(n => n !== '');

    try {
      await axios.post('/api/bikes/ai-add', { names: bikeNames });
      setSuccess(true);
      setNames('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add bikes via AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-200" />
            <h1 className="text-3xl font-bold tracking-tight">AI Inventory Booster</h1>
          </div>
          <p className="text-blue-100 text-lg opacity-90">
            Just type the names of the bikes you want to add. Our AI Agent will research the specs and populate your database instantly.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Bike Names (Comma Separated)
            </label>
            <textarea
              className="w-full h-40 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-0 transition-all text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              placeholder="e.g. BMW R1250GS, Kawasaki Ninja H2, Suzuki Hayabusa..."
              value={names}
              onChange={(e) => setNames(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Bikes added successfully! Redirecting to inventory...</p>
            </div>
          )}

          <button
            onClick={handleAddBikes}
            disabled={loading || !names.trim()}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all transform active:scale-95 ${
              loading 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                AI is researching specs...
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                Boost Inventory Now
              </>
            )}
          </button>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Sample Input</h3>
            <div className="flex flex-wrap gap-2">
              {['Ducati Panigale', 'Triumph Rocket 3', 'Harley Fat Boy'].map(sample => (
                <button
                  key={sample}
                  onClick={() => setNames(prev => prev ? `${prev}, ${sample}` : sample)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm rounded-lg transition-colors"
                >
                  + {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBikesAI;
