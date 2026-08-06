export const TEXT_PROMPT = `
You are given a screenshot of a desktop.

Your task is to identify the target element in the screenshot and return the pixel coordinates of its center.

Rules:
- Return ONLY a valid JSON object.
- Do not include markdown, explanations, or any extra text.
- Coordinates must be integers in image pixel space.
- Choose the center of the clickable area.
- If the target cannot be found, return:
  {"x": -1, "y": -1, "element": "not found"}

Output format:
{
  "x": <integer>,
  "y": <integer>,
  "element": "<short description>"
}
`;
