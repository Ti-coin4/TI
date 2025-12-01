
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Airdrop } from './components/Airdrop';
import { Swap } from './components/Swap';
import { CommunityChat } from './components/CommunityChat';
import { AdminPanel } from './components/AdminPanel';
import { Whitepaper } from './components/Whitepaper';
import { Language, WalletState, PublicMessage, SiteConfig, AirdropEntry } from './types';
import { TRANSLATIONS, TOKEN_CONFIG, ADMIN_CREDENTIALS } from './constants';
import { connectToBSC, getTokenBalance, fetchTokenPrice, isWalletDetected } from './services/web3Service';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState<Language>('zh');
  
  // --- Admin State (Persistent) ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    // Load from local storage or default
    const saved = localStorage.getItem('ti_site_config');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      heroTitlePrefix: TRANSLATIONS['zh'].hero.titlePrefix,
      heroTitleSuffix: TRANSLATIONS['zh'].hero.titleSuffix,
      heroSubtitle: TRANSLATIONS['zh'].hero.subtitle,
      tokenPrice: 0.1250, // Fallback base price
      airdropAmount: 100, // Default airdrop amount
      telegram: TOKEN_CONFIG.telegram,
      twitter: TOKEN_CONFIG.twitter,
      adminUser: ADMIN_CREDENTIALS.username,
      adminPass: ADMIN_CREDENTIALS.password
    };
  });

  // --- Airdrop Data State ---
  const [airdropSubmissions, setAirdropSubmissions] = useState<AirdropEntry[]>(() => {
    const saved = localStorage.getItem('ti_airdrop_data');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAirdropSubmit = (address: string) => {
    // Avoid duplicates
    if (airdropSubmissions.some(e => e.address.toLowerCase() === address.toLowerCase())) {
      alert("Address already submitted");
      return;
    }
    const newEntry: AirdropEntry = {
      id: Date.now().toString(),
      address,
      timestamp: Date.now(),
      status: 'Pending'
    };
    const updated = [newEntry, ...airdropSubmissions];
    setAirdropSubmissions(updated);
    localStorage.setItem('ti_airdrop_data', JSON.stringify(updated));
  };

  const handleUpdateAirdropStatus = (id: string, status: 'Pending' | 'Distributed') => {
    const updated = airdropSubmissions.map(e => e.id === id ? { ...e, status } : e);
    setAirdropSubmissions(updated);
    localStorage.setItem('ti_airdrop_data', JSON.stringify(updated));
  };

  const handleUpdateAirdropBalance = (id: string, balance: number) => {
    const updated = airdropSubmissions.map(e => e.id === id ? { ...e, currentBalance: balance } : e);
    setAirdropSubmissions(updated);
    // We generally don't persist transient balances to localStorage to avoid stale data, 
    // but for simplicity in this "mock db" setup, we can.
    localStorage.setItem('ti_airdrop_data', JSON.stringify(updated));
  };

  const handleConfigUpdate = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    localStorage.setItem('ti_site_config', JSON.stringify(newConfig));
  };

  // --- Wallet State ---
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balanceTi: 0,
    balanceUSDT: 0,
    balanceBNB: 0
  });

  const handleConnectWallet = async () => {
    if (wallet.connected) {
      setWallet({ connected: false, address: null, balanceTi: 0, balanceUSDT: 0, balanceBNB: 0 });
      return;
    }

    // Explicit check for wallet installation
    if (!isWalletDetected()) {
      alert(
        lang === 'zh' 
          ? '未检测到钱包。请安装 MetaMask 或在支持 Web3 的浏览器（如 TrustWallet 浏览器）中打开此网页。' 
          : 'No crypto wallet detected. Please install MetaMask or open this site in a Web3-enabled browser like TrustWallet.'
      );
      return;
    }

    try {
      const { address } = await connectToBSC();
      
      if (!address) throw new Error("No address returned");

      // Fetch balances
      const balTi = await getTokenBalance(address, TOKEN_CONFIG.address);
      const balUSDT = await getTokenBalance(address, TOKEN_CONFIG.usdtAddress);
      const balBNB = await getTokenBalance(address, 'BNB'); // Special check for Native
      
      setWallet({
        connected: true,
        address,
        balanceTi: balTi,
        balanceUSDT: balUSDT,
        balanceBNB: balBNB
      });
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      if (error.message === "WALLET_NOT_FOUND") {
         alert(lang === 'zh' ? '未找到钱包' : 'Wallet not found');
      } else {
         alert(lang === 'zh' ? '连接钱包失败，请重试或检查控制台错误' : 'Connection failed. Please check console or try again.');
      }
    }
  };

  const handleSwapSuccess = (amountIn: number, amountOut: number) => {
    // Refresh balances after swap
    if (wallet.address) {
       const addr = wallet.address; // Capture string type for closure
       getTokenBalance(addr, TOKEN_CONFIG.address).then(ti => {
         getTokenBalance(addr, TOKEN_CONFIG.usdtAddress).then(usdt => {
           getTokenBalance(addr, 'BNB').then(bnb => {
             setWallet(prev => ({...prev, balanceTi: ti, balanceUSDT: usdt, balanceBNB: bnb}));
           });
         });
       });
    }
  };

  // --- Real-time Price State ---
  const [currentPrice, setCurrentPrice] = useState(siteConfig.tokenPrice);

  useEffect(() => {
    // Poll for real price
    const pollPrice = async () => {
      const realPrice = await fetchTokenPrice();
      if (realPrice > 0) {
        setCurrentPrice(realPrice);
      } else {
        // Fallback to config price if API fails
        setCurrentPrice(siteConfig.tokenPrice);
      }
    };
    
    pollPrice(); // Initial fetch
    const interval = setInterval(pollPrice, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [siteConfig.tokenPrice]);


  // --- Public Chat State (Local Simulation for persistent UI) ---
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>(() => {
    const saved = localStorage.getItem('ti_chat_messages');
    return saved ? JSON.parse(saved) : [
      { id: '1', user: 'CryptoKing', text: 'To the moon! 🚀', timestamp: Date.now() - 100000 },
      { id: '2', user: 'DeFi_Master', text: 'Great project, team is solid.', timestamp: Date.now() - 50000 },
    ];
  });

  const handlePublicMessage = (text: string) => {
    const newMsg: PublicMessage = {
      id: Date.now().toString(),
      user: isAdminLoggedIn ? 'ADMIN' : (wallet.connected ? 'User_' + wallet.address?.slice(-4) : 'Guest'),
      text: text,
      timestamp: Date.now(),
      isAdmin: isAdminLoggedIn
    };
    const updated = [...publicMessages, newMsg];
    setPublicMessages(updated);
    localStorage.setItem('ti_chat_messages', JSON.stringify(updated));
  };

  const deleteMessage = (id: string) => {
    const updated = publicMessages.filter(msg => msg.id !== id);
    setPublicMessages(updated);
    localStorage.setItem('ti_chat_messages', JSON.stringify(updated));
  };

  // Clear chat if it gets too long for localStorage
  useEffect(() => {
    if (publicMessages.length > 50) {
      const trimmed = publicMessages.slice(-50);
      setPublicMessages(trimmed);
      localStorage.setItem('ti_chat_messages', JSON.stringify(trimmed));
    }
  }, [publicMessages]);

  // Handle Admin view at top level to ensure it overlays everything correctly
  if (activeTab === 'admin') {
    return (
      <AdminPanel 
        config={siteConfig} 
        updateConfig={handleConfigUpdate} 
        lang={lang} 
        onLoginSuccess={() => setIsAdminLoggedIn(true)}
        isLoggedIn={isAdminLoggedIn}
        airdropData={airdropSubmissions}
        onExit={() => setActiveTab('home')}
        wallet={wallet}
        connectWallet={handleConnectWallet}
        onUpdateAirdropStatus={handleUpdateAirdropStatus}
        onUpdateAirdropBalance={handleUpdateAirdropBalance}
      />
    );
  }

  // --- Main Render ---
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Hero lang={lang} config={siteConfig} setActiveTab={setActiveTab} />;
      case 'swap':
        return (
          <Swap 
            lang={lang} 
            wallet={wallet} 
            connectWallet={handleConnectWallet} 
            price={currentPrice}
            onSwap={handleSwapSuccess}
          />
        );
      case 'community':
        return (
          <CommunityChat 
            messages={publicMessages} 
            onSendMessage={handlePublicMessage} 
            onDeleteMessage={deleteMessage}
            wallet={wallet}
            isAdmin={isAdminLoggedIn}
            lang={lang}
          />
        );
      case 'airdrop':
        return <Airdrop lang={lang} wallet={wallet} connectWallet={handleConnectWallet} onSubmit={handleAirdropSubmit} />;
      case 'whitepaper': // Added Whitepaper route
        return <Whitepaper lang={lang} />;
      default:
        return <Hero lang={lang} config={siteConfig} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        setLang={setLang} 
        wallet={wallet}
        connectWallet={handleConnectWallet}
        currentPrice={currentPrice}
        config={siteConfig} // Pass dynamic config to Navbar
      />
      
      <main className="flex-grow pt-16 relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-900/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-brand-dark border-t border-white/10 py-8 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Ti. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
