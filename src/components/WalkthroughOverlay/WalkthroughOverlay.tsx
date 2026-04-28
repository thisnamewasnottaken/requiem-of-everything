import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./WalkthroughOverlay.module.css";

interface WalkthroughOverlayProps {
  mode: "welcome" | "whats-new";
  onStartFullTour: () => void;
  onStartWhatsNew?: () => void;
  onDefer: () => void;
  onDismiss: () => void;
}

export default function WalkthroughOverlay({
  mode,
  onStartFullTour,
  onStartWhatsNew,
  onDefer,
  onDismiss,
}: WalkthroughOverlayProps) {
  const { t, i18n } = useTranslation();

  const languageSelect = (
    <div className={styles.languageSwitcher}>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label={t("app.languageSelect")}
        className={styles.languageSelect}
      >
        <option value="en-GB">English</option>
        <option value="fr-FR">Français</option>
        <option value="af-ZA">Afrikaans</option>
        <option value="es-ES">Español</option>
      </select>
    </div>
  );
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDefer();
    };
    window.addEventListener("keydown", handleKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDefer]);

  return (
    <div className={styles.backdrop} onClick={onDefer}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkthrough-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "welcome" ? (
          <>
            <h2 id="walkthrough-title" className={styles.title}>
              {t("walkthrough.welcome.title")}
            </h2>
            <p className={styles.description}>
              {t("walkthrough.welcome.description")}
            </p>
            {languageSelect}
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={onStartFullTour}>
                {t("walkthrough.welcome.startTour")}
              </button>
              <button className={styles.secondaryBtn} onClick={onDefer}>
                {t("walkthrough.welcome.maybeLater")}
              </button>
              <button className={styles.textBtn} onClick={onDismiss}>
                {t("walkthrough.welcome.dontAsk")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="walkthrough-title" className={styles.title}>
              {t("walkthrough.whatsNew.title")}
            </h2>
            <p className={styles.description}>
              {t("walkthrough.whatsNew.description")}
            </p>
            {languageSelect}
            <div className={styles.actions}>
              {onStartWhatsNew && (
                <button className={styles.primaryBtn} onClick={onStartWhatsNew}>
                  {t("walkthrough.whatsNew.seeWhatsNew")}
                </button>
              )}
              <button className={styles.secondaryBtn} onClick={onStartFullTour}>
                {t("walkthrough.whatsNew.fullTour")}
              </button>
              <button className={styles.secondaryBtn} onClick={onDefer}>
                {t("walkthrough.whatsNew.maybeLater")}
              </button>
              <button className={styles.textBtn} onClick={onDismiss}>
                {t("walkthrough.whatsNew.dontAsk")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
