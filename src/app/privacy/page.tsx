import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for wattlyzer - how we handle your data",
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-800 to-yellow-800 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto bg-gray-900/50 rounded-lg p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-sans">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Location Data Usage
            </h2>
            <p>
              Your location data is used solely to provide solar energy estimates
              for your area. This information is sent to our solar data API to
              calculate accurate solar irradiance and weather data for your specific
              location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Local Storage
            </h2>
            <p>
              Your application settings and API results are cached locally in your
              browser's storage to improve performance and reduce unnecessary API
              calls. This data remains on your device and is never transmitted to
              any server except for the solar estimation API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Data Sharing
            </h2>
            <p>
              We do not share, sell, or transmit your personal data to any third
              parties. The only external communication is with the solar data API
              for the purpose of generating accurate solar estimates based on your
              location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Data Retention
            </h2>
            <p className="text-sm">
              All cached data is stored locally on your device and can be cleared
              at any time through your browser settings. No personal data is
              retained on our servers.
            </p>
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