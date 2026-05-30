# Retail price tracker (Bright Data — free tier)

A minimal, runnable Next.js app that tracks one product's price across Amazon and Walmart using
Bright Data's [Datasets API](https://brightdata.com/products/web-scraper) — the **free-tier** path
(dataset trigger → poll), no Pro plan and no `&pro=1` required. It's the runnable version of
**Use case 1** from the brightdata-scrape Kiro Power article.

The dashboard fires both retailers in parallel, polls each snapshot to completion, and renders a
"best price" banner across the two.

## What's inside

| File | Role |
|------|------|
| `src/scrapers/price-tracker.ts` | `triggerAndPoll` (Datasets API v3) + `normalise` + `fetchAllPrices` (parallel, per-retailer error isolation). |
| `src/app/api/scrape-prices/route.ts` | API route; runs both retailers live. |
| `src/app/page.tsx` | Dashboard: Amazon + Walmart cards + best-price banner. |

## Run it (free tier — no Pro plan)

```bash
npm install
cp .env.example .env.local      # then paste your token
npm run dev                     # http://localhost:3000
```

`.env.local`:

```bash
BRIGHTDATA_API_KEY=your-token-here   # free signup at brightdata.com/cp/setting/users
```

A live dataset scrape takes ~30–90s per retailer; the dashboard shows "Scraping live…" until both return.

## Notes

- **Don't commit your token.** `.env*` is gitignored.
- The product is the Sony WH-1000XM5; change the dataset IDs / URLs in `src/scrapers/price-tracker.ts` to track anything else.
- Hardcoded product URLs can drift (a listing ID can migrate to a different product). For production, discover the canonical URL by keyword instead of hardcoding — see the article's "Scaling" section.
- The free tier covers 5,000 requests/month. Want typed one-call tools (`web_data_amazon_product`) instead of trigger/poll? That's the Pro path (`&pro=1`) — covered in the article.
