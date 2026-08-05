import screenshot from "screenshot-desktop";
import fs from "fs";
export const screenshot_ = async () => {

  const filename = `screens/screenshot-${Date.now()}.png`;
  try {
//create screen folder -> take ss
    fs.mkdirSync("screens", { recursive: true });
    await screenshot({
      filename,
    });

    return filename
  }
  catch (error) {
    console.error(error)
    return ""
  }
}
