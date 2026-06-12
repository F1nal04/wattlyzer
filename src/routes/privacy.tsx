import { createFileRoute } from "@tanstack/react-router";
import { TextCard, TextPage } from "@/components/sky/text-page";

export const Route = createFileRoute("/privacy")({
  component: PrivacyScreen,
});

function PrivacyScreen() {
  return (
    <TextPage
      eyebrow="Privacy"
      title="How Wattlyzer handles your"
      italic="data"
      lede="The app is built around local processing and local caching. This page explains what is used and why."
    >
      {(t) => (
        <>
          <TextCard t={t} title="Location data usage">
            Your location is used only to provide solar energy estimates for your
            area. This information is sent to the solar estimation API so the
            forecast can reflect local conditions.
          </TextCard>
          <TextCard t={t} title="Local storage">
            Your settings and cached API responses are stored locally in the
            browser to improve performance and reduce unnecessary API calls.
          </TextCard>
          <TextCard t={t} title="Data sharing">
            We do not sell or distribute your personal data. External
            communication is limited to the solar and market APIs required to
            generate recommendations.
          </TextCard>
          <TextCard t={t} title="Retention">
            Cached data remains on your device and can be cleared manually. No
            personal data is retained on Wattlyzer servers.
          </TextCard>
        </>
      )}
    </TextPage>
  );
}
