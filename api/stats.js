import { kv } from '@vercel/kv';

// 认识的日子（起始日），存于数据库；修改请同时改 frontend/js/content.js 里的 startDate
const SINCE = '2023-06-10';

/**
 * GET /api/stats
 * 每次调用将访问次数 +1（原子自增），并返回 { visits, since }
 * 前端据此展示访问次数，并用 since 在本地计算“认识的天数”。
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // 首次访问时写入起始日
    const stored = await kv.get('since');
    if (!stored) {
      await kv.set('since', SINCE);
    }
    const since = stored || SINCE;
    const visits = await kv.incr('visits');

    res.status(200).json({ visits, since });
  } catch (err) {
    console.error('[stats] error:', err);
    // 优雅降级：即使数据库不可用也返回结构，避免前端崩掉
    res.status(200).json({ visits: null, since: SINCE, error: 'db_unavailable' });
  }
}
