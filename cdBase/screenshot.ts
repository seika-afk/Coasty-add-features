import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const screenshot_ = async (): Promise<string> => {
  const dir = "screens";
  const filename = path.join(dir, `screenshot-${Date.now()}.png`);

  fs.mkdirSync(dir, { recursive: true });

  try {
    await execFileAsync("grim", [filename]);
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    throw new Error(`grim failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!fs.existsSync(filename)) {
    throw new Error(`grim reported success but output file is missing: ${filename}`);
  }

  return filename;
};
