import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Info, Wallet, Loader2, ChevronDown, X, ExternalLink, CheckCircle, Settings, Fuel, Route as RouteIcon, AlertTriangle } from 'lucide-react';
import { WalletState, Language, Token } from '../types';
import { connectToBSC, executeSwap, getSwapQuote, estimateSwapGas } from '../services/web3Service';
import { TOKEN_CONFIG } from '../constants';

interface SwapProps {
  lang: Language;
  wallet: WalletState;
  connectWallet: () => void;
  price: number;
  onSwap: (amountIn: number, amountOut: number) => void;
}

const BASE_TOKENS: Token[] = [
  { symbol: 'USDT', address: TOKEN_CONFIG.usdtAddress, decimals: 18, logo: 'T' },
  { symbol: 'BNB', address: 'BNB', decimals: 18, logo: 'B' },
];

const TI_TOKEN: Token = { symbol: 'Ti', address: TOKEN_CONFIG.address, decimals: 18, logo: 'Ti' };

type SwapStep = 'INPUT' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS';

export const Swap: React.FC<SwapProps> = ({ lang, wallet, connectWallet, price, onSwap }) => {
  const [step, setStep] = useState<SwapStep>('INPUT');
  const [isBuying, setIsBuying] = useState(true); // true = Buy Ti, false = Sell Ti
  
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  
  // Base token selection (USDT/BNB)
  const [selectedBaseToken, setSelectedBaseToken] = useState<Token>(BASE_TOKENS[0]); 
  
  // Settings
  const [slippage, setSlippage] = useState(0.5); // %
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('');

  // Info
  const [routePath, setRoutePath] = useState<string[]>([]);
  const [gasFee, setGasFee] = useState<{ bnb: string, usd: string } | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [swapStatus, setSwapStatus] = useState<string>('');

  // Selector
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Derived Tokens based on Direction
  const tokenIn = isBuying ? selectedBaseToken : TI_TOKEN;
  const tokenOut = isBuying ? TI_TOKEN : selectedBaseToken;

  // Debounced Quote & Gas Fetching
  useEffect(() => {
    const fetchQuoteAndGas = async () => {
      if (!inputAmount || parseFloat(inputAmount) === 0 || isNaN(parseFloat(inputAmount))) {
        setOutputAmount('');
        setGasFee(null);
        setRoutePath([]);
        return;
      }
      
      setIsQuoting(true);
      try {
        // 1. Get Quote & Route
        const quote = await getSwapQuote(inputAmount, tokenIn.address, tokenOut.address);
        if (parseFloat(quote.amountOut) > 0) {
          setOutputAmount(parseFloat(quote.amountOut).toFixed(4));
          const symbols = quote.path.map(addr => {
             if (addr.toLowerCase() === TOKEN_CONFIG.wbnbAddress.toLowerCase() || addr === 'BNB') return 'BNB';
             if (addr.toLowerCase() === TOKEN_CONFIG.usdtAddress.toLowerCase()) return 'USDT';
             if (addr.toLowerCase() === TOKEN_CONFIG.address.toLowerCase()) return 'Ti';
             return addr.slice(0,4);
          });
          setRoutePath(symbols);
        }

        // 2. Estimate Gas (Only if connected, otherwise we can't estimate reliably)
        if (wallet.connected) {
           const { signer } = await connectToBSC();
           const gasEst = await estimateSwapGas(inputAmount, tokenIn.address, tokenOut.address, signer);
           setGasFee({ bnb: gasEst.gasBNB, usd: gasEst.gasUSD });
        } else {
           // Show approximate if not connected
           setGasFee({ bnb: '0.0015', usd: '0.90' });
        }

      } catch (e) {
        // console.error("Quote fetch failed", e);
        setOutputAmount('');
      } finally {
        setIsQuoting(false);
      }
    };

    const timer = setTimeout(fetchQuoteAndGas, 600);
    return () => clearTimeout(timer);
  }, [inputAmount, isBuying, selectedBaseToken, price, wallet.connected]);

  const toggleDirection = () => {
    setIsBuying(!isBuying);
    setInputAmount('');
    setOutputAmount('');
  };

  const handleInitiateSwap = () => {
    if (!inputAmount || !wallet.connected) return;
    setStep('CONFIRM');
  };

  const handleConfirmSwap = async () => {
    setStep('PROCESSING');
    setSwapStatus(lang === 'zh' ? '正在接入区块链...' : 'Accessing Blockchain...');
    setIsApproving(false);

    try {
      const { signer } = await connectToBSC();
      
      // Approval needed if Input is NOT BNB
      if (tokenIn.symbol !== 'BNB') {
        setSwapStatus(lang === 'zh' ? `检查授权: ${tokenIn.symbol}...` : `Checking Allowance: ${tokenIn.symbol}...`);
        // The service handles check & approve, but we set a UI flag to show "Approving" state
        // We can infer approval is happening if it takes longer than usual
        setIsApproving(true); 
      } else {
        setSwapStatus(lang === 'zh' ? '等待签名...' : 'Awaiting Signature...');
      }
      
      const receipt = await executeSwap(
        inputAmount,
        tokenIn.address,
        tokenOut.address,
        signer,
        slippage
      );

      setTxHash(receipt.hash);
      setStep('SUCCESS');
      onSwap(parseFloat(inputAmount), parseFloat(outputAmount));
      
    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || (lang === 'zh' ? '交易失败' : 'Transaction Failed');
      
      if (errMsg.includes("user rejected") || errMsg.includes("ACTION_REJECTED")) {
         setSwapStatus(lang === 'zh' ? '操作被拒绝' : 'Operation Rejected');
      } else if (errMsg.includes("INSUFFICIENT")) {
         alert(lang === 'zh' ? '余额不足' : 'Insufficient Balance');
      } else {
         alert(`${lang === 'zh' ? '错误: ' : 'Error: '} ${errMsg}`);
      }
      setStep('INPUT');
    } finally {
      setIsApproving(false);
    }
  };

  const handleClose = () => {
    setStep('INPUT');
    setInputAmount('');
    setOutputAmount('');
    setTxHash('');
  };

  const getBalance = (tokenSymbol: string) => {
    if (!wallet.connected) return '--';
    if (tokenSymbol === 'BNB') return wallet.balanceBNB.toFixed(4);
    if (tokenSymbol === 'USDT') return wallet.balanceUSDT.toFixed(2);
    if (tokenSymbol === 'Ti') return wallet.balanceTi.toFixed(2);
    return '0';
  };

  const handleCustomSlippage = (val: string) => {
    setCustomSlippage(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setSlippage(num);
  };

  const minReceived = outputAmount 
    ? (parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(4)
    : '0.0000';

  // --- RENDER HELPERS ---
  
  const renderTokenDisplay = (token: Token, isInput: boolean) => {
    // If it's the base token side (Buy Input OR Sell Output), show selector button or display
    // If it's Ti side (Buy Output OR Sell Input), show fixed Ti display
    
    const isBaseSide = (isBuying && isInput) || (!isBuying && !isInput);
    
    if (isBaseSide) {
      return (
        <div className="relative shrink-0">
          <button 
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 transition-colors"
          >
              <div className={`w-5 h-5 flex items-center justify-center text-[10px] text-black font-bold ${selectedBaseToken.symbol === 'BNB' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  {selectedBaseToken.logo}
              </div>
              <span className="font-bold text-white font-display">{selectedBaseToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {isSelectorOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-black border border-neon-purple shadow-[0_0_20px_rgba(189,0,255,0.2)] z-30 animate-fade-in">
              {BASE_TOKENS.map((token) => (
                  <button
                  key={token.symbol}
                  onClick={() => {
                      setSelectedBaseToken(token);
                      setIsSelectorOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-neon-purple/20 transition-colors text-left"
                  >
                  <span className="text-white font-mono text-sm">{token.symbol}</span>
                  </button>
              ))}
              </div>
          )}
        </div>
      );
    } else {
      // Fixed Ti Display
      return (
        <div className="flex items-center gap-2 px-3 py-1 cursor-default border border-neon-blue/30 bg-neon-blue/5">
          <div className="w-5 h-5 bg-neon-blue flex items-center justify-center text-[10px] text-black font-bold">Ti</div>
          <span className="font-bold text-white font-display">Ti</span>
        </div>
      );
    }
  };

  // Render Confirmation Modal
  const renderConfirmModal = () => (
    <div className="absolute inset-0 bg-neon-dark/95 backdrop-blur-xl z-50 flex flex-col p-6 rounded-none animate-fade-in border border-neon-blue">
      <div className="flex justify-between items-center mb-6 border-b border-neon-blue/30 pb-4">
        <h3 className="text-xl font-display font-bold text-white uppercase">{lang === 'zh' ? '交易确认' : 'CONFIRM SWAP'}</h3>
        <button onClick={() => setStep('INPUT')} className="text-neon-blue hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="bg-black/50 p-4 border border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="font-bold text-white text-lg">{tokenIn.symbol}</div>
             <div>
               <p className="text-xl font-mono font-bold text-white">{inputAmount}</p>
             </div>
          </div>
        </div>

        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-neon-dark p-2 border border-neon-blue/50 text-neon-blue">
            <ArrowDownUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-black/50 p-4 border border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="font-bold text-white text-lg">{tokenOut.symbol}</div>
             <div>
               <p className="text-xl font-mono font-bold text-neon-blue animate-pulse">{outputAmount}</p>
             </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/5 rounded border border-white/5 space-y-2 text-xs font-mono">
           <div className="flex justify-between text-gray-400">
             <span>{lang === 'zh' ? '滑点设置' : 'Slippage'}</span>
             <span className="text-yellow-400">{slippage}%</span>
           </div>
           <div className="flex justify-between text-gray-400">
             <span>{lang === 'zh' ? '最少收到' : 'Min Received'}</span>
             <span className="text-white">{minReceived} {tokenOut.symbol}</span>
           </div>
           <div className="flex justify-between text-gray-400">
             <span>{lang === 'zh' ? '网络费用' : 'Network Fee'}</span>
             <span className="text-white">~ ${gasFee?.usd || '0.00'}</span>
           </div>
        </div>
      </div>

      <button
        onClick={handleConfirmSwap}
        className="w-full mt-6 py-4 bg-neon-blue hover:bg-white text-black font-display font-bold text-lg uppercase tracking-widest transition-all hover:shadow-[0_0_20px_#00f3ff]"
      >
        {lang === 'zh' ? '执行' : 'EXECUTE'}
      </button>
    </div>
  );

  // Render Success Modal
  const renderSuccessModal = () => (
    <div className="absolute inset-0 bg-neon-dark/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 animate-fade-in text-center border border-neon-green">
      <div className="w-24 h-24 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green mb-6 border border-neon-green shadow-[0_0_30px_rgba(0,255,65,0.3)]">
        <CheckCircle className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase">{lang === 'zh' ? '交易成功' : 'SUCCESS'}</h3>
      
      <div className="bg-black/50 w-full p-4 border border-neon-green/30 mb-6 space-y-3 font-mono text-sm">
         <div className="flex justify-between">
            <span className="text-gray-500">{lang === 'zh' ? '支付' : 'Sent'}</span>
            <span className="text-white">{inputAmount} {tokenIn.symbol}</span>
         </div>
         <div className="flex justify-between border-t border-white/5 pt-2">
            <span className="text-gray-500">{lang === 'zh' ? '收到' : 'Received'}</span>
            <span className="text-neon-green">{outputAmount} {tokenOut.symbol}</span>
         </div>
      </div>

      <a 
        href={`https://bscscan.com/tx/${txHash}`}
        target="_blank"
        rel="noreferrer"
        className="text-neon-blue hover:text-white flex items-center gap-2 text-sm mb-8 font-mono hover:underline"
      >
        {lang === 'zh' ? 'BscScan 记录' : 'View on BscScan'} <ExternalLink className="w-3 h-3" />
      </a>

      <button
        onClick={handleClose}
        className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold font-display uppercase tracking-wider border border-white/20"
      >
        {lang === 'zh' ? '返回' : 'RETURN'}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Chart Section */}
        <div className="flex-1 bg-neon-panel border border-neon-blue/30 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] min-h-[550px] relative group">
           <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-blue"></div>
           <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-blue"></div>
           <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-blue"></div>
           <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-blue"></div>

           <div className="p-4 border-b border-neon-blue/20 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-neon-blue flex items-center justify-center text-black font-bold text-xs">Ti</div>
                <h2 className="text-lg font-display font-bold text-white tracking-wider">Ti / WBNB</h2>
                <span className="px-2 py-0.5 bg-neon-green/20 text-neon-green text-[10px] font-mono border border-neon-green/50 animate-pulse">LIVE FEED</span>
              </div>
           </div>
           
           <div className="w-full h-[500px] lg:h-[600px] relative">
              <iframe 
                src={`https://dexscreener.com/bsc/${TOKEN_CONFIG.address}?embed=1&theme=dark&trades=0&info=0`}
                className="absolute inset-0 w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity"
                title="Ti Chart"
              ></iframe>
           </div>
        </div>

        {/* RIGHT: Swap Interface */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-neon-panel border border-neon-purple/50 p-1 shadow-[0_0_40px_rgba(189,0,255,0.15)] relative overflow-hidden flex flex-col h-fit">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(189,0,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>

            <div className="relative bg-black/60 backdrop-blur-sm p-6 border-inner h-full">
                {step === 'CONFIRM' && renderConfirmModal()}
                {step === 'SUCCESS' && renderSuccessModal()}
                {step === 'PROCESSING' && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-center p-6 border border-neon-blue">
                    <Loader2 className="w-16 h-16 text-neon-blue animate-spin mb-6 drop-shadow-[0_0_10px_#00f3ff]" />
                    <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-widest">
                    {isApproving ? (lang === 'zh' ? `正在授权 ${tokenIn.symbol}...` : `Approving ${tokenIn.symbol}...`) : (lang === 'zh' ? '正在上传交易...' : 'Broadcasting Tx...')}
                    </h3>
                    <p className="text-neon-blue font-mono text-xs max-w-[200px] mx-auto animate-pulse">{swapStatus}</p>
                </div>
                )}

                {/* --- HEADER --- */}
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider text-neon-purple drop-shadow-[0_0_5px_rgba(189,0,255,0.5)]">{lang === 'zh' ? '黑市交易' : 'TERMINAL'}</h2>
                   <div className="relative">
                      <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/10 rounded cursor-pointer text-neon-purple transition-colors"
                      >
                         <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
                      </button>
                      
                      {/* Slippage Settings Dropdown */}
                      {showSettings && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-black border border-neon-purple p-4 shadow-xl z-40 animate-fade-in-down">
                           <h4 className="text-xs text-gray-500 font-bold mb-2 uppercase">{lang === 'zh' ? '最大滑点' : 'MAX SLIPPAGE'}</h4>
                           <div className="grid grid-cols-4 gap-2 mb-2">
                              {[0.1, 0.5, 1.0].map(val => (
                                <button
                                  key={val}
                                  onClick={() => { setSlippage(val); setCustomSlippage(''); }}
                                  className={`px-2 py-1 text-xs font-bold border ${slippage === val ? 'bg-neon-purple text-white border-neon-purple' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                                >
                                  {val}%
                                </button>
                              ))}
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="Custom"
                                  value={customSlippage}
                                  onChange={(e) => handleCustomSlippage(e.target.value)}
                                  className={`w-full px-1 py-1 text-xs font-bold bg-transparent border outline-none text-center ${customSlippage ? 'border-neon-purple text-white' : 'border-gray-700 text-gray-400'}`}
                                />
                                <span className="absolute right-1 top-1 text-[8px] text-gray-500">%</span>
                              </div>
                           </div>
                           {slippage > 5 && (
                             <div className="text-[10px] text-red-500 flex items-center gap-1">
                               <AlertTriangle className="w-3 h-3" /> {lang === 'zh' ? '高滑点风险' : 'High Slippage Risk'}
                             </div>
                           )}
                        </div>
                      )}
                   </div>
                </div>

                {/* --- INPUT --- */}
                <div className="bg-black border border-white/10 hover:border-neon-purple/50 transition-colors p-4 mb-2 relative group">
                  <div className="flex justify-between mb-2">
                      <span className="text-gray-500 font-mono text-xs uppercase">{lang === 'zh' ? '支付' : 'INPUT'}</span>
                      <span className="text-gray-500 font-mono text-xs">
                      {lang === 'zh' ? '可用' : 'AVAIL'}: {getBalance(tokenIn.symbol)}
                      </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                      <input 
                      type="number" 
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent text-2xl font-mono font-bold text-white outline-none w-full placeholder-gray-700"
                      />
                      {renderTokenDisplay(tokenIn, true)}
                  </div>
                </div>

                {/* --- SWITCH --- */}
                <div className="relative h-6 flex items-center justify-center my-2">
                  <div 
                    onClick={toggleDirection}
                    className="absolute bg-black p-1.5 border border-neon-purple text-neon-purple cursor-pointer hover:rotate-180 transition-transform z-10 hover:shadow-[0_0_10px_#bd00ff]"
                  >
                      <ArrowDownUp className="w-4 h-4" />
                  </div>
                  <div className="w-full h-[1px] bg-white/10"></div>
                </div>

                {/* --- OUTPUT --- */}
                <div className="bg-black border border-white/10 hover:border-neon-blue/50 transition-colors p-4 relative">
                  <div className="flex justify-between mb-2">
                      <span className="text-gray-500 font-mono text-xs uppercase">{lang === 'zh' ? '获取' : 'OUTPUT'}</span>
                      <span className="text-gray-500 font-mono text-xs">
                      {lang === 'zh' ? '可用' : 'AVAIL'}: {getBalance(tokenOut.symbol)}
                      </span>
                  </div>
                  <div className="flex items-center justify-between">
                      {isQuoting ? (
                      <div className="h-8 flex items-center">
                          <Loader2 className="w-5 h-5 text-neon-blue animate-spin" />
                      </div>
                      ) : (
                      <input 
                          type="text" 
                          value={outputAmount}
                          readOnly
                          placeholder="0.00"
                          className="bg-transparent text-2xl font-mono font-bold text-neon-blue outline-none w-2/3 placeholder-gray-700"
                      />
                      )}
                      {renderTokenDisplay(tokenOut, false)}
                  </div>
                </div>

                {/* --- DETAILS PANEL --- */}
                {outputAmount && (
                  <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded space-y-2">
                     <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {lang === 'zh' ? '预估矿工费' : 'Est. Gas'}</span>
                        <span className="text-white">
                           {gasFee ? `~${gasFee.bnb} BNB ($${gasFee.usd})` : <Loader2 className="w-3 h-3 animate-spin"/>}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-1"><RouteIcon className="w-3 h-3" /> {lang === 'zh' ? '智能路由' : 'Route'}</span>
                        <span className="text-neon-blue flex items-center gap-1">
                           {routePath.map((sym, i) => (
                             <React.Fragment key={i}>
                               {sym}
                               {i < routePath.length - 1 && <span className="text-gray-600 mx-0.5">&gt;</span>}
                             </React.Fragment>
                           ))}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-mono text-gray-400 border-t border-white/5 pt-2">
                        <span>{lang === 'zh' ? '最少收到' : 'Min Received'}</span>
                        <span className="text-white">{minReceived} {tokenOut.symbol}</span>
                     </div>
                  </div>
                )}

                {/* --- BUTTON --- */}
                <button
                onClick={wallet.connected ? handleInitiateSwap : connectWallet}
                disabled={wallet.connected && (!inputAmount || parseFloat(inputAmount) <= 0)}
                className={`w-full mt-6 py-4 font-display font-bold text-lg uppercase tracking-widest transition-all relative overflow-hidden group ${
                    !wallet.connected 
                    ? 'bg-transparent border border-neon-blue text-neon-blue hover:bg-neon-blue/10'
                    : !inputAmount || parseFloat(inputAmount) <= 0
                        ? 'bg-gray-900 border border-gray-700 text-gray-600 cursor-not-allowed'
                        : 'bg-neon-purple text-white hover:shadow-[0_0_20px_#bd00ff] border border-transparent'
                }`}
                >
                 <span className="relative z-10">
                    {!wallet.connected 
                    ? (lang === 'zh' ? '>>> 连接网络 <<<' : '>>> JACK IN <<<') 
                    : (lang === 'zh' ? '>>> 执行交易 <<<' : '>>> EXECUTE SWAP <<<')}
                 </span>
                 {wallet.connected && inputAmount && (
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                 )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};