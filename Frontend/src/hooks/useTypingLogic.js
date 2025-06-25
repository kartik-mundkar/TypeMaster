import { useCallback, useEffect } from 'react';
import socketService from '../services/socketService';
import { calculateStats } from '../utils/typingCalculations';

export const useTypingLogic = ({
  currentText,
  typedText,
  setTypedText,
  raceStatus,
  startTime,
  setWpm,
  setAccuracy,
  setProgress,
  inputRef
}) => {
  const updateStats = useCallback(() => {
    if (!startTime || !currentText) return;

    const stats = calculateStats(typedText, currentText, startTime);
    const newProgress = Math.round(
      (typedText.length / currentText.length) * 100
    );

    setWpm(stats.wpm);
    setAccuracy(stats.accuracy);
    setProgress(newProgress);

    // Send progress to other players
    socketService.sendPlayerProgress({
      progress: newProgress,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      typedText: typedText,
    });
  }, [startTime, currentText, typedText, setWpm, setAccuracy, setProgress]);

  useEffect(() => {
    if (raceStatus === "active" && startTime) {
      updateStats();
    }
  }, [typedText, startTime, raceStatus, currentText, updateStats]);

  const handleInputChange = useCallback((e) => {
    console.log("Input change attempted, race status:", raceStatus);

    if (raceStatus !== "active") {
      console.log("Input blocked - race not active");
      return;
    }

    const value = e.target.value;
    console.log("Typing value:", value);

    // Prevent typing beyond text length
    if (value.length > currentText.length) return;

    setTypedText(value);

    // Check if race is complete
    if (value.length === currentText.length && value === currentText) {
      // Race completed!
      setProgress(100);
      console.log("Race completed!");
    }
  }, [raceStatus, currentText, setTypedText, setProgress]);

  const handleKeyDown = useCallback((e) => {
    // Prevent page scrolling and other default behaviors
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "Space",
      ].includes(e.code)
    ) {
      e.preventDefault();
    }

    // Handle spacebar specifically
    if (e.code === "Space") {
      e.preventDefault();
      if (raceStatus === "active") {
        const currentValue = inputRef.current?.value || "";
        const newValue = currentValue + " ";
        if (newValue.length <= currentText.length) {
          setTypedText(newValue);
        }
      }
    }
  }, [raceStatus, currentText, setTypedText, inputRef]);

  const handleKeyPress = useCallback((e) => {
    // Prevent default for space to avoid scrolling
    if (e.key === " ") {
      e.preventDefault();
    }
  }, []);

  return {
    handleInputChange,
    handleKeyDown,
    handleKeyPress,
    updateStats
  };
};
