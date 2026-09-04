import { createFileRoute } from "@tanstack/react-router";
import { TextCard, TextPage } from "@/components/sky/text-page";
import { useI18n } from "@/lib/i18n";
import { Em, richParts } from "@/lib/i18n/rich";

export const Route = createFileRoute("/privacy")({
  component: PrivacyScreen,
});

function PrivacyScreen() {
  const { t } = useI18n();
  return (
    <TextPage
      eyebrow={t("privacy.eyebrow")}
      title={richParts(t("privacy.title"), {
        data: (
          <Em>
            {t("privacy.titleEm")}
          </Em>
        ),
      })}
      lede={t("privacy.lede")}
    >
      {(theme) => (
        <>
          <TextCard t={theme} title={t("privacy.location.title")}>
            {t("privacy.location.body")}
          </TextCard>
          <TextCard t={theme} title={t("privacy.storage.title")}>
            {t("privacy.storage.body")}
          </TextCard>
          <TextCard t={theme} title={t("privacy.sharing.title")}>
            {t("privacy.sharing.body")}
          </TextCard>
          <TextCard t={theme} title={t("privacy.retention.title")}>
            {t("privacy.retention.body")}
          </TextCard>
        </>
      )}
    </TextPage>
  );
}
