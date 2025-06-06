"use client";

import { use, useEffect } from "react";
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
  
  useEffect(() => {
    onData(data);
  }, [data, onData]);
  
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
  
  useEffect(() => {
    onData(data);
  }, [data, onData]);
  
  return null;
}