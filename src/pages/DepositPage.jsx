// pages/deposit.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { useSound } from '@/contexts/SoundContext';

const DepositPage = () => {
  const { user, updateUser } = useAuth();
  const { addTransaction } = useData();
  const { playSound } = useSound();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [action, setAction] = useState('deposit');

  const cryptoAddress = '0xBAeaDE80A2A1064E4F8f372cd2ADA9a00daB4BBE';

  const handleCopy = () => {
    playSound('click');
    navigator.clipboard.writeText(cryptoAddress);
    toast({ title: 'Copiado', description: 'Dirección copiada al portapapeles' });
  };

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      toast({ title: 'Error', description: 'Ingresa un monto válido.', variant: 'destructive' });
      return;
    }

    updateUser({ balance: user.balance + depositAmount });
    addTransaction({
      userId: user.id,
      type: 'deposit',
      amount: depositAmount,
      currency,
      description: `Depósito manual de ${currency}`,
      status: 'completed',
    });

    playSound('success');
    toast({ title: 'Depósito simulado', description: `+${depositAmount} ${currency}` });
    setAmount('');
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({ title: 'Error', description: 'Ingresa un monto válido.', variant: 'destructive' });
      return;
    }

    if (withdrawAmount > user[currency.toLowerCase()]) {
      toast({ title: 'Fondos insuficientes', description: `No tienes suficiente saldo en ${currency}` });
      return;
    }

    if (user.eth < 0.21) {
      toast({ title: 'ETH insuficiente', description: 'Necesitas al menos 0.21 ETH para cubrir el fee de retiro' });
      return;
    }

    updateUser({ [currency.toLowerCase()]: user[currency.toLowerCase()] - withdrawAmount, eth: user.eth - 0.21 });

    addTransaction({
      userId: user.id,
      type: 'withdrawal',
      amount: withdrawAmount,
      currency,
      description: `Retiro solicitado de ${currency}`,
      status: 'pending',
    });

    playSound('success');
    toast({ title: 'Retiro solicitado', description: `-${withdrawAmount} ${currency}` });
    setAmount('');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Depositar / Retirar</h1>
          <p className="text-slate-300">Puedes recargar saldo o retirar tus fondos fácilmente.</p>
        </motion.div>

        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-400" />
              Operaciones con tu saldo
            </CardTitle>
            <CardDescription className="text-slate-300">Elige si deseas depositar o retirar fondos.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="deposit" onValueChange={setAction} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="deposit" className="text-white">Depositar</TabsTrigger>
                <TabsTrigger value="withdraw" className="text-white">Retirar</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="mt-6">
                <Label className="text-white">Dirección de depósito (ERC20)</Label>
                <div className="flex items-center gap-2">
                  <Input value={cryptoAddress} readOnly className="text-white bg-slate-800 border-slate-600" />
                  <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
                </div>
              </TabsContent>

              <TabsContent value="withdraw" className="mt-6">
                <p className="text-slate-400 text-sm">
                  Requiere mínimo <span className="text-yellow-300 font-medium">0.21 ETH</span> para comisiones.
                </p>
              </TabsContent>
            </Tabs>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Criptomoneda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-slate-800 text-white border-slate-600">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white">
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Monto</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <Button onClick={action === 'deposit' ? handleDeposit : handleWithdraw} className="w-full mt-4">
              {action === 'deposit' ? 'Notificar Depósito' : 'Solicitar Retiro'}
            </Button>

            <div className="text-sm text-slate-400 text-center mt-2">
              Tu saldo actual: <strong>{user.usdc?.toFixed(2) || 0} USDC</strong> y <strong>{user.eth?.toFixed(6) || 0} ETH</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DepositPage;
