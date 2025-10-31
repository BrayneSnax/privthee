import { useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface VisualMetaphorGeneratorProps {
  metaphorText: string;
}

export const VisualMetaphorGenerator = ({ metaphorText }: VisualMetaphorGeneratorProps) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-visual-metaphor`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: metaphorText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const { imageUrl } = await response.json();
      setGeneratedImage(imageUrl);

      toast({
        title: "Visual metaphor manifested",
        description: "The inner landscape becomes visible",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation failed",
        description: "The image could not manifest",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={generateImage}
        disabled={isGenerating}
        className="text-muted-foreground hover:text-foreground"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ImageIcon className="h-4 w-4 mr-2" />
        )}
        Manifest visual metaphor
      </Button>

      {generatedImage && (
        <img
          src={generatedImage}
          alt="Visual metaphor"
          className="rounded-lg border border-border/40 w-full"
        />
      )}
    </div>
  );
};
