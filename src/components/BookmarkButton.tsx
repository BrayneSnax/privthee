import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookmarkButtonProps {
  messageId: string;
}

export const BookmarkButton = ({ messageId }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      if (!error) {
        setIsBookmarked(false);
        toast({ title: "Bookmark removed" });
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          message_id: messageId,
        });

      if (!error) {
        setIsBookmarked(true);
        toast({ title: "Moment bookmarked" });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleBookmark}
      className={isBookmarked ? "text-yellow-500" : "text-muted-foreground"}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
    </Button>
  );
};
