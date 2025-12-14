import { useState, useEffect, useRef } from 'react';
import { axiosClient } from '../api/axiosClient';

interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

export const useColdStartDetection = () => {
  const [isColdStarting, setIsColdStarting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const stateRef = useRef({ isColdStarting, showAlert });
  const countdownIntervalRef = useRef<number | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = { isColdStarting, showAlert };
  }, [isColdStarting, showAlert]);

  useEffect(() => {
    let healthCheckInterval: number;
    let isChecking = true;

    const checkBackendHealth = async () => {
      if (!isChecking) return;
      
      try {
        const response = await axiosClient.get<HealthStatus>('/health', {
          timeout: 5000 // 5 second timeout for health check
        });
        
        // If we get a successful response, backend is ready
        if (response.data.status === 'ok') {
          console.log('Backend is ready');
          const currentState = stateRef.current;
          if (currentState.isColdStarting || currentState.showAlert) {
            console.log('Hiding alert and stopping countdown');
            setIsColdStarting(false);
            setShowAlert(false);
            // Clear countdown and refresh timeout when backend is ready
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current);
              refreshTimeoutRef.current = null;
            }
            // Auto-reload the page when backend comes online
            window.location.reload();
          }
          // Stop health checking when backend is ready
          isChecking = false;
          if (healthCheckInterval) {
            clearInterval(healthCheckInterval);
            healthCheckInterval = 0;
          }
        }
      } catch (error) {
        console.log('Backend not responding, checking for cold start...');
        // Backend is not responding, likely cold starting
        const currentState = stateRef.current;
        if (!currentState.isColdStarting && !currentState.showAlert) {
          console.log('Starting cold start detection');
          setIsColdStarting(true);
          setShowAlert(true);
          setTimeRemaining(60);
          
          // Start countdown only if not already running
          if (!countdownIntervalRef.current) {
            countdownIntervalRef.current = window.setInterval(() => {
              setTimeRemaining((prev) => {
                if (prev <= 1) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }

          // Auto-refresh after 60 seconds
          if (!refreshTimeoutRef.current) {
            refreshTimeoutRef.current = window.setTimeout(() => {
              window.location.reload();
            }, 60000);
          }
        }
      }
    };

    // Initial health check
    checkBackendHealth();

    // Set up periodic health checks during cold start
    healthCheckInterval = window.setInterval(() => {
      if (isChecking) {
        checkBackendHealth();
      }
    }, 3000); // Check every 5 seconds

    return () => {
      isChecking = false;
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []); // Remove dependency on isColdStarting to prevent re-runs

  const dismissAlert = () => {
    setShowAlert(false);
  };

  return {
    isColdStarting,
    showAlert,
    timeRemaining,
    dismissAlert
  };
};
