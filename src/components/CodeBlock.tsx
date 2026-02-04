import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  className?: string;
}

// Simple syntax highlighting for demo purposes
const highlightSyntax = (code: string): React.ReactNode[] => {
  const lines = code.split('\n');
  
  return lines.map((line, index) => {
    // Simple keyword replacement for visual effect
    let highlighted = line
      // Keywords
      .replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|typeof|instanceof)\b/g, 
        '<span class="code-keyword">$1</span>')
      // Strings
      .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, 
        '<span class="code-string">$&</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, 
        '<span class="code-number">$1</span>')
      // Comments
      .replace(/(\/\/.*$)/g, 
        '<span class="code-comment">$1</span>')
      // Function names
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, 
        '<span class="code-function">$1</span>(');
    
    return (
      <span 
        key={index} 
        className="code-line"
        dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }}
      />
    );
  });
};

export function CodeBlock({ 
  code, 
  language = "javascript",
  highlightLines = [],
  showLineNumbers = true,
  className 
}: CodeBlockProps) {
  const lines = code.split('\n');
  
  return (
    <div className={cn("code-block font-mono", className)}>
      <pre className="m-0 p-0">
        <code>
          {lines.map((line, index) => {
            const isHighlighted = highlightLines.includes(index + 1);
            // Simple keyword replacement for visual effect
            let highlighted = line
              .replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|typeof|instanceof|null|undefined|true|false)\b/g, 
                '<span class="code-keyword">$1</span>')
              .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, 
                '<span class="code-string">$&</span>')
              .replace(/\b(\d+)\b/g, 
                '<span class="code-number">$1</span>')
              .replace(/(\/\/.*$)/g, 
                '<span class="code-comment">$1</span>')
              .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, 
                '<span class="code-function">$1</span>(');
            
            return (
              <div 
                key={index}
                className={cn(
                  "flex leading-relaxed",
                  isHighlighted && "bg-warning/10 -mx-4 px-4 border-l-2 border-warning"
                )}
              >
                {showLineNumbers && (
                  <span className="select-none pr-4 text-muted-foreground/50 w-8 text-right">
                    {index + 1}
                  </span>
                )}
                <span 
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }}
                />
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
