import sanitizeHtml from "sanitize-html";

const defaultAllowedTags = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "a", "b", "i", "strong", "em", "strike", "code", "pre", "hr", "br",
  "div", "table", "thead", "caption", "tbody", "tr", "th", "td",
  "blockquote", "ul", "ol", "li", "span", "img", "figure", "figcaption"
];

const defaultAllowedAttributes: Record<string, string[]> = {
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "loading", "class", "style"],
  figure: ["class", "style"],
  figcaption: ["class", "style"],
  "*": ["class", "id", "style"],
};

export function sanitizeContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  return sanitizeHtml(dirtyHtml, {
    allowedTags: defaultAllowedTags,
    allowedAttributes: defaultAllowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "data"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isExternal = href.startsWith("http://") || href.startsWith("https://");
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
  });
}
