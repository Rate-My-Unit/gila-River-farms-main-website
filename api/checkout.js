// Checkout: card payments (Stripe) or pay at pickup. Saves the order and emails the farm and the customer.
const crypto = require("crypto");
const L = require("./_lib");

function cleanCustomer(c) {
  c = c || {};
  const out = {
    name: String(c.name || "").trim().slice(0, 100),
    email: L.cleanEmail(c.email),
    phone: String(c.phone || "").trim().slice(0, 40),
    pickupDate: String(c.pickupDate || "").slice(0, 10),
    notes: String(c.notes || "").trim().slice(0, 450),
  };
  if (!out.name || !L.isEmail(out.email) || out.phone.replace(/\D/g, "").length < 10 || !/^\d{4}-\d{2}-\d{2}$/.test(out.pickupDate) || c.agree !== true) return null;
  return out;
}
const orderId = () => {
  const d = new Date(Date.now() - 7 * 36e5).toISOString(); // Arizona time
  return "GRF-" + d.slice(2, 4) + d.slice(5, 7) + d.slice(8, 10) + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();
};

function orderEmail(o, forCustomer) {
  const rows = o.lines.map(l => `<tr><td style="padding:6px 16px 6px 0">${L.esc(l.name)}${l.sku ? ` <span style="color:#56615A">(${L.esc(l.sku)})</span>` : ""}</td><td style="padding:6px 16px 6px 0">× ${l.qty}</td><td style="padding:6px 0;text-align:right">${L.usd(l.total)}</td></tr>`).join("");
  const pay = o.payment === "card" ? "Paid online by card" : "Pay at pickup";
  const intro = forCustomer
    ? `<p>Thank you for your order, ${L.esc(o.customer.name)}. Please pick up your hay within 24 hours of purchase. The farm does not deliver hay and cannot load trucks.</p>`
    : `<p>A new order was placed on the website.</p>`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1F2A24;max-width:560px">
<h2 style="margin:0 0 6px">Order ${L.esc(o.id)}</h2>${intro}
<table style="border-collapse:collapse;width:100%;margin:12px 0">${rows}<tr><td colspan="2" style="padding:10px 0;border-top:1px solid #DAD7CF;font-weight:bold">Total</td><td style="padding:10px 0;border-top:1px solid #DAD7CF;text-align:right;font-weight:bold">${L.usd(o.total)}</td></tr></table>
<p><b>Payment:</b> ${pay}<br><b>Pickup date:</b> ${L.esc(o.customer.pickupDate)}<br><b>Name:</b> ${L.esc(o.customer.name)}<br><b>Phone:</b> ${L.esc(o.customer.phone)}<br><b>Email:</b> ${L.esc(o.customer.email)}${o.customer.notes ? `<br><b>Notes:</b> ${L.esc(o.customer.notes)}` : ""}</p>
<p style="color:#56615A">Gila River Farms · 220 N. Old Hwy 93, Sacaton, AZ 85147 · ${L.OFFICE_PHONE}</p></div>`;
  const text = `Order ${o.id}\n` + o.lines.map(l => `${l.name} x ${l.qty}  ${L.usd(l.total)}`).join("\n") +
    `\nTotal ${L.usd(o.total)}\nPayment: ${pay}\nPickup date: ${o.customer.pickupDate}\nName: ${o.customer.name}\nPhone: ${o.customer.phone}\nEmail: ${o.customer.email}` +
    (o.customer.notes ? `\nNotes: ${o.customer.notes}` : "");
  return { html, text };
}

async function saveAndNotify(order, accountEmail) {
  let stored = false;
  if (L.kvEnabled()) {
    await L.kv("SET", `order:${order.id}`, JSON.stringify(order));
    const owners = new Set([order.customer.email, accountEmail].filter(Boolean));
    for (const e of owners) await L.kv("LPUSH", `orders:${e}`, order.id);
    await L.kv("LPUSH", "orders:all", order.id);
    stored = true;
  }
  const farm = orderEmail(order, false), cust = orderEmail(order, true);
  const toFarm = await L.sendEmail({ to: L.env("FORM_TO_EMAIL"), subject: `New order ${order.id} (${L.usd(order.total)})`, ...farm, replyTo: order.customer.email });
  await L.sendEmail({ to: order.customer.email, subject: `Your Gila River Farms order ${order.id}`, ...cust });
  return stored || toFarm;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return L.send(res, 405, { error: "method_not_allowed" });
  const b = L.body(req);
  try {
    if (!(await L.rateLimit(req, "checkout", 30, 600))) return L.send(res, 429, { error: "too_many_requests" });

    // 1) Card payments: create a PaymentIntent for the cart, priced on the server.
    if (b.action === "intent") {
      if (!L.stripeEnabled()) return L.send(res, 503, { error: "card_payments_not_configured" });
      const priced = L.priceItems(b.items), customer = cleanCustomer(b.customer);
      if (!priced) return L.send(res, 400, { error: "bad_cart" });
      if (!customer) return L.send(res, 400, { error: "missing_details" });
      const pi = await L.stripe("POST", "/payment_intents", {
        amount: String(priced.total), currency: "usd", "automatic_payment_methods[enabled]": "true",
        receipt_email: customer.email, description: "Gila River Farms order",
        "metadata[items]": JSON.stringify(priced.lines.map(l => [l.id, l.qty])),
        "metadata[name]": customer.name, "metadata[email]": customer.email, "metadata[phone]": customer.phone,
        "metadata[pickupDate]": customer.pickupDate, "metadata[notes]": customer.notes,
      });
      return L.send(res, 200, { clientSecret: pi.client_secret, id: pi.id });
    }

    // 2) Place the order.
    if (b.action === "place") {
      const accountEmail = L.sessionEmail(req);
      let order;
      if (b.payment === "card") {
        if (!L.stripeEnabled()) return L.send(res, 503, { error: "card_payments_not_configured" });
        const id = String(b.paymentIntentId || "");
        if (!/^pi_[A-Za-z0-9]+$/.test(id)) return L.send(res, 400, { error: "bad_payment" });
        const pi = await L.stripe("GET", "/payment_intents/" + id);
        if (pi.status !== "succeeded") return L.send(res, 402, { error: "payment_not_completed" });
        if (L.kvEnabled()) {                                          // don't create the same order twice
          const existing = await L.kv("GET", `pi:${id}`);
          if (existing) { const o = JSON.parse(await L.kv("GET", `order:${existing}`) || "null"); if (o) return L.send(res, 200, { order: { id: o.id, total: o.total, payment: o.payment } }); }
        }
        const m = pi.metadata || {};
        const priced = L.priceItems(JSON.parse(m.items || "[]").map(([id, qty]) => ({ id, qty })));
        if (!priced || priced.total !== pi.amount) return L.send(res, 400, { error: "amount_mismatch" });
        order = { id: orderId(), created: new Date().toISOString(), lines: priced.lines, total: priced.total, payment: "card", paymentIntent: id,
          customer: { name: m.name, email: m.email, phone: m.phone, pickupDate: m.pickupDate, notes: m.notes || "" } };
        if (L.kvEnabled()) await L.kv("SET", `pi:${id}`, order.id);
      } else {
        const priced = L.priceItems(b.items), customer = cleanCustomer(b.customer);
        if (!priced) return L.send(res, 400, { error: "bad_cart" });
        if (!customer) return L.send(res, 400, { error: "missing_details" });
        if (!L.kvEnabled() && !L.emailEnabled()) return L.send(res, 503, { error: "orders_not_configured" });
        order = { id: orderId(), created: new Date().toISOString(), lines: priced.lines, total: priced.total, payment: "pickup", customer };
      }
      const ok = await saveAndNotify(order, accountEmail);
      if (!ok && order.payment !== "card") return L.send(res, 503, { error: "order_not_saved" });
      return L.send(res, 200, { order: { id: order.id, total: order.total, payment: order.payment } });
    }
    return L.send(res, 400, { error: "unknown_action" });
  } catch (e) { return L.send(res, e.status || 500, { error: e.message || "error" }); }
};
