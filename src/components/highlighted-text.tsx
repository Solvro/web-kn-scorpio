import { parseHighlights } from "@/lib/highlight";

/** Renders CMS text, colouring `*highlighted*` parts with the accent. */
export function HighlightedText({ text }: { text: string }) {
  return (
    <>
      {parseHighlights(text).map((segment, index) =>
        segment.highlighted ? (
          <span
            key={`${String(index)}-${segment.text}`}
            className="text-primary"
          >
            {segment.text}
          </span>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}
