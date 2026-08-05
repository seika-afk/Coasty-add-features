import { model } from "./llm"
import { screenshot } from "./screenshot"

const run = async (action: string,model_:string ="") => {
//get screenshot
  const image = screenshot()
  //query
  const res = model(action,image,model_)


}


const query= "open browser then search  seika-afk "
run(query)
