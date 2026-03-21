import React from "react";
import { useTranslation, Trans } from "react-i18next";
import styles from "./HelpPanel.module.css";

interface HelpPanelProps {
  onClose: () => void;
}

export default function HelpPanel({ onClose }: HelpPanelProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.helpPanel} role="dialog" aria-label={t('help.ariaLabel')}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t('help.title')}</h2>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('help.closeAriaLabel')}
        >
          ×
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('help.keyboardShortcuts')}</h3>
        <table className={styles.shortcutTable}>
          <tbody>
            <tr>
              <td><kbd className={styles.kbd}>F</kbd></td>
              <td>{t('help.shortcut.toggleFilter')}</td>
            </tr>
            <tr>
              <td><kbd className={styles.kbd}>R</kbd></td>
              <td>{t('help.shortcut.resetView')}</td>
            </tr>
            <tr>
              <td><kbd className={styles.kbd}>?</kbd></td>
              <td>{t('help.shortcut.toggleHelp')}</td>
            </tr>
            <tr>
              <td><kbd className={styles.kbd}>Esc</kbd></td>
              <td>{t('help.shortcut.closePanels')}</td>
            </tr>
            <tr>
              <td><kbd className={styles.kbd}>Scroll</kbd></td>
              <td>{t('help.shortcut.zoom')}</td>
            </tr>
            <tr>
              <td><kbd className={styles.kbd}>Drag</kbd></td>
              <td>{t('help.shortcut.pan')}</td>
            </tr>
            <tr>
              <td>
                <kbd className={styles.kbd}>Ctrl</kbd>+click
              </td>
              <td>{t('help.shortcut.comparison')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Navigation */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('help.navigation')}</h3>
        <ul className={styles.tipList}>
          <li>{t('help.nav.item1')}</li>
          <li>{t('help.nav.item2')}</li>
          <li>{t('help.nav.item3')}</li>
          <li>{t('help.nav.item4')}</li>
          <li>{t('help.nav.item5')}</li>
          <li>
            <Trans i18nKey="help.nav.item6" components={{ strong: <strong /> }}>
              Use the <strong>+</strong> / <strong>−</strong> / <strong>↺</strong> controls in the top-right corner.
            </Trans>
          </li>
          <li>{t('help.nav.item7')}</li>
        </ul>
      </div>

      {/* Filters */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('help.filtersTitle')}</h3>
        <ul className={styles.tipList}>
          <li>
            <Trans i18nKey="help.filter.item1" components={{ kbd: <kbd className={styles.kbd} />, strong: <strong /> }}>
              Open with <kbd className={styles.kbd}>F</kbd> or the <strong>⚙ Filters</strong> button.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="help.filter.item2" components={{ strong: <strong /> }}>
              Filter by <strong>musical era</strong> — Renaissance, Baroque, Classical, Romantic, and Modern.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="help.filter.item3" components={{ strong: <strong /> }}>
              Filter by <strong>nationality</strong> — shows only composers from selected countries.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="help.filter.item4" components={{ strong: <strong /> }}>
              Filter by <strong>genre</strong> — shows only composers who wrote in at least one selected genre.
            </Trans>
          </li>
          <li>{t('help.filter.item5')}</li>
          <li>{t('help.filter.item6')}</li>
          <li>{t('help.filter.item7')}</li>
        </ul>
      </div>

      {/* Composition Detail */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('help.compositionDetail')}</h3>
        <ul className={styles.tipList}>
          <li>{t('help.comp.item1')}</li>
          <li>{t('help.comp.item2')}</li>
          <li>{t('help.comp.item3')}</li>
          <li>{t('help.comp.item4')}</li>
          <li>
            <Trans i18nKey="help.comp.item5" components={{ kbd: <kbd className={styles.kbd} />, strong: <strong /> }}>
              Press <kbd className={styles.kbd}>Esc</kbd> or click <strong>×</strong> to dismiss.
            </Trans>
          </li>
        </ul>
      </div>

      {/* Comparison Mode */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('help.comparisonMode')}</h3>
        <ul className={styles.tipList}>
          <li>
            <Trans i18nKey="help.compare.item1" components={{ strong: <strong /> }}>
              <strong>Ctrl+click</strong> (Cmd+click on Mac) composer bars to add them to comparison.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="help.compare.item2" components={{ em: <em /> }}>
              If a composer detail panel is open, Ctrl+clicking another composer adds <em>both</em> to comparison automatically.
            </Trans>
          </li>
          <li>{t('help.compare.item3')}</li>
          <li>{t('help.compare.item4')}</li>
          <li>{t('help.compare.item5')}</li>
          <li>{t('help.compare.item6')}</li>
          <li>{t('help.compare.item7')}</li>
          <li>{t('help.compare.item8')}</li>
          <li>
            <Trans i18nKey="help.compare.item9" components={{ strong: <strong /> }}>
              You can also use the <strong>+ Compare</strong> button in the composer detail panel.
            </Trans>
          </li>
          <li>{t('help.compare.item10')}</li>
        </ul>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {t('help.footer')}
      </div>
    </div>
  );
}
