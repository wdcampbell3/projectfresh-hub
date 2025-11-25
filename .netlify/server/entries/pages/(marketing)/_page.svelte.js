import { a1 as head, $ as ensure_array_like, a0 as attr } from "../../../chunks/index2.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function _page($$renderer) {
  const games3D = [
    {
      name: "🏗️ World Builder",
      path: "/world-builder",
      description: "Design 3D worlds with hundreds of models, then explore them in first-person mode",
      image: "/game-thumbs/world-builder.jpg"
    },
    {
      name: "🎯 Blocky Shooter",
      path: "/fps-game",
      description: "First-person shooter with multiple weapons, enemy types, and power-ups across custom maps",
      image: "/game-thumbs/fps-game.jpg"
    },
    {
      name: "🚀 Starship Flyer",
      path: "/starship-flyer",
      description: "Physics-based 3D dogfighting with barrel rolls, weapon pickups, and boss battles",
      image: "/game-thumbs/starship-flyer.jpg"
    }
  ];
  const games2D = [
    {
      name: "👾 Space Invaders",
      path: "/space-invaders",
      description: "Classic arcade defense with shield bunkers, boss waves, and 6 different power-ups",
      image: "/game-thumbs/space-invaders.jpg"
    },
    {
      name: "💡 Light Particles",
      path: "/light-cycles",
      description: "TRON-style trail combat—dodge walls while boxing in your AI opponent",
      image: "/game-thumbs/light-particles.jpg"
    },
    {
      name: "🏓 Cosmic Pong",
      path: "/pong",
      description: "Spaceship paddle action with freeze, lightning, and shrink power-ups",
      image: "/game-thumbs/cosmic-pong.jpg"
    },
    {
      name: "🗼 Tower Assault",
      path: "/tower-defense",
      description: "Strategic tower placement with 6 tower types across 5 escalating waves",
      image: "/game-thumbs/tower-assault.jpg"
    },
    {
      name: "💣 Mine Buster",
      path: "/minesweeper",
      description: "Logic-based minesweeper with X-Ray vision, lasers, and bombs—plus traps!",
      image: "/game-thumbs/mine-buster.jpg"
    },
    {
      name: "🐍 Snake-adelic",
      path: "/worm-game",
      description: "Trippy snake game with bizarre power-ups on pulsing psychedelic backgrounds",
      image: "/game-thumbs/snake-adelic.jpg"
    }
  ];
  head("skv6c4", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Dougie's Game Hub | Vibe Coded—100% AI Chat-Prompted—Game Experiments!</title>`);
    });
  });
  $$renderer.push(`<div class="min-h-screen bg-base-200"><div class="w-full py-8 mb-8" style="background-color: #660460;"><div class="container mx-auto px-4 text-center"><h1 class="text-5xl font-bold mb-2 text-white">Dougie's Game Hub</h1> <p class="text-xl text-white italic">Vibe Coded—100% AI Chat-Prompted—Game Experiments!</p></div></div> <div class="container mx-auto px-4 pb-12"><div class="mb-16"><h2 class="text-4xl font-bold mb-2 text-center" style="color: #660460;">3D Games</h2> <p class="text-lg text-gray-600 text-center mb-8">Build a custom world... And play games in it!</p> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"><!--[-->`);
  const each_array = ensure_array_like(games3D);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let game = each_array[$$index];
    $$renderer.push(`<a${attr("href", game.path)} class="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"><figure class="h-48 overflow-hidden"><img${attr("src", game.image)}${attr("alt", game.name)} class="w-full h-full object-cover"/></figure> <div class="card-body"><h2 class="card-title" style="color: #660460;">${escape_html(game.name)}</h2> <p class="text-gray-600">${escape_html(game.description)}</p></div></a>`);
  }
  $$renderer.push(`<!--]--></div></div> <div><h2 class="text-4xl font-bold mb-2 text-center" style="color: #660460;">2D Games</h2> <p class="text-lg text-gray-600 text-center mb-8">Power Packed Upgrades to Old Classics!</p> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"><!--[-->`);
  const each_array_1 = ensure_array_like(games2D);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let game = each_array_1[$$index_1];
    $$renderer.push(`<a${attr("href", game.path)} class="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"><figure class="h-48 overflow-hidden"><img${attr("src", game.image)}${attr("alt", game.name)} class="w-full h-full object-cover"/></figure> <div class="card-body"><h2 class="card-title" style="color: #660460;">${escape_html(game.name)}</h2> <p class="text-gray-600">${escape_html(game.description)}</p></div></a>`);
  }
  $$renderer.push(`<!--]--></div></div></div></div>`);
}
export {
  _page as default
};
