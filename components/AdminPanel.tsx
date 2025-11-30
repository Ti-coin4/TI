
import React, { useState } from 'react';
import { Lock, Save, Layout, DollarSign, Users, LogOut, Download, Wallet, RefreshCw, Send, CheckCircle, AlertTriangle, Shield, Link as LinkIcon } from 'lucide-react';
import { SiteConfig, Language, AirdropEntry, WalletState } from '../types';
import { ADMIN_CREDENTIALS, TOKEN_CONFIG } from '../constants';
import { Logo } from './Logo';
import { getTokenBalance, sendToken, connectToBSC } from '../services/web3Service';

interface AdminPanelProps {
  config: SiteConfig;
  updateConfig: (cfg: SiteConfig) => void;
  lang: Language;
  onLoginSuccess: () => void;
  isLoggedIn: boolean;
  airdropData: AirdropEntry[];
  onExit: () => void;
  wallet: WalletState;
  connectWallet: () => void;
  onUpdateAirdropStatus: (id: string, status: 'Pending' | 'Distributed') => void;
  onUpdateAirdropBalance: (id: string, balance: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  config, 
  updateConfig, 
  lang,
  onLoginSuccess,
  isLoggedIn,
  airdropData,
  onExit,
  wallet,
  connectWallet,
  onUpdateAirdropStatus,
  onUpdateAirdropBalance
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<'config' | 'airdrop' | 'security'>('config');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');

  const t = {
    zh: {
      login: {
        title: '管理员登录',
        userPlaceholder: '用户名',
        passPlaceholder: '密码',
        btn: '登录',
        back: '返回首页',
        error: '账号或密码错误'
      },
      sidebar: {
        title: '管理后台',
        config: '网站配置',
        airdrop: '空投管理',
        security: '安全设置',
        exit: '退出后台'
      },
      wallet: {
        title: '管理员钱包',
        notConnected: '未连接',
        connected: '已连接',
        connectBtn: '连接钱包',
        bal: '余额'
      },
      config: {
        title: '网站参数设置',
        sectionToken: '代币与空投设置',
        basePrice: '基础价格 (USDT)',
        basePriceDesc: 'API 失败时的备用价格',
        airdropAmt: '空投数量 (每人)',
        airdropAmtDesc: '每个地址发送的数量',
        sectionHero: '首页文字设置',
        prefix: '标题前缀',
        suffix: '标题后缀',
        subtitle: '副标题',
        sectionLinks: '社交链接设置',
        telegram: 'Telegram 链接',
        twitter: 'X (Twitter) 链接',
        save: '保存设置',
        savedAlert: '配置已保存!'
      },
      security: {
        title: '账户安全设置',
        desc: '修改管理员登录信息。请妥善保存新密码。',
        newUser: '新用户名',
        newPass: '新密码',
        saveBtn: '更新凭证',
        success: '管理员账户已更新！下次登录请使用新凭证。'
      },
      airdrop: {
        title: '空投列表管理',
        scan: '扫描余额',
        distribute: '一键分发所有',
        export: '导出数据',
        scanning: '正在扫描链上余额...',
        scanned: (count: number) => `成功扫描 ${count} 个地址`,
        error: '扫描出错',
        table: {
          addr: '钱包地址',
          time: '时间',
          bal: 'Ti 余额',
          status: '状态',
          action: '操作',
          empty: '暂无数据'
        },
        status: {
          pending: '待处理',
          distributed: '已分发',
          sent: '已发送'
        },
        btn: {
          send: '发送'
        },
        alerts: {
          connectFirst: '请先连接管理员钱包',
          confirmSend: (amt: number, addr: string) => `确认发送 ${amt} Ti 给 ${addr}?`,
          sending: (addr: string) => `正在发送给 ${addr}...`,
          sentSuccess: (addr: string) => `成功发送给 ${addr}`,
          failed: '发送失败: ',
          noPending: '没有待处理的用户',
          confirmBatch: (count: number) => `这将发起 ${count} 笔交易，您需要在钱包中逐笔确认。是否继续？`,
          batchStatus: (addr: string, current: number, total: number) => `正在发送给 ${addr}... (${current}/${total})`,
          batchComplete: (count: number) => `分发完成。成功发送给 ${count} 位用户。`,
          batchError: '批量处理错误: ',
          continueFail: '交易失败。是否继续发送下一个？'
        }
      }
    },
    en: {
      login: {
        title: 'Admin Access',
        userPlaceholder: 'Username',
        passPlaceholder: 'Password',
        btn: 'Login',
        back: 'Back to Site',
        error: 'Invalid Credentials'
      },
      sidebar: {
        title: 'Admin Panel',
        config: 'Website Config',
        airdrop: 'Airdrop Manager',
        security: 'Security',
        exit: 'Exit Dashboard'
      },
      wallet: {
        title: 'Admin Wallet',
        notConnected: 'Not connected',
        connected: 'Connected',
        connectBtn: 'Connect Wallet',
        bal: 'Balance'
      },
      config: {
        title: 'Website Configuration',
        sectionToken: 'Token & Airdrop Settings',
        basePrice: 'Base Price (USDT)',
        basePriceDesc: 'Fallback price if API fails.',
        airdropAmt: 'Airdrop Amount (Ti)',
        airdropAmtDesc: 'Amount sent per user.',
        sectionHero: 'Hero Section Text',
        prefix: 'Title Prefix',
        suffix: 'Title Suffix',
        subtitle: 'Subtitle',
        sectionLinks: 'Social Links',
        telegram: 'Telegram URL',
        twitter: 'X (Twitter) URL',
        save: 'Save Changes',
        savedAlert: 'Configuration Saved!'
      },
      security: {
        title: 'Account Security',
        desc: 'Update admin credentials. Save your new password carefully.',
        newUser: 'New Username',
        newPass: 'New Password',
        saveBtn: 'Update Credentials',
        success: 'Admin account updated! Use new credentials next time.'
      },
      airdrop: {
        title: 'Airdrop Management',
        scan: 'Scan Balances',
        distribute: 'Distribute All Pending',
        export: 'Export',
        scanning: 'Scanning blockchain for balances...',
        scanned: (count: number) => `Scanned ${count} addresses successfully.`,
        error: 'Error scanning balances.',
        table: {
          addr: 'Wallet Address',
          time: 'Time',
          bal: 'Ti Balance',
          status: 'Status',
          action: 'Action',
          empty: 'No submissions yet'
        },
        status: {
          pending: 'Pending',
          distributed: 'Distributed',
          sent: 'Sent'
        },
        btn: {
          send: 'Send'
        },
        alerts: {
          connectFirst: 'Please connect Admin wallet first',
          confirmSend: (amt: number, addr: string) => `Send ${amt} Ti to ${addr}?`,
          sending: (addr: string) => `Sending to ${addr.slice(0,6)}...`,
          sentSuccess: (addr: string) => `Sent successfully to ${addr}`,
          failed: 'Transfer Failed: ',
          noPending: 'No pending users.',
          confirmBatch: (count: number) => `This will initiate ${count} separate transactions. You will need to confirm each one in your wallet. Proceed?`,
          batchStatus: (addr: string, current: number, total: number) => `Sending to ${addr.slice(0,6)}... (${current}/${total})`,
          batchComplete: (count: number) => `Distribution Complete. Sent to ${count} users.`,
          batchError: 'Batch Process Error: ',
          continueFail: 'Transaction failed. Continue to next user?'
        }
      }
    }
  };

  const txt = t[lang];

  // Dynamic Login Check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminUser = config.adminUser || ADMIN_CREDENTIALS.username;
    const currentAdminPass = config.adminPass || ADMIN_CREDENTIALS.password;

    if (username === currentAdminUser && password === currentAdminPass) {
      onLoginSuccess();
      setError('');
    } else {
      setError(txt.login.error);
    }
  };

  const handleSave = () => {
    updateConfig(localConfig);
    alert(txt.config.savedAlert);
  };

  const handleUpdateCredentials = () => {
     updateConfig(localConfig);
     alert(txt.security.success);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Address,Timestamp,Status,TiBalance\n"
      + airdropData.map(e => `${e.id},${e.address},${new Date(e.timestamp).toISOString()},${e.status},${e.currentBalance || 0}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "airdrop_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch balances for all users
  const scanBalances = async () => {
    setIsProcessing(true);
    setProcessStatus(txt.airdrop.scanning);
    let count = 0;
    try {
      for (const entry of airdropData) {
        // Fetch real balance
        const balance = await getTokenBalance(entry.address, TOKEN_CONFIG.address);
        onUpdateAirdropBalance(entry.id, balance);
        count++;
      }
      setProcessStatus(txt.airdrop.scanned(count));
    } catch (e) {
      console.error(e);
      setProcessStatus(txt.airdrop.error);
    } finally {
      setTimeout(() => { setIsProcessing(false); setProcessStatus(''); }, 2000);
    }
  };

  // Send single airdrop
  const sendAirdrop = async (entry: AirdropEntry) => {
    if (!wallet.connected) {
      alert(txt.airdrop.alerts.connectFirst);
      return;
    }
    
    if (!confirm(txt.airdrop.alerts.confirmSend(localConfig.airdropAmount, entry.address))) return;

    setIsProcessing(true);
    setProcessStatus(txt.airdrop.alerts.sending(entry.address));

    try {
      const { signer } = await connectToBSC();
      await sendToken(
        entry.address, 
        localConfig.airdropAmount.toString(), 
        TOKEN_CONFIG.address, 
        signer
      );
      
      onUpdateAirdropStatus(entry.id, 'Distributed');
      alert(txt.airdrop.alerts.sentSuccess(entry.address));
    } catch (e: any) {
      console.error(e);
      alert(txt.airdrop.alerts.failed + (e.reason || e.message));
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Batch send (Loop)
  const distributeAllPending = async () => {
    const pending = airdropData.filter(e => e.status === 'Pending');
    if (pending.length === 0) {
      alert(txt.airdrop.alerts.noPending);
      return;
    }

    if (!wallet.connected) {
      alert(txt.airdrop.alerts.connectFirst);
      return;
    }

    if (!confirm(txt.airdrop.alerts.confirmBatch(pending.length))) return;

    setIsProcessing(true);
    let successCount = 0;
    
    try {
      const { signer } = await connectToBSC();
      
      for (let i = 0; i < pending.length; i++) {
         const entry = pending[i];
         setProcessStatus(txt.airdrop.alerts.batchStatus(entry.address, successCount + 1, pending.length));
         try {
           await sendToken(
            entry.address, 
            localConfig.airdropAmount.toString(), 
            TOKEN_CONFIG.address, 
            signer
           );
           onUpdateAirdropStatus(entry.id, 'Distributed');
           successCount++;
         } catch (err) {
           console.error(`Failed for ${entry.address}`, err);
           // Continue to next?
           if (!confirm(txt.airdrop.alerts.continueFail)) break;
         }
      }
      alert(txt.airdrop.alerts.batchComplete(successCount));
    } catch (e: any) {
       alert(txt.airdrop.alerts.batchError + e.message);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-brand-dark z-[100] flex items-center justify-center">
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-sm backdrop-blur-md">
          <div className="flex justify-center mb-6 text-brand-500">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-center text-xl font-bold text-white mb-6">{txt.login.title}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder={txt.login.userPlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-black/40 rounded-lg border border-white/10 text-white focus:border-brand-500 outline-none"
            />
            <input
              type="password"
              placeholder={txt.login.passPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black/40 rounded-lg border border-white/10 text-white focus:border-brand-500 outline-none"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button className="w-full py-3 bg-brand-600 rounded-lg text-white font-bold hover:bg-brand-500 transition-colors">
              {txt.login.btn}
            </button>
            <button 
              type="button" 
              onClick={onExit}
              className="w-full py-2 text-gray-500 hover:text-white text-sm"
            >
              {txt.login.back}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="fixed inset-0 bg-gray-900 z-[100] overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 border-r border-white/10 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-white/10">
           <Logo className="w-8 h-8" />
           <span className="font-bold text-white">{txt.sidebar.title}</span>
        </div>
        <div className="flex-1 p-4 space-y-2">
           <button 
            onClick={() => setActiveView('config')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeView === 'config' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
           >
             <Layout className="w-5 h-5" /> {txt.sidebar.config}
           </button>
           <button 
            onClick={() => setActiveView('airdrop')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeView === 'airdrop' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
           >
             <Users className="w-5 h-5" /> {txt.sidebar.airdrop}
           </button>
           <button 
            onClick={() => setActiveView('security')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeView === 'security' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
           >
             <Shield className="w-5 h-5" /> {txt.sidebar.security}
           </button>
        </div>
        <div className="p-4 border-t border-white/10">
           <button onClick={onExit} className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg">
              <LogOut className="w-5 h-5" /> {txt.sidebar.exit}
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-brand-dark p-8">
        
        {/* Admin Wallet Header */}
        <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
           <div>
             <h3 className="text-white font-bold">{txt.wallet.title}</h3>
             <p className="text-sm text-gray-400">{wallet.connected ? wallet.address : txt.wallet.notConnected}</p>
             {wallet.connected && (
               <p className="text-xs text-brand-400 mt-1">
                 Ti {txt.wallet.bal}: {wallet.balanceTi.toLocaleString()} | BNB: {wallet.balanceBNB.toFixed(4)}
               </p>
             )}
           </div>
           <button 
             onClick={connectWallet}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${wallet.connected ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-brand-600 text-white hover:bg-brand-500'}`}
           >
             <Wallet className="w-4 h-4" /> {wallet.connected ? txt.wallet.connected : txt.wallet.connectBtn}
           </button>
        </div>
        
        {activeView === 'config' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">{txt.config.title}</h2>
            
            {/* Price Control */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" /> {txt.config.sectionToken}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm text-gray-400 mb-1">{txt.config.basePrice}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={localConfig.tokenPrice}
                    onChange={(e) => setLocalConfig({...localConfig, tokenPrice: parseFloat(e.target.value)})}
                    className="w-full p-2 bg-black/40 rounded border border-white/10 text-white font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">{txt.config.basePriceDesc}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{txt.config.airdropAmt}</label>
                  <input
                    type="number"
                    value={localConfig.airdropAmount}
                    onChange={(e) => setLocalConfig({...localConfig, airdropAmount: parseFloat(e.target.value)})}
                    className="w-full p-2 bg-black/40 rounded border border-white/10 text-white font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">{txt.config.airdropAmtDesc}</p>
                </div>
              </div>
            </div>

            {/* Text Control */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-400" /> {txt.config.sectionHero}
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{txt.config.prefix}</label>
                    <input
                      type="text"
                      value={localConfig.heroTitlePrefix}
                      onChange={(e) => setLocalConfig({...localConfig, heroTitlePrefix: e.target.value})}
                      className="w-full p-2 bg-black/40 rounded border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{txt.config.suffix}</label>
                    <input
                      type="text"
                      value={localConfig.heroTitleSuffix}
                      onChange={(e) => setLocalConfig({...localConfig, heroTitleSuffix: e.target.value})}
                      className="w-full p-2 bg-black/40 rounded border border-white/10 text-white"
                    />
                  </div>
                </div>
                 <div>
                  <label className="block text-sm text-gray-400 mb-1">{txt.config.subtitle}</label>
                  <textarea
                    value={localConfig.heroSubtitle}
                    onChange={(e) => setLocalConfig({...localConfig, heroSubtitle: e.target.value})}
                    className="w-full p-2 bg-black/40 rounded border border-white/10 text-white h-24"
                  />
                </div>
              </div>
            </div>

            {/* Social Links Control */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-purple-400" /> {txt.config.sectionLinks}
              </h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{txt.config.telegram}</label>
                  <input
                    type="text"
                    value={localConfig.telegram}
                    onChange={(e) => setLocalConfig({...localConfig, telegram: e.target.value})}
                    className="w-full p-2 bg-black/40 rounded border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{txt.config.twitter}</label>
                  <input
                    type="text"
                    value={localConfig.twitter}
                    onChange={(e) => setLocalConfig({...localConfig, twitter: e.target.value})}
                    className="w-full p-2 bg-black/40 rounded border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
            >
              <Save className="w-5 h-5" /> {txt.config.save}
            </button>
          </div>
        )}

        {/* Security View */}
        {activeView === 'security' && (
           <div className="max-w-2xl mx-auto space-y-6">
             <h2 className="text-2xl font-bold text-white mb-6">{txt.security.title}</h2>
             <div className="bg-white/5 p-8 rounded-xl border border-white/5">
               <p className="text-gray-400 mb-6">{txt.security.desc}</p>
               
               <div className="space-y-4">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">{txt.security.newUser}</label>
                    <input
                      type="text"
                      value={localConfig.adminUser || ''}
                      onChange={(e) => setLocalConfig({...localConfig, adminUser: e.target.value})}
                      className="w-full p-3 bg-black/40 rounded border border-white/10 text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">{txt.security.newPass}</label>
                    <input
                      type="text"
                      value={localConfig.adminPass || ''}
                      onChange={(e) => setLocalConfig({...localConfig, adminPass: e.target.value})}
                      className="w-full p-3 bg-black/40 rounded border border-white/10 text-white"
                    />
                 </div>
               </div>

               <button
                  onClick={handleUpdateCredentials}
                  className="w-full mt-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Shield className="w-5 h-5" /> {txt.security.saveBtn}
                </button>
             </div>
           </div>
        )}

        {activeView === 'airdrop' && (
          <div className="max-w-6xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{txt.airdrop.title}</h2>
                <div className="flex gap-2">
                   <button 
                    onClick={scanBalances}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-brand-700 text-white rounded-lg flex items-center gap-2 hover:bg-brand-600 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} /> {txt.airdrop.scan}
                  </button>
                  <button 
                    onClick={distributeAllPending}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-500 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {txt.airdrop.distribute}
                  </button>
                   <button 
                    onClick={exportData}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-600"
                  >
                    <Download className="w-4 h-4" /> {txt.airdrop.export}
                  </button>
                </div>
             </div>

             {processStatus && (
               <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-200 text-sm flex items-center gap-2">
                 <RefreshCw className="w-4 h-4 animate-spin" /> {processStatus}
               </div>
             )}
             
             <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 text-gray-400 border-b border-white/10">
                      <th className="p-4 font-medium">{txt.airdrop.table.addr}</th>
                      <th className="p-4 font-medium">{txt.airdrop.table.time}</th>
                      <th className="p-4 font-medium">{txt.airdrop.table.bal}</th>
                      <th className="p-4 font-medium">{txt.airdrop.table.status}</th>
                      <th className="p-4 font-medium">{txt.airdrop.table.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {airdropData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">{txt.airdrop.table.empty}</td>
                      </tr>
                    ) : (
                      airdropData.map((entry) => (
                        <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-brand-400 text-sm">{entry.address}</td>
                          <td className="p-4 text-gray-400 text-sm">{new Date(entry.timestamp).toLocaleDateString()}</td>
                          <td className="p-4 font-mono text-white">
                            {entry.currentBalance !== undefined ? entry.currentBalance.toLocaleString() : '--'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                              entry.status === 'Distributed' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {entry.status === 'Distributed' ? txt.airdrop.status.distributed : txt.airdrop.status.pending}
                            </span>
                          </td>
                          <td className="p-4">
                            {entry.status === 'Pending' ? (
                              <button 
                                onClick={() => sendAirdrop(entry)}
                                disabled={isProcessing}
                                className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {txt.airdrop.btn.send} {localConfig.airdropAmount} Ti
                              </button>
                            ) : (
                              <span className="text-gray-600 text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> {txt.airdrop.status.sent}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
