import type { ElementType, ReactNode } from "react";

/** A small, self-contained Markdown renderer covering exactly what duty
 * content needs: headings, paragraphs, bullet/numbered/checklist lists,
 * blockquotes, bold/italic, and links. Not a general-purpose Markdown
 * engine — deliberately narrow instead of pulling in a new dependency for
 * this bounded feature set. */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // bold, italic, links — single pass, left to right, non-overlapping.
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-${i++}`}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      nodes.push(
        <a key={`${keyPrefix}-${i++}`} href={match[4]} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
          {match[3]}
        </a>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

interface Block {
  type: "heading" | "paragraph" | "bullet" | "number" | "checklist" | "quote";
  level?: number;
  lines: string[];
  checked?: boolean[];
}

function parseBlocks(content: string): Block[] {
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();
    if (line.trim() === "") continue;

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    const checklistMatch = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    const bulletMatch = /^[-*]\s+(.*)$/.exec(line);
    const numberMatch = /^\d+\.\s+(.*)$/.exec(line);
    const quoteMatch = /^>\s?(.*)$/.exec(line);

    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, lines: [headingMatch[2]] });
    } else if (checklistMatch) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "checklist") {
        last.lines.push(checklistMatch[2]);
        last.checked!.push(checklistMatch[1].toLowerCase() === "x");
      } else {
        blocks.push({ type: "checklist", lines: [checklistMatch[2]], checked: [checklistMatch[1].toLowerCase() === "x"] });
      }
    } else if (bulletMatch) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "bullet") last.lines.push(bulletMatch[1]);
      else blocks.push({ type: "bullet", lines: [bulletMatch[1]] });
    } else if (numberMatch) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "number") last.lines.push(numberMatch[1]);
      else blocks.push({ type: "number", lines: [numberMatch[1]] });
    } else if (quoteMatch) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "quote") last.lines.push(quoteMatch[1]);
      else blocks.push({ type: "quote", lines: [quoteMatch[1]] });
    } else {
      const last = blocks[blocks.length - 1];
      if (last?.type === "paragraph") last.lines.push(line);
      else blocks.push({ type: "paragraph", lines: [line] });
    }
  }
  return blocks;
}

const HEADING_CLASSES: Record<number, string> = {
  1: "text-lg font-semibold text-foreground mt-5 mb-2",
  2: "text-base font-semibold text-foreground mt-5 mb-2",
  3: "text-[15px] font-semibold text-foreground mt-4 mb-1.5",
  4: "text-sm font-semibold text-foreground mt-4 mb-1.5",
  5: "text-sm font-semibold text-foreground mt-3 mb-1",
  6: "text-sm font-semibold text-muted-foreground mt-3 mb-1",
};

export function MarkdownContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        const key = `block-${i}`;
        if (block.type === "heading") {
          const Tag = `h${Math.min(block.level ?? 2, 6)}` as ElementType;
          return (
            <Tag key={key} className={HEADING_CLASSES[block.level ?? 2]}>
              {renderInline(block.lines[0], key)}
            </Tag>
          );
        }
        if (block.type === "bullet") {
          return (
            <ul key={key} className="list-disc space-y-1 pl-5">
              {block.lines.map((line, j) => (
                <li key={j}>{renderInline(line, `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "number") {
          return (
            <ol key={key} className="list-decimal space-y-1 pl-5">
              {block.lines.map((line, j) => (
                <li key={j}>{renderInline(line, `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === "checklist") {
          return (
            <ul key={key} className="space-y-1.5">
              {block.lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2">
                  <input type="checkbox" checked={block.checked?.[j]} readOnly disabled className="mt-1 h-3.5 w-3.5" />
                  <span className={block.checked?.[j] ? "text-muted-foreground line-through" : ""}>{renderInline(line, `${key}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={key} className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground">
              {block.lines.map((line, j) => (
                <p key={j}>{renderInline(line, `${key}-${j}`)}</p>
              ))}
            </blockquote>
          );
        }
        return (
          <p key={key}>
            {block.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(line, `${key}-${j}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
