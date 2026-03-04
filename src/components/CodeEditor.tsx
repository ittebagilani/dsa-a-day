import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { CodeLanguage, highlightCodeToHtml } from "@/components/CodeBlock";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  placeholder?: string;
  className?: string;
  minLines?: number;
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  placeholder = "",
  className,
  minLines = 10,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => {
    const valueLines = value ? value.split("\n") : [""];
    const lineCount = Math.max(minLines, valueLines.length);
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [minLines, value]);
  const lineCount = lines.length;
  const editorHeightPx = lineCount * 24 + 24;

  const highlightedLines = useMemo(() => {
    const normalizedValue = value || "";
    const htmlLines = highlightCodeToHtml(normalizedValue, language);
    const targetLength = Math.max(minLines, htmlLines.length || 1);

    while (htmlLines.length < targetLength) {
      htmlLines.push("&nbsp;");
    }

    return htmlLines;
  }, [language, minLines, value]);

  const syncScroll = () => {
    if (!textareaRef.current || !preRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  return (
    <div className={cn("rounded-lg border bg-code-bg overflow-hidden", className)}>
      <div className="px-4 py-2 bg-muted/50 border-b flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {language === "python" ? "Python" : "JavaScript"}
        </span>
      </div>
      <div className="relative" style={{ height: `${editorHeightPx}px` }}>
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="w-12 sm:w-14 shrink-0 select-none py-3 pr-2 text-muted-foreground/50 text-right bg-transparent border-r border-border/40">
            {lines.map((line) => (
              <div key={line} className="leading-6 min-h-6">
                {line}
              </div>
            ))}
          </div>
          <pre
            ref={preRef}
            className="flex-1 m-0 py-3 px-3 overflow-x-auto overflow-y-hidden text-sm leading-6 text-[hsl(var(--code-text))]"
          >
            <code>
              {highlightedLines.map((html, index) => (
                <div
                  key={index}
                  className="leading-6 min-h-6 whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </code>
          </pre>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          placeholder={placeholder}
          wrap="off"
          spellCheck={false}
          className="relative z-10 w-full h-full bg-transparent resize-none py-3 px-3 pl-[3.75rem] sm:pl-[4.25rem] font-mono text-sm leading-6 text-transparent caret-foreground outline-none overflow-x-auto overflow-y-hidden"
          style={{ WebkitTextFillColor: "transparent", lineHeight: "1.5rem" }}
        />
        {!value && placeholder && (
          <div className="absolute z-0 left-[3.75rem] sm:left-[4.25rem] top-3 text-sm text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
