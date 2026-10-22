// The signed-in customer's details and order history.
const L = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!L.accountsEnabled()) return L.send(res, 503, { error: "accounts_not_configured" });
  const email = L.sessionEmail(req);
  if (!email) return L.send(res, 401, { error: "signed_out" });
  try {
    const raw = await L.kv("GET", `user:${email}`);
    if (!raw) { L.clearSession(res); return L.send(res, 401, { error: "signed_out" }); }
    const u = JSON.parse(raw);
    const ids = (await L.kv("LRANGE", `orders:${email}`, 0, 49)) || [];
    const orders = ids.length ? (await L.kv("MGET", ...ids.map(id => `order:${id}`))).filter(Boolean).map(o => {
      const x = JSON.parse(o); return { id: x.id, created: x.created, lines: x.lines, total: x.total, payment: x.payment, pickupDate: x.customer.pickupDate };
    }) : [];
    return L.send(res, 200, { user: { name: u.name, email: u.email, phone: u.phone }, orders });
  } catch (e) { return L.send(res, e.status || 500, { error: e.message || "error" }); }
};
