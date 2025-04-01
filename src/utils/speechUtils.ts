// Speech synthesis utility functions

/**
 * Speaks the provided text using the browser's speech synthesis API
 * @param text The text to speak
 * @param lang The language code (e.g., 'en-US', 'hi-IN')
 * @param onEnd Callback function to execute when speech ends
 */
export const speakText = (
  text: string,
  lang: string = 'en-US',
  onEnd?: () => void
): void => {
  // Check if speech synthesis is supported
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Set the onend callback if provided
  if (onEnd) {
    utterance.onend = onEnd;
  }

  // Speak the text
  window.speechSynthesis.speak(utterance);
};

/**
 * Stops any ongoing speech
 */
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Gets available voices for the specified language
 * @param langCode Language code to filter voices by
 * @returns Array of SpeechSynthesisVoice objects
 */
export const getVoicesForLanguage = (langCode: string): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith(langCode.split('-')[0]));
};