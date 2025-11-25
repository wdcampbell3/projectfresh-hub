import { error } from "@sveltejs/kit";
async function GET() {
  error(404, "Search index not found");
}
export {
  GET
};
