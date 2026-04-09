import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, RefreshCcw, Plus, AlertCircle, CheckCircle, ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ChatWindow = () => {
  const { user: authUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your Bike Expert AI Agent. I can help you compare bikes and find the best one for you. How many bikes would you like to compare today? (Choose 2-5)" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState("Step 1: GREETING");
  const [bikesInMemory, setBikesInMemory] = useState([]);
  const [showThinking, setShowThinking] = useState(null); // Track which message's thinking is open

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { 
        message: input,
        history: messages,
        sessionState: sessionState,
        bikesInMemory: bikesInMemory
      });
      const data = response.data;
      
      // Update Agentic State
      if (data.nextState) setSessionState(data.nextState);
      if (data.collectedBikes) setBikesInMemory(data.collectedBikes);

      const botMessage = { 
        role: 'bot', 
        text: data.reply, 
        internal_thought: data.internal_thought,
        isComparisonReady: data.isComparisonReady,
        comparisonData: data.comparisonData,
        unrecognizedBikes: data.unrecognizedBikes
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (apiError) {
      console.error("AI Error:", apiError);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to my brain. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'bot', text: "Hello! I'm your Bike Expert AI Agent. I can help you compare bikes and find the best one for you. How many bikes would you like to compare today? (Choose 2-5)" }]);
    setSessionState("Step 1: GREETING");
    setBikesInMemory([]);
  };

  return (
    <div className="flex flex-col h-[700px] max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mt-10">
      {/* Header */}
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold leading-tight">Bike Expert AI Agent</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">State: {sessionState.split(':')[1]?.trim() || "Ready"}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleReset} 
          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-all"
          title="Reset Conversation"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white shadow-sm border border-slate-200 text-slate-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="space-y-4 w-full">
                {/* Main Message Bubble */}
                <div className={`p-5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none ml-auto' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none mr-auto'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>
                
                {/* Agentic Thinking Accordion */}
                {msg.internal_thought && (
                  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300">
                    <button 
                      onClick={() => setShowThinking(showThinking === idx ? null : idx)}
                      className="w-full px-4 py-2.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <BrainCircuit className="w-4 h-4 text-blue-500" />
                        AI Reasoning & Calculations
                      </div>
                      {showThinking === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showThinking === idx && (
                      <div className="p-4 bg-white text-xs text-slate-600 border-t border-slate-100 leading-relaxed font-mono whitespace-pre-wrap animate-in slide-in-from-top-2 duration-300">
                        {msg.internal_thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Comparison UI */}
                {msg.isComparisonReady && msg.comparisonData && (
                  <div className="mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-700">
                    <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="px-6 py-4 font-bold border-r border-slate-800 min-w-[150px]">Feature</th>
                            {msg.comparisonData.bikes.map((bike, bIdx) => (
                              <th key={bIdx} className="px-6 py-4 font-bold text-center border-r border-slate-800 last:border-0 min-w-[140px]">
                                {bike.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {msg.comparisonData.categoryScores.map((row, i) => (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-100">{row.category}</td>
                              {msg.comparisonData.bikes.map((_, bIdx) => {
                                const score = row.bikeScores[bIdx];
                                const colors = ['bg-blue-600', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
                                const barColor = colors[bIdx % colors.length];
                                return (
                                  <td key={bIdx} className="px-6 py-4 border-r border-slate-100 last:border-0">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                        <span>SCORE</span>
                                        <span className="text-slate-600">{score}/100</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                            <td className="px-6 py-4 text-xs uppercase tracking-wider">Overall Match</td>
                            {msg.comparisonData.bikes.map((bike, bIdx) => {
                               const textColors = ['text-blue-700', 'text-amber-700', 'text-emerald-700', 'text-purple-700', 'text-rose-700'];
                               return (
                                 <td key={bIdx} className={`px-6 py-4 text-center text-lg ${textColors[bIdx % textColors.length]} border-r border-slate-100 last:border-0`}>
                                   {bike.totalScore}
                                 </td>
                               );
                            })}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-3 max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5 text-slate-400" />
              </div>
              <div className="bg-white border border-slate-200 px-5 py-4 rounded-xl rounded-tl-none shadow-sm flex items-center gap-4">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Agent Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-4">
          <input 
            type="text" 
            placeholder={loading ? "Waiting for agent..." : "Type your message..."}
            className="flex-1 px-5 py-3 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium disabled:opacity-50 shadow-inner"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

