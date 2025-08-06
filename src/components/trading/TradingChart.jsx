import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const TradingChart = ({ priceHistory, selectedPair = 'BTC/USDT', cryptoPrices = {} }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

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
          { time: Date.now() - 30000, value: 100 },
          { time: Date.now() - 20000, value: 102 },
          { time: Date.now() - 10000, value: 101 },
          { time: Date.now(), value: 103 }
        ]; // mock de respaldo

    if (seriesRef.current) {
      const sorted = [...validData].sort((a, b) => a.time - b.time);

      const candlestickData = sorted.map((data, index) => {
        const prev = sorted[index - 1] || data;
        return {
          time: Math.floor(data.time / 1000),
          open: prev.value,
          high: Math.max(prev.value, data.value),
          low: Math.min(prev.value, data.value),
          close: data.value,
        };
      });

      seriesRef.current.setData(candlestickData);
      chartRef.current.timeScale().fitContent();
    }
  }, [priceHistory]);

  const currentCrypto = selectedPair?.split?.('/')[0] || 'BTC';
  const currentPriceData = cryptoPrices?.[currentCrypto];

  return (
    <Card className="crypto-card h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              Gráfico de {selectedPair}
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs sm:text-sm">
              Visualiza el precio en tiempo real
            </CardDescription>
          </div>
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
