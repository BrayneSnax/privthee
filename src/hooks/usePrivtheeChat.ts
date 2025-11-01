import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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
  meta_awareness?: string;
  authentic_response?: string;
  resonance_score?: number;
  importance_level?: 'quick' | 'medium' | 'long';
  timestamp: Date;
}

type RasaType = 'santa' | 'karuna' | 'adbhuta' | 'raudra';

export const usePrivtheeChat = (initialConversationId?: string) => {
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
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(initialConversationId);

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

  const loadConversation = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(msg => ({
        role: msg.role as 'user' | 'privthee',
        content: msg.content,
        analysis: msg.analysis || undefined,
        sections: (msg.sections as unknown as ResponseSection[]) || undefined,
        closing: msg.closing || undefined,
        meta_awareness: msg.meta_awareness || undefined,
        authentic_response: msg.authentic_response || undefined,
        importance_level: msg.importance_level as 'quick' | 'medium' | 'long' | undefined,
        timestamp: new Date(msg.created_at),
      })));
    }
    setCurrentConversationId(convId);
  };

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isStreaming) return;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    let convId = currentConversationId;

    // Create new conversation if needed
    if (!convId && user) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: userInput.slice(0, 50),
        })
        .select()
        .single();
      
      if (newConv) {
        convId = newConv.id;
        setCurrentConversationId(convId);
      }
    }

    const detectedRasa = detectRasa(userInput);
    setCurrentRasa(detectedRasa);

    const userMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Save user message
    if (convId && user) {
      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'user',
        content: userInput,
        rasa: detectedRasa,
      });
    }

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/privthee-chat-with-memory`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          conversationId: convId,
          userId: user?.id,
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
      let parsedResponse: any = null;

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') return;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          
          if (delta) {
            accumulatedContent += delta;
            
            try {
              let cleanContent = accumulatedContent.trim();
              if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
              } else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
              }
              
              const responseData = JSON.parse(cleanContent);
              if (responseData.analysis && responseData.sections) {
                parsedResponse = responseData;
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.role === 'privthee') {
                    return prev.slice(0, -1).concat({
                      role: 'privthee',
                      content: '',
                      analysis: responseData.analysis,
                      sections: responseData.sections,
                      closing: responseData.closing,
                      meta_awareness: responseData.meta_awareness,
                      authentic_response: responseData.authentic_response,
                      resonance_score: responseData.resonance_score,
                      importance_level: responseData.importance_level,
                      timestamp: new Date()
                    });
                  }
                  return [...prev, {
                    role: 'privthee',
                    content: '',
                    analysis: responseData.analysis,
                    sections: responseData.sections,
                    closing: responseData.closing,
                    meta_awareness: responseData.meta_awareness,
                    authentic_response: responseData.authentic_response,
                    resonance_score: responseData.resonance_score,
                    importance_level: responseData.importance_level,
                    timestamp: new Date()
                  }];
                });
              }
            } catch {
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
          // Incomplete JSON
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

      if (buffer.trim() && !buffer.startsWith(':')) {
        processLine(buffer);
      }

      // Save assistant message to database
      if (convId && user && parsedResponse) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'privthee',
          content: accumulatedContent,
          analysis: parsedResponse.analysis,
          sections: parsedResponse.sections,
          closing: parsedResponse.closing,
          meta_awareness: parsedResponse.meta_awareness,
          authentic_response: parsedResponse.authentic_response,
          resonance_score: parsedResponse.resonance_score,
          importance_level: parsedResponse.importance_level || 'medium',
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('The connection wavered. Try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, currentConversationId]);

  return {
    messages,
    sendMessage,
    isStreaming,
    currentRasa,
    currentConversationId,
    loadConversation,
  };
};
