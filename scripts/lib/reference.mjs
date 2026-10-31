// Helpers for reading the offline reference capture in docs/reference/.
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

export const REF_DIR = path.resolve(import.meta.dirname, "../../docs/reference");
export const HTML_DIR = path.join(REF_DIR, "html");

/** Server HTML of a captured page, by capture name ("home", "puppies__maltipoo-max-male", …). */
export const readPage = (name) => readFileSync(path.join(HTML_DIR, `${name}.html`), "utf8");

export const parsePage = (name) => parse(readPage(name));

/**
 * The Next.js flight (RSC) payload inlined in the page as self.__next_f.push([1,"…"]) chunks,
 * JSON-decoded and concatenated. Client components' props live in here as JSON.
 */
export function flight(html) {
  const re = /self\.__next_f\.push\(\[1,"(.*?)"\]\)<\/script>/gs;
  let out = "";
  for (const m of html.matchAll(re)) out += JSON.parse(`"${m[1]}"`);
  return out;
}

/** Return the JSON value (object or array) starting at index `start`, matching brackets outside strings. */
export const sliceJson = (text, start) => JSON.parse(text.slice(start, jsonEnd(text, start)));

/** Index just past the JSON value that starts at `start`. */
export function jsonEnd(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error(`Unterminated JSON value at ${start}`);
}

/** First JSON value that follows `"key":` at or after `from`, or undefined when absent. */
export function jsonAfterKey(text, key, from = 0) {
  const found = locateJsonAfterKey(text, key, from);
  return found && JSON.parse(text.slice(found.start, found.end));
}

/** Start/end offsets of the first JSON value that follows `"key":` at or after `from`. */
export function locateJsonAfterKey(text, key, from = 0) {
  const needle = `"${key}":`;
  const at = text.indexOf(needle, from);
  if (at < 0) return undefined;
  const start = at + needle.length;
  return { start, end: jsonEnd(text, start) };
}

export const clean = (s) => s.replace(/\s+/g, " ").trim();
