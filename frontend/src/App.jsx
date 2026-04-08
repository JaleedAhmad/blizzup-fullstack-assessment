import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import Inventory from './pages/Inventory.jsx';
import BikeDetail from './components/BikeDetail.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import AddBikesAI from './pages/AddBikesAI.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inventory />} />
            <Route path="bike/:id" element={<BikeDetail />} />
            <Route path="add-bikes-ai" element={
              <ProtectedRoute>
                <AddBikesAI />
              </ProtectedRoute>
            } />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="compare" element={
              <ProtectedRoute>
                <div className="bg-slate-50 min-h-screen py-10 px-4">
                  <div className="max-w-4xl mx-auto text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Bike <span className="text-blue-600">Expert</span> AI</h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">Compare multiple bikes and find the perfect ride with our data-driven AI assistant.</p>
                  </div>
                  <ChatWindow />
                </div>
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
