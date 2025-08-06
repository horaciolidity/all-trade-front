import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RefreshCw } from 'lucide-react';
import { useTradingLogic } from '@/hooks/useTradingLogic';

const TradingPanel = ({
  selectedPair,
  setSelectedPair,
  tradeAmount,
  setTradeAmount,
  tradeType,
  setTradeType,
  isTrading,
  executeTrade,
  resetBalance,
  cryptoPrices,
  tradeDuration,
  setTradeDuration,
}) => {
  const currentCrypto = selectedPair.split('/')[0];
  const currentPriceData = cryptoPrices[currentCrypto];

  const { openTrades, closeTrade } = useTradingLogic();

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Play className="h-5 w-5 mr-2 text-green-400" />
          Panel de Trading
        </CardTitle>
        <CardDescription className="text-slate-300">
          Ejecuta trades virtuales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Par de Trading</Label>
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
              <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
              <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
              <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Monto ($)</Label>
          <Input
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            placeholder="Ingresa el monto"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Duración</Label>
          <Select
            value={tradeDuration.toString()}
            onValueChange={(val) => setTradeDuration(parseInt(val))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="60">1 Minuto</SelectItem>
              <SelectItem value="300">5 Minutos</SelectItem>
              <SelectItem value="900">15 Minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentPriceData && (
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Precio Actual:</span>
              <span className="text-white font-semibold">
                ${currentPriceData.price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cambio 24h:</span>
              <span
                className={`font-semibold ${
                  currentPriceData.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {currentPriceData.change.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => {
              setTradeType('buy');
              executeTrade();
            }}
            disabled={isTrading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isTrading && tradeType === 'buy' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2 transform rotate-90" />
            )}
            COMPRA
          </Button>
          <Button
            onClick={() => {
              setTradeType('sell');
              executeTrade();
            }}
            disabled={isTrading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isTrading && tradeType === 'sell' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2 transform -rotate-90" />
            )}
            VENTA
          </Button>
        </div>

        <Button
          onClick={resetBalance}
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Reiniciar Saldo Virtual
        </Button>

        {/* ✅ Mostrar operaciones abiertas en tiempo real */}
        {openTrades.length > 0 && (
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-white text-md font-bold mb-2">Operaciones Abiertas</h3>
            {openTrades.map((trade) => (
              <div
                key={trade.id}
                className="p-3 mb-2 rounded-lg bg-slate-800 border border-slate-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">
                      {trade.pair} ({trade.type.toUpperCase()})
                    </div>
                    <div className="text-sm text-slate-400">
                      Entrada: ${trade.priceAtExecution.toFixed(2)} | Actual:{' '}
                      ${trade.currentPrice?.toFixed(2) || '...'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        trade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {trade.profit >= 0 ? '+' : ''}
                      {trade.profit.toFixed(2)} USDT
                    </div>
                    <button
                      onClick={() => closeTrade(trade.id, true)}
                      className="text-xs text-blue-400 hover:underline mt-1"
                    >
                      Cerrar ahora
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingPanel;
