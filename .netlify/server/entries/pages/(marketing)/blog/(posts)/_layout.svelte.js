import { V as store_get, a1 as head, W as unsubscribe_stores, a0 as attr } from "../../../../../chunks/index2.js";
import { p as page } from "../../../../../chunks/stores.js";
import { error } from "@sveltejs/kit";
import { s as sortedBlogPosts } from "../../../../../chunks/posts.js";
import { a as WebsiteName } from "../../../../../chunks/config.js";
import { e as escape_html } from "../../../../../chunks/escaping.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    function getCurrentPost(url) {
      let searchPost = null;
      for (const post of sortedBlogPosts) {
        if (url == post.link || url == post.link + "/") {
          searchPost = post;
          continue;
        }
      }
      if (!searchPost) {
        error(404, "Blog post not found");
      }
      return searchPost;
    }
    let currentPost = getCurrentPost(store_get($$store_subs ??= {}, "$page", page).url.pathname);
    function buildLdJson(post) {
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.parsedDate?.toISOString(),
        dateModified: post.parsedDate?.toISOString()
      };
    }
    let jsonldScript = `<script type="application/ld+json">${JSON.stringify(buildLdJson(currentPost)) + "<"}/script>`;
    let pageUrl = store_get($$store_subs ??= {}, "$page", page).url.origin + store_get($$store_subs ??= {}, "$page", page).url.pathname;
    head("1lsl30p", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(currentPost.title)}</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", currentPost.description)}/> <meta property="og:title"${attr("content", currentPost.title)}/> <meta property="og:description"${attr("content", currentPost.description)}/> <meta property="og:site_name"${attr("content", WebsiteName)}/> <meta property="og:url"${attr("content", pageUrl)}/>  <meta name="twitter:card" content="summary"/> <meta name="twitter:title"${attr("content", currentPost.title)}/> <meta name="twitter:description"${attr("content", currentPost.description)}/>  ${html(jsonldScript)}`);
    });
    $$renderer2.push(`<article class="prose mx-auto py-12 px-6 font-sans"><div class="text-sm text-accent">${escape_html(currentPost.parsedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</div> <h1>${escape_html(currentPost.title)}</h1> `);
    children?.($$renderer2);
    $$renderer2.push(`<!----></article>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
