import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { routes } from "../figma/routes";
import { useFmLocale } from "../i18n/useFmLocale";

import { GettingStartedCompletionModal } from "./GettingStartedCompletionModal";
import { OnboardingTour } from "./OnboardingTour";
import {
  getSortedOnboardingSteps,
  gettingStartedSteps,
  quickTourSteps,
} from "./onboardingSteps";
import { OnboardingTransitionModal } from "./OnboardingTransitionModal";
import {
  clearForceGettingStarted,
  clearForceOnboarding,
  isGettingStartedCompleted,
  isGettingStartedSkipped,
  isQuickTourCompleted,
  markGettingStartedCompleted,
  markGettingStartedSkipped,
  markQuickTourCompleted,
  readForceGettingStarted,
  readForceOnboarding,
  requestPostOnboardingStartHighlight,
} from "./onboardingStorage";

type Flow = "quick" | "getting-started" | null;

type OnboardingTourRootProps = {
  /** After splash / intro overlay — avoids stacking under splash */
  splashDone?: boolean;
};

/**
 * Two-phase onboarding: Quick Tour → optional transition → Getting Started guide.
 * Full replay: `prepareOnboardingReplay()` + reload. GS-only replay: `prepareGettingStartedReplay()` + reload.
 */
export function OnboardingTourRoot({ splashDone = true }: OnboardingTourRootProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useFmLocale();

  const quickSteps = useMemo(() => getSortedOnboardingSteps(quickTourSteps), []);
  const gsSteps = useMemo(() => getSortedOnboardingSteps(gettingStartedSteps), []);

  const [flow, setFlow] = useState<Flow>(null);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [gettingStartedCompletionOpen, setGettingStartedCompletionOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const openedAfterSplashRef = useRef(false);

  const activeSteps = flow === "quick" ? quickSteps : flow === "getting-started" ? gsSteps : [];
  const activeStep =
    activeSteps.length === 0 ? undefined : activeSteps[Math.min(stepIndex, activeSteps.length - 1)];

  /* Decide initial flow once splash is done */
  useEffect(() => {
    if (!splashDone || openedAfterSplashRef.current) return;

    if (readForceGettingStarted()) {
      clearForceGettingStarted();
      if (isQuickTourCompleted()) {
        openedAfterSplashRef.current = true;
        setStepIndex(0);
        setFlow("getting-started");
        return;
      }
      /* Intended GS replay but Quick not finished — continue as first-run into Quick */
    }

    if (readForceOnboarding()) {
      openedAfterSplashRef.current = true;
      setStepIndex(0);
      setFlow("quick");
      return;
    }

    if (!isQuickTourCompleted()) {
      openedAfterSplashRef.current = true;
      setStepIndex(0);
      setFlow("quick");
      return;
    }

    if (
      isQuickTourCompleted() &&
      !isGettingStartedCompleted() &&
      !isGettingStartedSkipped()
    ) {
      openedAfterSplashRef.current = true;
      setTransitionOpen(true);
    }
  }, [splashDone]);

  /* Navigate to current step route */
  useEffect(() => {
    const tourOpen = flow !== null && !transitionOpen;
    if (!tourOpen || !activeStep?.route) return;
    if (location.pathname === activeStep.route) return;
    navigate(activeStep.route);
  }, [activeStep?.route, flow, location.pathname, navigate, transitionOpen]);

  const tourOpen = flow !== null && !transitionOpen;

  const handleQuickFinish = () => {
    markQuickTourCompleted();
    clearForceOnboarding();
    setFlow(null);
    setTransitionOpen(true);
  };

  const handleQuickClose = () => {
    markQuickTourCompleted();
    markGettingStartedSkipped();
    clearForceOnboarding();
    setFlow(null);
    setTransitionOpen(false);
  };

  const finalizeGettingStarted = () => {
    markGettingStartedCompleted();
    clearForceOnboarding();
    setGettingStartedCompletionOpen(false);
    setFlow(null);
    setStepIndex(0);
  };

  /** Last Getting Started step — show success modal (completion marks onboarding done). */
  const handleGettingStartedFinish = () => {
    clearForceOnboarding();
    setFlow(null);
    setStepIndex(0);
    setGettingStartedCompletionOpen(true);
  };

  const handleGettingStartedClose = () => {
    markGettingStartedSkipped();
    clearForceOnboarding();
    setFlow(null);
    setStepIndex(0);
  };

  const handleTransitionStartGuide = () => {
    setTransitionOpen(false);
    setStepIndex(0);
    setFlow("getting-started");
  };

  const handleTransitionSkip = () => {
    markGettingStartedSkipped();
    setTransitionOpen(false);
  };

  if (quickSteps.length === 0 && gsSteps.length === 0) return null;

  return (
    <>
      <GettingStartedCompletionModal
        isOpen={gettingStartedCompletionOpen}
        title={t("onboarding.completion.title")}
        description={t("onboarding.completion.description")}
        startBotLabel={t("onboarding.completion.startBot")}
        gotItLabel={t("onboarding.completion.gotIt")}
        onStartBot={() => {
          requestPostOnboardingStartHighlight();
          navigate(routes.bot);
          finalizeGettingStarted();
        }}
        onGotIt={finalizeGettingStarted}
      />

      <OnboardingTransitionModal
        isOpen={transitionOpen}
        title={t("onboarding.transition.title")}
        startGuideLabel={t("onboarding.transition.startGuide")}
        skipLabel={t("onboarding.transition.skip")}
        onStartGuide={handleTransitionStartGuide}
        onSkip={handleTransitionSkip}
      />

      <OnboardingTour
        steps={activeSteps}
        isOpen={tourOpen}
        onClose={flow === "quick" ? handleQuickClose : handleGettingStartedClose}
        onFinish={flow === "quick" ? handleQuickFinish : handleGettingStartedFinish}
        controlledStepIndex={stepIndex}
        onControlledStepIndexChange={setStepIndex}
        routeKey={location.pathname}
      />
    </>
  );
}
