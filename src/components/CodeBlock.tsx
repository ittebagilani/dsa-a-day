import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  className?: string;
}

// Escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Highlight syntax using a token-based approach to avoid double-replacement
const highlightPythonLine = (line: string): string => {
  const tokens: Array<{ type: string; value: string; start: number; end: number }> = [];

  // Find all strings first (they take precedence)
  const stringRegex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  let match;
  while ((match = stringRegex.exec(line)) !== null) {
    tokens.push({ type: 'string', value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Find all comments
  const commentRegex = /(#.*$)/g;
  while ((match = commentRegex.exec(line)) !== null) {
    // Only add if not inside a string
    const isInString = tokens.some(t => t.type === 'string' && match!.index >= t.start && match!.index < t.end);
    if (!isInString) {
      tokens.push({ type: 'comment', value: match[0], start: match.index, end: match.index + match[0].length });
    }
  }

  // Find all numbers
  const numberRegex = /\b(\d+(?:\.\d+)?)\b/g;
  while ((match = numberRegex.exec(line)) !== null) {
    const isInToken = tokens.some(t => match!.index >= t.start && match!.index < t.end);
    if (!isInToken) {
      tokens.push({ type: 'number', value: match[0], start: match.index, end: match.index + match[0].length });
    }
  }

  // Find all keywords
  const keywordRegex = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|True|False|None|and|or|not|in|is|pass|break|continue|yield|assert|raise|global|nonlocal)\b/g;
  while ((match = keywordRegex.exec(line)) !== null) {
    const isInToken = tokens.some(t => match!.index >= t.start && match!.index < t.end);
    if (!isInToken) {
      tokens.push({ type: 'keyword', value: match[0], start: match.index, end: match.index + match[0].length });
    }
  }

  // Find all function names (including built-ins)
  const functionRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  while ((match = functionRegex.exec(line)) !== null) {
    const funcName = match[1];
    const isInToken = tokens.some(t => match!.index >= t.start && match!.index < t.end);
    if (!isInToken) {
      tokens.push({ type: 'function', value: funcName, start: match.index, end: match.index + funcName.length });
    }
  }

  // Sort tokens by start position
  tokens.sort((a, b) => a.start - b.start);

  // Build the highlighted line
  let result = '';
  let lastIndex = 0;

  for (const token of tokens) {
    // Add text before this token
    if (token.start > lastIndex) {
      result += escapeHtml(line.substring(lastIndex, token.start));
    }

    // Add the highlighted token
    const className = `code-${token.type}`;
    result += `<span class="${className}">${escapeHtml(token.value)}</span>`;
    lastIndex = token.end;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    result += escapeHtml(line.substring(lastIndex));
  }

  return result || '&nbsp;';
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
      {language && (
        <div className="px-4 py-2 bg-muted/50 border-b flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {language === "python" ? "Python" : "JavaScript"}
          </span>
        </div>
      )}
      <pre className="m-0 p-0">
        <code>
          {lines.map((line, index) => {
            const isHighlighted = highlightLines.includes(index + 1);
            const highlighted = language === "python" ? highlightPythonLine(line) : escapeHtml(line);

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
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
