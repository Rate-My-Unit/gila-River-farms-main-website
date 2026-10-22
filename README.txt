GILA RIVER FARMS WEBSITE: HOW TO PUT IT ONLINE
=================================================

This folder is the complete website, ready for Vercel. Everything lives on
this one site: pages, shopping cart, checkout, customer accounts, forms and news.
There are no links to the old store.

WHAT'S INSIDE
- 18 pages, each with its own web address:
    /                    Home
    /our-mission/        Our Mission
    /our-team/           Our Team
    /our-history/        Our History
    /donate/             Request a Donation
    /donation-policy/    Donations & Sponsorship Policy
    /available-jobs/     Available Jobs
    /job-application/    Employment Application
    /hay/                Hay
    /horse-hay/          Horse Hay ($15.00) with Add to Cart
    /cow-hay/            Cow Hay ($10.00) with Add to Cart
    /olive-oil/          Olive Oil (coming soon)
    /what-we-grow/       What We Grow
    /contact/            Contact Us
    /privacy-policy/     Privacy Policy
    /cart/               Shopping cart
    /checkout/           Checkout (pay online by card, or pay at pickup)
    /account/            My Account (sign in, create account, order history)
- api/        the behind-the-scenes parts: checkout, accounts, forms, news, sitemap
- assets/     photos, styles, the page script, and the fillable donation PDF
- favicon.ico, icon-192.png, apple-touch-icon.png   the farm logo as the browser tab icon


STEP 1. PUT IT ON VERCEL (about 10 minutes, on a computer)
1. Unzip this folder.
2. Go to github.com and make a free account (or sign in).
3. Click "+" (top right) > "New repository". Name it gila-river-farms-website,
   choose Private, click "Create repository".
4. Click "uploading an existing file". Drag EVERYTHING from inside the unzipped
   folder into the page (all files plus the api and assets folders). Click "Commit changes".
5. Go to vercel.com > "Sign Up" > "Continue with GitHub".
6. "Add New..." > "Project" > gila-river-farms-website > "Import" > "Deploy".
7. Vercel gives you a live address like gila-river-farms-website.vercel.app.
Every time you upload changed files to GitHub, Vercel updates the site.

The site works right away. Steps 2 to 4 switch on orders, accounts, card
payments and form emails. Until then, those parts tell visitors to call the
office at (520) 315-3965.


STEP 2. STORAGE FOR ORDERS AND ACCOUNTS (free)
1. In Vercel open the project > "Storage" > "Create Database" > choose
   "Upstash for Redis" (free plan) > connect it to this project.
   This adds KV_REST_API_URL and KV_REST_API_TOKEN automatically.
2. "Settings" > "Environment Variables" > add:
     SESSION_SECRET = any long random text (at least 16 characters, e.g. 40 random letters and numbers)
3. Redeploy (Deployments > three dots on the newest > Redeploy).
Customers can now create accounts, sign in, and see their order history.


STEP 3. EMAIL (orders, contact, hay requests, job applications)
1. Go to resend.com, make a free account, "API Keys" > "Create API Key", copy it.
2. In Vercel "Settings" > "Environment Variables" add:
     RESEND_API_KEY = the key you copied
     FORM_TO_EMAIL  = the farm email that should get orders and form submissions
                      (separate several with commas)
3. Redeploy.
Each new order emails the farm (items, total, pickup date, customer info) and
sends the customer a confirmation.
Note: until a domain is verified in Resend, Resend only delivers to the email on
the Resend account, and customer confirmations won't go out. Once the new domain
is picked, add it in Resend under "Domains", then add:
     FORM_FROM_EMAIL = Gila River Farms Website <orders@YOUR-NEW-DOMAIN>
and redeploy.


STEP 4. CARD PAYMENTS (Stripe, the payment company named in the privacy policy)
1. Go to stripe.com and create an account for the farm (they'll need the farm's
   business and bank details to pay out).
2. Developers > API keys. Copy the Publishable key and the Secret key.
3. In Vercel "Settings" > "Environment Variables" add:
     STRIPE_PUBLISHABLE_KEY = pk_live_...
     STRIPE_SECRET_KEY      = sk_live_...
4. Redeploy. "Pay online with card" now appears at checkout. The card form is
   built into the checkout page, so customers never leave the site.
Tip: use Stripe's test keys (pk_test_ / sk_test_) first and test card
4242 4242 4242 4242, any future date, any CVC. Switch to live keys after.
All card payments also show in the Stripe dashboard with the customer's name,
phone, pickup date and items.
Without Stripe, checkout still works with "Pay at pickup".
Note: no sales tax is added. Ask the farm whether tax should be charged.


STEP 5. LIVE NEWS
Nothing to do. Agricultural Updates pulls the latest headlines every hour from
Real Agriculture, USDA and Farm Progress, and shows built-in headlines if the
feeds can't be reached. To change feeds, add:
     NEWS_FEEDS = https://feed-address|Source Name,https://another-feed|Another Source


STEP 6. ADD THE NEW DOMAIN (when it's picked)
1. Vercel project > "Settings" > "Domains" > add the domain.
2. Add the DNS records Vercel shows where the domain was bought (GoDaddy:
   My Products > the domain > DNS > Add record). Usually live within an hour.
3. The sitemap updates itself. Submit https://YOUR-NEW-DOMAIN/sitemap.xml in
   Google Search Console (search.google.com/search-console).
GoDaddy can manage the domain, but the site must stay on Vercel. GoDaddy's basic
hosting can't run checkout, accounts, forms or news.


STEP 7. TEST AND GET APPROVAL
On an iPhone and an Android phone, open the vercel.app address and check:
[ ] Menu opens, scrolls, and every page loads
[ ] Slideshow changes every 3 seconds, acreage numbers count up
[ ] Add Horse Hay and Cow Hay to the cart; cart icon shows the count
[ ] Change quantities and remove items in the cart
[ ] Check out with "Pay at pickup": the order number shows and the farm gets the email
[ ] Check out with a card (Stripe test card first)
[ ] Create an account, sign out, sign back in, see the order under My Account
[ ] Donation PDF downloads and can be filled in
[ ] Contact form, hay request and job application arrive in the farm inbox
[ ] Tapping the phone number in the top bar starts a call
Then send the vercel.app link to the farm for sign-off before connecting the domain.
