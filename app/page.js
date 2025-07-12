'use client';

import React, { useState } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', content: inputValue }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://mykna.app.n8n.cloud/webhook-test/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputValue })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.reponse_formatee || 'Réponse reçue' }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', content: 'Erreur de connexion' }]);
    }
    
    setInputValue('');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            TargAIt
          </h1>
          <div className="space-x-4">
            <a href="https://discord.gg/uWyf7wgm" className="text-gray-300 hover:text-white">Community</a>
            <button className="text-gray-300 hover:text-white">Pricing</button>
            <button className="bg-blue-500 px-4 py-2 rounded text-white">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">TargAIt</span>
          {' '}comme un Pro
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Découvrez vos prospects qualifiés pour aider votre force de vente et marketing
        </p>

        {/* Search */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Exemple: Entreprises du secteur financier qui utilisent un CRM depuis 5+ ans"
              className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              {isLoading ? '...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 text-left space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded ${msg.type === 'user' ? 'bg-blue-600 ml-8' : 'bg-gray-700 mr-8'}`}>
                {msg.content}
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {[
            "Quels sont les OMS des filiales du groupe LVMH en France",
            "Quels logiciels RH La Banque Postale utilise-t-elle ?",
            "Entreprises utilisant Slack depuis plus de 7 ans",
            "Sociétés avec CRM depuis 8+ ans"
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setInputValue(suggestion)}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left text-gray-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}