import React, { useState, useRef, useEffect } from 'react';
import { Send, Target, Download, BookmarkPlus, History, Trash2, Search, Users, Building, Clock, TrendingUp, Menu, X, Star, Check, ArrowRight } from 'lucide-react';

const TargAItApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [currentResults, setCurrentResults] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPayAsYouGoModal, setShowPayAsYouGoModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggestions réalistes basées sur les vraies données
  const suggestions = [
    "Quels sont les OMS des filiales du groupe LVMH en France",
    "Quels logiciels RH La Banque Postale utilise-t-elle ?",
    "Entreprises utilisant Slack depuis plus de 7 ans",
    "Sociétés avec CRM depuis 8+ ans"
  ];

  // Navigation
  const navItems = [
    { name: 'Community', href: 'https://discord.gg/uWyf7wgm', external: true },
    { name: 'Pricing', page: 'pricing' },
    { name: 'Learn', page: 'learn' }
  ];

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('targait-history');
    if (saved) {
      setConversationHistory(JSON.parse(saved));
    }
    const savedSearchesList = localStorage.getItem('targait-saved');
    if (savedSearchesList) {
      setSavedSearches(JSON.parse(savedSearchesList));
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save to localStorage
  const saveToHistory = (question, response) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      question,
      response,
      results: response.solutions || []
    };
    const updated = [newEntry, ...conversationHistory].slice(0, 50);
    setConversationHistory(updated);
    localStorage.setItem('targait-history', JSON.stringify(updated));
  };

  const saveSearch = (question, results) => {
    const newSaved = {
      id: Date.now(),
      question,
      results,
      timestamp: new Date().toISOString()
    };
    const updated = [newSaved, ...savedSearches].slice(0, 20);
    setSavedSearches(updated);
    localStorage.setItem('targait-saved', JSON.stringify(updated));
  };

  const sendMessage = async (question = inputValue) => {
    if (!question.trim() || isLoading) return;

    const userMessage = { type: 'user', content: question, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://mykna.app.n8n.cloud/webhook-test/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question })
      });

      const data = await response.json();
      
      const botMessage = {
        type: 'bot',
        content: data.reponse_formatee || 'Aucune réponse disponible',
        rawData: data,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentResults(data);
      saveToHistory(question, data);

    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: '❌ Erreur de connexion. Veuillez réessayer.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const exportToCSV = (results) => {
    if (!results?.solutions?.length) return;
    
    const headers = ['Entreprise', 'Solution', 'Durée (ans)', 'Depuis', 'Signaux Migration', 'Score'];
    const csvContent = [
      headers.join(','),
      ...results.solutions.map(s => [
        s.entreprise_nom,
        s.nom_solution,
        s.duree_usage_annees,
        s.date_debut_utilisation?.split('-')[0] || '',
        s.signaux_migration || '',
        s.score_fiabilite
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `targait-results-${Date.now()}.csv`;
    a.click();
  };

  const clearHistory = () => {
    setMessages([]);
    setCurrentResults(null);
  };

  // Header Component
  const Header = () => (
    <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#F97316" />
                  </linearGradient>
                </defs>
                {/* Circle background in gradient */}
                <circle cx="20" cy="20" r="19" fill="url(#logoGradient)" opacity="0.9" stroke="url(#logoGradient)" strokeWidth="1"/>
                {/* Triangle shape in dark */}
                <path 
                  d="M20 8 L30 26 L10 26 Z" 
                  fill="#1F2937" 
                  opacity="0.9"
                />
                {/* Target dots in white */}
                <circle cx="20" cy="16" r="1.2" fill="white" opacity="0.9"/>
                <circle cx="17" cy="22" r="1" fill="white" opacity="0.8"/>
                <circle cx="23" cy="22" r="1" fill="white" opacity="0.8"/>
              </svg>
            </div>
            <div>
              <button 
                onClick={() => setCurrentPage('home')}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-orange-300 transition-all"
              >
                TargAIt
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ) : (
                <button
                  key={item.name}
                  onClick={() => setCurrentPage(item.page)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item.name}
                </button>
              )
            ))}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentPage('login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => setCurrentPage('signup')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Get started
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => {
                      setCurrentPage(item.page);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {item.name}
                  </button>
                )
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setCurrentPage('signup')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              TargAIt
            </span>{' '}
            comme un Pro
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Découvrez vos prospects qualifiés pour aider votre force de vente et marketing
          </p>

          {/* Main Input */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0" viewBox="0 0 40 40" fill="none">
                  <defs>
                    <linearGradient id="inputGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                  </defs>
                  <circle cx="20" cy="20" r="19" fill="url(#inputGradient)" opacity="0.9" stroke="url(#inputGradient)" strokeWidth="1"/>
                  <path 
                    d="M20 8 L30 26 L10 26 Z" 
                    fill="#1F2937" 
                    opacity="0.9"
                  />
                  <circle cx="20" cy="16" r="1.2" fill="white" opacity="0.9"/>
                  <circle cx="17" cy="22" r="1" fill="white" opacity="0.8"/>
                  <circle cx="23" cy="22" r="1" fill="white" opacity="0.8"/>
                </svg>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Exemple: Entreprises du secteur financier en France de plus de 500 employés qui utilisent un POS depuis plus de 5 ans"
                  className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded-xl transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  className="p-4 text-left rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {messages.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Résultats de recherche</span>
              </div>
              <div className="flex space-x-2">
                {currentResults && (
                  <>
                    <button
                      onClick={() => saveSearch(messages.filter(m => m.type === 'user').slice(-1)[0]?.content, currentResults)}
                      className="p-2 text-gray-400 hover:text-orange-400 transition-colors"
                      title="Sauvegarder"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportToCSV(currentResults)}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="Exporter CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={clearHistory}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Vider le chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.timestamp}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.rawData?.solutions && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="text-xs text-gray-400">
                          {message.rawData.solutions.length} résultat(s) • 
                          Critères: {message.rawData.criteres_detectes?.duree_minimale || 0}+ ans
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-sm text-gray-400 ml-2">Recherche en cours...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Pricing Page
  const PricingPage = () => (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="pricingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="19" fill="url(#pricingGradient)" opacity="0.9" stroke="url(#pricingGradient)" strokeWidth="1"/>
            <path 
              d="M20 8 L30 26 L10 26 Z" 
              fill="#1F2937" 
              opacity="0.9"
            />
            <circle cx="20" cy="16" r="1.2" fill="white" opacity="0.9"/>
            <circle cx="17" cy="22" r="1" fill="white" opacity="0.8"/>
            <circle cx="23" cy="22" r="1" fill="white" opacity="0.8"/>
          </svg>
          <h1 className="text-5xl font-bold text-white mb-6">Pricing</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Commencez gratuitement. Évoluez selon les besoins de votre équipe commerciale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-bold text-white mb-6">
              €0<span className="text-lg text-gray-400">/mois</span>
            </div>
            <p className="text-gray-400 mb-6">Pour découvrir TargAIt</p>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-8">
              Commencer
            </button>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>2 recherches par mois</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Export CSV basique</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Support communautaire</span>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl p-8 border border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                POPULAIRE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="text-4xl font-bold text-white mb-6">
              €299<span className="text-lg text-gray-300">/mois</span>
            </div>
            <p className="text-gray-300 mb-6">Pour les commerciaux actifs</p>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-8">
              Choisir Pro
            </button>
            <div className="space-y-4">
              <div className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>1 utilisateur inclus</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>20 recherches par semaine</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Newsletter sectorielle hebdo</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Export avancé (CSV, Excel)</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Support prioritaire</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Accès à l'API</span>
              </div>
            </div>
          </div>

          {/* Pay as you go */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-orange-500">
            <h3 className="text-2xl font-bold text-white mb-2">Pay as you go</h3>
            <div className="text-4xl font-bold text-white mb-6">
              Variable
            </div>
            <p className="text-gray-400 mb-6">Tarifs selon complexité</p>
            <button 
              onClick={() => setShowPayAsYouGoModal(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-8"
            >
              Voir tarifs
            </button>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Recherches illimitées</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Tarif selon niveau de scraping</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Prix adapté à la complexité</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Pas d'engagement</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Facturation à l'usage</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Accès à l'API</span>
              </div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-white mb-6">
              Sur mesure
            </div>
            <p className="text-gray-400 mb-6">Pour les grandes équipes</p>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-8">
              Nous contacter
            </button>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Utilisateurs illimités</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Support dédié</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Intégrations CRM custom</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>SLA garanti 99,9%</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Formation & onboarding</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Accès à l'API</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <span>Scrapers dédiés sur mesure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay as You Go Modal */}
        {showPayAsYouGoModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 relative">
              <button
                onClick={() => setShowPayAsYouGoModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Tarification Pay as you go</h3>
                <p className="text-gray-300">Prix dégressif selon le volume de recherches acheté</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-white">Pack Starter</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">€50</div>
                      <div className="text-sm text-gray-400">10€ par recherche</div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">5 recherches incluses</p>
                  <div className="text-sm text-gray-400">
                    • Idéal pour tester le service<br/>
                    • Accès API complet<br/>
                    • Export CSV/Excel<br/>
                    • Support email
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-orange-500">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-white">Pack Business</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-400">€120</div>
                      <div className="text-sm text-gray-400">8€ par recherche</div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">15 recherches incluses</p>
                  <div className="text-sm text-gray-400">
                    • Économie de 20% vs Starter<br/>
                    • Priorité dans la file<br/>
                    • Analyses temporelles avancées<br/>
                    • Support prioritaire
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-purple-500">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-white">Pack Premium</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">€175</div>
                      <div className="text-sm text-gray-400">5€ par recherche</div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">35 recherches incluses</p>
                  <div className="text-sm text-gray-400">
                    • Économie de 50% vs Starter<br/>
                    • Scraping temps réel prioritaire<br/>
                    • Account manager dédié<br/>
                    • SLA 99.9% garanti
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowPayAsYouGoModal(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Commencer maintenant
                </button>
                <p className="text-sm text-gray-400 mt-4">
                  Crédits valables 12 mois • Facturation sécurisée
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Learn Page - Style Lovable docs
  const LearnPage = () => {
    const [activeTab, setActiveTab] = useState('introduction');
    
    const tabs = [
      { id: 'introduction', label: 'Introduction', icon: () => (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="currentColor" opacity="0.9" stroke="currentColor" strokeWidth="0.5"/>
          <path 
            d="M20 8 L30 26 L10 26 Z" 
            fill="#1F2937" 
            opacity="0.9"
          />
          <circle cx="20" cy="16" r="1" fill="white" opacity="0.9"/>
          <circle cx="17.5" cy="22" r="0.8" fill="white" opacity="0.8"/>
          <circle cx="22.5" cy="22" r="0.8" fill="white" opacity="0.8"/>
        </svg>
      )},
      { id: 'getting-started', label: 'Getting Started', icon: Search },
      { id: 'api', label: 'API Reference', icon: Building },
      { id: 'integrations', label: 'Intégrations', icon: Users },
      { id: 'strategies', label: 'Stratégies', icon: TrendingUp },
      { id: 'use-cases', label: 'Cas d\'usage', icon: Star }
    ];

    const content = {
      introduction: {
        title: 'Welcome',
        subtitle: 'Maîtrisez l\'intelligence temporelle B2B avec TargAIt',
        sections: [
          {
            title: 'Qu\'est-ce que TargAIt ?',
            content: 'TargAIt révolutionne la prospection B2B en identifiant les entreprises approchant la fin de leur cycle d\'usage des solutions logicielles. Notre intelligence temporelle vous permet de cibler vos campagnes avec une précision inégalée.'
          },
          {
            title: 'Comment ça fonctionne',
            content: 'Nous analysons en temps réel les signaux d\'adoption, de migration et de renouvellement des entreprises pour vous proposer les prospects les plus qualifiés au moment optimal.'
          },
          {
            title: 'Votre avantage concurrentiel',
            content: 'Anticipez les besoins de vos prospects, optimisez vos budgets marketing et maximisez votre taux de conversion grâce à notre différenciant temporel unique sur le marché.'
          }
        ]
      },
      'getting-started': {
        title: 'Getting Started',
        subtitle: 'Démarrez avec TargAIt en quelques minutes',
        sections: [
          {
            title: 'Première recherche',
            content: 'Utilisez notre interface intuitive pour formuler votre première requête. Soyez spécifique : secteur, taille d\'entreprise, technologie utilisée et durée d\'usage.'
          },
          {
            title: 'Interpréter les résultats',
            content: 'Chaque résultat inclut des métriques temporelles clés : durée d\'usage, date d\'adoption estimée, signaux de migration détectés et score de fiabilité.'
          },
          {
            title: 'Export et actions',
            content: 'Exportez vos listes en CSV/Excel, sauvegardez vos recherches favorites et intégrez les données dans vos workflows commerciaux existants.'
          }
        ]
      },
      api: {
        title: 'API Reference',
        subtitle: 'Intégrez TargAIt dans vos systèmes',
        sections: [
          {
            title: 'Authentication',
            content: 'Authentifiez-vous avec votre clé API TargAIt. Disponible dans votre dashboard Pro/Enterprise. Rate limit : 100 requêtes/heure en Pro, illimité en Enterprise.'
          },
          {
            title: 'Endpoints principaux',
            content: 'POST /api/search - Lancer une recherche\nGET /api/results/{id} - Récupérer les résultats\nGET /api/history - Historique des recherches\nPOST /api/export - Exporter en CSV/Excel'
          },
          {
            title: 'Webhooks',
            content: 'Configurez des webhooks pour recevoir les notifications en temps réel lors de la détection de nouveaux signaux de migration dans vos segments cibles.'
          }
        ]
      },
      integrations: {
        title: 'Intégrations',
        subtitle: 'Connectez TargAIt à votre stack tech',
        sections: [
          {
            title: 'CRM Integration',
            content: 'Synchronisez automatiquement vos prospects TargAIt avec Salesforce, HubSpot, Pipedrive. Enrichissement automatique des fiches prospects avec les données temporelles.'
          },
          {
            title: 'Marketing Automation',
            content: 'Intégrations natives avec Marketo, Pardot, ActiveCampaign. Déclenchez des séquences personnalisées basées sur les signaux de migration détectés.'
          },
          {
            title: 'Business Intelligence',
            content: 'Connecteurs Power BI, Tableau, Looker pour analyser vos performances de prospection et optimiser vos stratégies de ciblage temporel.'
          }
        ]
      },
      strategies: {
        title: 'Stratégies de recherche',
        subtitle: 'Maximisez vos résultats avec ces bonnes pratiques',
        sections: [
          {
            title: 'Ciblage temporel optimal',
            content: 'CRM : 7-8 ans d\'usage = zone chaude. ERP : 10+ ans = migration probable. Communication : 3-4 ans = rotation naturelle. Adaptez vos approches selon ces cycles.'
          },
          {
            title: 'Signaux de migration',
            content: 'Surveillez les mentions "cherche alternative", "problèmes de performance", "budget renouvellement". Ces signaux indiquent une intention d\'achat imminente.'
          },
          {
            title: 'Segmentation avancée',
            content: 'Combinez critères sectoriels + taille + durée d\'usage. Exemple : "Banques françaises 500+ employés, CRM 8+ ans" = segment ultra-qualifié pour solutions financières.'
          }
        ]
      },
      'use-cases': {
        title: 'Cas d\'usage',
        subtitle: 'Exemples concrets d\'utilisation par secteur',
        sections: [
          {
            title: 'Éditeurs de logiciels',
            content: 'Identifiez les entreprises utilisant des solutions concurrentes depuis 5+ ans. Ciblez les moments de renouvellement pour proposer vos alternatives.'
          },
          {
            title: 'Intégrateurs & ESN',
            content: 'Détectez les entreprises avec des ERP obsolètes nécessitant une modernisation. Proposez vos services de migration au moment optimal.'
          },
          {
            title: 'Fournisseurs de services',
            content: 'Trouvez les entreprises en croissance rapide dépassant les limites de leurs outils actuels. Timing parfait pour vos solutions scalables.'
          }
        ]
      }
    };

    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        
        <div className="flex max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-950 border-r border-gray-800 min-h-screen sticky top-16">
            <div className="p-6">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {typeof Icon === 'function' ? <Icon /> : <Icon className="w-4 h-4 flex-shrink-0" />}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-8 py-8">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {content[activeTab].title}
                </h1>
                <p className="text-xl text-gray-300">
                  {content[activeTab].subtitle}
                </p>
              </div>

              <div className="space-y-8">
                {content[activeTab].sections.map((section, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {section.title}
                    </h3>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation between sections */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
                <button
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  disabled={activeTab === tabs[0].id}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Précédent</span>
                </button>
                
                <button
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  disabled={activeTab === tabs[tabs.length - 1].id}
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Login/Signup Pages
  const AuthPage = ({ isLogin }) => (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
              <path 
                d="M20 4 L35 30 L5 30 Z" 
                fill="url(#authGradient)" 
                opacity="0.9"
              />
              <circle cx="20" cy="15" r="1.5" fill="white" opacity="0.9"/>
              <circle cx="16" cy="22" r="1.2" fill="white" opacity="0.8"/>
              <circle cx="24" cy="22" r="1.2" fill="white" opacity="0.8"/>
            </svg>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Connectez-vous à votre compte TargAIt' : 'Rejoignez TargAIt aujourd\'hui'}
            </p>
          </div>

          <button className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium transition-colors mb-6 flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="text-center">
            <button 
              onClick={() => setCurrentPage(isLogin ? 'signup' : 'login')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Page Router
  switch (currentPage) {
    case 'pricing':
      return <PricingPage />;
    case 'learn':
      return <LearnPage />;
    case 'login':
      return <AuthPage isLogin={true} />;
    case 'signup':
      return <AuthPage isLogin={false} />;
    default:
      return <HomePage />;
  }
};

export default TargAItApp;