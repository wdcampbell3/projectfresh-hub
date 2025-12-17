import { json } from "@sveltejs/kit"
import fs from "fs"
import path from "path"

export function GET() {
  const mapsDir = path.resolve("static/3d-maps")

  try {
    if (!fs.existsSync(mapsDir)) {
      return json([])
    }

    const files = fs
      .readdirSync(mapsDir)
      .filter((file) => file.endsWith(".json"))

    return json(files)
  } catch (error) {
    console.error("Error reading maps directory:", error)
    return json([], { status: 500 })
  }
}
