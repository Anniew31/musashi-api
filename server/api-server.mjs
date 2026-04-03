import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(fileName, override = false) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, 'utf8');

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\n/g, '\n');

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local', true);

const PORT = Number(process.env.API_PORT ?? 8787);
const HOST = process.env.API_HOST ?? '127.0.0.1';
const API_KEY = process.env.BACKEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function requireApiKey(req, res) {
  if (!API_KEY) return true;
  const incomingKey = req.headers['x-api-key'];
  if (incomingKey !== API_KEY) {
    sendJson(res, 401, { error: 'Unauthorized: invalid x-api-key' });
    return false;
  }
  return true;
}

function validateEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    return `${field} must be one of: ${allowed.join(', ')}`;
  }
  return null;
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > 1_000_000) {
      throw new Error('Request body too large');
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

async function upsertUserAccount(payload, res) {
  const { id, email, role = 'user', subscription_status = 'free' } = payload;

  if (!email) {
    return sendJson(res, 400, { error: 'email is required' });
  }

  const roleError = validateEnum(role, ['user', 'admin'], 'role');
  if (roleError) return sendJson(res, 400, { error: roleError });

  const subError = validateEnum(
    subscription_status,
    ['free', 'trial', 'active', 'canceled', 'expired'],
    'subscription_status',
  );
  if (subError) return sendJson(res, 400, { error: subError });

  const { data, error } = await supabase
    .from('user_accounts')
    .upsert(
      { id, email, role, subscription_status },
      { onConflict: 'email' },
    )
    .select('*')
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, 200, { data });
}

async function insertPluginUsage(payload, res) {
  const {
    user_id,
    extension_version,
    device_id,
    event_type,
    is_active = true,
    metadata = null,
    activity_at,
  } = payload;

  if (!user_id || !extension_version || !device_id || !event_type) {
    return sendJson(res, 400, {
      error: 'user_id, extension_version, device_id, event_type are required',
    });
  }

  const eventError = validateEnum(event_type, ['install', 'activate', 'usage'], 'event_type');
  if (eventError) return sendJson(res, 400, { error: eventError });

  const insertPayload = {
    user_id,
    extension_version,
    device_id,
    event_type,
    is_active,
    metadata,
  };

  if (activity_at) {
    insertPayload.activity_at = activity_at;
  }

  const { data, error } = await supabase
    .from('plugin_usage_records')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, 201, { data });
}

async function upsertOrderSubscription(payload, res) {
  const {
    id,
    user_id,
    amount_usd,
    payment_method,
    subscription_status = 'pending',
    expires_at,
    started_at,
  } = payload;

  if (!user_id || amount_usd == null || !payment_method || !expires_at) {
    return sendJson(res, 400, {
      error: 'user_id, amount_usd, payment_method, expires_at are required',
    });
  }

  const paymentMethodError = validateEnum(
    payment_method,
    ['card', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'other'],
    'payment_method',
  );
  if (paymentMethodError) return sendJson(res, 400, { error: paymentMethodError });

  const statusError = validateEnum(
    subscription_status,
    ['pending', 'active', 'canceled', 'expired', 'refunded'],
    'subscription_status',
  );
  if (statusError) return sendJson(res, 400, { error: statusError });

  const upsertPayload = {
    id,
    user_id,
    amount_usd,
    payment_method,
    subscription_status,
    expires_at,
  };

  if (started_at) {
    upsertPayload.started_at = started_at;
  }

  const query = supabase.from('orders_subscriptions');
  const operation = id
    ? query.upsert(upsertPayload, { onConflict: 'id' })
    : query.insert(upsertPayload);

  const { data, error } = await operation.select('*').single();

  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, id ? 200 : 201, { data });
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, { error: 'Invalid request' });
  }

  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'musashi-backend-api',
      now: new Date().toISOString(),
    });
  }

  if (!requireApiKey(req, res)) return;

  try {
    if (req.method === 'POST' && req.url === '/api/user-accounts/upsert') {
      const payload = await readJsonBody(req);
      return upsertUserAccount(payload, res);
    }

    if (req.method === 'POST' && req.url === '/api/plugin-usage/log') {
      const payload = await readJsonBody(req);
      return insertPluginUsage(payload, res);
    }

    if (req.method === 'POST' && req.url === '/api/orders-subscriptions/upsert') {
      const payload = await readJsonBody(req);
      return upsertOrderSubscription(payload, res);
    }

    return sendJson(res, 404, { error: 'Route not found' });
  } catch (error) {
    return sendJson(res, 500, { error: error instanceof Error ? error.message : 'Internal error' });
  }
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on http://${HOST}:${PORT}`);
});
