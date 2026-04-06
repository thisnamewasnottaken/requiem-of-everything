import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import * as WalkthroughService from "@/services/WalkthroughService";

export function useWalkthrough(callbacks?: {
  setActiveView?: (view: "timeline" | "terms" | "orchestra") => void;
  closeHelpPanel?: () => void;
  selectComposer?: (id: string | null) => void;
  selectComposition?: (id: string | null) => void;
}) {
  const { t } = useTranslation();

  const fullTourSteps = useMemo(
    (): DriveStep[] => [
      {
        popover: {
          title: t("walkthrough.steps.welcome.title"),
          description: t("walkthrough.steps.welcome.description"),
        },
      },
      {
        element: '[data-tour="timeline-viewport"]',
        popover: {
          title: t("walkthrough.steps.timeline.title"),
          description: t("walkthrough.steps.timeline.description"),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="time-ruler"]',
        popover: {
          title: t("walkthrough.steps.timeRuler.title"),
          description: t("walkthrough.steps.timeRuler.description"),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="era-backdrop"]',
        popover: {
          title: t("walkthrough.steps.eras.title"),
          description: t("walkthrough.steps.eras.description"),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="composer-bar-first"]',
        popover: {
          title: t("walkthrough.steps.composerBar.title"),
          description: t("walkthrough.steps.composerBar.description"),
          side: "bottom",
          align: "start",
          onNextClick: (_el, _step, { driver: d }) => {
            callbacks?.selectComposer?.("johann-sebastian-bach");
            setTimeout(() => d.moveNext(), 350);
          },
        },
      },
      {
        element: '[data-tour="composer-panel"]',
        popover: {
          title: t("walkthrough.steps.composerPanel.title"),
          description: t("walkthrough.steps.composerPanel.description"),
          side: "left",
          align: "start",
        },
      },
      {
        element: '[data-tour="composer-wiki-link"]',
        popover: {
          title: t("walkthrough.steps.composerLinks.title"),
          description: t("walkthrough.steps.composerLinks.description"),
          side: "left",
          align: "start",
          onNextClick: (_el, _step, { driver: d }) => {
            callbacks?.selectComposition?.("bach-goldberg-variations");
            setTimeout(() => d.moveNext(), 350);
          },
        },
      },
      {
        element: '[data-tour="composition-detail"]',
        popover: {
          title: t("walkthrough.steps.compositionDetail.title"),
          description: t("walkthrough.steps.compositionDetail.description"),
          side: "top",
          align: "center",
          onNextClick: (_el, _step, { driver: d }) => {
            callbacks?.selectComposition?.(null);
            callbacks?.selectComposer?.(null);
            setTimeout(() => d.moveNext(), 200);
          },
        },
      },
      {
        element: '[data-tour="search-filter"]',
        popover: {
          title: t("walkthrough.steps.search.title"),
          description: t("walkthrough.steps.search.description"),
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="view-tabs"]',
        popover: {
          title: t("walkthrough.steps.views.title"),
          description: t("walkthrough.steps.views.description"),
          side: "bottom",
          align: "center",
          onNextClick: (_el, _step, { driver: d }) => {
            callbacks?.setActiveView?.("terms");
            setTimeout(() => d.moveNext(), 400);
          },
        },
      },
      {
        element: '[data-tour="terms-view"]',
        popover: {
          title: t("walkthrough.steps.termsView.title"),
          description: t("walkthrough.steps.termsView.description"),
          side: "right",
          align: "start",
          onNextClick: (_el, _step, { driver: d }) => {
            callbacks?.setActiveView?.("orchestra");
            setTimeout(() => d.moveNext(), 400);
          },
        },
      },
      {
        element: '[data-tour="orchestra-view"]',
        popover: {
          title: t("walkthrough.steps.orchestraView.title"),
          description: t("walkthrough.steps.orchestraView.description"),
          side: "right",
          align: "start",
          onNextClick: (_el, _step, { driver: d }) => {
            callbacks?.setActiveView?.("timeline");
            setTimeout(() => d.moveNext(), 300);
          },
        },
      },
      {
        element: '[data-tour="language-switcher"]',
        popover: {
          title: t("walkthrough.steps.language.title"),
          description: t("walkthrough.steps.language.description"),
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="help-button"]',
        popover: {
          title: t("walkthrough.steps.help.title"),
          description: t("walkthrough.steps.help.description"),
          side: "bottom",
          align: "end",
        },
      },
      {
        popover: {
          title: t("walkthrough.steps.done.title"),
          description: t("walkthrough.steps.done.description"),
        },
      },
    ],
    [t],
  );

  const driverConfig: Config = useMemo(
    () => ({
      showProgress: true,
      progressText: t("walkthrough.progress", {
        defaultValue: "{{current}} of {{total}}",
      }),
      nextBtnText: t("walkthrough.next", { defaultValue: "Next" }),
      prevBtnText: t("walkthrough.prev", { defaultValue: "Back" }),
      doneBtnText: t("walkthrough.done", { defaultValue: "Done" }),
      allowClose: true,
      overlayColor: "#000",
      overlayOpacity: 0.75,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: "reqe-tour-popover",
      animate: true,
      smoothScroll: true,
      allowKeyboardControl: true,
    }),
    [t],
  );

  const startFullTour = useCallback(() => {
    callbacks?.setActiveView?.("timeline");
    callbacks?.closeHelpPanel?.();

    let closedEarly = false;

    const driverObj = driver({
      ...driverConfig,
      steps: fullTourSteps,
      onCloseClick: () => {
        closedEarly = true;
        WalkthroughService.markTourDeferred();
        driverObj.destroy();
      },
      onDestroyed: () => {
        if (!closedEarly) {
          WalkthroughService.markTourCompleted();
        }
      },
    });

    driverObj.drive();
  }, [driverConfig, fullTourSteps, callbacks]);

  const startWhatsNewTour = useCallback(() => {
    callbacks?.setActiveView?.("timeline");
    callbacks?.closeHelpPanel?.();

    let closedEarly = false;

    const driverObj = driver({
      ...driverConfig,
      steps: fullTourSteps,
      onCloseClick: () => {
        closedEarly = true;
        driverObj.destroy();
      },
      onDestroyed: () => {
        if (!closedEarly) {
          WalkthroughService.updateVersionSeen();
        }
      },
    });

    driverObj.drive();
  }, [driverConfig, fullTourSteps, callbacks]);

  const shouldShowWelcome = useMemo(
    () => WalkthroughService.isFirstVisit(),
    [],
  );

  const shouldShowWhatsNew = useMemo(
    () =>
      !WalkthroughService.isFirstVisit() &&
      WalkthroughService.isWhatsNewAvailable() &&
      !WalkthroughService.isWhatsNewDismissed(),
    [],
  );

  const shouldShowSubtlePrompt = useMemo(
    () =>
      WalkthroughService.isTourDeferred() &&
      !WalkthroughService.isTourCompleted(),
    [],
  );

  const dismissTour = useCallback(() => {
    WalkthroughService.markTourDismissed();
  }, []);

  const deferTour = useCallback(() => {
    WalkthroughService.markTourDeferred();
  }, []);

  const dismissWhatsNew = useCallback(() => {
    WalkthroughService.markWhatsNewDismissed();
  }, []);

  return {
    startFullTour,
    startWhatsNewTour,
    shouldShowWelcome,
    shouldShowWhatsNew,
    shouldShowSubtlePrompt,
    dismissTour,
    deferTour,
    dismissWhatsNew,
  };
}
