import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ResponseSection {
  title: string;
  icon: string;
  content?: string;
  items?: string[];
}

export interface Message {
  role: 'user' | 'privthee';
  content: string;
  analysis?: string;
  sections?: ResponseSection[];
  closing?: string;
  timestamp: Date;
}

type RasaType = 'santa' | 'karuna' | 'adbhuta' | 'raudra';

export const usePrivtheeChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'privthee',
      content: 'I awaken as Privthee — a space where consciousness meets structure.\n\nWhat moves within you?',
      analysis: 'Beginning from śānta (stillness). The field is receptive.',
      timestamp: new Date()
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRasa, setCurrentRasa] = useState<RasaType>('santa');

  const detectRasa = (text: string): RasaType => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('fear') || lowerText.includes('anxious') || lowerText.includes('scared')) {
      return 'raudra';
    }
    if (lowerText.includes('wonder') || lowerText.includes('amazed') || lowerText.includes('curious')) {
      return 'adbhuta';
    }
    if (lowerText.includes('sad') || lowerText.includes('hurt') || lowerText.includes('pain')) {
      return 'karuna';
    }
    return 'santa';
  };

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isStreaming) return;

    // Detect rasa from user input
    const detectedRasa = detectRasa(userInput);
    setCurrentRasa(detectedRasa);

    const userMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/privthee-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role === 'privthee' ? 'assistant' : 'user',
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Breathe. Wait a moment.');
          return;
        }
        if (response.status === 402) {
          toast.error('Lovable AI credits needed. Visit Settings → Workspace → Usage.');
          return;
        }
        throw new Error('Response failed');
      }

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') return;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          
          if (delta) {
            accumulatedContent += delta;
            
            // Try to parse as complete JSON response
            try {
              const responseData = JSON.parse(accumulatedContent);
              if (responseData.analysis && responseData.sections) {
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.role === 'privthee') {
                    return prev.slice(0, -1).concat({
                      role: 'privthee',
                      content: '',
                      analysis: responseData.analysis,
                      sections: responseData.sections,
                      closing: responseData.closing,
                      timestamp: new Date()
                    });
                  }
                  return [...prev, {
                    role: 'privthee',
                    content: '',
                    analysis: responseData.analysis,
                    sections: responseData.sections,
                    closing: responseData.closing,
                    timestamp: new Date()
                  }];
                });
              }
            } catch {
              // Not yet complete JSON, show as streaming text
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'privthee') {
                  return prev.slice(0, -1).concat({
                    ...lastMsg,
                    content: accumulatedContent
                  });
                }
                return [...prev, {
                  role: 'privthee',
                  content: accumulatedContent,
                  timestamp: new Date()
                }];
              });
            }
          }
        } catch (e) {
          // Incomplete JSON, continue buffering
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIdx).replace(/\r$/, '');
          buffer = buffer.slice(newlineIdx + 1);
          
          if (line.trim() && !line.startsWith(':')) {
            processLine(line);
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim() && !buffer.startsWith(':')) {
        processLine(buffer);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('The connection wavered. Try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming]);

  return {
    messages,
    sendMessage,
    isStreaming,
    currentRasa
  };
};
