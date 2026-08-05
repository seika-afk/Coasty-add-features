import { model } from "./llm"
import {  screenshot_ } from "./screenshot"

const run = async (action: string,model_:string ="") => {
  const image_path= await screenshot_()
  //query
  const res = model(action, image_path, model_) //get screenshot
}


const query= "open browser then search  seika-afk "
run(query)
