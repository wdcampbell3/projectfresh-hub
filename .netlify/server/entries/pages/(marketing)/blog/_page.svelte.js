import { a1 as head, $ as ensure_array_like, a0 as attr } from "../../../../chunks/index2.js";
import { s as sortedBlogPosts, b as blogInfo } from "../../../../chunks/posts.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("8fdu19", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(blogInfo.name)}</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Our blog posts."/>`);
    });
    $$renderer2.push(`<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto"><div class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"><div class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">${escape_html(blogInfo.name)}</div> <a href="/blog/rss.xml" target="_blank" rel="noreferrer"><img class="flex-none w-5 h-5 object-contain" src="/images/rss.svg" alt="rss feed"/></a></div> <div class="text-lg text-center">A demo blog with sample content.</div> <!--[-->`);
    const each_array = ensure_array_like(sortedBlogPosts);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let post = each_array[$$index];
      $$renderer2.push(`<a${attr("href", post.link)}><div class="card my-6 bg-white shadow-xl flex-row overflow-hidden"><div class="flex-none w-6 md:w-32 bg-secondary"></div> <div class="py-6 px-6"><div class="text-xl">${escape_html(post.title)}</div> <div class="text-sm text-accent">${escape_html(post.parsedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</div> <div class="text-slate-500">${escape_html(post.description)}</div></div></div></a>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
