import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TWITTER_ACCOUNTS, ACCOUNT_STATS } from '../../src/data/twitter-accounts';
import type { AccountsResponse } from '../../src/types/feed';

// ─── Main Handler ──────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const startTime = Date.now();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
    return;
  }

  try {
    // Build response
    const response: AccountsResponse = {
      success: true,
      data: {
        accounts: TWITTER_ACCOUNTS,
        count: ACCOUNT_STATS.total,
        by_category: ACCOUNT_STATS.by_category,
        by_priority: {
          high: ACCOUNT_STATS.high_priority,
          medium: ACCOUNT_STATS.medium_priority,
        },
        metadata: {
          processing_time_ms: Date.now() - startTime,
        },
      },
    };

    // Cache for 1 hour (account list rarely changes)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Feed Accounts API] Error:', errorMessage);

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
