"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useSettings } from "@/lib/settings-context";

export default function Home() {
  const { settings } = useSettings();
  const [sliderValue, setSliderValue] = useState(3);
  const [displayText, setDisplayText] = useState("");
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<{
    result: Record<string, number>;
    message: {
      code: number;
      type: string;
      text: string;
      pid: string;
      info: {
        latitude: number;
        longitude: number;
        distance: number;
        place: string;
        timezone: string;
        time: string;
        time_utc: string;
      };
      ratelimit: {
        zone: string;
        period: number;
        limit: number;
        remaining: number;
      };
    };
  } | null>(null);
  const [marketData, setMarketData] = useState<{
    object: string;
    data: Array<{
      start_timestamp: number;
      end_timestamp: number;
      marketprice: number;
      unit: string;
    }>;
    url: string;
  } | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const fullText = "wattlyzer";

  const calculatePowerGeneration = (hoursFromNow: number) => {
    if (!solarData) return 0;
    
    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    
    // Find the closest timestamp in the solar data
    const timestamps = Object.keys(solarData.result);
    const currentClosestTimestamp = timestamps.reduce((closest, current) => {
      const currentDiff = Math.abs(new Date(current).getTime() - now.getTime());
      const closestDiff = Math.abs(new Date(closest).getTime() - now.getTime());
      return currentDiff < closestDiff ? current : closest;
    });
    
    const targetClosestTimestamp = timestamps.reduce((closest, current) => {
      const currentDiff = Math.abs(new Date(current).getTime() - targetTime.getTime());
      const closestDiff = Math.abs(new Date(closest).getTime() - targetTime.getTime());
      return currentDiff < closestDiff ? current : closest;
    });
    
    // Since solar data is cumulative, calculate the difference
    const currentValue = solarData.result[currentClosestTimestamp] || 0;
    const targetValue = solarData.result[targetClosestTimestamp] || 0;
    
    return Math.max(0, targetValue - currentValue);
  };

  const calculateMarketPrice = (hoursFromNow: number) => {
    if (!marketData) return 0;
    
    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    const targetTimestamp = targetTime.getTime();
    
    // Find the market price data that contains the target time
    const priceData = marketData.data.find(item => 
      targetTimestamp >= item.start_timestamp && targetTimestamp < item.end_timestamp
    );
    
    return priceData ? priceData.marketprice : 0;
  };

  const calculateEarnings = (hoursFromNow: number) => {
    const watthours = calculatePowerGeneration(hoursFromNow);
    const marketPrice = calculateMarketPrice(hoursFromNow);
    
    // Convert watthours to MWh (divide by 1,000,000) and multiply by market price
    return (watthours / 1000000) * marketPrice;
  };

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (position && settings) {
      const fetchSolarData = async () => {
        setApiLoading(true);
        setApiError(null);
        
        try {
          const { latitude, longitude } = position;
          const { angle, azimut, kwh } = settings;
          
          const url = `https://api.forecast.solar/estimate/watthours/${latitude}/${longitude}/${angle}/${azimut}/${kwh}`;
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          setSolarData(data);
        } catch (error) {
          setApiError(error instanceof Error ? error.message : 'Failed to fetch solar data');
        } finally {
          setApiLoading(false);
        }
      };

      const fetchMarketData = async () => {
        try {
          const response = await fetch('https://api.awattar.de/v1/marketdata');
          if (!response.ok) {
            throw new Error(`Market API error: ${response.status}`);
          }
          
          const data = await response.json();
          setMarketData(data);
        } catch (error) {
          setApiError(error instanceof Error ? error.message : 'Failed to fetch market data');
        }
      };

      fetchSolarData();
      fetchMarketData();
    }
  }, [position, settings]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location access denied by user");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information unavailable");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out");
              break;
            default:
              setLocationError("Unknown location error");
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      setLocationError("Geolocation not supported by browser");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-800 to-yellow-700 flex flex-col items-center justify-center px-4">
      {/* Title with typewriter effect */}
      <div className="mb-16">
        <h1 className="text-6xl md:text-8xl font-bold text-white text-center font-sans">
          {displayText}
          <span className="cursor-blink">|</span>
        </h1>
      </div>

      {/* Hours slider section */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <label
            htmlFor="hours-slider"
            className="block text-2xl font-semibold text-white mb-4"
          >
            hours: {sliderValue}
          </label>
          <Slider
            id="hours-slider"
            min={1}
            max={5}
            defaultValue={[3]}
            onValueChange={(value) => setSliderValue(value[0])}
          />
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Big calculated number */}
        <div className="text-center">
          <div className="text-8xl md:text-9xl font-bold text-yellow-400 font-sans">
            {apiLoading ? "..." : `€${calculateEarnings(sliderValue).toFixed(3)}`}
          </div>
          <div className="text-xl text-gray-300 mt-2">
            {apiLoading ? "Loading..." : `earnings in ${sliderValue} hours`}
          </div>
          <div className="text-sm text-gray-400 mt-2 space-y-1">
            <div>{calculatePowerGeneration(sliderValue)} Wh</div>
            <div>{calculateMarketPrice(sliderValue).toFixed(2)} €/MWh</div>
          </div>
          {apiError && (
            <div className="text-red-400 text-sm mt-2">
              Error: {apiError}
            </div>
          )}
        </div>
      </div>

      {/* Footer links */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-6">
        <a
          href="https://github.com/F1nal04/wattlyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          GitHub
        </a>
        <a
          href="/legal"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Legal Notice
        </a>
        <a
          href="/settings"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Settings
        </a>
      </div>
    </div>
  );
}
