export interface TextLayoutOptions {
  width: number;
  fontSize?: number;
  lineHeight?: number;
  padding?: number;
  maxLinesPerPage?: number;
}

export interface TextPage {
  pageIndex: number;
  lines: string[];
  charStart: number;
  charEnd: number;
}

export interface TextLayoutResult {
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
  padding: number;
  charsPerLine: number;
  pages: TextPage[];
}

export function wrapLine(line: string, charsPerLine: number): string[] {
  if (line.length <= charsPerLine) return [line];

  const wrapped: string[] = [];
  let remaining = line;
  while (remaining.length > charsPerLine) {
    wrapped.push(remaining.slice(0, charsPerLine));
    remaining = remaining.slice(charsPerLine);
  }
  if (remaining.length > 0) wrapped.push(remaining);
  return wrapped;
}

export function layoutPromptPages(
  prompt: string,
  options: TextLayoutOptions,
): TextLayoutResult {
  const fontSize = options.fontSize ?? 14;
  const lineHeight = options.lineHeight ?? 1.4;
  const padding = options.padding ?? 32;
  const maxLinesPerPage = options.maxLinesPerPage ?? Number.POSITIVE_INFINITY;

  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.max(
    1,
    Math.floor((options.width - padding * 2) / avgCharWidth),
  );

  const allLines: string[] = [];
  for (const rawLine of prompt.split("\n")) {
    allLines.push(...wrapLine(rawLine, charsPerLine));
  }

  const pages: TextPage[] = [];
  let charCursor = 0;

  for (let i = 0; i < allLines.length; i += maxLinesPerPage) {
    const slice = allLines.slice(i, i + maxLinesPerPage);
    const charStart = charCursor;
    const pageText = slice.join("\n");
    charCursor += pageText.length + (i + slice.length < allLines.length ? 1 : 0);

    pages.push({
      pageIndex: pages.length,
      lines: slice,
      charStart,
      charEnd: charStart + pageText.length,
    });
  }

  if (pages.length === 0) {
    pages.push({ pageIndex: 0, lines: [""], charStart: 0, charEnd: 0 });
  }

  const tallestPageLines = Math.max(...pages.map((p) => p.lines.length));
  const height = Math.ceil(tallestPageLines * fontSize * lineHeight + padding * 2);

  return {
    width: options.width,
    height,
    fontSize,
    lineHeight,
    padding,
    charsPerLine,
    pages,
  };
}
