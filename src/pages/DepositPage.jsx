import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Copy, QrCode, CreditCard, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { useSound } from '@/contexts/SoundContext';

const DepositPage = () => {
  const { user, updateUser } = useAuth();
  const { addTransaction } = useData();
  const { playSound } = useSound();
  const [depositMethod, setDepositMethod] = useState('crypto');
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');
  const [fiatMethod, setFiatMethod] = useState('alias');
  const [amount, setAmount] = useState('');

  const cryptoAddress = '0xBAeaDE80A2A1064E4F8f372cd2ADA9a00daB4BBE';

  const fiatAliases = {
    ARS: 'ALIAS.CRYPTOINVEST.ARS',
    BRL: 'ALIAS.CRYPTOINVEST.BRL',
    COP: 'ALIAS.CRYPTOINVEST.COP',
    MXN: 'ALIAS.CRYPTOINVEST.MXN',
  };

  const handleCopy = (text) => {
    playSound('click');
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: `${text} copiado al portapapeles.` });
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      playSound('error');
      toast({ title: "Error", description: "Ingresa un monto válido.", variant: "destructive" });
      return;
    }

    const depositAmount = parseFloat(amount);

    addTransaction({
      userId: user.id,
      type: 'deposit',
      amount: depositAmount,
      currency: depositMethod === 'crypto' ? cryptoCurrency : 'USD',
      description: `Depósito vía ${depositMethod === 'crypto' ? cryptoCurrency : fiatMethod}`,
      status: 'pending'
    });

    playSound('success');
    toast({ title: "Solicitud de Depósito Enviada", description: `Tu solicitud de depósito de ${depositAmount} está pendiente de confirmación.` });
    setAmount('');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Realizar Depósito</h1>
          <p className="text-slate-300">Recarga tu saldo o retira tus fondos.</p>
        </motion.div>

        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-400" />
              Selecciona Acción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="crypto" onValueChange={setDepositMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="crypto" className="text-white">Depositar</TabsTrigger>
                <TabsTrigger value="fiat" className="text-white">Retirar</TabsTrigger>
              </TabsList>

              <TabsContent value="crypto" className="mt-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Depositar con Criptomonedas</CardTitle>
                    <CardDescription className="text-slate-300">Envía cualquier cripto a la dirección indicada.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Dirección de Depósito</Label>
                      <div className="flex items-center space-x-2">
                        <Input readOnly value={cryptoAddress} className="bg-slate-700 border-slate-600 text-slate-300" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(cryptoAddress)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-white">Monto del Depósito (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ej: 100"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <Button onClick={handleDeposit} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      Notificar Depósito
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fiat" className="mt-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Solicitar Retiro</CardTitle>
                    <CardDescription className="text-slate-300">Puedes retirar saldo a tu cuenta registrada.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Label htmlFor="amount" className="text-white">Monto a Retirar (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ej: 50"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <Button onClick={() => {
                      const withdrawAmount = parseFloat(amount);
                      if (!withdrawAmount || withdrawAmount <= 0) {
                        toast({ title: "Error", description: "Monto inválido.", variant: "destructive" });
                        return;
                      }
                      if (withdrawAmount > user.balance) {
                        toast({ title: "Fondos insuficientes", description: "No tienes saldo suficiente." });
                        return;
                      }
                      addTransaction({
                        userId: user.id,
                        type: 'withdrawal',
                        amount: withdrawAmount,
                        currency: 'USD',
                        description: `Retiro solicitado`,
                        status: 'pending'
                      });
                      updateUser({ balance: user.balance - withdrawAmount });
                      playSound('success');
                      toast({ title: "Retiro Solicitado", description: `Tu retiro de ${withdrawAmount} USD será procesado.` });
                      setAmount('');
                    }} className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600">
                      Solicitar Retiro
                    </Button>
                    <p className="text-xs text-center text-yellow-300">Se cobrará una comisión del 6%. El retiro será procesado manualmente.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DepositPage;
