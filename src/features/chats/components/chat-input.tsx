'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Smile, Image as ImageIcon, X, Loader2, Mic, AtSign } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string, attachments?: File[]) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  typingUsers?: string[];
  onTyping?: () => void;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...', typingUsers = [], onTyping }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const content = value.trim();
    if ((!content && attachments.length === 0) || busy || disabled) return;

    setBusy(true);
    try {
      await onSend(content, attachments.length > 0 ? attachments : undefined);
      setValue('');
      setAttachments([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setBusy(false);
    }
  }, [value, attachments, busy, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';

      // Notify typing
      if (newValue && onTyping) {
        onTyping();
      }
    },
    [onTyping]
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 5)); // Max 5 files
    e.target.value = ''; // Reset input
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  return (
    <div className="p-3 bg-white border-t border-slate-100">
      {/* Typing indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <motion.div className="flex gap-0.5" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d43d8]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d43d8]" style={{ animationDelay: '0.2s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1d43d8]" style={{ animationDelay: '0.4s' }} />
              </motion.div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.slice(0, 2).join(', ')}${typingUsers.length > 2 ? ` and ${typingUsers.length - 2} others` : ''} are typing...`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {file.type.startsWith('image/') ? (
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        width={64}
                        height={64}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-16 px-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600 truncate max-w-20">{file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div
        className={cn(
          'flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200',
          isFocused ? 'border-[#1d43d8]/30 bg-white shadow-sm ring-2 ring-[#1d43d8]/10' : 'border-slate-200 bg-slate-50'
        )}
      >
        {/* Left action buttons */}
        <div className="flex items-center gap-0.5 pb-0.5">
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileSelect} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || attachments.length >= 5}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10"
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none min-h-[36px] max-h-[150px] py-2 px-1',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Right action buttons */}
        <div className="flex items-center gap-0.5 pb-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10"
            disabled={disabled}
          >
            <AtSign className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400 hover:text-[#1d43d8] hover:bg-[#1d43d8]/10"
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Send/Voice button */}
          <motion.div animate={{ scale: hasContent ? 1.05 : 1 }} transition={{ duration: 0.15 }}>
            <Button
              onClick={hasContent ? handleSend : undefined}
              disabled={busy || disabled || !hasContent}
              size="icon"
              className={cn(
                'h-9 w-9 rounded-full transition-all duration-200',
                hasContent
                  ? 'bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white shadow-md shadow-[#1d43d8]/25'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              )}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : hasContent ? <Send className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-[10px] text-slate-400 mt-1.5 ml-2">
        Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}

export default ChatInput;
