import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import TransactionStats from '@/components/transactions/TransactionStats';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionTabs from '@/components/transactions/TransactionTabs';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const TransactionHistory = () => {
  const { user } = useAuth();
  const { getTransactions, getInvestments } = useData();

  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user) return;

    // ✅ Lógica especial para fernandosalinas2008@gmail.com
    if (user.email === 'fernandosalinas2008@gmail.com') {
      const fakeTx = Array.from({ length: 15 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i * 3);
        const type = ['deposit', 'withdrawal', 'investment'][i % 3];
        return {
          id: `tx-fake-${i}`,
          userId: user.id,
          type,
          description:
            type === 'deposit'
              ? 'Depósito bancario'
              : type === 'withdrawal'
              ? 'Retiro rápido'
              : 'Inversión auto-generada',
          amount: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
          status: 'completed',
          createdAt: date.toISOString(),
          planName: 'Plan Simulado',
          dailyReturn: 1.2
        };
      });

      const fakeInv = fakeTx
        .filter(tx => tx.type === 'investment')
        .map((tx, i) => ({
          id: `inv-fake-${i}`,
          userId: user.id,
          amount: tx.amount,
          planName: tx.planName,
          dailyReturn: tx.dailyReturn,
          duration: 30,
          createdAt: tx.createdAt,
        }));

      setTransactions(fakeTx);
      setInvestments(fakeInv);
      setFilteredTransactions(fakeTx);
    } else {
      // 🔁 Para todos los demás usuarios, comportamiento normal
      const userTransactions = getTransactions().filter(t => t.userId === user.id);
      const userInvestments = getInvestments().filter(i => i.userId === user.id);

      setTransactions(userTransactions);
      setInvestments(userInvestments);
      setFilteredTransactions(userTransactions);
    }
  }, [user, getTransactions, getInvestments]);

  useEffect(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTransactions(filtered);
  }, [transactions, filterType, filterStatus, searchTerm]);

  const exportTransactions = () => {
    const csvContent = [
      ['Fecha', 'Tipo', 'Descripción', 'Monto', 'Estado'],
      ...filteredTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.type,
        t.description || '',
        t.amount.toFixed(2),
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transacciones.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Historial de Transacciones
          </h1>
          <p className="text-slate-300">
            Revisa todas tus transacciones e inversiones
          </p>
        </motion.div>

        <TransactionStats transactions={transactions} />

        <TransactionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          exportTransactions={exportTransactions}
        />

        <TransactionTabs
          filteredTransactions={filteredTransactions}
          investments={investments}
        />
      </div>
    </Layout>
  );
};

export default TransactionHistory;
