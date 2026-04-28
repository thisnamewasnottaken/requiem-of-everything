import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./CreditsPage.module.css";

interface Contributor {
  name: string;
  roleKey: string;
}

const CONTRIBUTORS: Contributor[] = [
  { name: "thisnamewasnottaken", roleKey: "credits.roleCreator" },
  { name: "copilot-swe-agent[bot]", roleKey: "credits.roleAI" },
];

export default function CreditsPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page} aria-label={t("credits.title")}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("credits.title")}</h2>
        <p className={styles.subtitle}>{t("credits.subtitle")}</p>
      </div>

      <div className={styles.grid}>
        {CONTRIBUTORS.map((contributor) => (
          <div key={contributor.name} className={styles.card}>
            <div className={styles.avatar} aria-hidden="true">
              {contributor.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.cardBody}>
              <span className={styles.name}>{contributor.name}</span>
              <span className={styles.role}>{t(contributor.roleKey)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>{t("credits.footer")}</div>
    </div>
  );
}
