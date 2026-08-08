// THIS FILE IS STALE ,and is just for reference 

import { ChatOpenRouter } from "@langchain/openrouter";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";
import { HumanMessage } from "@langchain/core/messages";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const execFileAsync = promisify(execFile);



const llm = new ChatOpenRouter({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0,
  maxTokens: 500,
});

const execute_script = tool(
  async ({ actions }: { actions: { x: number; y: number; action: string; text?: string }[] }) => {
    for (const step of actions) {
      await execFileAsync("ydotool", ["mousemove", "--absolute", "-x", String(step.x), "-y", String(step.y)]);
      if (step.action === "click") await execFileAsync("ydotool", ["click", "0xC0"]);
      if (step.action === "type" && step.text) await execFileAsync("ydotool", ["type", step.text]);
      await new Promise((r) => setTimeout(r, 150));
    }
    return { success: true, count: actions.length };
  },
  {
    name: "execute_script",
    description: "Executes a sequence of UI actions (click/type/etc) in order, given pre-resolved coordinates.",
    schema: z.object({
      actions: z.array(
        z.object({
          x: z.number(),
          y: z.number(),
          action: z.enum(["click", "double_click", "right_click", "move", "type"]),
          text: z.string().optional(),
        })
      ),
    }),
  }
);

const model = llm.bindTools([execute_script]);

export const execute = async (x: number, y: number) => {
  const response = await model.invoke([
    new HumanMessage(`Click on coordinates x=${x}, y=${y} using execute_script.`),
  ]);
  console.log(response);

  if ((response as any).tool_calls?.length) {
    const call = (response as any).tool_calls[0];
    console.log("ARGS: ",call.args)
    const result = await execute_script.invoke(call.args);
    console.log(result);
  }

  return response;
};

execute(1740,250)
