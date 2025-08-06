import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const [cryptoPrices, setCryptoPrices] = useState({});

useEffect(() => {
  // 1. Petición inicial a CoinGecko
  const fetchInitialPrices = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,binancecoin,cardano&vs_currencies=usd'
      );
      const data = await res.json();

      // Seteamos los precios base
      setCryptoPrices({
        BTC: { price: data.bitcoin.usd, change: 0, history: [data.bitcoin.usd] },
        ETH: { price: data.ethereum.usd, change: 0, history: [data.ethereum.usd] },
        USDT: { price: data['usd-coin'].usd, change: 0, history: [data['usd-coin'].usd] },
        BNB: { price: data.binancecoin.usd, change: 0, history: [data.binancecoin.usd] },
        ADA: { price: data.cardano.usd, change: 0, history: [data.cardano.usd] },
      });
    } catch (error) {
      console.error('Error fetching initial prices:', error);
    }
  };

  fetchInitialPrices();

  // 2. Fluctuar con base en el precio actual (no volver a llamar a la API)
  const interval = setInterval(() => {
    setCryptoPrices((prev) => {
      const fluctuate = (price) => {
        const fluctuation = (Math.random() - 0.5) * 0.04 * price; // ±2%
        return price + fluctuation;
      };

      return {
        BTC: {
          price: fluctuate(prev.BTC.price),
          change: 0,
          history: [...(prev.BTC.history || []), prev.BTC.price].slice(-100),
        },
        ETH: {
          price: fluctuate(prev.ETH.price),
          change: 0,
          history: [...(prev.ETH.history || []), prev.ETH.price].slice(-100),
        },
        USDT: {
          price: 1,
          change: 0,
          history: [...(prev.USDT.history || []), 1].slice(-100),
        },
        BNB: {
          price: fluctuate(prev.BNB.price),
          change: 0,
          history: [...(prev.BNB.history || []), prev.BNB.price].slice(-100),
        },
        ADA: {
          price: fluctuate(prev.ADA.price),
          change: 0,
          history: [...(prev.ADA.history || []), prev.ADA.price].slice(-100),
        },
      };
    });
  }, 1000); // cada 1 segundo

  return () => clearInterval(interval);
}, []);




  const [investmentPlans] = useState([
    {
      id: 1,
      name: 'Plan Básico',
      minAmount: 100,
      maxAmount: 999,
      dailyReturn: 1.5,
      duration: 30,
      description: 'Perfecto para principiantes'
    },
    {
      id: 2,
      name: 'Plan Estándar',
      minAmount: 1000,
      maxAmount: 4999,
      dailyReturn: 2.0,
      duration: 30,
      description: 'Para inversores intermedios'
    },
    {
      id: 3,
      name: 'Plan Premium',
      minAmount: 5000,
      maxAmount: 19999,
      dailyReturn: 2.5,
      duration: 30,
      description: 'Para inversores avanzados'
    },
    {
      id: 4,
      name: 'Plan VIP',
      minAmount: 20000,
      maxAmount: 100000,
      dailyReturn: 3.0,
      description: 'Para grandes inversores'
    }
  ]);

  const getInvestments = () => {
    return JSON.parse(localStorage.getItem('cryptoinvest_investments') || '[]');
  };

  const addInvestment = (investment) => {
    const investments = getInvestments();
    const newInvestment = {
      id: Date.now().toString(),
      ...investment,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    investments.push(newInvestment);
    localStorage.setItem('cryptoinvest_investments', JSON.stringify(investments));
    return newInvestment;
  };

  const getTransactions = () => {
    const transactions = JSON.parse(localStorage.getItem('cryptoinvest_transactions') || '[]');
    const user = JSON.parse(localStorage.getItem('cryptoinvest_current_user'));

    if (user?.email === 'fernandosalinas2008@gmail.com') {
      const hasFakeTx = transactions.some(tx => tx.description?.includes('Simulado'));
      if (!hasFakeTx) {
        const simulated = [
          { id: 'sim1', userId: user.id, type: 'deposit', amount: 3000, currency: 'USDC', description: 'Depósito Simulado', createdAt: '2025-08-01T10:00:00Z' },
          { id: 'sim2', userId: user.id, type: 'investment', amount: 1000, currency: 'USDC', description: 'Inversión Simulada', createdAt: '2025-08-03T14:00:00Z' },
          { id: 'sim3', userId: user.id, type: 'gain', amount: 50, currency: 'USDC', description: 'Ganancia Diaria', createdAt: '2025-08-04T08:30:00Z' },
          { id: 'sim4', userId: user.id, type: 'withdrawal', amount: 200, currency: 'USDC', description: 'Retiro Simulado', createdAt: '2025-08-06T16:45:00Z' },
          { id: 'sim5', userId: user.id, type: 'eth_fee', amount: 0.000001, currency: 'ETH', description: 'Saldo Inicial ETH', createdAt: '2025-08-01T00:00:00Z' },
        ];

        const updated = [...transactions, ...simulated];
        localStorage.setItem('cryptoinvest_transactions', JSON.stringify(updated));
        return updated;
      }
    }

    return transactions;
  };

  const addTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      createdAt: new Date().toISOString()
    };
    const updated = [...transactions, newTransaction];
    localStorage.setItem('cryptoinvest_transactions', JSON.stringify(updated));
    return newTransaction;
  };

  const getReferrals = (userId) => {
    const users = JSON.parse(localStorage.getItem('cryptoinvest_users') || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) return [];

    return users.filter(u => u.referredBy === user.referralCode);
  };

  const value = {
    cryptoPrices,
    investmentPlans,
    getInvestments,
    addInvestment,
    getTransactions,
    addTransaction,
    getReferrals
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
