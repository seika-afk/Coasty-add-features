import fs from "fs";
import screenshot from "screenshot-desktop";

export const screenshot_ = async () => {
  const filename = `screens/screenshot-${Date.now()}.png`;
  try {
    fs.mkdirSync("screens", { recusive: true });
    await screenshot({ filename })
    return filename
  } catch (error) {
    console.log(error)
    return ""
  }

}
