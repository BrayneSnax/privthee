import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const DocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload documents",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to parse document");
      }

      const { documentId } = await response.json();

      toast({
        title: "Document absorbed",
        description: `${file.name} has been added to Privthee's knowledge field`,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "The document could not be absorbed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="document-upload"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <label htmlFor="document-upload">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          disabled={isUploading}
          asChild
        >
          <span className="cursor-pointer">
            {isUploading ? (
              <FileText className="h-5 w-5 animate-pulse" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};
