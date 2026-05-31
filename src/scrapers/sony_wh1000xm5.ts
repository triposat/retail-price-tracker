// src/scrapers/sony_wh1000xm5.ts
// Free-tier price tracking via Bright Data's Datasets API v3 (trigger -> poll).
// No `&pro=1`, no Pro web_data_* tools — runs on the free 5,000-requests/month tier.
const BASE = "https://api.brightdata.com/datasets/v3";

// Bright Data dataset IDs for Amazon / Walmart product records.
const DATASETS = {
  Amazon: "gd_l7q7dkf244hwjntr0",
  Walmart: "gd_l95fol7l1ru6rlo116",
} as const;
type Retailer = keyof typeof DATASETS;

// The product to track on each retailer (Sony WH-1000XM5).
const PRODUCT_URLS: Record<Retailer, string> = {
  Amazon: "https://www.amazon.com/dp/B09XS7JWHH",
  Walmart:
    "https://www.walmart.com/ip/Sony-WH-1000XM5-The-Best-Wireless-Noise-Canceling-Headphones-Black/386006068",
};

export interface PriceResult {
  retailer: string;
  title: string;
  final_price: number | null;
  currency: string;
  availability: string;
  url: string;
  error?: string;
}

async function triggerAndPoll(datasetId: string, url: string): Promise<Record<string, unknown>[]> {
  if (!process.env.BRIGHTDATA_API_KEY) throw new Error("BRIGHTDATA_API_KEY is not set");
  const auth = { Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}` };

  const trigger = await fetch(`${BASE}/trigger?dataset_id=${datasetId}&include_errors=true`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify([{ url }]),
  });
  const { snapshot_id } = (await trigger.json()) as { snapshot_id?: string };
  if (!snapshot_id) throw new Error("no snapshot_id returned from trigger");

  // In-progress snapshots return HTTP 202; the finished one returns 200 + a JSON array.
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(`${BASE}/snapshot/${snapshot_id}?format=json`, { headers: auth });
    if (res.status === 202) continue;
    return (await res.json()) as Record<string, unknown>[];
  }
  throw new Error("snapshot timed out after 120s");
}

function normalise(row: Record<string, unknown>, retailer: Retailer, url: string): PriceResult {
  return {
    retailer,
    title: String(row.title ?? row.product_name ?? "—"),
    final_price: typeof row.final_price === "number" ? row.final_price : null,
    currency: String(row.currency ?? "USD"),
    availability: String(row.availability ?? "—"),
    url,
  };
}

export async function fetchAllPrices(): Promise<PriceResult[]> {
  const entries = Object.entries(DATASETS) as [Retailer, string][];
  // errors are isolated per-retailer so one bad snapshot doesn't sink the other
  const settled = await Promise.allSettled(
    entries.map(async ([retailer, datasetId]) => {
      const rows = await triggerAndPoll(datasetId, PRODUCT_URLS[retailer]);
      return normalise(rows[0] ?? {}, retailer, PRODUCT_URLS[retailer]);
    }),
  );
  return settled.map((r, i) => {
    const retailer = entries[i][0];
    if (r.status === "fulfilled") return r.value;
    return {
      retailer,
      title: "—",
      final_price: null,
      currency: "USD",
      availability: "—",
      url: PRODUCT_URLS[retailer],
      error: String(r.reason),
    };
  });
}
