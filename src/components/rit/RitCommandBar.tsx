import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Search, Send, Sparkles } from 'lucide-react';
import { LiquidGlassSurface } from './LiquidGlassSurface';
import { RitAvatar } from './RitAvatar';

export interface RitSuggestionItem {
  id: string;
  label: string;
  query: string;
  meta?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

interface RitCommandBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query?: string) => void;
  isThinking: boolean;
  suggestions: RitSuggestionItem[];
  theme: 'dark' | 'light';
  onVoiceError?: (msg: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const RitCommandBar: React.FC<RitCommandBarProps> = ({
  value,
  onChange,
  onSubmit,
  isThinking,
  suggestions,
  theme,
  onVoiceError,
  inputRef: externalInputRef,
}) => {
  const internalRef = useRef<HTMLInputElement | null>(null);
  const inputRef = externalInputRef || internalRef;
  const dockRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeHintIdx, setActiveHintIdx] = useState(0);

  const speechCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const speechSupported = Boolean(speechCtor);

  const filteredSuggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 6);
    const matched = suggestions.filter(
      (s) => s.label.toLowerCase().includes(q) || s.query.toLowerCase().includes(q)
    );
    return (matched.length > 0 ? matched : suggestions).slice(0, 5);
  }, [value, suggestions]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!speechCtor) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new speechCtor();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const transcript = Array.from({ length: event.results.length })
          .map((_, idx) => event.results[idx]?.[0]?.transcript || '')
          .join(' ')
          .trim();
        if (transcript) {
          onChange(transcript);
        }
      };
      rec.onerror = (event) => {
        setIsListening(false);
        const msg =
          event.error === 'not-allowed'
            ? 'Microphone access was denied by browser settings.'
            : 'Voice dictation could not start.';
        onVoiceError?.(msg);
      };
      rec.onend = () => {
        setIsListening(false);
        inputRef.current?.focus();
      };
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      onVoiceError?.('Voice dictation is unavailable in this browser.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isThinking) return;
    setShowSuggestions(false);
    onSubmit();
  };

  return (
    <div ref={dockRef} className={`rit-command-dock ${isFocused ? 'is-focused' : ''}`}>
      {/* Contextual Suggestions Floating Glass Tray */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="rit-suggestions-anchor" role="listbox" aria-label="Contextual RIT suggestions">
          <LiquidGlassSurface variant="menu" theme={theme} className="rit-suggestions-card">
            <div className="rit-suggestions-header">
              <span className="rit-suggestions-title">
                <Sparkles size={11} /> Contextual Commands
              </span>
              <span className="rit-suggestions-hint">Tab / Click to run</span>
            </div>
            <div className="rit-suggestions-list">
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={activeHintIdx === idx}
                  className={`rit-suggestion-item ${activeHintIdx === idx ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveHintIdx(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowSuggestions(false);
                    onSubmit(item.query);
                  }}
                >
                  <span className="rit-suggestion-label">{item.label}</span>
                  {item.meta && <span className="rit-suggestion-meta">{item.meta}</span>}
                </button>
              ))}
            </div>
          </LiquidGlassSurface>
        </div>
      )}

      {/* Main Floating Pill + Detached Submit Glass Orb */}
      <form onSubmit={handleFormSubmit} className="rit-command-row" role="search">
        <LiquidGlassSurface
          variant="pill"
          theme={theme}
          interactiveFluid
          className={`rit-command-pill ${isFocused ? 'is-expanded' : ''}`}
        >
          <div className="rit-command-pill-inner">
            <div className="rit-pill-leading" title="RIT — Harmony, Structure and Order">
              <RitAvatar size={34} shape="circle" thinking={isThinking} />
              <span className="rit-search-icon-badge" aria-hidden="true">
                <Search size={12} />
              </span>
            </div>

            <div className="rit-input-shell">
              <input
                ref={inputRef}
                type="text"
                className="rit-command-input"
                placeholder="Ask RIT anything..."
                aria-label="Ask RIT anything"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  if (!showSuggestions) setShowSuggestions(true);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    inputRef.current?.blur();
                  } else if (e.key === 'ArrowDown' && showSuggestions && filteredSuggestions.length) {
                    e.preventDefault();
                    setActiveHintIdx((prev) => (prev + 1) % filteredSuggestions.length);
                  } else if (e.key === 'ArrowUp' && showSuggestions && filteredSuggestions.length) {
                    e.preventDefault();
                    setActiveHintIdx(
                      (prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
                    );
                  } else if (e.key === 'Tab' && showSuggestions && filteredSuggestions[activeHintIdx]) {
                    e.preventDefault();
                    onChange(filteredSuggestions[activeHintIdx].query);
                    setShowSuggestions(false);
                  }
                }}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <div className="rit-pill-actions">
              <button
                type="button"
                className="rit-pill-icon-btn"
                aria-label="Toggle suggested commands"
                title="Suggested commands"
                aria-expanded={showSuggestions}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowSuggestions((prev) => !prev)}
              >
                <Sparkles size={15} />
              </button>

              {speechSupported && (
                <button
                  type="button"
                  className={`rit-pill-icon-btn ${isListening ? 'is-listening' : ''}`}
                  aria-label={isListening ? 'Stop voice input' : 'Voice search'}
                  title={isListening ? 'Stop listening' : 'Voice search'}
                  onClick={toggleVoiceInput}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}
            </div>
          </div>
        </LiquidGlassSurface>

        <LiquidGlassSurface
          variant="orb"
          theme={theme}
          interactiveFluid
          className={`rit-submit-orb ${!value.trim() || isThinking ? 'is-disabled' : 'is-ready'}`}
        >
          <button
            type="submit"
            disabled={!value.trim() || isThinking}
            aria-label="Send message to RIT"
            title="Send to RIT"
            className="rit-submit-orb-btn"
          >
            <Send size={17} />
          </button>
        </LiquidGlassSurface>
      </form>
    </div>
  );
};
