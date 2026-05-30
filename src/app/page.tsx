"use client";
import { useEffect, useState } from "react";

interface PriceResult {
  retailer: string;
  title: string;
  final_price: number | null;
  currency: string;
  availability: string;
  url: string;
  error?: string;
}

const THEME: Record<string, string> = {
  Amazon: "border-orange-300 bg-orange-50",
  Walmart: "border-blue-300 bg-blue-50",
};

export default function Home() {
  const [prices, setPrices] = useState<PriceResult[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/scrape-prices")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else { setPrices(d.prices); setFetchedAt(d.fetchedAt); }
      })
      .catch((e) => setError(String(e)));
  }, []);

  const valid = prices?.filter((p) => p.final_price != null) ?? [];
  const best = valid.length
    ? valid.reduce((a, b) => (a.final_price! <= b.final_price! ? a : b))
    : null;

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Sony WH-1000XM5 price tracker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live from Bright Data dataset triggers (free tier)
          {fetchedAt && <> · fetched {new Date(fetchedAt).toLocaleString()}</>}
        </p>

        {error && <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">Error: {error}</div>}
        {!prices && !error && <div className="mt-6 text-slate-500">Scraping live… (dataset triggers take ~30–90s)</div>}

        {best && (
          <div className="mt-6 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800">
            Best price: <strong>{best.retailer}</strong> at <strong>${best.final_price}</strong>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {prices?.map((p) => (
            <div key={p.retailer} className={`rounded-lg border p-5 shadow-sm ${THEME[p.retailer] ?? "border-slate-200 bg-white"}`}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{p.retailer}</h2>
                {p.final_price != null
                  ? <span className="text-2xl font-bold">${p.final_price}</span>
                  : <span className="text-sm text-red-600">unavailable</span>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                {p.availability} · <a className="underline" href={p.url} target="_blank" rel="noreferrer">source</a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
