// Creates disposable orders and deletes only the records created by this run.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const base = (process.env.API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const tag = `LAB2-TEST-${randomUUID()}`;
const ids = new Set();
let passed = 0;
async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}/api/orders${path}`, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  return { status: response.status, data: await response.json() };
}
function check(condition, label) {
  assert.ok(condition, label);
  console.log(`PASS: ${label}`); passed++;
}
async function main() {
  console.log(`Target: ${base}\nTemporary record prefix: ${tag}`);
  try {
    for (const amount of [300, 100, 200]) {
      const result = await request('', 'POST', {
        customerName: `${tag} Nguyen`, customerEmail: 'lab2-test@example.com',
        items: [{ productName: 'Temporary test item', quantity: 1, unitPrice: amount }],
        totalAmount: amount,
      });
      if (result.data._id) ids.add(result.data._id);
      check(result.status === 201 && result.data._id && result.data.status === 'pending', `Create ${amount}`);
    }
    const id = [...ids][0];
    let r = await request(`/${id}`);
    check(r.status === 200 && r.data.customerName === `${tag} Nguyen`, 'Read created order');
    r = await request(`/${id}`, 'PUT', { status: 'confirmed' });
    check(r.status === 200 && r.data.status === 'confirmed', 'Update status');
    r = await request(`/${id}`);
    check(r.status === 200 && r.data.status === 'confirmed', 'Read persisted update');
    r = await request('?status=confirmed');
    check(r.status === 200 && r.data.every(x => x.status === 'confirmed') && r.data.some(x => x._id === id), 'Filter status');
    for (const direction of ['asc', 'desc']) {
      r = await request(`?sort=${direction}`);
      check(r.status === 200 && r.data.every((x, i, a) => i === 0 || (direction === 'asc' ? a[i - 1].totalAmount <= x.totalAmount : a[i - 1].totalAmount >= x.totalAmount)), `Sort ${direction}`);
      check(r.data.filter(x => ids.has(x._id)).length === 3, `Sort includes all test orders ${direction}`);
    }
    r = await request('?status=pending&sort=asc');
    check(r.status === 200 && r.data.every((x, i, a) => x.status === 'pending' && (i === 0 || a[i - 1].totalAmount <= x.totalAmount)) && r.data.filter(x => ids.has(x._id)).length === 2, 'Combined filter and sort');
    r = await request(`/search?name=${encodeURIComponent(tag.toLowerCase())}`);
    check(r.status === 200 && r.data.length === 3 && r.data.every(x => ids.has(x._id)), 'Case-insensitive partial name search');
    for (const path of ['?status=wrong', '?sort=wrong', '/search', '/not-an-id']) {
      r = await request(path);
      check(r.status === 400, `Reject invalid input ${path}`);
    }
    r = await request(`/${id}`, 'DELETE');
    check(r.status === 200, 'Delete created order');
    r = await request(`/${id}`);
    check(r.status === 404, 'Deleted order is absent');
    ids.delete(id);
  } finally {
    for (const id of ids) {
      try {
        const r = await request(`/${id}`, 'DELETE');
        assert.ok([200, 404].includes(r.status));
        const verification = await request(`/${id}`);
        assert.equal(verification.status, 404);
        ids.delete(id);
      } catch {
        console.error(`Cleanup failed; manually inspect test order ${id}`);
        process.exitCode = 1;
      }
    }
    console.log(`Checks passed: ${passed}; test records awaiting cleanup: ${ids.size}`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
