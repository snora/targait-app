'use client';

import React, { useState, useEffect } from 'react';
import { Search, Send, Download, User, MessageSquare, Target, BarChart, ChevronRight, Menu, X } from 'lucide-react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('targait-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = { type: 'user', content: inputValue, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('https://mykna.app.n8n.cloud/webhook-test/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputValue })
      });
      const data = await response.json();
      
      const botMessage = { 
        type: 'bot', 
        content: data.reponse_formatee || 'Réponse reçue',
        data: data.solutions || [],
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Sauvegarder dans l'historique
      const newHistory = [...history, { question: inputValue, response: botMessage, date: new Date().toISOString() }];
      setHistory(newHistory);
      localStorage.setItem('targait-history', JSON.stringify(newHistory.slice(-50))); // Garder les 50 dernières
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Erreur de connexion. Vérifiez votre connexion internet.',
        timestamp: new Date().toISOString()
      }]);
    }
    
    setInputValue('');
    setIsLoading(false);
  };

  const exportToCSV = () => {
    if (messages.length === 0) return;
    
    const botMessages = messages.filter(m => m.type === 'bot' && m.data && m.data.length > 0);
    if (botMessages.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    
    let csv = 'Entreprise,Solution,Durée Usage,Date Début,Signaux Migration,Score\n';
    
    botMessages.forEach(msg => {
      msg.data.forEach(item => {
        csv += `"${item.entreprise_nom || ''}","${item.nom_solution || ''}","${item.duree_usage_annees || ''}","${item.date_debut_utilisation || ''}","${item.signaux_migration || ''}","${item.score_fiabilite || ''}"\n`;
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `targait-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {setShowPricing(false); setShowLearn(false); setShowAuth(false);}}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full"></div>
                <div className="absolute inset-[2px] bg-gray-900 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-gray-300 transform -rotate-45"></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full -top-0.5 -right-0.5"></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full -bottom-0.5 -left-0.5"></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full -bottom-0.5 -right-0.5"></div>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                TargAIt
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="https://discord.gg/uWyf7wgm" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                Community
              </a>
              <button onClick={() => {setShowPricing(true); setShowLearn(false); setShowAuth(false);}} className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </button>
              <button onClick={() => {setShowLearn(true); setShowPricing(false); setShowAuth(false);}} className="text-gray-300 hover:text-white transition-colors">
                Learn
              </button>
              <button onClick={() => {setShowAuth(true); setShowPricing(false); setShowLearn(false);}} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
                Get Started
              </button>
            </nav>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-2 space-y-1">
              <a href="https://discord.gg/uWyf7wgm" className="block py-2 text-gray-300">Community</a>
              <button onClick={() => {setShowPricing(true); setMobileMenuOpen(false);}} className="block py-2 text-gray-300 w-full text-left">Pricing</button>
              <button onClick={() => {setShowLearn(true); setMobileMenuOpen(false);}} className="block py-2 text-gray-300 w-full text-left">Learn</button>
              <button onClick={() => {setShowAuth(true); setMobileMenuOpen(false);}} className="block py-2 text-blue-400 w-full text-left">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      {!showPricing && !showLearn && !showAuth ? (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                TargAIt
              </span>
              {' '}comme un Pro
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Découvrez vos prospects qualifiés pour aider votre force de vente et marketing
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-gray-700">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Exemple: Entreprises du secteur financier utilisant un CRM depuis 5+ ans"
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg outline-none py-4 px-2"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Rechercher</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Export Button */}
          {messages.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter CSV</span>
              </button>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="bg-gray-800/30 rounded-2xl p-6 space-y-4 mb-8 border border-gray-700/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 ml-auto max-w-[80%] border border-blue-600/30'
                      : 'bg-gray-700/50 mr-auto max-w-[90%] border border-gray-600/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.type === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {msg.type === 'user' ? <User className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">
                        {msg.type === 'user' ? 'Vous' : 'TargAIt'} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-white whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: BarChart, text: "Quels sont les OMS des filiales du groupe LVMH en France" },
              { icon: Target, text: "Quels logiciels RH La Banque Postale utilise-t-elle ?" },
              { icon: MessageSquare, text: "Entreprises utilisant Slack depuis plus de 7 ans" },
              { icon: Search, text: "Sociétés avec CRM depuis 8+ ans cherchant à migrer" }
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInputValue(suggestion.text)}
                className="group p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl text-left transition-all border border-gray-700/50 hover:border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <suggestion.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">{suggestion.text}</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </main>
      ) : null}

      {/* Pricing Page */}
      {showPricing && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-center mb-12">Choisissez votre plan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-4xl font-bold mb-6">0€<span className="text-base text-gray-400">/mois</span></p>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li>✓ 2 recherches/mois</li>
                <li>✓ Résultats basiques</li>
                <li>✓ Support communautaire</li>
              </ul>
              <button className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg transition-colors">Commencer</button>
            </div>
            
            <div className="bg-gradient-to-b from-blue-900/20 to-gray-800/50 rounded-2xl p-8 border border-blue-600/50 transform scale-105">
              <div className="bg-blue-600 text-xs px-3 py-1 rounded-full inline-block mb-4">POPULAIRE</div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-4xl font-bold mb-6">299€<span className="text-base text-gray-400">/mois</span></p>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li>✓ 80 recherches/mois</li>
                <li>✓ Export illimité</li>
                <li>✓ API access</li>
                <li>✓ Support prioritaire</li>
                <li>✓ Newsletter insights</li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-3 rounded-lg transition-all">Essayer gratuitement</button>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <p className="text-4xl font-bold mb-6">Sur mesure</p>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li>✓ Recherches illimitées</li>
                <li>✓ Scrapers dédiés</li>
                <li>✓ Intégration CRM</li>
                <li>✓ Account manager</li>
                <li>✓ SLA garanti</li>
              </ul>
              <button className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg transition-colors">Nous contacter</button>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-6">Pay as you go</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                { searches: 5, price: 50 },
                { searches: 15, price: 125 },
                { searches: 35, price: 175 }
              ].map((pack, i) => (
                <div key={i} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <p className="text-3xl font-bold">{pack.price}€</p>
                  <p className="text-gray-400">{pack.searches} recherches</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learn Page */}
      {showLearn && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold mb-8">Comment ça marche ?</h2>
          <div className="space-y-8">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">1. Intelligence temporelle unique</h3>
              <p className="text-gray-300">TargAIt analyse les cycles d'usage des solutions logicielles pour identifier les entreprises approchant leur période de renouvellement.</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">2. Données enrichies par IA</h3>
              <p className="text-gray-300">Notre IA enrichit les données avec des signaux de migration, dates d'adoption et intentions d'achat détectées.</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4">3. Ciblage précis</h3>
              <p className="text-gray-300">Identifiez exactement quelles entreprises sont prêtes à changer de solution, optimisant vos efforts commerciaux.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Cycles de renouvellement types</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-blue-400">CRM</h4>
                <p className="text-gray-400">8-10 ans</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-orange-400">ERP</h4>
                <p className="text-gray-400">10-15 ans</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-green-400">Communication</h4>
                <p className="text-gray-400">3-5 ans</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Page */}
      {showAuth && (
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center">Commencer avec TargAIt</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email professionnel</label>
                <input type="email" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" placeholder="vous@entreprise.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
                <input type="password" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-3 rounded-lg font-medium transition-all">
                Créer un compte
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-400">Déjà un compte ? <button className="text-blue-400 hover:text-blue-300">Se connecter</button></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}