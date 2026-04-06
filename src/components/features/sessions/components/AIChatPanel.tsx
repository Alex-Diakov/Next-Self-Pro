import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Icon } from '../../../../components/ui/Icon';
import { cn } from '../../../../lib/utils';
import { ChatMessage } from '../../../../types';

interface AIChatPanelProps {
  messages: ChatMessage[];
  isAnalyzing: boolean;
  inputMessage: string;
  setInputMessage: (text: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const AIChatPanel = React.memo(function AIChatPanel({
  messages,
  isAnalyzing,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  messagesEndRef
}: AIChatPanelProps) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={cn(
              "flex max-w-[85%]",
              msg.role === 'user' ? "ml-auto" : "mr-auto"
            )}
          >
            <div className={cn(
              "p-5 rounded-3xl text-sm leading-relaxed shadow-xl border-t border-border-glass",
              msg.role === 'user' 
                ? "bg-accent/20 border border-accent/30 text-primary backdrop-blur-md glow-accent" 
                : "bg-surface-highlight border border-border text-secondary backdrop-blur-md prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-primary prose-headings:font-bold prose-strong:text-primary"
            )}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </motion.div>
        ))}
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex max-w-[85%] mr-auto"
          >
            <div className="p-5 rounded-3xl bg-surface-highlight border border-border flex items-center gap-3 text-muted backdrop-blur-md shadow-lg">
              <Icon name="sync" className="text-xl animate-spin text-accent" />
              <span className="text-sm font-mono font-medium">Analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-6 border-t border-border bg-background/60 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="relative flex items-center bg-surface-hover border border-border rounded-3xl overflow-hidden focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all shadow-inner">
          <div className="pl-6 pr-3 text-accent font-mono font-bold select-none text-lg">
            &gt;_
          </div>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Query AI Analysis Engine..."
            className="w-full bg-transparent text-secondary py-5 pr-16 text-sm focus:outline-none placeholder:text-subtle font-mono font-medium"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAnalyzing}
            className="absolute right-3 w-12 h-12 flex items-center justify-center bg-premium-gradient text-background rounded-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all duration-300 shadow-lg shadow-accent/20 border-t border-border-premium glow-accent"
          >
            <Icon name="send" filled className="text-xl ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
});
