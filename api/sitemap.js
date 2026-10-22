// Builds sitemap.xml from whatever domain the site is served on.
const PATHS = ["/", "/our-mission/", "/our-team/", "/our-history/", "/donate/", "/donation-policy/", "/available-jobs/", "/job-application/", "/hay/", "/horse-hay/", "/cow-hay/", "/olive-oil/", "/what-we-grow/", "/contact/", "/privacy-policy/"];
module.exports = (req, res) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const base = "https://" + host;
  const today = new Date().toISOString().slice(0, 10);
  const urls = PATHS.map(p => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
};
