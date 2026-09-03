import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  IMPRESSUM,
  impressumAddressLines,
  translatorFor as impressumFor,
} from "@wattlyzer/legal";
import { TextCard, TextPage } from "@/components/sky/text-page";
import { useI18n } from "@/lib/i18n";
import { richParts } from "@/lib/i18n/rich";

export const Route = createFileRoute("/legal")({
  component: LegalScreen,
});

function LegalScreen() {
  const { t, locale } = useI18n();
  // Operator, contact and disclaimer come from the shared package, so this
  // page and wattlyzer.de/legal/ cannot state different things.
  const impressum = impressumFor(locale);

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
          <TextCard t={theme} title={impressum("operator")}>
            {impressumAddressLines(locale).map((line, index) => (
              <Fragment key={line}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </TextCard>
          <TextCard t={theme} title={impressum("contact")}>
            <a
              href={`mailto:${IMPRESSUM.email}`}
              style={{ color: "inherit" }}
            >
              {IMPRESSUM.email}
            </a>
          </TextCard>
          <TextCard t={theme} title={impressum("informational")}>
            {impressum("informationalBody")}
          </TextCard>
        </>
      )}
    </TextPage>
  );
}
