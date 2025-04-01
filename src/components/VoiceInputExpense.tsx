"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExpenseFormInput, CATEGORIES } from "@/types";
import { speakText, stopSpeaking } from "@/utils/speechUtils";

// Improved type definitions for the Web Speech API
interface SpeechRecognitionResult {
  readonly isFinal?: boolean;
  readonly length: number;
  readonly [index: number]: {
    readonly transcript: string;
    readonly confidence: number;
  };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: {
      new(): SpeechRecognition;
      prototype: SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new(): SpeechRecognition;
      prototype: SpeechRecognition;
    };
  }
}

interface VoiceInputExpenseProps {
  onSubmit: (data: ExpenseFormInput) => void;
  onCancel: () => void;
}

export default function VoiceInputExpense({
  onSubmit,
  onCancel,
}: VoiceInputExpenseProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExpenseFormInput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("en-US");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // List of supported languages - we'll use this for display purposes
  const supportedLanguages = [
    { code: "en-US", name: "English (US)" },
    { code: "hi-IN", name: "Hindi" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "ja-JP", name: "Japanese" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
  ];

  // Get language name from code
  const getLanguageName = (code: string) => {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Your browser doesn't support speech recognition. Try using Chrome.");
      return;
    }

    // Initialize speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = true;
        
        // Set to English initially, but we'll detect the language
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptValue = result[0].transcript;
          setTranscript(transcriptValue);
          
          // Use a safer approach for language detection
          // Since browser API doesn't reliably provide language detection,
          // we'll rely on the backend to detect language
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  const startListening = () => {
    setTranscript("");
    setExtractedData(null);
    setError(null);
    stopSpeaking();
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError("Please speak something first");
      return;
    }

    setProcessing(true);
    try {
      // The API will detect the language
      const response = await fetch("/api/process-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          transcript, 
          language: "auto" // Let the backend detect the language
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process voice input");
      }

      const data = await response.json();
      
      // If the backend returns a detected language, use it
      if (data.detectedLanguage) {
        setDetectedLanguage(data.detectedLanguage);
      }
      
      setExtractedData(data);
      
      // Provide voice feedback using detected language
      const feedbackText = getFeedbackText(data, detectedLanguage);
      setIsSpeaking(true);
      speakText(feedbackText, detectedLanguage, () => setIsSpeaking(false));
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessing(false);
    }
  };

  const getFeedbackText = (data: ExpenseFormInput, lang: string): string => {
    // Generate feedback text based on language
    switch (lang.split('-')[0]) {
      case 'hi':
        return `मैंने ${data.amount} रुपये का ${data.category} खर्च समझा है। क्या यह सही है?`;
      case 'es':
        return `He entendido un gasto de ${data.amount} en ${data.category}. ¿Es correcto?`;
      case 'fr':
        return `J'ai compris une dépense de ${data.amount} pour ${data.category}. Est-ce correct?`;
      case 'de':
        return `Ich habe eine Ausgabe von ${data.amount} für ${data.category} verstanden. Ist das richtig?`;
      case 'ja':
        return `${data.category}に${data.amount}の支出を理解しました。これは正しいですか？`;
      case 'zh':
        return `我理解了${data.category}的${data.amount}支出。这正确吗？`;
      default:
        return `I understood an expense of ${data.amount} for ${data.category}. Is this correct?`;
    }
  };

  const confirmAndSubmit = () => {
    if (extractedData) {
      onSubmit(extractedData);
    }
  };

  const editExtractedData = (field: keyof ExpenseFormInput, value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-6"
    >
      <div className="space-y-4">
        {/* Display detected language if available */}
        {detectedLanguage && transcript && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Detected language: <span className="font-medium">{getLanguageName(detectedLanguage)}</span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-6">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-4 rounded-full ${
              isListening
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            } text-white transition-colors`}
            disabled={processing || isSpeaking}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isListening
                    ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                }
              />
            </svg>
          </button>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isListening ? "Listening... Click to stop" : "Click to start speaking"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        {transcript && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">You said:</h3>
            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">
              {transcript}
            </div>
            {!extractedData && (
              <button
                onClick={processTranscript}
                disabled={processing || isListening || isSpeaking}
                className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                aria-label="Process voice input"
              >
                {processing ? "Processing..." : "Process Voice Input"}
              </button>
            )}
          </div>
        )}

        {extractedData && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              I understood this expense:
            </h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="amount-input" className="block text-xs text-gray-500 dark:text-gray-400">Amount</label>
                <input
                  id="amount-input"
                  type="text"
                  value={extractedData.amount}
                  onChange={(e) => editExtractedData("amount", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  aria-label="Expense amount"
                />
              </div>
              
              <div>
                <label htmlFor="category-select" className="block text-xs text-gray-500 dark:text-gray-400">Category</label>
                <select
                  id="category-select"
                  value={extractedData.category}
                  onChange={(e) => editExtractedData("category", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  aria-label="Expense category"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="description-input" className="block text-xs text-gray-500 dark:text-gray-400">Description</label>
                <input
                  id="description-input"
                  type="text"
                  value={extractedData.description || ""}
                  onChange={(e) => editExtractedData("description", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  aria-label="Expense description"
                />
              </div>
              
              <div>
                <label htmlFor="date-input" className="block text-xs text-gray-500 dark:text-gray-400">Date</label>
                <input
                  id="date-input"
                  type="date"
                  value={extractedData.date || ""}
                  onChange={(e) => editExtractedData("date", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  aria-label="Expense date"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                onClick={startListening}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Try voice input again"
              >
                Try Again
              </button>
              <button
                onClick={confirmAndSubmit}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Confirm and add expense"
              >
                Confirm & Add
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}