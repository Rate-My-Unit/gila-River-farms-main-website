// Tells the browser which shop features are switched on.
const L = require("./_lib");
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  L.send(res, 200, {
    card: L.stripeEnabled(),
    stripePk: L.stripeEnabled() ? L.env("STRIPE_PUBLISHABLE_KEY") : null,
    accounts: L.accountsEnabled(),
    orders: L.kvEnabled() || L.emailEnabled(),
  });
};
