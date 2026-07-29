import React, { useState, useEffect, useRef } from 'react';
import { documentService, AIChatMessage } from '../../../core/api/documentService';
import '../../../styles/analysis.css';

interface AIChatSidebarProps {
  documentId: string;
}

const SUGGESTED_PROMPTS = [
  "Summarize the key obligations.",
  "Are there any hidden fees?",
  "Explain the termination clause.",
  "What is the governing law?"
];

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ documentId }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hello! I'm JurisMind AI. I've analyzed your document. What would you like to know?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Try to load initial chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await documentService.getChatHistory(documentId);
        const resData = response.data;
        if (resData.success && resData.data.length > 0) {
          setMessages(resData.data);
        }
      } catch (err) {
        // Backend TODO: Ignore 404
      }
    };
    fetchHistory();
  }, [documentId]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await documentService.sendChatMessage(documentId, text);
      const resData = response.data;
      if (resData.success) {
        setMessages((prev) => [...prev, resData.data]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          content: "Sorry, the AI Chat endpoint (`POST /api/v1/documents/:id/chat`) has not been implemented on the backend yet. (TODO)",
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Very basic markdown bold renderer for chat
  const renderContent = (content: string) => {
    const html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <>
      <div className="chat-header">
        <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'bold' }}>JurisMind Assistant</h3>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-400)', backgroundColor: 'var(--color-bg-secondary)', padding: '2px 8px', borderRadius: '12px' }}>
          GPT-4 Powered
        </span>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'user' ? 'U' : '⚖️'}
            </div>
            <div>
              <div className="chat-bubble">
                {renderContent(msg.content)}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: 'var(--color-text-muted)', 
                marginTop: '4px',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                display: 'flex',
                gap: '8px',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'ai' && (
                  <>
                    <button onClick={() => handleCopy(msg.content)} style={{ background: 'none', border: 'none', color: 'var(--color-brand-400)', cursor: 'pointer', fontSize: '10px' }}>Copy</button>
                    <button onClick={() => handleSend(messages[messages.length - 2].content)} style={{ background: 'none', border: 'none', color: 'var(--color-brand-400)', cursor: 'pointer', fontSize: '10px' }}>Regenerate</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message ai">
            <div className="chat-avatar">⚖️</div>
            <div className="chat-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '0 var(--space-4) var(--space-2)' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{ 
                whiteSpace: 'nowrap',
                fontSize: 'var(--text-xs)',
                padding: '4px 12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                color: 'var(--color-brand-300)',
                cursor: 'pointer'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-input-container">
        <form 
          className="chat-input-wrapper" 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder="Ask a question about this contract..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!inputValue.trim() || isLoading}
          >
            ↑
          </button>
        </form>
      </div>
    </>
  );
};
