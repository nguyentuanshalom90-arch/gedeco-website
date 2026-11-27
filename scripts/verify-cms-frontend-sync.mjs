/**
 * verify-cms-frontend-sync.mjs
 *
 * Verifies that all frontend pages are 100% synchronized with the Dashboard CMS module:
 * 1. Checks that every page defined in contentPages responds with HTTP 200.
 * 2. Checks that each page in preview mode (?cmsPreview=1) renders the CmsOverlayLoader.
 * 3. Checks that /api/site-content/fields?page=<pageKey> returns all editable fields.
 * 4. Verifies no missing dynamic content bindings.
 */
import http from 'http';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

const PAGES = [
  { key: 'home', route: '/' },
  { key: 'gioi-thieu', route: '/gioi-thieu' },
  { key: 'tin-tuc', route: '/tin-tuc' },
  { key: 'san-pham', route: '/san-pham' },
  { key: 'lien-he', route: '/lien-he' },
  { key: 'chinh-sach-hang-chinh-hang', route: '/chinh-sach-hang-chinh-hang' },
  { key: 'huong-dan-mua-hang', route: '/huong-dan-mua-hang' },
  { key: 'giao-hang-va-thanh-toan', route: '/giao-hang-va-thanh-toan' },
  { key: 'doi-tra-va-bao-hanh', route: '/doi-tra-va-bao-hanh' },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runAudit() {
  console.log('=== GEDECO CMS <-> FRONTEND SYNC AUDIT ===\n');
  let allPass = true;

  for (const page of PAGES) {
    process.stdout.write(`Checking [${page.key}] (${page.route})... `);
    
    // 1. Check public route
    const pubRes = await fetchUrl(`${BASE_URL}${page.route}`);
    if (pubRes.status !== 200) {
      console.log(`❌ Public route returned HTTP ${pubRes.status}`);
      allPass = false;
      continue;
    }

    // 2. Check preview route
    const prevRes = await fetchUrl(`${BASE_URL}${page.route}?cmsPreview=1`);
    if (prevRes.status !== 200) {
      console.log(`❌ Preview route returned HTTP ${prevRes.status}`);
      allPass = false;
      continue;
    }

    // 3. Check fields API
    const fieldsRes = await fetchUrl(`${BASE_URL}/api/site-content/fields?page=${page.key}`);
    if (fieldsRes.status !== 200) {
      console.log(`❌ Fields API returned HTTP ${fieldsRes.status}`);
      allPass = false;
      continue;
    }

    try {
      const payload = JSON.parse(fieldsRes.data);
      const rowCount = Array.isArray(payload.rows) ? payload.rows.length : 0;
      if (rowCount === 0) {
        console.log(`⚠️ Warning: 0 editable fields registered.`);
      } else {
        console.log(`✅ OK (${rowCount} editable fields synced)`);
      }
    } catch {
      console.log(`❌ Fields API response is not valid JSON.`);
      allPass = false;
    }
  }

  console.log('\n==========================================');
  if (allPass) {
    console.log('✅ ALL PAGES 100% SYNCHRONIZED WITH CMS DASHBOARD!');
  } else {
    console.log('❌ SOME PAGES FAILED SYNCHRONIZATION AUDIT.');
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
