"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

export default function Home() {
  const [sliderValue, setSliderValue] = useState(3);
  const [displayText, setDisplayText] = useState("");
  const fullText = "wattlyzer";

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

  const calculateValue = (value: number) => {
    return value * 300;
  };

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
            max={6}
            defaultValue={[3]}
            onValueChange={(value) => setSliderValue(value[0])}
          />
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>
        </div>

        {/* Big calculated number */}
        <div className="text-center">
          <div className="text-8xl md:text-9xl font-bold text-yellow-400 font-sans">
            {calculateValue(sliderValue)}
          </div>
          <div className="text-xl text-gray-300 mt-2">hours from now on</div>
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
      </div>
    </div>
  );
}
