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
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,binancecoin,cardano&vs_currencies=usd');
        const data = await res.json();
        setCryptoPrices({
          BTC: { price: data.bitcoin.usd, change: 0, history: [] },
          ETH: { price: data.ethereum.usd, change: 0, history: [] },
          USDT: { price: data['usd-coin'].usd, change: 0, history: [] },
          BNB: { price: data.binancecoin.usd, change: 0, history: [] },
          ADA: { price: data.cardano.usd, change: 0, history: [] }
        });
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
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
      duration: 30,
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
    return JSON.parse(localStorage.getItem('cryptoinvest_transactions') || '[]');
  };

  const addTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    localStorage.setItem('cryptoinvest_transactions', JSON.stringify(transactions));
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
