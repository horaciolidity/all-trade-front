import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const intervals = [
  { label: '1 Minuto', value: '1' },
  { label: '5 Minutos', value: '5' },
  { label: '15 Minutos', value: '15' },
  { label: '1 Hora', value: '60' },
];

// 🔧 Agrupa datos de priceHistory en velas por intervalo
function groupCandles(data, intervalMinutes = 15) {
  const intervalMs = intervalMinutes * 60 * 1000;
  const buckets = new Map();

  data.forEach((point) => {
    const bucketTime = Math.floor(point.time / intervalMs) * intervalMs;
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime).push(point);
  });

  const candles = [];

  for (const [bucketTime, points] of buckets.entries()) {
    const open = points[0].value;
    const close = points[points.length - 1].value;
    const high = Math.max(...points.map(p => p.value));
    const low = Math.min(...points.map(p => p.value));

    candles.push({
      time: Math.floor(bucketTime / 1000),
      open,
      high,
      low,
      close
    });
  }

  return candles.sort((a, b) => a.time - b.time);
}

const TradingChart = ({ priceHistory, selectedPair = 'BTC/USDT', cryptoPrices = {} }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [interval, setInterval] = useState('15'); // 15 minutos por defecto

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth || 400,
        height: chartContainerRef.current.clientHeight || 400,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#D1D5DB',
        },
        grid: {
          vertLines: { color: 'rgba(71, 85, 105, 0.5)' },
          horzLines: { color: 'rgba(71, 85, 105, 0.5)' },
        },
        timeScale: {
          borderColor: '#4B5563',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: { mode: 0 },
      });

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });
    }

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const validData = Array.isArray(priceHistory) && priceHistory.length > 0
      ? priceHistory
      : [
          { time: Date.now() - 3600000, value: 100 },
          { time: Date.now() - 3000000, value: 102 },
          { time: Date.now() - 1800000, value: 98 },
          { time: Date.now() - 600000, value: 103 },
          { time: Date.now(), value: 101 }
        ];

    if (seriesRef.current) {
      const candles = groupCandles(validData, parseInt(interval));
      seriesRef.current.setData(candles);
      chartRef.current.timeScale().fitContent();
    }
  }, [priceHistory, interval]);

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
              Visualiza el precio en tiempo real
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
          ref={chartContainerRef}
          className="w-full h-[400px] sm:h-[500px] trading-chart rounded-lg"
        />
      </CardContent>
    </Card>
  );
};

export default TradingChart;
