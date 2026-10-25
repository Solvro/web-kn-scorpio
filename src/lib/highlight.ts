export interface TextSegment {
  text: string;
  highlighted: boolean;
}

/** Splits CMS text on `*highlight*` markers. Unbalanced markers are kept as plain text. */
export function parseHighlights(source: string): TextSegment[] {
  return source
    .split(/(\*[^*\n]+\*)/)
    .filter((part) => part !== "")
    .map((part) =>
      part.length > 2 && part.startsWith("*") && part.endsWith("*")
        ? { text: part.slice(1, -1), highlighted: true }
        : { text: part, highlighted: false },
    );
}

/** A word as its highlighted and plain parts, e.g. "*Marsa*." -> [Marsa, .]. */
export interface HighlightedWord {
  parts: TextSegment[];
}

/**
 * Splits CMS text into words for per-word animations. Words break only at
 * whitespace, so punctuation written right after a highlight ("na *Marsa*.")
 * stays attached to its word instead of becoming a separate one.
 */
export function highlightedWords(source: string): HighlightedWord[] {
  const words: HighlightedWord[] = [];
  let continuesWord = false;
  for (const segment of parseHighlights(source)) {
    for (const token of segment.text.split(/(\s+)/)) {
      if (token === "") {
        continue;
      }
      if (/^\s+$/.test(token)) {
        continuesWord = false;
        continue;
      }
      const part = { text: token, highlighted: segment.highlighted };
      const previous = words.at(-1);
      if (continuesWord && previous != null) {
        previous.parts.push(part);
      } else {
        words.push({ parts: [part] });
      }
      continuesWord = true;
    }
  }
  return words;
}

/** Plain text of a word, for keys and labels. */
export function wordText(word: HighlightedWord) {
  return word.parts.map((part) => part.text).join("");
}
