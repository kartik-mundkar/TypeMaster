import { useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

export const useSocketEvents = ({
  setRaceData,
  setCurrentText,
  setPlayers,
  setRaceStatus,
  setError,
  setIsJoining,
  setCountdown,
  setStartTime,
  setRaceResults,
  inputRef
}) => {
  const handleRaceJoined = useCallback((data) => {
    console.log("Race joined:", data);
    setRaceData(data);
    setCurrentText(data.text);
    setPlayers(data.players);
    setRaceStatus(data.status);
    setError("");
    setIsJoining(false);

    if (data.status === "countdown") {
      console.log("Joined race during countdown");
    }

    // Focus input for typing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        console.log("Input focused, race status:", data.status);
      }
    }, 100);
  }, [setRaceData, setCurrentText, setPlayers, setRaceStatus, setError, setIsJoining, inputRef]);

  const handlePlayerJoined = useCallback((data) => {
    console.log("Player joined:", data);
    setPlayers((prev) => [...prev, data.player]);
  }, [setPlayers]);

  const handlePlayerLeft = useCallback((data) => {
    console.log("Player left:", data);
    setPlayers((prev) => prev.filter((p) => p.username !== data.username));
  }, [setPlayers]);

  const handleCountdownStarted = useCallback((data) => {
    console.log("Countdown started:", data);
    setRaceStatus("countdown");
    setCountdown(data.countdownSeconds);
  }, [setRaceStatus, setCountdown]);

  const handleCountdownTick = useCallback((data) => {
    setCountdown(data.timeLeft);
  }, [setCountdown]);

  const handleRaceStarted = useCallback((data) => {
    console.log("Race started:", data);
    setRaceStatus("active");
    setStartTime(Date.now());
    setCountdown(null);

    // Ensure input is focused when race starts
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        console.log("Input focused after race start");
      }
    }, 100);
  }, [setRaceStatus, setStartTime, setCountdown, inputRef]);

  const handlePlayerProgressUpdate = useCallback((data) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.socketId === data.socketId ? { ...player, ...data } : player
      )
    );
  }, [setPlayers]);

  const handleRaceFinished = useCallback((data) => {
    console.log("Race finished:", data);
    setRaceStatus("finished");
    setRaceResults(data);
  }, [setRaceStatus, setRaceResults]);

  const handleRaceError = useCallback((data) => {
    console.error("Race error:", data);
    setError(data.message);
    setIsJoining(false);
  }, [setError, setIsJoining]);

  useEffect(() => {
    // Connect to socket server
    socketService.connect();

    // Connection status listeners
    socketService.onConnect(() => {
      console.log("✅ Connected to server");
      setError("");
    });

    socketService.onDisconnect(() => {
      console.log("❌ Disconnected from server");
      setRaceStatus("disconnected");
    });

    socketService.onConnectError((error) => {
      console.error("Connection error:", error);
      setError("Connection failed. Please refresh the page.");
    });

    // Set up event listeners
    socketService.onRaceJoined(handleRaceJoined);
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);
    socketService.onCountdownStarted(handleCountdownStarted);
    socketService.onCountdownTick(handleCountdownTick);
    socketService.onRaceStarted(handleRaceStarted);
    socketService.onPlayerProgressUpdate(handlePlayerProgressUpdate);
    socketService.onRaceFinished(handleRaceFinished);
    socketService.onRaceError(handleRaceError);

    return () => {
      socketService.leaveRace();
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [
    handleRaceJoined,
    handlePlayerJoined,
    handlePlayerLeft,
    handleCountdownStarted,
    handleCountdownTick,
    handleRaceStarted,
    handlePlayerProgressUpdate,
    handleRaceFinished,
    handleRaceError,
    setRaceStatus,
    setError,
  ]);

  return {
    handleRaceJoined,
    handlePlayerJoined,
    handlePlayerLeft,
    handleCountdownStarted,
    handleCountdownTick,
    handleRaceStarted,
    handlePlayerProgressUpdate,
    handleRaceFinished,
    handleRaceError,
  };
};
