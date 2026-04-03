// Price Tracker - Tracks market price changes over time
// Stores historical snapshots to detect movers and price trends

import { Market } from '../types/market';

export interface PriceSnapshot {
  marketId: string;
  platform: 'polymarket' | 'kalshi';
  yesPrice: number;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface PriceHistory {
  [marketId: string]: PriceSnapshot[];
}

export interface MarketMover {
  market: Market;
  priceChange1h: number; // Change in last hour (e.g., 0.05 = +5%)
  priceChange24h: number; // Change in last 24 hours
  previousPrice: number;
  currentPrice: number;
  direction: 'up' | 'down';
  timestamp: number;
}

// Storage keys for price history
const STORAGE_KEY_PRICE_HISTORY = 'price_history_v1';
const STORAGE_KEY_MOVERS = 'market_movers_v1';
const STORAGE_KEY_MOVERS_TS = 'moversTs_v1';

// How long to keep price history (7 days)
const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// How long to keep movers in cache (5 minutes)
const MOVERS_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Record a price snapshot for a market
 */
export async function recordPriceSnapshot(
  marketId: string,
  platform: 'polymarket' | 'kalshi',
  yesPrice: number
): Promise<void> {
  const snapshot: PriceSnapshot = {
    marketId,
    platform,
    yesPrice,
    timestamp: Date.now(),
  };

  // Get existing history
  const history = await loadPriceHistory();

  // Initialize array if not exists
  if (!history[marketId]) {
    history[marketId] = [];
  }

  // Add new snapshot
  history[marketId].push(snapshot);

  // Keep only recent snapshots (last 7 days)
  const cutoff = Date.now() - HISTORY_TTL_MS;
  history[marketId] = history[marketId].filter(s => s.timestamp >= cutoff);

  // Save back to storage
  await savePriceHistory(history);
}

/**
 * Record snapshots for multiple markets
 */
export async function recordBulkSnapshots(markets: Market[]): Promise<void> {
  const history = await loadPriceHistory();
  const now = Date.now();
  const cutoff = now - HISTORY_TTL_MS;

  for (const market of markets) {
    const snapshot: PriceSnapshot = {
      marketId: market.id,
      platform: market.platform,
      yesPrice: market.yesPrice,
      timestamp: now,
    };

    if (!history[market.id]) {
      history[market.id] = [];
    }

    history[market.id].push(snapshot);

    // Keep only recent snapshots
    history[market.id] = history[market.id].filter(s => s.timestamp >= cutoff);
  }

  await savePriceHistory(history);
}

/**
 * Get price change for a market over a time period
 */
export async function getPriceChange(
  marketId: string,
  hoursAgo: number
): Promise<number | null> {
  const history = await loadPriceHistory();
  const snapshots = history[marketId];

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  // Get current price (most recent snapshot)
  const current = snapshots[snapshots.length - 1];

  // Find snapshot closest to hoursAgo
  const targetTime = Date.now() - (hoursAgo * 60 * 60 * 1000);

  // Find the snapshot closest to targetTime
  let closestSnapshot = snapshots[0];
  let closestDiff = Math.abs(closestSnapshot.timestamp - targetTime);

  for (const snapshot of snapshots) {
    const diff = Math.abs(snapshot.timestamp - targetTime);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestSnapshot = snapshot;
    }
  }

  // If the closest snapshot is too old (more than 2x the target period), return null
  if (closestDiff > (hoursAgo * 60 * 60 * 1000 * 2)) {
    return null;
  }

  // Calculate price change
  const change = current.yesPrice - closestSnapshot.yesPrice;
  return change;
}

/**
 * Detect market movers (significant price changes)
 */
export async function detectMovers(
  markets: Market[],
  minChange: number = 0.05, // 5% minimum change
  timeframe: '1h' | '6h' | '24h' = '1h'
): Promise<MarketMover[]> {
  const hoursMap = { '1h': 1, '6h': 6, '24h': 24 };
  const hours = hoursMap[timeframe];

  const movers: MarketMover[] = [];

  for (const market of markets) {
    const change1h = await getPriceChange(market.id, 1);
    const change24h = await getPriceChange(market.id, 24);

    if (change1h === null) continue;

    const absChange = Math.abs(change1h);
    if (absChange >= minChange) {
      const history = await loadPriceHistory();
      const snapshots = history[market.id];
      const previousPrice = snapshots && snapshots.length > 1
        ? snapshots[snapshots.length - 2].yesPrice
        : market.yesPrice;

      movers.push({
        market,
        priceChange1h: change1h,
        priceChange24h: change24h ?? 0,
        previousPrice,
        currentPrice: market.yesPrice,
        direction: change1h > 0 ? 'up' : 'down',
        timestamp: Date.now(),
      });
    }
  }

  // Sort by absolute change (biggest movers first)
  movers.sort((a, b) => Math.abs(b.priceChange1h) - Math.abs(a.priceChange1h));

  return movers;
}

/**
 * Get cached movers or recompute if stale
 */
export async function getMovers(
  markets: Market[],
  options: {
    minChange?: number;
    timeframe?: '1h' | '6h' | '24h';
    limit?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<MarketMover[]> {
  const {
    minChange = 0.05,
    timeframe = '1h',
    limit = 20,
    forceRefresh = false,
  } = options;

  if (!forceRefresh) {
    // Try to load from cache
    const cached = await loadCachedMovers();
    if (cached && cached.movers && cached.timestamp) {
      const age = Date.now() - cached.timestamp;
      if (age < MOVERS_CACHE_TTL_MS) {
        console.log(`[Price Tracker] Returning ${cached.movers.length} cached movers`);
        return filterMovers(cached.movers, minChange, limit);
      }
    }
  }

  // Compute fresh movers
  const movers = await detectMovers(markets, minChange, timeframe);

  // Cache the results
  await cacheMovers(movers);

  console.log(`[Price Tracker] Detected ${movers.length} movers (min change: ${minChange})`);
  return movers.slice(0, limit);
}

/**
 * Filter and limit movers
 */
function filterMovers(
  movers: MarketMover[],
  minChange: number,
  limit: number
): MarketMover[] {
  return movers
    .filter(m => Math.abs(m.priceChange1h) >= minChange)
    .slice(0, limit);
}

/**
 * Load price history from storage
 */
async function loadPriceHistory(): Promise<PriceHistory> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return {};
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY_PRICE_HISTORY], (result) => {
      const history: PriceHistory = result[STORAGE_KEY_PRICE_HISTORY] ?? {};
      resolve(history);
    });
  });
}

/**
 * Save price history to storage
 */
async function savePriceHistory(history: PriceHistory): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY_PRICE_HISTORY]: history }, () => {
      resolve();
    });
  });
}

/**
 * Load cached movers from storage
 */
async function loadCachedMovers(): Promise<{ movers: MarketMover[]; timestamp: number } | null> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY_MOVERS, STORAGE_KEY_MOVERS_TS], (result) => {
      const movers = result[STORAGE_KEY_MOVERS];
      const timestamp = result[STORAGE_KEY_MOVERS_TS];

      if (movers && timestamp) {
        resolve({ movers, timestamp });
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Cache movers to storage
 */
async function cacheMovers(movers: MarketMover[]): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({
      [STORAGE_KEY_MOVERS]: movers,
      [STORAGE_KEY_MOVERS_TS]: Date.now(),
    }, () => {
      resolve();
    });
  });
}

/**
 * Clear old price history (cleanup utility)
 */
export async function cleanupOldHistory(): Promise<void> {
  const history = await loadPriceHistory();
  const cutoff = Date.now() - HISTORY_TTL_MS;
  let cleaned = 0;

  for (const marketId in history) {
    const before = history[marketId].length;
    history[marketId] = history[marketId].filter(s => s.timestamp >= cutoff);
    const after = history[marketId].length;

    if (history[marketId].length === 0) {
      delete history[marketId];
    }

    cleaned += (before - after);
  }

  if (cleaned > 0) {
    await savePriceHistory(history);
    console.log(`[Price Tracker] Cleaned ${cleaned} old snapshots`);
  }
}
