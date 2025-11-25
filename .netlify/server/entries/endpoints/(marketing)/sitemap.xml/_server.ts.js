import { W as WebsiteBaseUrl } from "../../../../chunks/config.js";
const langRegex = /\/?\[(\[lang(=[a-z]+)?\]|lang(=[a-z]+)?)\]/;
const langRegexNoPath = /\[(\[lang(=[a-z]+)?\]|lang(=[a-z]+)?)\]/;
async function response({ additionalPaths = [], changefreq = false, excludeRoutePatterns, headers = {}, lang, maxPerPage = 5e4, origin, page, paramValues, priority = false, processPaths, sort = false }) {
  let paths = [
    ...generatePaths(excludeRoutePatterns, paramValues, lang),
    ...normalizeAdditionalPaths(additionalPaths)
  ];
  if (processPaths) {
    paths = processPaths(paths);
  }
  paths = deduplicatePaths(paths);
  if (sort === "alpha") {
    paths.sort((a, b) => a.path.localeCompare(b.path));
  }
  const totalPages = Math.ceil(paths.length / maxPerPage);
  let body;
  if (!page) {
    if (paths.length <= maxPerPage) {
      body = generateBody(origin, paths, changefreq, priority);
    } else {
      body = generateSitemapIndex(origin, totalPages);
    }
  } else {
    if (!/^[1-9]\d*$/.test(page)) {
      return new Response("Invalid page param", { status: 400 });
    }
    const pageInt = Number(page);
    if (pageInt > totalPages) {
      return new Response("Page does not exist", { status: 404 });
    }
    const pathsOnThisPage = paths.slice((pageInt - 1) * maxPerPage, pageInt * maxPerPage);
    body = generateBody(origin, pathsOnThisPage, changefreq, priority);
  }
  const newHeaders = {
    "cache-control": "max-age=0, s-maxage=3600",
    // 1h CDN cache
    "content-type": "application/xml",
    ...Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]))
  };
  return new Response(body, { headers: newHeaders });
}
function generateBody(origin, paths, changefreq = false, priority = false) {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>${paths.map(({ alternates, path }) => `
  <url>
    <loc>${origin}${path}</loc>
` + (changefreq ? `    <changefreq>${changefreq}</changefreq>
` : "") + (priority ? `    <priority>${priority}</priority>
` : "") + (!alternates ? "" : alternates.map(({ lang, path: path2 }) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${origin}${path2}" />`).join("\n") + "\n") + `  </url>`).join("")}
</urlset>`;
}
function generateSitemapIndex(origin, pages) {
  let str = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  for (let i = 1; i <= pages; i++) {
    str += `
  <sitemap>
    <loc>${origin}/sitemap${i}.xml</loc>
  </sitemap>`;
  }
  str += `
</sitemapindex>`;
  return str;
}
function generatePaths(excludeRoutePatterns = [], paramValues = {}, lang = { alternates: [], default: "" }) {
  const svelteRoutes = Object.keys({ "/src/routes/(admin)/account/(menu)/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/billing/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/change_email/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/change_email_subscription/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/change_password/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/delete_account/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/edit_profile/+page.svelte": 0, "/src/routes/(admin)/account/(menu)/settings/reset_password/+page.svelte": 0, "/src/routes/(admin)/account/create_profile/+page.svelte": 0, "/src/routes/(admin)/account/select_plan/+page.svelte": 0, "/src/routes/(admin)/account/sign_out/+page.svelte": 0, "/src/routes/(experiments)/drawing-canvas/+page.svelte": 0, "/src/routes/(experiments)/fps-game/+page.svelte": 0, "/src/routes/(experiments)/light-cycles/+page.svelte": 0, "/src/routes/(experiments)/loan-calculator/+page.svelte": 0, "/src/routes/(experiments)/minesweeper/+page.svelte": 0, "/src/routes/(experiments)/pong/+page.svelte": 0, "/src/routes/(experiments)/space-invaders/+page.svelte": 0, "/src/routes/(experiments)/starship-flyer/+page.svelte": 0, "/src/routes/(experiments)/tower-defense/+page.svelte": 0, "/src/routes/(experiments)/world-builder/+page.svelte": 0, "/src/routes/(experiments)/worm-game/+page.svelte": 0, "/src/routes/(marketing)/+page.svelte": 0, "/src/routes/(marketing)/blog/(posts)/awesome_post/+page.svelte": 0, "/src/routes/(marketing)/blog/(posts)/example_blog_post/+page.svelte": 0, "/src/routes/(marketing)/blog/(posts)/how_we_built_our_41kb_saas_website/+page.svelte": 0, "/src/routes/(marketing)/blog/+page.svelte": 0, "/src/routes/(marketing)/contact_us/+page.svelte": 0, "/src/routes/(marketing)/login/+page.svelte": 0, "/src/routes/(marketing)/login/current_password_error/+page.svelte": 0, "/src/routes/(marketing)/login/forgot_password/+page.svelte": 0, "/src/routes/(marketing)/login/sign_in/+page.svelte": 0, "/src/routes/(marketing)/login/sign_up/+page.svelte": 0, "/src/routes/(marketing)/pricing/+page.svelte": 0, "/src/routes/(marketing)/search/+page.svelte": 0 });
  const mdRoutes = Object.keys({});
  const svxRoutes = Object.keys({});
  let routes = [...svelteRoutes, ...mdRoutes, ...svxRoutes];
  let routesContainLangParam = false;
  for (const route of routes) {
    if (route.match(langRegex)?.length) {
      routesContainLangParam = true;
      break;
    }
  }
  if (routesContainLangParam && (!lang?.default || !lang?.alternates.length)) {
    throw Error("Must specify `lang` property within the sitemap config because one or more routes contain [[lang]].");
  }
  routes = filterRoutes(routes, excludeRoutePatterns);
  routes = processRoutesForOptionalParams(routes);
  const { pathsWithLang, pathsWithoutLang } = generatePathsWithParamValues(routes, paramValues);
  return [
    ...pathsWithoutLang.map((path) => ({ path })),
    ...pathsWithLang.length ? generatePathsWithLang(pathsWithLang, lang) : []
  ];
}
function filterRoutes(routes, excludeRoutePatterns) {
  return routes.map((x) => {
    x = x.substring(11);
    x = x.replace(/\/\+page.*\.(svelte|md|svx)$/, "");
    return !x ? "/" : x;
  }).filter((x) => !excludeRoutePatterns.some((pattern) => new RegExp(pattern).test(x))).map((x) => {
    x = x.replaceAll(/\/\([^)]+\)/g, "");
    return !x ? "/" : x;
  }).sort();
}
function generatePathsWithParamValues(routes, paramValues) {
  for (const paramValueKey in paramValues) {
    if (!routes.includes(paramValueKey)) {
      throw new Error(`Sitemap: paramValues were provided for a route that does not exists within src/routes/: '${paramValueKey}'. Remove this property from your paramValues.`);
    }
  }
  let pathsWithLang = [];
  let pathsWithoutLang = [];
  for (const paramValuesKey in paramValues) {
    const hasLang = langRegex.exec(paramValuesKey);
    const routeSansLang = paramValuesKey.replace(langRegex, "");
    const paths = [];
    if (Array.isArray(paramValues[paramValuesKey][0])) {
      paths.push(
        ...paramValues[paramValuesKey].map((data) => {
          let i = 0;
          return routeSansLang.replace(/(\[\[.+?\]\]|\[.+?\])/g, () => data[i++] || "");
        })
      );
    } else {
      paths.push(
        ...paramValues[paramValuesKey].map((value) => routeSansLang.replace(/\[.*\]/, value))
      );
    }
    if (hasLang) {
      const lang = hasLang?.[0];
      pathsWithLang.push(...paths.map((path) => path.slice(0, hasLang?.index) + lang + path.slice(hasLang?.index)));
    } else {
      pathsWithoutLang.push(...paths);
    }
    routes.splice(routes.indexOf(paramValuesKey), 1);
  }
  const staticWithLang = [];
  const staticWithoutLang = [];
  for (const route of routes) {
    const hasLang = route.match(langRegex);
    if (hasLang) {
      staticWithLang.push(route);
    } else {
      staticWithoutLang.push(route);
    }
  }
  pathsWithLang = [...staticWithLang, ...pathsWithLang];
  pathsWithoutLang = [...staticWithoutLang, ...pathsWithoutLang];
  for (const route of routes) {
    const regex = /.*(\[\[.+\]\]|\[.+\]).*/;
    const routeSansLang = route.replace(langRegex, "") || "/";
    if (regex.test(routeSansLang)) {
      throw new Error(`Sitemap: paramValues not provided for: '${route}'
Update your sitemap's excludedRoutePatterns to exclude this route OR add data for this route's param(s) to the paramValues object of your sitemap config.`);
    }
  }
  return { pathsWithLang, pathsWithoutLang };
}
function processRoutesForOptionalParams(routes) {
  routes = routes.flatMap((route) => {
    const routeWithoutLangIfAny = route.replace(langRegex, "");
    return /\[\[.*\]\]/.test(routeWithoutLangIfAny) ? processOptionalParams(route) : route;
  });
  return Array.from(new Set(routes));
}
function processOptionalParams(route) {
  const hasLang = langRegex.exec(route);
  if (hasLang) {
    route = route.replace(langRegex, "");
  }
  let results = [];
  results.push(route.slice(0, route.indexOf("[[") - 1));
  const remaining = route.slice(route.indexOf("[["));
  const segments = remaining.split("/").filter(Boolean);
  let j = 1;
  for (const segment of segments) {
    if (!results[j])
      results[j] = results[j - 1];
    results[j] += "/" + segment;
    if (segment.startsWith("[[")) {
      j++;
    }
  }
  if (hasLang) {
    const lang = hasLang?.[0];
    results = results.map((result) => result.slice(0, hasLang?.index) + lang + result.slice(hasLang?.index));
  }
  if (!results[0].length)
    results[0] = "/";
  return results;
}
function generatePathsWithLang(paths, langConfig) {
  const allPathObjs = [];
  for (const path of paths) {
    const hasLangRequired = /\/?\[lang(=[a-z]+)?\](?!\])/.exec(path);
    const _path = hasLangRequired ? path.replace(langRegex, "/" + langConfig.default) : path.replace(langRegex, "") || "/";
    const variations = [
      {
        lang: langConfig.default,
        path: _path
      }
    ];
    for (const lang of langConfig.alternates) {
      variations.push({
        lang,
        path: path.replace(langRegexNoPath, lang)
      });
    }
    const pathObjs = [];
    for (const x of variations) {
      pathObjs.push({
        alternates: variations,
        path: x.path
      });
    }
    allPathObjs.push(...pathObjs);
  }
  return allPathObjs;
}
function deduplicatePaths(pathObjs) {
  const uniquePaths = /* @__PURE__ */ new Map();
  for (const pathObj of pathObjs) {
    uniquePaths.set(pathObj.path, pathObj);
  }
  return Array.from(uniquePaths.values());
}
function normalizeAdditionalPaths(additionalPaths) {
  return additionalPaths.map((path) => ({
    path: path.startsWith("/") ? path : `/${path}`
  }));
}
const prerender = true;
const GET = async () => {
  return await response({
    origin: WebsiteBaseUrl,
    excludeRoutePatterns: [
      ".*\\(admin\\).*"
      // i.e. exclude routes within admin group
    ]
  });
};
export {
  GET,
  prerender
};
