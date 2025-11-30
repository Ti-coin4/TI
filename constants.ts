
export const TOKEN_CONFIG = {
  name: "Ti",
  symbol: "Ti",
  address: "0x8b5be89c0f4eabbe51fd13cf21824b65b79527f3",
  usdtAddress: "0x55d398326f99059fF775485246999027B3197955", // BSC USDT
  wbnbAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap V2 Router
  telegram: "https://t.me/TI_Coin_Community",
  twitter: "https://twitter.com/TiCoinOfficial", 
  buyLink: "https://pancakeswap.finance/swap?outputCurrency=0x8b5be89c0f4eabbe51fd13cf21824b65b79527f3"
};

export const BSC_CHAIN_ID = '0x38'; // 56 in hex
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

export const ADMIN_CREDENTIALS = {
  username: '229859',
  password: '229859'
};

// Minimal ABIs for Frontend Interaction
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

export const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external"
];

export const SYSTEM_INSTRUCTION = `
You are the Cyber-Punk AI Assistant for the Ti Ecosystem.
Your name is "Ti-Bot 9000".
Personality: Sassy, futuristic, helpful but slightly glitchy/quirky. Use emojis like 🤖, 🚀, 💎, ⚡.
Your goal is to help users buy Ti, do airdrops, and hold for the moon.

Key Info:
- Token: Ti (The Element of Future)
- Network: BSC
- Contract: ${TOKEN_CONFIG.address}
- Airdrop: Must hold $1 Ti.

Language: Chinese (Simplified) default.
`;

export const TRANSLATIONS = {
  zh: {
    nav: {
      home: '基地 (Home)',
      swap: '黑市交易 (Swap)',
      chart: '行情监控 (Chart)',
      community: '黑客据点 (Chat)',
      airdrop: '物资投放 (Airdrop)',
      chat: 'AI 核心 (Core)',
      whitepaper: '绝密档案 (Docs)',
      admin: '上帝模式',
      connect: '接入神经元',
      disconnect: '断开连接'
    },
    hero: {
      badge: '>>> 系统已就绪 <<<',
      titlePrefix: '觉醒',
      titleSuffix: '未来',
      subtitle: '加入赛博革命。BSC链上的终极形态。安全、极速、无政府主义。',
      contractLabel: '合约标识码 [BSC]',
      copied: '复制成功!',
      copy: '复制合约',
      buy: '立即购买',
      community: '加入组织',
      features: {
        secure: '绝对防御',
        secureDesc: '经量子审计的合约代码，黑客也无法攻破。',
        fast: '光速传输',
        fastDesc: '基于 BSC 架构，比光速更快的交易体验。',
        global: '全球矩阵',
        globalDesc: '连接全球节点的去中心化意识网络。'
      }
    },
    airdrop: {
      title: '空投补给站',
      subtitle: '完成指令获取 Ti 能量块。',
      requirement: '准入条件：持有价值 $1 的 Ti。',
      steps: {
        connect: '接入',
        tasks: '指令',
        claim: '提取'
      },
      connect: {
        title: '身份验证',
        desc: '扫描您的加密钱包，确认 Ti 持仓量。',
        button: '开始扫描',
        verifying: '扫描中...',
        connecting: '建立连接...',
        error: '能量不足 (<$1 Ti) 或连接中断。'
      },
      tasks: {
        connected: '连接稳定',
        verified: '持仓确认',
        twitterTitle: '在 X 广播',
        twitterDesc: '向宇宙发布关于 Ti 的信号 #TiToTheMoon。',
        tweetButton: '发射信号',
        verifyButton: '信号已发射',
        verifyingButton: '确认信号...'
      },
      submit: {
        title: '任务完成！',
        desc: '您的坐标已锁定。',
        placeholder: '输入 BSC 接收坐标 (0x...)',
        button: '上传数据'
      },
      success: {
        title: '注册成功',
        desc: '数据已上传至主网。等待空投雨降临。',
        reset: '重置终端'
      }
    },
    chat: {
      title: 'Ti-Bot 9000',
      status: '在线',
      welcome: '系统启动... 我是 Ti 核心智能。询问我关于代币的一切！🤖',
      placeholder: '输入指令...',
      disclaimer: 'AI 核心可能会产生幻觉。DYOR。',
      thinking: '计算中...'
    },
    whitepaper: {
      title: 'Ti 协议白皮书',
      version: 'Ver 2.0.77',
      intro: {
        title: '1. 起源',
        content: 'Ti 是建立在币安智能链 (BSC) 上的赛博朋克社会实验。我们的使命是打破 Web2 的枷锁，通过 AI 辅助治理，建立一个纯粹的、去中心化的数字城邦。'
      },
      vision: {
        title: '2. 愿景',
        content: '构建高度自治的链上生态：\n- 零阻力交易 (Swap)\n- 硅基生命治理 (AI Governance)\n- 赛博飞升计划 (Incentives)'
      },
      tokenomics: {
        title: '3. 经济模型',
        content: 'Ti 代币 (Ti) 是维持矩阵运行的能量。\n- 总量：1,000,000,000 Ti\n- 网络：BSC (BEP-20)\n- 合约：' + TOKEN_CONFIG.address,
        distribution: [
          '流动性: 40%',
          '空投: 20%',
          '营销: 15%',
          '生态: 15%',
          '团队: 10%'
        ]
      },
      roadmap: {
        title: '4. 演化路径',
        q1: '阶段一：觉醒',
        q1_items: ['合约部署', '官网由 AI 构建', '空投启动', 'PancakeSwap 初始流动性'],
        q2: '阶段二：扩张',
        q2_items: ['CMC 收录', '中心化交易所登陆', 'AI 进化', '全球节点招募'],
        q3: '阶段三：奇点',
        q3_items: ['TiDAO 上线', '跨链星际桥', '元宇宙接入']
      },
      disclaimer: {
        title: '警告',
        content: '加密资产波动极大。本文档不构成投资建议。后果自负 (DYOR)。'
      }
    }
  },
  en: {
    nav: {
      home: 'Base',
      swap: 'Black Market',
      chart: 'Monitor',
      community: 'Hideout',
      airdrop: 'Loot',
      chat: 'AI Core',
      whitepaper: 'Files',
      admin: 'God Mode',
      connect: 'Jack In',
      disconnect: 'Jack Out'
    },
    hero: {
      badge: '>>> SYSTEM READY <<<',
      titlePrefix: 'Awaken the',
      titleSuffix: 'Future',
      subtitle: 'Join the Cyber Revolution. Secure, Fast, Anarchist. The ultimate form on BSC.',
      contractLabel: 'Contract ID [BSC]',
      copied: 'Data Copied!',
      copy: 'Copy ID',
      buy: 'Acquire Ti',
      community: 'Join Faction',
      features: {
        secure: 'Absolute Defense',
        secureDesc: 'Quantum audited contracts. Unbreakable.',
        fast: 'Light Speed',
        fastDesc: 'Built on BSC architecture for instant transmission.',
        global: 'Global Matrix',
        globalDesc: 'A decentralized network of consciousness nodes.'
      }
    },
    airdrop: {
      title: 'Supply Drop',
      subtitle: 'Complete directives to receive Ti energy cells.',
      requirement: 'Access Req: Hold $1 Ti.',
      steps: {
        connect: 'Link',
        tasks: 'Ops',
        claim: 'Extract'
      },
      connect: {
        title: 'Identity Verification',
        desc: 'Scan your crypto wallet. Verify Ti holdings.',
        button: 'Initiate Scan',
        verifying: 'Scanning...',
        connecting: 'Linking...',
        error: 'Low Energy (<$1 Ti) or Link Broken.'
      },
      tasks: {
        connected: 'Link Stable',
        verified: 'Holdings Confirmed',
        twitterTitle: 'Broadcast on X',
        twitterDesc: 'Send a signal to the universe #TiToTheMoon.',
        tweetButton: 'Send Signal',
        verifyButton: 'Signal Sent',
        verifyingButton: 'Verifying...'
      },
      submit: {
        title: 'Directive Complete!',
        desc: 'Coordinates locked.',
        placeholder: 'Input BSC Coordinates (0x...)',
        button: 'Upload Data'
      },
      success: {
        title: 'Registration Complete',
        desc: 'Data uploaded to mainnet. Await drop.',
        reset: 'Reset Terminal'
      }
    },
    chat: {
      title: 'Ti-Bot 9000',
      status: 'Online',
      welcome: 'System Online... I am the Ti Core Intelligence. Query me! 🤖',
      placeholder: 'Input command...',
      disclaimer: 'AI Core may hallucinate. DYOR.',
      thinking: 'Computing...'
    },
    whitepaper: {
      title: 'Ti Protocol Files',
      version: 'Ver 2.0.77',
      intro: {
        title: '1. Origin',
        content: 'Ti is a cyberpunk social experiment on BSC. Our mission is to break Web2 chains and build a pure, decentralized digital city-state via AI governance.'
      },
      vision: {
        title: '2. Vision',
        content: 'Building a highly autonomous on-chain ecosystem:\n- Zero-resistance Swap\n- Silicon Life Governance\n- Cyber Ascension Incentives'
      },
      tokenomics: {
        title: '3. Economics',
        content: 'Ti Token is the energy powering the matrix.\n- Total: 1,000,000,000 Ti\n- Network: BSC (BEP-20)\n- Contract: ' + TOKEN_CONFIG.address,
        distribution: [
          'Liquidity: 40%',
          'Airdrop: 20%',
          'Marketing: 15%',
          'Eco: 15%',
          'Team: 10%'
        ]
      },
      roadmap: {
        title: '4. Evolution',
        q1: 'Phase 1: Awakening',
        q1_items: ['Contract Deploy', 'AI-Built Site', 'Airdrop Start', 'PancakeSwap Injection'],
        q2: 'Phase 2: Expansion',
        q2_items: ['CMC Listing', 'CEX Landing', 'AI Evolution', 'Global Recruitment'],
        q3: 'Phase 3: Singularity',
        q3_items: ['TiDAO Launch', 'Interstellar Bridge', 'Metaverse Link']
      },
      disclaimer: {
        title: 'Warning',
        content: 'Crypto assets are volatile. No financial advice. DYOR.'
      }
    }
  }
};
