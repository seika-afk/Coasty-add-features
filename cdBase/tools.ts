import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { mouse, keyboard, Point, straightTo, Button } from "@nut-tree-fork/nut-js";

mouse.config.mouseSpeed = 1500;

export const clickTool = tool(
  async ({ x, y }: {x:number,y:number}) => {
    await mouse.move(straightTo(new Point(x, y)));
    await mouse.leftClick();
    return `Clicked at (${x},${y})`;
  }, {
    name: "click",
     description: "Move the mouse to the given screen coordinates and left-click.",
     schema: z.object({
       x: z.number().describe("X coordinate on screen"),
       y: z.number().describe("Y coordinate on screen"),
     }),
}

)

export const typeTextTool = tool(
  async ({ text }: { text: string }) => {
    await keyboard.type(text);
    return `Typed: "${text}"`;
  },
  {
    name: "type_text",
    description: "Type the given text at the current cursor/focus position.",
    schema: z.object({
      text: z.string().describe("Text to type"),
    }),
  }
);

export const guitools= [clickTool,typeTextTool]
