import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, Sparkles, LogOut, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Blizzup<span className="text-blue-500">Bikes</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hidden md:block"
            >
              Inventory
            </Link>
            <Link 
              to="/compare" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hidden md:block border-l border-slate-700/50 pl-4"
            >
              Compare AI
            </Link>
            
            <div className="border-l border-slate-700/50 h-6 mx-2 hidden md:block"></div>

            {!user ? (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-bold transition-all">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-200 hidden md:block">{user.name?.split(' ')[0]}</span>
                </div>
                
                <Link 
                  to="/add-bikes-ai" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 hidden sm:block" />
                  <span className="hidden sm:inline">Add Bikes</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="p-2 ml-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
