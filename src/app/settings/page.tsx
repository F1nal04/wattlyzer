"use client";

import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/settings-context";
import { clearCache } from "@/lib/cache";
import { useState } from "react";

/**
 * Renders the settings page for configuring solar panel parameters and application preferences.
 *
 * Provides interactive controls for adjusting azimut, tilt angle, system capacity, minimum kWh requirement, and morning shading compensation. Includes a button to clear cached data and displays feedback when the cache is cleared. The UI adapts based on selected options, such as showing additional controls when morning shading is enabled.
 *
 * @returns The React element representing the settings page UI.
 */
export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    clearCache();
    setCacheCleared(true);
    // Reset the message after 3 seconds
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-800 to-yellow-800 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl mx-auto bg-gray-900/50 rounded-lg p-6 md:p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-sans">
          Settings
        </h1>

        <div className="space-y-8 text-gray-300">
          {/* Azimut Slider */}
          <section>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:flex-1 text-sm text-gray-400">
                <p>The compass direction your solar panels face:</p>
                <ul className="mt-2 space-y-1">
                  <li>0° = North</li>
                  <li>90° = East</li>
                  <li>180° = South</li>
                  <li>270° = West</li>
                </ul>
              </div>
              <div className="md:flex-1 text-center">
                <label
                  htmlFor="azimut-slider"
                  className="block text-xl md:text-2xl font-semibold text-white mb-4"
                >
                  Azimut: {settings.azimut}°
                </label>
                <Slider
                  id="azimut-slider"
                  min={0}
                  max={360}
                  value={[settings.azimut]}
                  onValueChange={(value) =>
                    updateSettings({ azimut: value[0] })
                  }
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-300 mt-2">
                  <span>
                    N<br />
                    0°
                  </span>
                  <span>
                    E<br />
                    90°
                  </span>
                  <span>
                    S<br />
                    180°
                  </span>
                  <span>
                    W<br />
                    270°
                  </span>
                  <span>
                    N<br />
                    360°
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Angle Slider */}
          <section>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:flex-1 text-sm text-gray-400">
                <p>
                  The tilt angle of your solar panels from horizontal (0° =
                  flat, 90° = vertical)
                </p>
              </div>
              <div className="md:flex-1 text-center">
                <label
                  htmlFor="angle-slider"
                  className="block text-xl md:text-2xl font-semibold text-white mb-4"
                >
                  Angle: {settings.angle}°
                </label>
                <Slider
                  id="angle-slider"
                  min={0}
                  max={90}
                  value={[settings.angle]}
                  onValueChange={(value) => updateSettings({ angle: value[0] })}
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
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:flex-1 text-sm text-gray-400">
                <p>Your total solar panel system capacity in kilowatts</p>
              </div>
              <div className="md:flex-1 text-center">
                <label
                  htmlFor="kwh-slider"
                  className="block text-xl md:text-2xl font-semibold text-white mb-4"
                >
                  kWh: {settings.kwh}
                </label>
                <Slider
                  id="kwh-slider"
                  min={1}
                  max={10}
                  value={[settings.kwh]}
                  onValueChange={(value) => updateSettings({ kwh: value[0] })}
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

          {/* Minimum kWh Requirement Slider */}
          <section>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:flex-1 text-sm text-gray-400">
                <p>
                  Set the minimum energy threshold for choosing solar over price
                  optimization.
                </p>
              </div>
              <div className="md:flex-1 text-center">
                <label
                  htmlFor="min-kwh-slider"
                  className="block text-xl md:text-2xl font-semibold text-white mb-4 md:whitespace-nowrap"
                >
                  Min Requirement: {(settings.minKwh / 1000).toFixed(1)} kWh
                </label>
                <Slider
                  id="min-kwh-slider"
                  min={500}
                  max={3000}
                  step={100}
                  value={[settings.minKwh]}
                  onValueChange={(value) =>
                    updateSettings({ minKwh: value[0] })
                  }
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-300 mt-2">
                  <span>0.5</span>
                  <span>1.0</span>
                  <span>1.5</span>
                  <span>2.0</span>
                  <span>2.5</span>
                  <span>3.0</span>
                </div>
              </div>
            </div>
          </section>

          {/* Morning Shading Switch */}
          <section>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:flex-1 text-sm text-gray-400">
                <p>
                  Enable morning shading compensation to reduce solar production
                  estimates before the specified time. Useful when trees,
                  buildings, or other objects block your panels in the morning.
                </p>
              </div>
              <div className="md:flex-1 flex items-center justify-center gap-4">
                <label
                  htmlFor="morning-shading-switch"
                  className="text-xl md:text-2xl font-semibold text-white"
                >
                  Morning Shading
                </label>
                <Switch
                  id="morning-shading-switch"
                  checked={settings.morningShading}
                  onCheckedChange={(checked) =>
                    updateSettings({ morningShading: checked })
                  }
                />
              </div>
            </div>
          </section>

          {/* Shading End Time Slider - only show if morning shading is enabled */}
          {settings.morningShading && (
            <section>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="md:flex-1 text-sm text-gray-400">
                  <p>
                    Set the hour when shading clears and full solar production
                    begins. Before this time, estimates will be reduced by 50%.
                  </p>
                </div>
                <div className="md:flex-1 text-center">
                  <label
                    htmlFor="shading-end-time-slider"
                    className="block text-xl md:text-2xl font-semibold text-white mb-4"
                  >
                    Shading Ends: {settings.shadingEndTime}:00
                  </label>
                  <Slider
                    id="shading-end-time-slider"
                    min={6}
                    max={12}
                    value={[settings.shadingEndTime]}
                    onValueChange={(value) =>
                      updateSettings({ shadingEndTime: value[0] })
                    }
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-300 mt-2">
                    <span>6:00</span>
                    <span>8:00</span>
                    <span>10:00</span>
                    <span>12:00</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Cache Clear Button */}
          <section>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:flex-1 text-sm text-gray-400">
                <p>
                  Clear cached solar and market data to force fresh API calls.
                  This can help if you&apos;re experiencing outdated data
                  issues.
                </p>
              </div>
              <div className="md:flex-1 flex flex-col items-center justify-center gap-4">
                <button
                  onClick={handleClearCache}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  disabled={cacheCleared}
                >
                  {cacheCleared ? "Cache Cleared!" : "Clear Cache"}
                </button>
                {cacheCleared && (
                  <p className="text-green-400 text-sm">
                    ✓ Cache cleared successfully
                  </p>
                )}
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
