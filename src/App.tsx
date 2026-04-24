/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, RefreshCcw, Send, Check, Hash, Info, History as HistoryIcon } from 'lucide-react';
import { emojifyText, EmojifyMode } from './services/gemini';

interface HistoryItem {
  id: string;
  original: string;
  result: string;
  mode: EmojifyMode;
  timestamp: number;
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<EmojifyMode>('literal');
  const [isLoading, setIsLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyReaction, setCopyReaction] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const reactions = ['👍', '🎉', '🤔', '🔥', '✨', '✅', '💥', '🙌'];

  const handleConvert = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await emojifyText(input, mode);
      setOutput(result);
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        original: input,
        result: result,
        mode,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (error) {
      console.error(error);
      setOutput("⚠️ Failed to transform. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, isLoading]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopying(true);
    
    // Pick random reaction
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setCopyReaction(randomReaction);
    
    setTimeout(() => {
      setCopying(false);
      setCopyReaction('');
    }, 2000);
  }, [output]);

  const modes: { id: EmojifyMode; label: string; icon: any; color: string }[] = [
    { id: 'literal', label: 'Literal', icon: Sparkles, color: 'neon-blue' },
    { id: 'story', label: 'Story', icon: Send, color: 'neon-green' },
    { id: 'vibes', label: 'Vibes', icon: Hash, color: 'neon-pink' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar Rail (Desktop) / Header (Mobile) */}
      <div className="w-full md:w-20 md:h-screen border-b-2 md:border-b-0 md:border-r-2 border-black flex md:flex-col items-center justify-between p-4 md:p-6 bg-white sticky top-0 z-50">
        <div className="font-display text-2xl md:text-xl tracking-tighter leading-none md:-rotate-90 md:mt-12 whitespace-nowrap">
          EMOJIFY&nbsp;<span className="text-xs font-sans font-bold align-top">V1.0</span>
        </div>
        
        <div className="flex md:flex-col gap-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 brutal-border brutal-shadow-hover rounded-none transition-colors ${showHistory ? 'bg-black text-white' : 'bg-white'}`}
            title="History"
          >
            <HistoryIcon size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <div className="p-6 md:p-12 border-b-2 border-black bg-black text-white">
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tighter">
              Plain Text Is Boring
            </h1>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
          {/* Input Side */}
          <div className="p-6 md:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-black space-y-8 bg-white">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest block">Choose Mode</label>
              <div className="flex flex-wrap gap-3">
                {modes.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 brutal-border font-bold text-sm uppercase tracking-tight
                        transition-all ${mode === m.id ? `${m.color} brutal-shadow` : 'bg-white hover:bg-gray-100'}
                      `}
                    >
                      <Icon size={16} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest block">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-48 md:h-64 p-6 brutal-border brutal-shadow focus:outline-none font-mono text-lg resize-none placeholder:opacity-30"
              />
              
              <button
                onClick={handleConvert}
                disabled={!input.trim() || isLoading}
                className={`
                  w-full py-6 brutal-border brutal-shadow font-display text-3xl uppercase tracking-wider
                  flex items-center justify-center gap-4 transition-all
                  ${isLoading ? 'bg-gray-100 opacity-50' : 'bg-white hover:bg-black hover:text-white brutal-shadow-hover'}
                `}
              >
                {isLoading ? (
                  <RefreshCcw className="animate-spin" size={32} />
                ) : (
                  <>
                    Transform <Sparkles size={32} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Side */}
          <div className="p-6 md:p-10 bg-white flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 z-10">
               <label className="text-xs font-bold uppercase tracking-widest">Output</label>
               {output && (
                 <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 brutal-border brutal-shadow-hover font-bold text-xs uppercase ${copying ? 'bg-black text-white' : 'bg-white'}`}
                 >
                   {copying ? <Check size={14} /> : <Copy size={14} />}
                   {copying ? 'Copied' : 'Copy'}
                 </button>
               )}
            </div>

            <div className="flex-1 brutal-border bg-white brutal-shadow p-8 flex flex-col items-center justify-center min-h-[350px] z-10 transition-colors relative">
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.div
                    key="output"
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: 1, 
                      y: [0, -10, 0] 
                    }}
                    transition={{
                      scale: { duration: 0.3, ease: "easeOut" },
                      y: { 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }
                    }}
                    className="text-center text-4xl md:text-6xl leading-relaxed break-words max-w-full select-none"
                    style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.1))" }}
                  >
                    <div className="flex flex-wrap justify-center gap-2">
                      {/* Split by characters to animate them slightly differently if they are just emojis */}
                      {Array.from(output).map((char, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 0.3,
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      rotate: { repeat: Infinity, duration: 4, ease: "linear" } 
                    }}
                    className="text-center text-6xl"
                  >
                    ✨
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading Particles */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="absolute text-2xl"
                    >
                      {['✨', '⭐', '💫', '🪄'][i % 4]}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Copy Reaction Overlay */}
              <AnimatePresence>
                {copyReaction && (
                  <motion.div
                    initial={{ scale: 0, y: 0, opacity: 0 }}
                    animate={{ scale: 1, y: -40, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute bottom-8 text-4xl pointer-events-none"
                  >
                    {copyReaction}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 z-10">
              <div className="p-4 brutal-border bg-white text-[10px] leading-tight font-bold uppercase">
                <span className="block text-gray-400 mb-1">Status</span>
                {isLoading ? 'Processing...' : output ? 'Ready' : 'Waiting'}
              </div>
              <div className="p-4 brutal-border bg-white text-[10px] leading-tight font-bold uppercase">
                <span className="block text-gray-400 mb-1">System</span>
                Gemini 3.0 Flash
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l-4 border-black z-[100] p-8 brutal-shadow-hover flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl uppercase">History</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 brutal-border hover:bg-red-500 hover:text-white transition-colors">
                <RefreshCcw className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {history.length === 0 ? (
                <p className="font-mono text-sm opacity-40 uppercase italic">No history yet...</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 brutal-border brutal-shadow-hover bg-gray-50 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase opacity-40">
                      <span>{item.mode}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs line-clamp-2">{item.original}</p>
                    <div className="text-xl brutal-border bg-white p-2 mt-1 truncate">
                      {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
