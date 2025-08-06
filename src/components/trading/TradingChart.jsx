import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const intervals = [
  { label: '1 Minuto', value: '1' },
  { label: '5 Minutos', value: '5' },
  { label: '15 Minutos', value: '15' },
  { label: '1 Hora', value: '60' },
];

const TradingChart = ({ selectedPair = 'BTC/USDT', cryptoPrices = {} }) => {
  const containerRef = useRef(null);
  const [interval, setInterval] = useState('15'); // default 15min

  useEffect(() => {
    const [symbol, quote] = selectedPair.toUpperCase().split('/');
    const tvSymbol = `${symbol}${quote}`;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${tvSymbol}`,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'es',
          toolbar_bg: '#1e293b',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: 'tradingview-chart',
        });
      }
    };

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);
  }, [selectedPair, interval]);

  const currentCrypto = selectedPair?.split?.('/')[0] || 'BTC';
  const currentPriceData = cryptoPrices?.[currentCrypto];

  return (
    <Card className="crypto-card h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <CardTitle className="text-white flex items-center text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              Gráfico de {selectedPair}
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs sm:text-sm">
              Gráfico en vivo de TradingView
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            {currentPriceData && (
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  ${currentPriceData.price.toFixed(2)}
                </p>
                <p className={`text-xs sm:text-sm ${currentPriceData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentPriceData.change.toFixed(2)}% (24h)
                </p>
              </div>
            )}
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-[120px] bg-slate-700 text-white border-slate-600">
                <SelectValue placeholder="Intervalo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 text-white">
                {intervals.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-2 sm:p-4">
        <div
          id="tradingview-chart"
          ref={containerRef}
          className="w-full h-[400px] sm:h-[500px] trading-chart rounded-lg overflow-hidden"
        />
      </CardContent>
    </Card>
  );
};

export default TradingChart;
