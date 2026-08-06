import { model } from "./llm"
import {  screenshot_ } from "./screenshot"

const run = async (action: string ) => {
  console.log(" ========STARTING=========")
 console.log("Taking Initial screenshot...")
 try{
  const image_path = await screenshot_()
 }
 catch (error) {
   console.log("ERROR WHILE SCREENSHOTTING .")
   console.log(error)
  }
  console.log("=== Success: Screenshot")

  //query
  console.log("Conversing with LLM ")
  const res = await model(action, image_path) //get screenshot
  console.log("LLM RETURND:")
  console.log(res.content)
}


const query= "open browser then search  seika-afk "
run(query)
