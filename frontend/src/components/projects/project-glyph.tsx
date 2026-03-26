import { Blocks, FileStack, Globe2, Sparkles, SquareTerminal } from "lucide-react";

interface ProjectGlyphProps {
  iconKey: string;
}

export function ProjectGlyph({ iconKey }: ProjectGlyphProps) {
  const Icon =
    {
      spark: Sparkles,
      server: SquareTerminal,
      globe: Globe2,
      docs: FileStack,
    }[iconKey] ?? Blocks;

  return <Icon className="h-5 w-5" />;
}
