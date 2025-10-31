import { useEffect, useState } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationHistoryProps {
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationHistory = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) setConversations(data);
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm border-r border-border/40">
      <div className="p-4 border-b border-border/40">
        <Button
          onClick={onNewConversation}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                currentConversationId === conv.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <div className="font-medium truncate text-sm">
                {conv.title || "Untitled"}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
