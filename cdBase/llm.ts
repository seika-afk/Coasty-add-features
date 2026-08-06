import fs from "fs";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path"
import { TEXT_PROMPT } from "./prompts";

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
       {type:"text",text:TEXT_PROMPT}
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
