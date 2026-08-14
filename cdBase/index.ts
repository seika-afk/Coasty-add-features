import { chooseModels } from "./decide_model"
import { run_graph } from "./llm"

const run = async (action: string) => {
  try {
    console.log(" ========STARTING=========")
    console.log("----DECIDING MODELS---")
    const models= await chooseModels(action)
    const res = await run_graph(action,models)
    console.log("LLM RETURNED:")
    console.log(res)
  } catch (err) {
    console.error("========FAILED=========")
    console.error(err)
  }
}

const query = "Click on the prompts.ts file on the file manager bar on right of it"
run(query)
