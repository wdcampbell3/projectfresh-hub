import * as server from '../entries/pages/(admin)/account/(menu)/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(admin)/account/(menu)/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(admin)/account/(menu)/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.BVB_51PK.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/C7VldRES.js","_app/immutable/chunks/DlewTG-N.js","_app/immutable/chunks/ugBxT2tc.js","_app/immutable/chunks/De2g9qe0.js"];
export const stylesheets = [];
export const fonts = [];
