"use client";

import { use, useEffect, useEffectEvent } from "react";
import { SolarData, MarketData } from "@/lib/types";

// Data fetching component that throws promises for Suspense
export function SolarDataFetcher({ 
  promise, 
  onData 
}: { 
  promise: Promise<SolarData>; 
  onData: (data: SolarData) => void;
}) {
  const data = use(promise);
  const handleData = useEffectEvent(onData);
  
  useEffect(() => {
    handleData(data);
  }, [data]);
  
  return null;
}

export function MarketDataFetcher({ 
  promise, 
  onData 
}: { 
  promise: Promise<MarketData>; 
  onData: (data: MarketData) => void;
}) {
  const data = use(promise);
  const handleData = useEffectEvent(onData);
  
  useEffect(() => {
    handleData(data);
  }, [data]);
  
  return null;
}
