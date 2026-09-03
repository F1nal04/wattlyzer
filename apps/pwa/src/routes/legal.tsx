import { createFileRoute } from "@tanstack/react-router";
import { TextCard, TextPage } from "@/components/sky/text-page";
import { useI18n } from "@/lib/i18n";
import { richParts } from "@/lib/i18n/rich";

export const Route = createFileRoute("/legal")({
  component: LegalScreen,
});

function LegalScreen() {
  const { t } = useI18n();
  return (
    <TextPage
      eyebrow={t("legal.eyebrow")}
      title={richParts(t("legal.title"), {
        contact: (
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>
            {t("legal.titleEm")}
          </span>
        ),
      })}
      lede={t("legal.lede")}
    >
      {(theme) => (
        <>
          <TextCard t={theme} title={t("legal.operator")}>
            Leon Bojanowski
            <br />
            Marienstraße 3b
            <br />
            14532 Stahnsdorf
            <br />
            {t("legal.country")}
          </TextCard>
          <TextCard t={theme} title={t("legal.contact")}>
            {t("legal.emailLabel")}: leongaborbojanowski04@gmail.com
            <br />
            {t("legal.phoneLabel")}: +49 160 3020390
          </TextCard>
          <TextCard t={theme} title={t("legal.disclaimer")}>
            {t("legal.disclaimerBody")}
          </TextCard>
        </>
      )}
    </TextPage>
  );
}
