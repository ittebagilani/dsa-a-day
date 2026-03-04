import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: CodeLanguage;
  showLineNumbers?: boolean;
  className?: string;
}

export type CodeLanguage = "python" | "javascript";

// Escape HTML to prevent XSS
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const createHighlightLineFn = (language: CodeLanguage) => (line: string): string => {
  const tokens: Array<{ type: string; value: string; start: number; end: number }> = [];
  const keywordRegex =
    language === "python"
      ? /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|True|False|None|and|or|not|in|is|pass|break|continue|yield|assert|raise|global|nonlocal)\b/g
      : /\b(function|const|let|var|if|else|for|while|return|import|from|export|class|new|try|catch|finally|switch|case|default|break|continue|true|false|null|undefined|await|async|throw)\b/g;
  const commentRegex = language === "python" ? /(#.*$)/g : /(\/\/.*$)/g;

  // Find all strings first (they take precedence)
  const stringRegex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  let match;
  while ((match = stringRegex.exec(line)) !== null) {
    tokens.push({ type: 'string', value: match[0], start: match.index, end: match.index + match[0].length });
  }

  // Find all comments
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
  while ((match = keywordRegex.exec(line)) !== null) {
    const isInToken = tokens.some(t => match!.index >= t.start && match!.index < t.end);
    if (!isInToken) {
      tokens.push({ type: 'keyword', value: match[0], start: match.index, end: match.index + match[0].length });
    }
  }

  // Find operators and assignment symbols
  const operatorRegex = /(\+|\-|\*|\/|%|==|!=|<=|>=|=|<|>|\||&|\^|!)/g;
  while ((match = operatorRegex.exec(line)) !== null) {
    const isInToken = tokens.some(t => match!.index >= t.start && match!.index < t.end);
    if (!isInToken) {
      tokens.push({ type: 'operator', value: match[0], start: match.index, end: match.index + match[0].length });
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
    const tokenStyleByType: Record<string, string> = {
      keyword: 'color:hsl(var(--code-keyword));',
      string: 'color:hsl(var(--code-string));',
      function: 'color:hsl(var(--code-function));',
      comment: 'color:hsl(var(--code-comment));font-style:italic;',
      number: 'color:hsl(var(--code-number));',
      operator: 'color:hsl(var(--code-operator));',
    };
    const style = tokenStyleByType[token.type] || 'color:hsl(var(--code-text));';
    result += `<span style="${style}">${escapeHtml(token.value)}</span>`;
    lastIndex = token.end;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    result += escapeHtml(line.substring(lastIndex));
  }

  return result || '&nbsp;';
};

export const highlightCodeToHtml = (code: string, language: CodeLanguage = "javascript"): string[] => {
  const highlightLine = createHighlightLineFn(language);
  return code.split('\n').map((line) => highlightLine(line));
};

export function CodeBlock({ 
  code, 
  language = "javascript",
  showLineNumbers = true,
  className 
}: CodeBlockProps) {
  const lines = code.split('\n');
  const highlightedLines = highlightCodeToHtml(code, language);
  
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
          {lines.map((_, index) => {
            return (
              <div
                key={index}
                className="flex items-start leading-6"
              >
                {showLineNumbers && (
                  <span className="select-none pr-3 sm:pr-4 text-muted-foreground/50 w-9 sm:w-10 text-right leading-6 shrink-0">
                    {index + 1}
                  </span>
                )}
                <span
                  className="flex-1 leading-6 whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: highlightedLines[index] }}
                />
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
