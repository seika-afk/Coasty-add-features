import { execSync } from "child_process";
import fs from "fs";

export const screenshot_ = () => {
  const filename = `screens/screenshot-${Date.now()}.png`;
  try {
    fs.mkdirSync("screens", { recursive: true });
    execSync(`grim ${filename}`);
    return filename;
  } catch (error) {
    console.error(error);
    return "";
  }
};
