import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { tourSteps } from './steps';
import type { RouteStep } from './steps';
import { waitForElement } from './waitForElement';

type StartOptions = { force?: boolean; fromStep?: number };

type TourCtx = {
  run: boolean;
  stepIndex: number;
  steps: RouteStep[];
  start: (opts?: StartOptions) => void;
  stop: () => void;
  reset: () => void;
  next: () => void;
  prev: () => void;
};

const STORAGE_KEY_COMPLETED = 'tour_completed_v1';

const TourContext = createContext<TourCtx | null>(null);

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const stepsRef = useRef<RouteStep[]>(tourSteps);
  const steps = stepsRef.current;

  const markCompleted = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, '1');
    } catch {}
  }, []);

  const isCompleted = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_COMPLETED) === '1';
    } catch {
      return false;
    }
  }, []);

  const start = useCallback((opts?: StartOptions) => {
    const from = opts?.fromStep ?? 0;
    const force = !!opts?.force;
    if (isCompleted() && !force) return; // only run once unless forced
    setStepIndex(from);
    setRun(true);
  }, [isCompleted]);

  const stop = useCallback(() => {
    setRun(false);
  }, []);

  const reset = useCallback(() => {
    setRun(false);
    setStepIndex(0);
  }, []);

  const goToStepSafely = useCallback(
    async (idx: number) => {
      const next = steps[idx];
      if (!next) return;

      if (location.pathname !== next.route) {
        navigate(next.route);
        await new Promise((r) => setTimeout(r, 0));
      }
      try {
        await waitForElement(next.target, { timeout: 10000, interval: 100 });
      } catch {
        // swallow; Joyride will handle target:notFound
      }
      setStepIndex(idx);
      if (!run) setRun(true);
    },
    [location.pathname, navigate, run, steps]
  );

  const next = useCallback(() => {
    void goToStepSafely(stepIndex + 1);
  }, [goToStepSafely, stepIndex]);

  const prev = useCallback(() => {
    void goToStepSafely(Math.max(0, stepIndex - 1));
  }, [goToStepSafely, stepIndex]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        markCompleted();
        reset();
        return;
      }

      if (type === 'step:after' || type === EVENTS.TARGET_NOT_FOUND) {
        // If the next step is the submit step, finish the tour instead of showing it
        const nextStep = steps[index + 1];
        if (action === 'next' && nextStep && (nextStep as any).id === 'project-form-submit') {
          markCompleted();
          reset();
          return;
        }

        // Also guard: if this was the last step, finish instead of trying to advance
        if (action === 'next' && index >= steps.length - 1) {
          markCompleted();
          reset();
          return;
        }

        if (action === 'next') {
          void goToStepSafely(index + 1);
        } else if (action === 'prev') {
          void goToStepSafely(Math.max(0, index - 1));
        }
      }
    },
    [goToStepSafely, reset, markCompleted, steps]
  );

  const joyrideSteps: Step[] = useMemo(() => {
    // Hide the submit step from the tour so the previous step becomes the final (shows Last)
    const filtered = steps.filter((s) => s.id !== 'project-form-submit');
    return filtered.map(({ route, ...rest }) => rest);
  }, [steps]);

  // Auto-start only once for a new user
  React.useEffect(() => {
    if (!isCompleted()) {
      void (async () => {
        await goToStepSafely(0);
        setRun(true);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TourContext.Provider value={{ run, stepIndex, steps, start, stop, reset, next, prev }}>
      {children}
      <Joyride
        steps={joyrideSteps}
        stepIndex={stepIndex}
        run={run}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableScrolling
        spotlightClicks={false}
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={{ options: { zIndex: 9999 } }}
      />
    </TourContext.Provider>
  );
};
