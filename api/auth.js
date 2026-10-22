// Customer accounts: sign up, sign in, sign out.
const L = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return L.send(res, 405, { error: "method_not_allowed" });
  const b = L.body(req);
  try {
    if (b.action === "logout") { L.clearSession(res); return L.send(res, 200, { ok: true }); }
    if (!L.accountsEnabled()) return L.send(res, 503, { error: "accounts_not_configured" });
    if (!(await L.rateLimit(req, "auth", 20, 900))) return L.send(res, 429, { error: "too_many_attempts" });

    const email = L.cleanEmail(b.email), password = String(b.password || "");
    if (!L.isEmail(email)) return L.send(res, 400, { error: "bad_email" });

    if (b.action === "signup") {
      const name = String(b.name || "").trim().slice(0, 100), phone = String(b.phone || "").trim().slice(0, 40);
      if (!name) return L.send(res, 400, { error: "name_required" });
      if (password.length < 8 || password.length > 200) return L.send(res, 400, { error: "weak_password" });
      const user = { name, email, phone, pw: L.hashPassword(password), created: new Date().toISOString() };
      const ok = await L.kv("SET", `user:${email}`, JSON.stringify(user), "NX");
      if (ok !== "OK") return L.send(res, 409, { error: "account_exists" });
      L.setSession(res, email);
      return L.send(res, 200, { ok: true, user: { name, email, phone } });
    }

    if (b.action === "login") {
      const raw = await L.kv("GET", `user:${email}`);
      const user = raw ? JSON.parse(raw) : null;
      if (!user || !L.checkPassword(password, user.pw)) return L.send(res, 401, { error: "invalid_login" });
      L.setSession(res, email);
      return L.send(res, 200, { ok: true, user: { name: user.name, email, phone: user.phone } });
    }
    return L.send(res, 400, { error: "unknown_action" });
  } catch (e) { return L.send(res, e.status || 500, { error: e.message || "error" }); }
};
