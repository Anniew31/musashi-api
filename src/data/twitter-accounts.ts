// Curated list of high-signal Twitter accounts for prediction market intelligence
// 71 accounts across 8 categories (45 high priority, 26 medium priority)

import { TwitterAccount } from '../types/feed';

export const TWITTER_ACCOUNTS: TwitterAccount[] = [
  // ─── Breaking News (5 accounts) ──────────────────────────────────────────
  {
    username: 'BBCBreaking',
    category: 'breaking_news',
    priority: 'high',
    description: '50M+ followers, first to report major global events',
  },
  {
    username: 'Reuters',
    category: 'breaking_news',
    priority: 'high',
    description: 'Global wire service, 25M+ followers, real-time verified news',
  },
  {
    username: 'AP',
    category: 'breaking_news',
    priority: 'high',
    description: 'Associated Press wire service, breaking news standard',
  },
  {
    username: 'spectatorindex',
    category: 'breaking_news',
    priority: 'high',
    description: 'Data-driven breaking news across all categories',
  },
  {
    username: 'BNONews',
    category: 'breaking_news',
    priority: 'high',
    description: 'Fast, verified breaking news with real-time updates',
  },

  // ─── Politics (8 accounts) ───────────────────────────────────────────────
  {
    username: 'Redistrict',
    category: 'politics',
    priority: 'high',
    description: 'Dave Wasserman, election forecasting expert and Cook Political Report',
  },
  {
    username: 'NateSilver538',
    category: 'politics',
    priority: 'high',
    description: 'Polling expert, prediction markets commentator, founded FiveThirtyEight',
  },
  {
    username: 'gelliottmorris',
    category: 'politics',
    priority: 'high',
    description: 'The Economist polling director, election forecasts',
  },
  {
    username: 'jaketapper',
    category: 'politics',
    priority: 'medium',
    description: 'CNN Chief Washington Correspondent',
  },
  {
    username: 'mkraju',
    category: 'politics',
    priority: 'medium',
    description: 'CNN Chief Congressional Correspondent, Congress insider',
  },
  {
    username: 'joshtpm',
    category: 'politics',
    priority: 'medium',
    description: 'Talking Points Memo founder, political analysis',
  },
  {
    username: 'JakeSherman',
    category: 'politics',
    priority: 'high',
    description: 'Punchbowl News co-founder, insider Congress coverage',
  },
  {
    username: 'AnnaAPalmer',
    category: 'politics',
    priority: 'high',
    description: 'Punchbowl News co-founder, Washington insider',
  },

  // ─── Economics (8 accounts) ──────────────────────────────────────────────
  {
    username: 'federalreserve',
    category: 'economics',
    priority: 'high',
    description: 'Official Federal Reserve account, monetary policy announcements',
  },
  {
    username: 'NickTimiraos',
    category: 'economics',
    priority: 'high',
    description: 'WSJ "Fed whisperer", insider Fed coverage',
  },
  {
    username: 'economics',
    category: 'economics',
    priority: 'high',
    description: 'The Economist official account',
  },
  {
    username: 'FT',
    category: 'economics',
    priority: 'high',
    description: 'Financial Times, global economics coverage',
  },
  {
    username: 'JenniferJJacobs',
    category: 'economics',
    priority: 'medium',
    description: 'Bloomberg White House correspondent',
  },
  {
    username: 'lisaabramowicz1',
    category: 'economics',
    priority: 'medium',
    description: 'Bloomberg markets anchor, Fed coverage',
  },
  {
    username: 'MikeCaraccio',
    category: 'economics',
    priority: 'medium',
    description: 'Bloomberg Economics, macro analysis',
  },
  {
    username: 'WSJeconomics',
    category: 'economics',
    priority: 'high',
    description: 'Wall Street Journal Economics team',
  },

  // ─── Crypto (10 accounts) ────────────────────────────────────────────────
  {
    username: 'VitalikButerin',
    category: 'crypto',
    priority: 'high',
    description: 'Ethereum co-founder, crypto thought leader',
  },
  {
    username: 'saylor',
    category: 'crypto',
    priority: 'high',
    description: 'Michael Saylor, MicroStrategy CEO, Bitcoin maximalist',
  },
  {
    username: 'APompliano',
    category: 'crypto',
    priority: 'high',
    description: 'Pomp, Bitcoin macro investor, high-signal Bitcoin commentary',
  },
  {
    username: 'WatcherGuru',
    category: 'crypto',
    priority: 'high',
    description: 'Breaking crypto news, fast updates on Bitcoin, ETH, regulation',
  },
  {
    username: 'elonmusk',
    category: 'crypto',
    priority: 'high',
    description: 'Dogecoin supporter, crypto market mover',
  },
  {
    username: 'coinbureau',
    category: 'crypto',
    priority: 'medium',
    description: 'Crypto analysis and education',
  },
  {
    username: 'aantonop',
    category: 'crypto',
    priority: 'medium',
    description: 'Andreas Antonopoulos, Bitcoin educator',
  },
  {
    username: 'cz_binance',
    category: 'crypto',
    priority: 'medium',
    description: 'Changpeng Zhao, Binance founder',
  },
  {
    username: 'SBF_FTX',
    category: 'crypto',
    priority: 'medium',
    description: 'FTX collapse coverage, crypto regulation commentary',
  },
  {
    username: 'LayahHeilpern',
    category: 'crypto',
    priority: 'medium',
    description: 'Crypto commentator, Bitcoin advocate',
  },

  // ─── Technology (9 accounts) ─────────────────────────────────────────────
  {
    username: 'sama',
    category: 'technology',
    priority: 'high',
    description: 'Sam Altman, OpenAI CEO, AI developments',
  },
  {
    username: 'nvidia',
    category: 'technology',
    priority: 'high',
    description: 'NVIDIA official account, AI chips, data center',
  },
  {
    username: 'JensenHuang',
    category: 'technology',
    priority: 'high',
    description: 'NVIDIA CEO, GPU and AI chip announcements',
  },
  {
    username: 'ylecun',
    category: 'technology',
    priority: 'high',
    description: 'Yann LeCun, Meta AI Chief Scientist',
  },
  {
    username: 'demishassabis',
    category: 'technology',
    priority: 'high',
    description: 'Demis Hassabis, Google DeepMind CEO',
  },
  {
    username: 'AnthropicAI',
    category: 'technology',
    priority: 'high',
    description: 'Anthropic/Claude AI official account',
  },
  {
    username: 'satyanadella',
    category: 'technology',
    priority: 'medium',
    description: 'Satya Nadella, Microsoft CEO',
  },
  {
    username: 'sundarpichai',
    category: 'technology',
    priority: 'medium',
    description: 'Sundar Pichai, Google CEO',
  },
  {
    username: 'tim_cook',
    category: 'technology',
    priority: 'medium',
    description: 'Tim Cook, Apple CEO',
  },

  // ─── Geopolitics (8 accounts) ────────────────────────────────────────────
  {
    username: 'GeopoliticsMag',
    category: 'geopolitics',
    priority: 'high',
    description: 'The Geopolitics analysis, global affairs',
  },
  {
    username: 'JenniferJJacobs',
    category: 'geopolitics',
    priority: 'high',
    description: 'Bloomberg foreign policy and White House',
  },
  {
    username: 'eha_news',
    category: 'geopolitics',
    priority: 'high',
    description: 'ELINT News, intelligence and geopolitics',
  },
  {
    username: 'ragipsoylu',
    category: 'geopolitics',
    priority: 'medium',
    description: 'Middle East Eye, Turkey and Middle East coverage',
  },
  {
    username: 'JackDetsch',
    category: 'geopolitics',
    priority: 'medium',
    description: 'Foreign Policy Pentagon correspondent',
  },
  {
    username: 'ChristopherJM',
    category: 'geopolitics',
    priority: 'medium',
    description: 'Wall Street Journal National Security',
  },
  {
    username: 'NATOPress',
    category: 'geopolitics',
    priority: 'high',
    description: 'NATO official account, alliance announcements',
  },
  {
    username: 'AFP',
    category: 'geopolitics',
    priority: 'high',
    description: 'Agence France-Presse, global wire service',
  },

  // ─── Sports (8 accounts) ─────────────────────────────────────────────────
  {
    username: 'AdamSchefter',
    category: 'sports',
    priority: 'high',
    description: 'ESPN NFL insider, breaking NFL news and trades',
  },
  {
    username: 'wojespn',
    category: 'sports',
    priority: 'high',
    description: 'Adrian Wojnarowski, ESPN NBA insider',
  },
  {
    username: 'ShamsCharania',
    category: 'sports',
    priority: 'high',
    description: 'The Athletic NBA insider, breaking NBA news',
  },
  {
    username: 'FabrizioRomano',
    category: 'sports',
    priority: 'high',
    description: 'Soccer transfers expert, "Here we go!" tweets',
  },
  {
    username: 'JeffPassan',
    category: 'sports',
    priority: 'medium',
    description: 'ESPN MLB insider, baseball trades',
  },
  {
    username: 'espn',
    category: 'sports',
    priority: 'medium',
    description: 'ESPN official account',
  },
  {
    username: 'BR_Betting',
    category: 'sports',
    priority: 'medium',
    description: 'Bleacher Report Betting, sports betting insights',
  },
  {
    username: 'UFC',
    category: 'sports',
    priority: 'medium',
    description: 'UFC official account, fight announcements',
  },

  // ─── Finance (7 accounts) ────────────────────────────────────────────────
  {
    username: 'BlackRock',
    category: 'finance',
    priority: 'high',
    description: 'BlackRock official, Bitcoin ETF, institutional crypto',
  },
  {
    username: 'GoldmanSachs',
    category: 'finance',
    priority: 'high',
    description: 'Goldman Sachs official, market forecasts',
  },
  {
    username: 'jpmorgan',
    category: 'finance',
    priority: 'high',
    description: 'JPMorgan Chase official, market outlook',
  },
  {
    username: 'business',
    category: 'finance',
    priority: 'high',
    description: 'Bloomberg Business, market news',
  },
  {
    username: 'markets',
    category: 'finance',
    priority: 'high',
    description: 'Bloomberg Markets, trading and markets',
  },
  {
    username: 'CathieDWood',
    category: 'finance',
    priority: 'medium',
    description: 'Cathie Wood, ARK Invest CEO, Bitcoin ETF',
  },
  {
    username: 'unusual_whales',
    category: 'finance',
    priority: 'medium',
    description: 'Market data, options flow, institutional trading',
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getAccountsByPriority(priority: 'high' | 'medium'): TwitterAccount[] {
  return TWITTER_ACCOUNTS.filter(account => account.priority === priority);
}

export function getAccountsByCategory(category: string): TwitterAccount[] {
  return TWITTER_ACCOUNTS.filter(account => account.category === category);
}

export function getHighPriorityAccounts(): TwitterAccount[] {
  return getAccountsByPriority('high');
}

export function getMediumPriorityAccounts(): TwitterAccount[] {
  return getAccountsByPriority('medium');
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export const ACCOUNT_STATS = {
  total: TWITTER_ACCOUNTS.length,
  high_priority: getHighPriorityAccounts().length,
  medium_priority: getMediumPriorityAccounts().length,
  by_category: {
    breaking_news: getAccountsByCategory('breaking_news').length,
    politics: getAccountsByCategory('politics').length,
    economics: getAccountsByCategory('economics').length,
    crypto: getAccountsByCategory('crypto').length,
    technology: getAccountsByCategory('technology').length,
    geopolitics: getAccountsByCategory('geopolitics').length,
    sports: getAccountsByCategory('sports').length,
    finance: getAccountsByCategory('finance').length,
  },
};

console.log(`[Musashi] Monitoring ${ACCOUNT_STATS.total} Twitter accounts (${ACCOUNT_STATS.high_priority} high priority, ${ACCOUNT_STATS.medium_priority} medium priority)`);
