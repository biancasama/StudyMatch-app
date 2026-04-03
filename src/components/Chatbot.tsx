import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send } from 'lucide-react';

const ALEX_RESPONSES: Record<string, string> = {
  "hey": "Hey!! So glad we matched 🙌 which class are you studying for?",
  "hi": "Hey!! So glad we matched 🙌 which class are you studying for?",
  "hello": "Hey!! So glad we matched 🙌 which class are you studying for?",
  "notes": "omg yes I have notes for everything!! want me to share my gdrive folder?",
  "meet": "YES let's meet!! Student union? I'm free most afternoons!",
  "exam": "ugh exams 😭 we should definitely study together, I make great flashcards!",
  "when": "I'm usually free after 3pm! what about you?",
  "study": "I'm down to study! What are we tackling first?",
  "coffee": "Coffee sounds amazing! ☕️",
  "library": "Library is a bit quiet for me, but I'll go if you need to focus!",
  "help": "I can try to help! What's confusing you?",
  "thanks": "No problem!! Happy to help a study buddy!",
  "bye": "See ya! Good luck with studying!",
  "cool": "Right?! Let's crush this semester!",
  "what": "What's up? Need help with something?"
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const lowerInput = input.toLowerCase();
    let botResponse = "I'm not sure how to respond to that, but I'm excited to study with you!";
    
    for (const [keyword, response] of Object.entries(ALEX_RESPONSES)) {
      if (lowerInput.includes(keyword)) {
        botResponse = response;
        break;
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 flex flex-col"
          >
            <div className="p-3 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm">Study Assistant</h3>
              <button onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded text-sm ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-slate-100'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 border rounded p-2 text-sm"
                placeholder="Ask a question..."
              />
              <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded"><Send size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
