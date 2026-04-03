# Local API

Run the existing `api/*.ts` handlers locally without `vercel dev`.

## Start

```bash
pnpm run local:api
```

Optional overrides:

```bash
MUSASHI_LOCAL_API_HOST=127.0.0.1 MUSASHI_LOCAL_API_PORT=3000 pnpm run local:api
```

## Verify

In a second terminal:

```bash
curl -i http://127.0.0.1:3000/api/health
MUSASHI_API_BASE_URL=http://127.0.0.1:3000 pnpm run agent:test:api
```

Full suite:

```bash
MUSASHI_API_BASE_URL=http://127.0.0.1:3000 pnpm run agent:test:api:full
```

## Notes

- This local server reuses the same handlers under `api/`.
- It does not require `vercel login`.
- Routes not implemented in the repo, such as `/api/internal/usage`, still return `404`.
