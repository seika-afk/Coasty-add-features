import { model } from "./llm"
import { screenshot_ } from "./screenshot"

const run = async (action: string) => {
  console.log(" ========STARTING=========")
  console.log("Taking Initial screenshot...")

  let image_path: string = ""
  try {
    image_path = await screenshot_()
  } catch (error) {
    console.log("ERROR WHILE SCREENSHOTTING .")
    console.log(error)
  }

  if (!image_path) {
    console.log("No screenshot available, aborting.")
    return
  }

  console.log("=== Success: Screenshot")
  console.log("Conversing with LLM ")
  const res = await model(action, image_path)
  console.log("LLM RETURND:")
  console.log(res.content)
}

const query = " Click on the prompts.ts file on the file manager bar"
run(query)
