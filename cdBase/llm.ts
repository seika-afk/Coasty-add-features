import fs from "fs";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path"
import {  REASONING_MODEL_PROMPT, VISION_MODEL_PROMPT } from "./prompts";
import { StateGraph,END,START } from "@langchain/langgraph";
import { screenshot_ } from "./screenshot";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { guitools } from "./tools";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

export const imageToBase64 = (path: string) => {
  const buffer = fs.readFileSync(path);
 return `data:image/png;base64,${buffer.toString("base64")}`;
};



export const visionModel = new ChatOpenRouter({
    model: "qwen/qwen2.5-vl-72b-instruct",
    temperature: 0,
    maxTokens: 500,
  });

export const reasoningModel = new ChatOpenRouter({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0,
  maxTokens: 200,
})
const agent = createReactAgent({
  llm: reasoningModel,
  tools:guitools
})

export interface GraphState{
  query: string;
  history: string[];
  current_summary?: string;
  current_coords?: { x: number, y: number };
  status: boolean;
  current_action_for_reasoning_model:string;

}
////////////////////////////////////NODES
export async function visionNode(state: GraphState): Promise<Partial<GraphState>> {
console.log(" ENTERED VISION NODE")

  let image_path: string = ""



  try {
    console.log("TAKING SCREENSHOT : ",state.history.length+1)
    image_path = await screenshot_()
  } catch (error) {
    console.log("ERROR WHILE SCREENSHOTTING .")
    console.log(error)
    throw error;
  }


  const SS_IMAGE = imageToBase64(image_path);


    console.log("CONVERSING WITH LLM ")
  const response = await visionModel.invoke([
    { role: "system", content: [{ type: "text", text: VISION_MODEL_PROMPT }] },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "QUERY: " + state.query + "\n\nLAST ACTION HISTORY: " + (state.history.length > 0 ? state.history[state.history.length - 1] : "none yet"),
        } ,  { type: "image_url", image_url: { url: SS_IMAGE } },
      ],
    },
  ]);


  const raw = typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  console.log("-------------")
  console.log(cleaned)
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Vision model returned non-JSON: ${raw.slice(0, 200)}`);
  }
  if (typeof parsed.status !== "boolean") {
    throw new Error(`Vision model returned malformed status: ${JSON.stringify(parsed)}`);
  }
  if (parsed.coords !== null && typeof parsed.coords?.x !== "number") {
    throw new Error(`Vision model returned malformed coords: ${JSON.stringify(parsed)}`);
  }

  if (typeof parsed.action !== "string" || parsed.action.trim() === "") {
    throw new Error(`Vision model returned malformed action: ${JSON.stringify(parsed)}`);
  }


  const hist = `${JSON.stringify(parsed.coords)} --- action: ${parsed.action} --- summary: ${parsed.summary}`;
console.log("SUMMARY : ",parsed.summary)
console.log("MOVING TO REASONING NODE -------------")
  return {
    current_coords: parsed.coords ?? undefined,
    current_summary: parsed.summary,
    status: parsed.status,
    history: [hist],
    current_action_for_reasoning_model:parsed.action,
  };
}

export async function reasoningNode(state: GraphState): Promise<Partial<GraphState>> {
  const userInput = [
    `ACTION: ${state.current_action_for_reasoning_model ?? "none"}`,
    `COORDS: ${state.current_coords ? JSON.stringify(state.current_coords) : "null"}`,
    `SUMMARY: ${state.current_summary ?? ""}`,
  ].join("\n");

  let result;
  try {
    result = await agent.invoke({
      messages: [
        { role: "system", content: REASONING_MODEL_PROMPT },
        { role: "user", content: userInput },
      ],
    });
  } catch (error) {
    console.error("Reasoning agent invocation failed:", error);
    throw error;
  }

  const messages = result?.messages;
  if (!messages || messages.length === 0) {
    throw new Error("Reasoning agent returned no messages");
  }

  const lastMessage = messages[messages.length - 1];
  const actionSummary = typeof lastMessage.content === "string"
    ? lastMessage.content
    : JSON.stringify(lastMessage.content);

  return {
    history: [`REASONING MODEL'S SUMMARY : ${actionSummary}`],
  };
}///////////////////////////////////////////// MAIN GRAPH
export const run_graph = async (query:string) => {


  const graph = new StateGraph<GraphState>({
    channels: {
      query: null,
      history: {
        value: (curr: string[] = [], update: string[]) => curr.concat(update),
        default: () => [],
      },
      current_summary: null,
      current_coords: null,
      status: null,
      current_action_for_reasoning_model:null,
    }  })
  graph.addNode("vision", visionNode)
  graph.addNode("reasoning", reasoningNode)

  graph.addEdge(START, "vision");
  graph.addConditionalEdges("vision", (state: GraphState) => {
    if (state.status) {
      return "done"
    }
    return "reasoning"

  }, { done: END, reasoning: "reasoning" })

  graph.addEdge("reasoning", "vision")
  const app = graph.compile()

  const result = await app.invoke({
    query,
    history: [],
    status: false,
    current_coords: null,
    current_summary: "",
    current_action_for_reasoning_model:"",
  },

   { recursionLimit: 25 })
  return result.current_summary ?? ""
}
