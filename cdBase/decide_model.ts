import { ChatOpenRouter } from "@langchain/openrouter";
import { MODEL_REGISTRY } from "./model_registery";

const routerLLM = new ChatOpenRouter({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0,
  maxTokens: 150,
});

export interface ModelSelection {
  visionModelId: string;
  reasoningModelId: string;
  rationale: string;//later if smtg goes wrong
}

const SYSTEM_PROMPT = `You route tasks to the cheapest model likely to succeed for a GUI automation agent.

Available models:
${MODEL_REGISTRY.map(m => `- ${m.id} | kind:${m.kind} | cost:${m.costTier} | ${m.description}`).join("\n")}

Given the user's task, pick exactly one vision model and one reasoning model.
Prefer the cheapest option that can plausibly handle the task. Only pick a higher-cost
model if the task clearly needs it (dense/ambiguous UI, multi-branch logic, error-prone steps).

Respond ONLY with JSON, no markdown fences:
{"visionModelId": "...", "reasoningModelId": "...", "rationale": "one sentence"}`;

export async function chooseModels(query: string): Promise<ModelSelection> {
  const response = await routerLLM.invoke(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `TASK: ${query}` },
    ],
    { response_format: { type: "json_object" } }
  );

  const raw = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
  const cleaned = raw.replace(/```json|```/g, "").trim();//safety

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Router returned non-JSON: ${raw.slice(0, 200)}`);
  }
  console.log("------DECIDING LLMS :", parsed);
  return parsed;
}
