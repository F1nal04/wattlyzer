import { createFileRoute } from "@tanstack/react-router";
import { TextCard, TextPage } from "@/components/sky/text-page";

export const Route = createFileRoute("/legal")({
  component: LegalScreen,
});

function LegalScreen() {
  return (
    <TextPage
      eyebrow="Legal · § 5 TMG"
      title="Legal notice and"
      italic="contact"
      lede="The core company and contact information for Wattlyzer."
    >
      {(t) => (
        <>
          <TextCard t={t} title="Operator">
            Leon Bojanowski
            <br />
            Marienstraße 3b
            <br />
            14532 Stahnsdorf
            <br />
            Germany
          </TextCard>
          <TextCard t={t} title="Contact">
            E-Mail: leongaborbojanowski04@gmail.com
            <br />
            Phone: +49 160 3020390
          </TextCard>
          <TextCard t={t} title="Disclaimer">
            This application is provided for informational purposes only. The
            calculations and results are estimates and should not be used for
            critical decision making without proper verification.
          </TextCard>
        </>
      )}
    </TextPage>
  );
}
