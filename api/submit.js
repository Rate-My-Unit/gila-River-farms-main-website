// Emails website form submissions to the farm using Resend (https://resend.com).
// Required environment variables (set them in Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY   - API key from resend.com
//   FORM_TO_EMAIL    - where submissions go, e.g. office@example.com (comma-separate for several)
// Optional:
//   FORM_FROM_EMAIL  - sender, e.g. "Gila River Farms Website <website@yourdomain.com>"
//                      (needs a verified domain in Resend; defaults to Resend's test sender)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method_not_allowed" }); }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "bad_json" }); } }
  if (!body || typeof body !== "object") return res.status(400).json({ error: "bad_request" });
  if (body.company) return res.status(200).json({ ok: true });             // spam bot filled the hidden field

  const form = String(body.form || "Website form").slice(0, 100);
  const page = String(body.page || "").slice(0, 200);
  const fields = Array.isArray(body.fields) ? body.fields.slice(0, 200)
    .filter(f => Array.isArray(f) && f.length === 2)
    .map(([k, v]) => [String(k).slice(0, 300), String(v).slice(0, 5000)]) : [];
  if (!fields.length) return res.status(400).json({ error: "empty" });

  const key = process.env.RESEND_API_KEY, to = process.env.FORM_TO_EMAIL;
  if (!key || !to) return res.status(503).json({ error: "not_configured" });

  const replyTo = (fields.find(([k, v]) => /e-?mail/i.test(k) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || [])[1];
  const rows = fields.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#56615A;font-weight:600">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1F2A24"><h2 style="margin:0 0 12px">${esc(form)}</h2><p style="color:#56615A;margin:0 0 16px">Sent from the Gila River Farms website${page ? " (" + esc(page) + ")" : ""}.</p><table style="border-collapse:collapse">${rows}</table></div>`;
  const text = `${form}\n\n` + fields.map(([k, v]) => `${k}: ${v}`).join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.FORM_FROM_EMAIL || "Gila River Farms Website <onboarding@resend.dev>",
      to: to.split(",").map(s => s.trim()).filter(Boolean),
      subject: `New ${form} from the website`,
      html, text, ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!r.ok) return res.status(502).json({ error: "send_failed" });
  return res.status(200).json({ ok: true });
};
