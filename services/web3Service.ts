import * as ethers from 'ethers';
import { TOKEN_CONFIG, ERC20_ABI, ROUTER_ABI, BSC_CHAIN_ID } from '../constants';

// Declare window type for Ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Destructure mostly used safely
const { 
  BrowserProvider, 
  Contract, 
  formatEther, 
  formatUnits, 
  parseUnits, 
  parseEther, 
  MaxUint256 
} = ethers;

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    if (!BrowserProvider) {
      console.error("Ethers.js library failed to load correctly.");
      return null;
    }
    return new BrowserProvider(window.ethereum);
  }
  return null;
};

export const isWalletDetected = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Retry utility for mobile wallets that might inject 'window.ethereum' slightly later
const waitForWallet = async (retries = 3, interval = 500): Promise<boolean> => {
    if (isWalletDetected()) return true;
    if (retries === 0) return false;
    await new Promise(resolve => setTimeout(resolve, interval));
    return waitForWallet(retries - 1, interval);
};

export const connectToBSC = async () => {
  const walletExists = await waitForWallet();
  if (!walletExists) {
    throw new Error("WALLET_NOT_FOUND");
  }
  
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Switch to BSC
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BSC_CHAIN_ID,
              chainName: 'Binance Smart Chain Mainnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed1.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  } catch (error) {
    console.error("Connection Error:", error);
    throw error;
  }
};

export const getTokenBalance = async (walletAddress: string, tokenAddress: string) => {
  try {
    const provider = getProvider();
    if (!provider) return 0;
    
    // Check for Native BNB
    if (tokenAddress === 'BNB') {
      const balance = await provider.getBalance(walletAddress);
      return parseFloat(formatEther(balance));
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    return parseFloat(formatUnits(balance, decimals));
  } catch (error) {
    // console.warn(`Failed to fetch balance for ${tokenAddress}`, error);
    return 0;
  }
};

export const fetchTokenPrice = async () => {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONFIG.address}`);
    const data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      return parseFloat(data.pairs[0].priceUsd);
    }
    return 0;
  } catch (error) {
    console.error("Price fetch error:", error);
    return 0;
  }
};

export interface SwapQuote {
  amountOut: string;
  path: string[];
}

export const getSwapQuote = async (
  amountIn: string,
  tokenInAddress: string,
  tokenOutAddress: string
): Promise<SwapQuote> => {
  try {
    const provider = getProvider();
    if (!provider) return { amountOut: '0', path: [] };
    
    const router = new Contract(TOKEN_CONFIG.routerAddress, ROUTER_ABI, provider);
    
    const actualTokenIn = tokenInAddress === 'BNB' ? TOKEN_CONFIG.wbnbAddress : tokenInAddress;
    const actualTokenOut = tokenOutAddress === 'BNB' ? TOKEN_CONFIG.wbnbAddress : tokenOutAddress;

    // Routing Logic:
    let path = [actualTokenIn, actualTokenOut];
    
    if (actualTokenIn.toLowerCase() !== TOKEN_CONFIG.wbnbAddress.toLowerCase() && 
        actualTokenOut.toLowerCase() !== TOKEN_CONFIG.wbnbAddress.toLowerCase()) {
       path = [actualTokenIn, TOKEN_CONFIG.wbnbAddress, actualTokenOut];
    }
    
    if (actualTokenIn.toLowerCase() === actualTokenOut.toLowerCase()) {
        return { amountOut: amountIn, path: [actualTokenIn] };
    }

    let decimals = 18;
    if (tokenInAddress !== 'BNB') {
       const tokenContract = new Contract(tokenInAddress, ERC20_ABI, provider);
       decimals = await tokenContract.decimals();
    }
    const amountInWei = parseUnits(amountIn, decimals);

    const amounts = await router.getAmountsOut(amountInWei, path);
    
    let outDecimals = 18;
    if (tokenOutAddress !== 'BNB') {
       const tokenOutContract = new Contract(tokenOutAddress, ERC20_ABI, provider);
       outDecimals = await tokenOutContract.decimals();
    }

    const amountOut = formatUnits(amounts[amounts.length - 1], outDecimals);

    return {
      amountOut,
      path
    };
  } catch (error) {
    return { amountOut: '0', path: [] };
  }
};

export const estimateSwapGas = async (
  amountIn: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  signer: ethers.JsonRpcSigner
): Promise<{ gasBNB: string; gasUSD: string }> => {
   try {
     const router = new Contract(TOKEN_CONFIG.routerAddress, ROUTER_ABI, signer);
     const address = await signer.getAddress();
     const deadline = Math.floor(Date.now() / 1000) + 1200;

     const quote = await getSwapQuote(amountIn, tokenInAddress, tokenOutAddress);
     const path = quote.path;
     
     if (path.length === 0) return { gasBNB: "0", gasUSD: "0" };

     let decimals = 18;
     if (tokenInAddress !== 'BNB') {
        const t = new Contract(tokenInAddress, ERC20_ABI, signer);
        decimals = await t.decimals();
     }
     const amountInWei = parseUnits(amountIn, decimals);
     const amountOutMinWei = 0; // Estimate only

     let estimatedGasLimit = 300000n; // Safer default

     try {
       if (tokenInAddress === 'BNB') {
         // Buying with BNB
         estimatedGasLimit = await router.swapExactETHForTokens.estimateGas(
            amountOutMinWei, path, address, deadline, { value: amountInWei }
         );
       } else if (tokenOutAddress === 'BNB') {
          // Selling for BNB
          const tokenIn = new Contract(tokenInAddress, ERC20_ABI, signer);
          const allowance = await tokenIn.allowance(address, TOKEN_CONFIG.routerAddress);
          
          if (allowance < amountInWei) {
             estimatedGasLimit = 400000n; // Approve + Swap
          } else {
             estimatedGasLimit = await router.swapExactTokensForETHSupportingFeeOnTransferTokens.estimateGas(
                amountInWei, amountOutMinWei, path, address, deadline
             );
          }
       } else {
         // Token to Token
          const tokenIn = new Contract(tokenInAddress, ERC20_ABI, signer);
          const allowance = await tokenIn.allowance(address, TOKEN_CONFIG.routerAddress);
          if (allowance < amountInWei) {
             estimatedGasLimit = 450000n;
          } else {
             estimatedGasLimit = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens.estimateGas(
                amountInWei, amountOutMinWei, path, address, deadline
             );
          }
       }
     } catch(e) {
       console.warn("Gas sim failed (likely insufficient funds or RPC error), using fallback.");
       estimatedGasLimit = 350000n;
     }

     const provider = signer.provider;
     const feeData = await provider.getFeeData();
     // Fallback gas price 3 gwei if RPC fails
     const gasPrice = feeData.gasPrice || parseUnits('3', 'gwei');
     
     const costWei = gasPrice * estimatedGasLimit;
     const costBNB = formatEther(costWei);
     
     // Approx USD price of BNB (assume $600 for quick display, or we could fetch it)
     const costUSD = (parseFloat(costBNB) * 600).toFixed(2);

     return { gasBNB: parseFloat(costBNB).toFixed(5), gasUSD: costUSD };
   } catch (e) {
     return { gasBNB: "0.0015", gasUSD: "0.90" }; // Conservative fallback
   }
}

export const executeSwap = async (
  amountIn: string, 
  tokenInAddress: string, 
  tokenOutAddress: string,
  signer: ethers.JsonRpcSigner,
  slippagePercent: number
): Promise<ethers.TransactionReceipt> => {
  try {
    const router = new Contract(TOKEN_CONFIG.routerAddress, ROUTER_ABI, signer);
    const address = await signer.getAddress();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins

    // 1. Get Quote
    const quote = await getSwapQuote(amountIn, tokenInAddress, tokenOutAddress);
    const amountOutQuote = quote.amountOut;
    const path = quote.path;
    
    // 2. Calc Min Output
    let outDecimals = 18;
    if (tokenOutAddress !== 'BNB') {
       const contract = new Contract(tokenOutAddress, ERC20_ABI, signer);
       outDecimals = await contract.decimals();
    }
    
    const amountOutWei = parseUnits(amountOutQuote, outDecimals);
    
    // Calculate slippage: (100 - slippage) / 100
    // Using BigInt for precision
    const keepBasis = BigInt(Math.floor((100 - slippagePercent) * 100)); // e.g. 9950 for 0.5%
    const amountOutMinWei = (amountOutWei * keepBasis) / 10000n;

    if (tokenInAddress === 'BNB') {
      // --- BUYING (BNB -> Token) ---
      const amountInWei = parseEther(amountIn);
      
      // Check Balance
      const balance = await signer.provider.getBalance(address);
      if (balance < amountInWei) {
          throw new Error("INSUFFICIENT_BNB_BALANCE");
      }

      const txSwap = await router.swapExactETHForTokens(
        amountOutMinWei,
        path,
        address,
        deadline,
        { value: amountInWei }
      );
      return await txSwap.wait();

    } else {
      // --- SELLING/SWAPPING (Token -> BNB or Token) ---
      const tokenIn = new Contract(tokenInAddress, ERC20_ABI, signer);
      const decimals = await tokenIn.decimals();
      const amountInWei = parseUnits(amountIn, decimals);
      
      // Check Balance
      const balance = await tokenIn.balanceOf(address);
      if (balance < amountInWei) {
          throw new Error("INSUFFICIENT_TOKEN_BALANCE");
      }

      // Check Allowance
      const allowance = await tokenIn.allowance(address, TOKEN_CONFIG.routerAddress);
      if (allowance < amountInWei) {
        // console.log("Approving...");
        const txApprove = await tokenIn.approve(TOKEN_CONFIG.routerAddress, MaxUint256);
        // Wait for approval to be mined before swapping
        await txApprove.wait();
        // console.log("Approved");
      }
      
      let txSwap;
      if (tokenOutAddress === 'BNB') {
        // Token -> BNB (Using SupportingFeeOnTransferTokens for robustness)
        txSwap = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
          amountInWei,
          amountOutMinWei,
          path,
          address,
          deadline
        );
      } else {
        // Token -> Token
        txSwap = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountInWei,
          amountOutMinWei,
          path,
          address,
          deadline
        );
      }
      return await txSwap.wait();
    }
  } catch (error) {
    console.error("Swap execution failed:", error);
    throw error;
  }
};

export const sendToken = async (
  recipientAddress: string,
  amount: string,
  tokenAddress: string,
  signer: ethers.JsonRpcSigner
) => {
  try {
    const contract = new Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountWei = parseUnits(amount, decimals);
    
    // Check balance first
    const address = await signer.getAddress();
    const balance = await contract.balanceOf(address);
    if (balance < amountWei) {
        throw new Error("Insufficient Admin Balance");
    }

    const tx = await contract.transfer(recipientAddress, amountWei);
    return await tx.wait();
  } catch (error) {
    console.error("Transfer Error:", error);
    throw error;
  }
};