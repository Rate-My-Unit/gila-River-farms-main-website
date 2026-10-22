// Shared helpers for the shop, accounts and order emails. Files starting with "_" are not public routes on Vercel.
const crypto = require("crypto");

// Prices are in cents and are only trusted from here, never from the browser.
const CATALOG = {
  "horse-hay": { name: "Horse Hay", sku: "HHN", price: 1500 },
  "cow-hay": { name: "Cow Hay", sku: "", price: 1000 },
};
const OFFICE_PHONE = "(520) 315-3965";

const env = k => (process.env[k] || "").trim();
const kvUrl = () => env("KV_REST_API_URL") || env("UPSTASH_REDIS_REST_URL");
const kvToken = () => env("KV_REST_API_TOKEN") || env("UPSTASH_REDIS_REST_TOKEN");
const kvEnabled = () => !!(kvUrl() && kvToken());
const emailEnabled = () => !!(env("RESEND_API_KEY") && env("FORM_TO_EMAIL"));
const stripeEnabled = () => !!(env("STRIPE_SECRET_KEY") && env("STRIPE_PUBLISHABLE_KEY"));
const accountsEnabled = () => kvEnabled() && env("SESSION_SECRET").length >= 16;

async function kv(...cmd) {
  if (!kvEnabled()) { const e = new Error("storage_not_configured"); e.status = 503; throw e; }
  const r = await fetch(kvUrl(), { method: "POST", headers: { Authorization: `Bearer ${kvToken()}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) { const e = new Error(j.error || "storage_error"); e.status = 502; throw e; }
  return j.result;
}

function body(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
  return b && typeof b === "object" ? b : {};
}
const send = (res, status, data) => res.status(status).json(data);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const cleanEmail = e => String(e || "").trim().toLowerCase().slice(0, 200);
const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const usd = c => "$" + (c / 100).toFixed(2);

function priceItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 10) return null;
  const lines = [];
  for (const it of items) {
    const p = CATALOG[it && it.id]; const qty = parseInt(it && it.qty, 10);
    if (!p || !(qty >= 1 && qty <= 999)) return null;
    const ex = lines.find(l => l.id === it.id);
    if (ex) { ex.qty += qty; ex.total = ex.qty * ex.unit; continue; }
    lines.push({ id: it.id, name: p.name, sku: p.sku, qty, unit: p.price, total: qty * p.price });
  }
  return { lines, total: lines.reduce((t, l) => t + l.total, 0) };
}

// ---- passwords + sessions ----
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + crypto.scryptSync(pw, salt, 64).toString("hex");
}
function checkPassword(pw, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex"), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const b64u = s => Buffer.from(s).toString("base64url");
function sign(v) { return crypto.createHmac("sha256", env("SESSION_SECRET")).update(v).digest("base64url"); }
function setSession(res, email) {
  const exp = Date.now() + 30 * 864e5, v = b64u(email) + "." + exp;
  res.setHeader("Set-Cookie", `grf_s=${v}.${sign(v)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}`);
}
function clearSession(res) { res.setHeader("Set-Cookie", "grf_s=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"); }
function sessionEmail(req) {
  if (!accountsEnabled()) return null;
  const m = String(req.headers.cookie || "").match(/(?:^|;\s*)grf_s=([^;]+)/); if (!m) return null;
  const [e, exp, sig] = m[1].split("."); if (!e || !exp || !sig) return null;
  const v = e + "." + exp, good = sign(v);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  if (+exp < Date.now()) return null;
  return Buffer.from(e, "base64url").toString();
}
async function rateLimit(req, key, max, seconds) {
  if (!kvEnabled()) return true;
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const k = `rl:${key}:${ip}`; const n = await kv("INCR", k); if (n === 1) await kv("EXPIRE", k, seconds);
  return n <= max;
}

// ---- email ----
async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!env("RESEND_API_KEY") || !to) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("FORM_FROM_EMAIL") || "Gila River Farms Website <onboarding@resend.dev>",
      to: String(to).split(",").map(s => s.trim()).filter(Boolean), subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  }).catch(() => null);
  return !!(r && r.ok);
}

// ---- stripe (REST, no SDK needed) ----
async function stripe(method, path, params) {
  const r = await fetch("https://api.stripe.com/v1" + path, {
    method, headers: { Authorization: `Bearer ${env("STRIPE_SECRET_KEY")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error((j.error && j.error.message) || "stripe_error"); e.status = 502; throw e; }
  return j;
}

module.exports = { CATALOG, OFFICE_PHONE, env, kv, kvEnabled, emailEnabled, stripeEnabled, accountsEnabled, body, send, esc,
  cleanEmail, isEmail, usd, priceItems, hashPassword, checkPassword, setSession, clearSession, sessionEmail, rateLimit, sendEmail, stripe };
