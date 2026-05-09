import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, Loader2, Play } from 'lucide-react';
import { motion } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Props {
  context: string;
}

export function AIAdvisor({ context }: Props) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const model = 'gemini-3-flash-preview';
      const result = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `You are Namma Mistri AI, a wise and practical construction advisor. 
          The user is currently looking at a construction calculation with this context: ${context}.
          
          Provide practical, professional advice for a rural mason (Mistri) in India.
          Be concise, use simple language, and focus on material saving and safety.
          
          User Question: ${prompt}` }] }
        ],
      });
      setResponse(result.text || 'No response');
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("Sorry, I'm having trouble thinking right now. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
          <Sparkles size={20} className="text-white" />
        </div>
        <h4 className="font-black text-sm uppercase tracking-widest">Mistri AI Advisor</h4>
      </div>

      <div className="space-y-4">
        {response && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-sm border border-white/10"
          >
            {response}
          </motion.div>
        )}

        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI for advice..."
            className="w-full bg-white/20 border border-white/30 p-4 pr-14 rounded-2xl placeholder:text-white/50 text-white outline-none focus:ring-2 focus:ring-white/50 transition-all font-bold"
            onKeyDown={(e) => e.key === 'Enter' && askAI()}
          />
          <button
            onClick={askAI}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-50 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
