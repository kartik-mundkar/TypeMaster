import React from 'react';

const TypingInput = ({ 
  inputRef,
  typedText,
  onChange,
  onKeyDown,
  onKeyPress,
  onFocus,
  onBlur,
  raceStatus 
}) => {
  return (
    <input
      ref={inputRef}
      type="text"
      value={typedText}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onKeyPress={onKeyPress}
      onFocus={onFocus}
      onBlur={onBlur}
      className="typing-input"
      disabled={raceStatus !== "active"}
      placeholder={
        raceStatus === "active"
          ? "Start typing..."
          : `Race status: ${raceStatus}`
      }
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
};

export default TypingInput;
