import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socketService from "../services/socketService";

// Custom hooks
import { useSocketEvents } from "../hooks/useSocketEvents";
import { useTypingLogic } from "../hooks/useTypingLogic";

// Components
import JoinRaceForm from "../components/multiplayer/JoinRaceForm";
import WaitingArea from "../components/multiplayer/WaitingArea";
import CountdownTimer from "../components/multiplayer/CountdownTimer";
import RaceHeader from "../components/multiplayer/RaceHeader";
import TypingSection from "../components/multiplayer/TypingSection";
import PlayerStats from "../components/multiplayer/PlayerStats";
import PlayersList from "../components/multiplayer/PlayersList";
import RaceResults from "../components/multiplayer/RaceResults";

import "./MultiplayerRacePage.css";

const MultiplayerRacePage = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Race state
  const [raceStatus, setRaceStatus] = useState("disconnected");
  const [raceData, setRaceData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [raceResults, setRaceResults] = useState(null);

  // User state
  const [username, setUsername] = useState(
    `Player${Math.floor(Math.random() * 1000)}`
  );
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  // Statistics
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [progress, setProgress] = useState(0);

  // Custom hooks
  useSocketEvents({
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
  });

  const { handleInputChange, handleKeyDown, handleKeyPress } = useTypingLogic({
    currentText,
    typedText,
    setTypedText,
    raceStatus,
    startTime,
    setWpm,
    setAccuracy,
    setProgress,
    inputRef
  });

  // Effects for keyboard handling and focus management
  useEffect(() => {
    const preventScrolling = (e) => {
      if (
        raceStatus === "active" &&
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space"].includes(e.code)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", preventScrolling);
    return () => document.removeEventListener("keydown", preventScrolling);
  }, [raceStatus]);

  useEffect(() => {
    if (raceStatus === "active" && inputRef.current) {
      inputRef.current.focus();

      const maintainFocus = () => {
        if (
          raceStatus === "active" &&
          inputRef.current &&
          document.activeElement !== inputRef.current
        ) {
          inputRef.current.focus();
        }
      };

      const focusInterval = setInterval(maintainFocus, 1000);
      return () => clearInterval(focusInterval);
    }
  }, [raceStatus]);

  // Event handlers
  const handleJoinRace = () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (isJoining) {
      console.log("Already joining a race, preventing duplicate request");
      return;
    }

    setIsJoining(true);
    setError("");

    socketService.joinRace({
      username: username.trim(),
      isGuest: true,
    });
  };

  const handleLeaveRace = () => {
    socketService.leaveRace();
    navigate("/");
  };

  const handleTextClick = () => {
    if (inputRef.current && raceStatus === "active") {
      inputRef.current.focus();
      console.log("Text display clicked - focusing input");
    }
  };

  const handleInputFocus = () => console.log("Input focused");
  const handleInputBlur = () => console.log("Input blurred");

  // Auto-scroll calculation for 3-line display
  const calculateScrollOffset = () => {
    if (!currentText) return 0;

    const charsPerLine = 50;
    const lineHeight = 2;
    const currentChar = typedText.length;
    const currentLine = Math.floor(currentChar / charsPerLine);
    const targetLine = Math.max(0, currentLine - 1);

    return targetLine * lineHeight;
  };

  // Render based on race status
  if (raceStatus === "disconnected") {
    return (
      <JoinRaceForm
        username={username}
        setUsername={setUsername}
        onJoinRace={handleJoinRace}
        isJoining={isJoining}
        error={error}
      />
    );
  }

  return (
    <div className="multiplayer-race-page">
      <RaceHeader onLeaveRace={handleLeaveRace} />

      {raceStatus === "waiting" && <WaitingArea />}

      {raceStatus === "countdown" && <CountdownTimer countdown={countdown} />}

      {(raceStatus === "active" || raceStatus === "finished") && (
        <div className="main-content">
          <div className="three-column-layout">
            {/* Left Column - Live Stats */}
            <div className="left-column">
              <PlayerStats
                progress={progress}
                wpm={wpm}
                accuracy={accuracy}
              />
            </div>
            
            {/* Center Column - Text Display */}
            <div className="center-column">
              {raceStatus === "active" && (
                <div className="typing-instructions">
                  💡 Click on the text below and start typing!
                </div>
              )}
              <TypingSection
                currentText={currentText}
                typedText={typedText}
                raceStatus={raceStatus}
                inputRef={inputRef}
                calculateScrollOffset={calculateScrollOffset}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyPress={handleKeyPress}
                onInputFocus={handleInputFocus}
                onInputBlur={handleInputBlur}
                onTextClick={handleTextClick}
              />
            </div>
            
            {/* Right Column - Player Rankings */}
            <div className="right-column">
              <PlayersList 
                players={players} 
                raceData={raceData}
                currentUser={username}
              />
            </div>
          </div>
        </div>
      )}

      {raceStatus === "finished" && raceResults && (
        <RaceResults raceResults={raceResults} />
      )}
    </div>
  );
};

export default MultiplayerRacePage;
