import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal notice and contact information for wattlyzer",
};

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-800 to-yellow-800 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto bg-gray-900/50 rounded-lg p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-sans">
          Legal Notice
        </h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Information according to § 5 TMG
            </h2>
            <p>
              Leon Bojanowski
              <br />
              Marienstraße 3b
              <br />
              14532 Stahnsdorf
              <br />
              Germany
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              E-Mail: leongaborbojanowski04@gmail.com
              <br />
              Phone: +49 160 3020390
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Disclaimer
            </h2>
            <p className="text-sm">
              This application is provided for informational purposes only. The
              calculations and results are estimates and should not be used for
              critical decision making without proper verification.
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
