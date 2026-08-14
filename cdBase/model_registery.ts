export interface ModelSpec {
  id: string;
  kind: "vision" | "reasoning";
  costTier: "low" | "medium" | "high";
  description: string;}



// just collection of diff models , And config -> kind :visidon or reasoning, then CostTier and description
export const MODEL_REGISTRY: ModelSpec[] = [

  {
    id: "qwen/qwen2.5-vl-72b-instruct",
    kind: "vision",
    costTier: "medium",
    description: "Default vision model. Reliable general-purpose GUI understanding, good OCR. Use for anything with real text/forms/menus.",
  },
  {
    id: "deepseek/deepseek-chat-v3.1",
    kind: "reasoning",
    costTier: "low",
    description: "Cheap reasoning/tool-use model. Good for short, linear, well-specified tasks (e.g. 'click X then Y').",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    kind: "reasoning",
    costTier: "high",
    description: "Stronger reasoning. Use for ambiguous instructions, multi-branch tasks, or when error recovery/judgment is likely needed.",
  },
];
