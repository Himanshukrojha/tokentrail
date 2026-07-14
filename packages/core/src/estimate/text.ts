import { encode } from "gpt-tokenizer/model/gpt-4o";

export function estimateTextTokens(prompt: string): number {
  return encode(prompt).length;
}
