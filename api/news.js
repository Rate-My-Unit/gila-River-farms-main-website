// Live agricultural news for the "Agricultural Updates" section.
// Feeds can be changed with the NEWS_FEEDS environment variable:
//   NEWS_FEEDS="https://www.realagriculture.com/feed/|Real Agriculture,https://example.com/rss|Example"
const DEFAULT_FEEDS = [
  "https://www.realagriculture.com/feed/|Real Agriculture",
  "https://www.usda.gov/rss/latest-releases.xml|USDA",
  "https://www.farmprogress.com/rss.xml|Farm Progress",
].join(",");

const TAGS = [
  [/water|drought|irrigat|colorado river|aquifer/i, "Water"],
  [/hay|alfalfa|forage/i, "Hay"],
  [/cotton/i, "Cotton"],
  [/citrus|orange|lemon|grapefruit/i, "Citrus"],
  [/olive/i, "Olives"],
  [/corn|wheat|barley|sorghum|grain|soy/i, "Crops"],
  [/cattle|beef|livestock|dairy/i, "Livestock"],
  [/price|market|trade|tariff|export/i, "Markets"],
];
const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#0?39;|&apos;|&#8217;|&rsquo;/g, "’").replace(/&#8216;|&lsquo;/g, "‘").replace(/&#8220;|&ldquo;/g, "“")
  .replace(/&#8221;|&rdquo;/g, "”").replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, " ").trim();
const pick = (xml, tag) => { const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i")); return m ? decode(m[1]) : ""; };

async function readFeed(url, source) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "GilaRiverFarmsSite/1.0 (+news widget)" } });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
    return items.slice(0, 15).map(it => {
      let link = pick(it, "link");
      if (!link) { const m = it.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ""; }
      const when = new Date(pick(it, "pubDate") || pick(it, "updated") || pick(it, "published") || 0);
      const title = pick(it, "title");
      const tag = (TAGS.find(([re]) => re.test(title)) || [null, "News"])[1];
      return { title, link, source, tag, time: isNaN(when) ? 0 : when.getTime() };
    }).filter(i => i.title && /^https?:\/\//.test(i.link));
  } catch { return []; } finally { clearTimeout(t); }
}

module.exports = async (req, res) => {
  const feeds = (process.env.NEWS_FEEDS || DEFAULT_FEEDS).split(",").map(s => s.trim()).filter(Boolean)
    .map(s => { const [url, name] = s.split("|"); return { url, name: name || new URL(url).hostname }; });
  const lists = await Promise.all(feeds.map(f => readFeed(f.url, f.name)));
  lists.forEach(l => l.sort((a, b) => b.time - a.time));
  const out = [], seen = new Set();
  for (let i = 0; out.length < 6 && lists.some(l => l.length > i); i++)        // take turns across feeds
    for (const l of lists) { const it = l[i]; if (it && !seen.has(it.title) && out.length < 6) { seen.add(it.title); out.push(it); } }
  const items = out.map(({ time, ...rest }) => ({ ...rest,
    date: time ? new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Phoenix" }) : "" }));
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(items.length ? 200 : 502).json({ updated: new Date().toISOString(), items });
};
