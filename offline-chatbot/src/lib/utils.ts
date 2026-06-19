import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseMessageContent(content: string) {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const match = content.match(thinkRegex);

  if (match) {
    // Both <think> and </think> are present
    const thinkingText = match[1];
    const cleanText = content.replace(thinkRegex, "").trim();
    return {
      isThinking: false,
      thinkingText,
      cleanText,
    };
  }

  if (content.includes("<think>")) {
    // <think> is present, but no </think> yet (still thinking)
    const parts = content.split("<think>");
    const thinkingText = parts[1] || "";
    const cleanText = parts[0] || "";
    return {
      isThinking: true,
      thinkingText,
      cleanText,
    };
  }

  // No thinking tags found
  return {
    isThinking: false,
    thinkingText: "",
    cleanText: content,
  };
}
