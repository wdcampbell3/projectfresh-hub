import { b as blogInfo, s as sortedBlogPosts } from "../../../../../chunks/posts.js";
const encodeXML = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
function GET({ url }) {
  const headers = {
    "Cache-Control": "max-age=0, s-maxage=3600",
    "Content-Type": "application/xml"
  };
  let body = `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"> 
  <channel>
    <title>${encodeXML(blogInfo.name)}</title>
    <link>${url.origin}/blog</link>
    <description>${encodeXML(blogInfo.description)}</description>
    <atom:link href="${url.origin}/blog/rss.xml" rel="self" type="application/rss+xml" />`;
  for (const post of sortedBlogPosts) {
    body += `
    <item>
      <title>${encodeXML(post.title)}</title>
      <description>${encodeXML(post.description)}</description>
      <link>${url.origin + post.link}/</link>
      <pubDate>${post.parsedDate?.toUTCString()}</pubDate>
    </item>
`;
  }
  body += `  </channel>
</rss>
`;
  return new Response(body, {
    headers
  });
}
export {
  GET
};
