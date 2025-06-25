import React from 'react';
import UnifiedTextDisplay from '../common/UnifiedTextDisplay';
import TypingInput from './TypingInput';

const TypingSection = ({
  currentText,
  typedText,
  raceStatus,
  inputRef,
  calculateScrollOffset,
  onInputChange,
  onKeyDown,
  onKeyPress,
  onInputFocus,
  onInputBlur,
  onTextClick
}) => {
  return (
    <div className="typing-section">
      <UnifiedTextDisplay
        currentText={currentText}
        typedText={typedText}
        onTextClick={onTextClick}
        raceStatus={raceStatus}
        calculateScrollOffset={calculateScrollOffset}
        renderMode="characters"
      />
      <TypingInput
        inputRef={inputRef}
        typedText={typedText}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        raceStatus={raceStatus}
      />
    </div>
  );
};

export default TypingSection;
