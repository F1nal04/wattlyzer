"use client";

import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export default function Settings() {
  const [azimutValue, setAzimutValue] = useState(180);
  const [angleValue, setAngleValue] = useState(45);
  const [kwhValue, setKwhValue] = useState(5);

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-800 to-yellow-800 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto bg-gray-900/50 rounded-lg p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-sans">
          Settings
        </h1>

        <div className="space-y-8 text-gray-300">
          {/* Azimut Slider */}
          <section>
            <div className="flex items-start gap-6">
              <div className="flex-1 text-sm text-gray-400 pt-2">
                <p>The compass direction your solar panels face (0° = North, 180° = South)</p>
              </div>
              <div className="flex-1 text-center">
                <label
                  htmlFor="azimut-slider"
                  className="block text-2xl font-semibold text-white mb-4"
                >
                  Azimut: {azimutValue}°
                </label>
              <Slider
                id="azimut-slider"
                min={0}
                max={360}
                defaultValue={[180]}
                onValueChange={(value) => setAzimutValue(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-300 mt-2">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
              </div>
            </div>
          </section>

          {/* Angle Slider */}
          <section>
            <div className="flex items-start gap-6">
              <div className="flex-1 text-sm text-gray-400 pt-2">
                <p>The tilt angle of your solar panels from horizontal (0° = flat, 90° = vertical)</p>
              </div>
              <div className="flex-1 text-center">
                <label
                  htmlFor="angle-slider"
                  className="block text-2xl font-semibold text-white mb-4"
                >
                  Angle: {angleValue}°
                </label>
              <Slider
                id="angle-slider"
                min={0}
                max={90}
                defaultValue={[45]}
                onValueChange={(value) => setAngleValue(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-300 mt-2">
                <span>0°</span>
                <span>22.5°</span>
                <span>45°</span>
                <span>67.5°</span>
                <span>90°</span>
              </div>
              </div>
            </div>
          </section>

          {/* kWh Slider */}
          <section>
            <div className="flex items-start gap-6">
              <div className="flex-1 text-sm text-gray-400 pt-2">
                <p>Your total solar panel system capacity in kilowatts</p>
              </div>
              <div className="flex-1 text-center">
                <label
                  htmlFor="kwh-slider"
                  className="block text-2xl font-semibold text-white mb-4"
                >
                  kWh: {kwhValue}
                </label>
              <Slider
                id="kwh-slider"
                min={1}
                max={10}
                defaultValue={[5]}
                onValueChange={(value) => setKwhValue(value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-300 mt-2">
                <span>1</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>10</span>
              </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
          >
            ← Back to Wattlyzer
          </Link>
        </div>
      </div>
    </div>
  );
}
