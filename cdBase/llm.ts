import fs from "fs";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path"
import {  VISION_MODEL_PROMPT } from "./prompts";
import { StateGraph,END,START } from "@langchain/langgraph";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const imageToBase64 = (path: string) => {
  const buffer = fs.readFileSync(path);
 return `data:image/png;base64,${buffer.toString("base64")}`;
};



export const visionModel = new ChatOpenRouter({
    model: "qwen/qwen2.5-vl-72b-instruct",
    temperature: 0,
    maxTokens: 500,
  });


export const model = async (query: string, image_path: string) => {
  const SS_IMAGE = imageToBase64(image_path);
  const response = await visionModel.invoke([
    {
      role: "system",
      content: [
       {type:"text",text:VISION_MODEL_PROMPT}
     ]}, {

      role: "user",
      content: [
        { type: "text",  text: "QUERY : -----------: " + query },
        { type: "image_url", image_url: { url: SS_IMAGE } },
      ],
    },
  ]);
  return response;
};

interface GraphState{
  query: string;
  history: string[];
  current_summary?: string;
  current_coords?: { x: number, y: number };
  status: boolean;

}
////////////////////////////////////NODES

////////////////////////////////////////////// MAIN GRAPH
const run_graph = async (query:string) => {


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
    current_summary:"",
  })
  return result.current_summary ?? ""
}
