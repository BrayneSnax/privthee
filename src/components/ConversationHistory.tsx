import { useEffect, useState } from "react";
import { Clock, Plus, LogOut, FileText, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from "./ui/sidebar";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  storage_path: string;
  parsed_at: string;
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
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    loadDocuments();
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

  const loadDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('knowledge_documents')
      .select('id, title, storage_path, parsed_at')
      .eq('user_id', user.id)
      .order('parsed_at', { ascending: false });

    if (data) setDocuments(data);
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('knowledge-documents')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document removed from field');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Could not remove document');
    }
  };

  const handleStartEdit = (doc: KnowledgeDocument) => {
    setEditingDocId(doc.id);
    setEditTitle(doc.title);
  };

  const handleSaveEdit = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_documents')
        .update({ title: editTitle })
        .eq('id', docId);

      if (error) throw error;

      setDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, title: editTitle } : d
      ));
      setEditingDocId(null);
      toast.success('Document title updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Could not update title');
    }
  };

  const handleCancelEdit = () => {
    setEditingDocId(null);
    setEditTitle("");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar 
      collapsible="offcanvas"
      className="border-r border-border/40"
    >
      <SidebarHeader className="p-4 border-b border-border/40 space-y-2">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start"
          variant="outline"
          title="New Conversation"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="ml-2">New Conversation</span>
        </Button>
        
        <Button
          onClick={handleSignOut}
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="ml-2">Sign Out</span>
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="flex-1 p-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conversations
            </h3>
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

          {documents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Knowledge Field
                </h3>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    {editingDocId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-sm"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleSaveEdit(doc.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm">
                              {doc.title}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(doc.parsed_at), { addSuffix: true })}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={() => handleStartEdit(doc)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteDocument(doc.id, doc.storage_path)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};
