const AUTH_KEY = "ADMIN_PASSWORD";

export function authHeaders() {
  const token = localStorage.getItem(AUTH_KEY);
  return token ? { Authorization: token } : {};
}

export async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export function fmtNum(n, d = 4) {
  if (n == null || !Number.isFinite(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
}

export function renderNav(active) {
  const items = [
    { section: "Trading" },
    { href: "/dashboard/bot", label: "Bots" },
    { href: "/dashboard/strategies", label: "Strategies" },
    { href: "/dashboard/grid-bot/create", label: "New grid bot" },
    { href: "/dashboard/dca-bot/create", label: "New DCA bot" },
    { href: "/dashboard/accounts", label: "My exchanges" },
    { section: "Intelligence" },
    { href: "/hub/index.html", label: "Overview", id: "overview" },
    { href: "/hub/agentic.html", label: "Agentic trading", id: "agentic" },
    { href: "/hub/news.html", label: "Semantic news", id: "news" },
    { href: "/hub/whales.html", label: "Whale wallets", id: "whales" },
    { href: "/hub/paper.html", label: "Paper portfolio", id: "paper" },
    { section: "App" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  const links = items
    .map((item) => {
      if (item.section) return `<div class="section">${item.section}</div>`;
      const cls = item.id === active ? "active" : "";
      return `<a class="${cls}" href="${item.href}">${item.label}</a>`;
    })
    .join("");

  return `<nav>${links}<a class="back" href="/">← Main app</a></nav>`;
}

export function mountLayout(active, title, subtitle, bodyHtml) {
  document.body.innerHTML = `
    <div class="layout">
      ${renderNav(active)}
      <main>
        <h1>${title}</h1>
        <p class="sub">${subtitle}</p>
        <div id="content">${bodyHtml}</div>
        <p id="err" class="err"></p>
      </main>
    </div>`;
}

export function setError(msg) {
  const el = document.getElementById("err");
  if (el) el.textContent = msg || "";
}
