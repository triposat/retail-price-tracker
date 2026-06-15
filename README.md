# Retail price tracker

Tracks one product's price across Amazon and Walmart and shows the cheaper option on a dashboard. This is the runnable version of **Use case 1** from the [brightdata-scrape Kiro Power](https://github.com/brightdata/kiro-powers) guide.

It uses Bright Data's [Datasets API](https://brightdata.com/products/web-scraper) on the **free tier**.

## Run it

```bash
npm install
cp .env.example .env.local   # paste your Bright Data token into BRIGHTDATA_API_KEY
npm run dev                  # open http://localhost:3000
```

Get a free token at [brightdata.com/cp/setting/users](https://brightdata.com/cp/setting/users). The first scrape takes about a minute, and the page shows "Scraping live…" until the prices return.

## Good to know

- `.env*` is gitignored, so your token is never committed.
- The tracked product is the Sony WH-1000XM5. To track something else, change the URLs in the scraper file under `src/scrapers/`.
