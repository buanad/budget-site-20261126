/* HouseLedger charts — one job: turn figures into inline SVG.
   No library, no canvas, no network: every chart is a string of SVG. */
'use strict';

const Charts = (() => {
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  /* Donut of spending by category. slices: [{label, value, color}] */
  function donut(slices, size) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    const r = 70, cx = 90, cy = 90, thick = 26;
    let angle = -Math.PI / 2;
    let paths = '';
    slices.forEach(s => {
      if (s.value <= 0) return;
      const frac = s.value / total;
      const a0 = angle, a1 = angle + frac * Math.PI * 2;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      paths += '<path d="M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) +
        ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
        '" fill="none" stroke="' + s.color + '" stroke-width="' + thick + '"/>';
      angle = a1;
    });
    const hole = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - thick / 2 - 4) + '" fill="none"/>' +
      '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="donut-total">' +
      Store.money(total) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" class="donut-label">spent in Nov</text>';
    const legend = slices.filter(s => s.value > 0).map(s =>
      '<li><span class="swatch" style="background:' + s.color + '"></span>' +
      esc(s.label) + ' <b>' + Store.money(s.value) + '</b> <span class="pct">' +
      Math.round(100 * s.value / total) + '%</span></li>').join('');
    return '<div class="donut-wrap"><svg viewBox="0 0 180 180" width="' + (size || 180) + '" height="' + (size || 180) +
      '" role="img" aria-label="Spending by category">' + paths + hole + '</svg>' +
      '<ul class="legend">' + legend + '</ul></div>';
  }

  /* Horizontal bars comparing this month with last month, per category.
     rows: [{label, thisMonth, lastMonth, color}] */
  function compareBars(rows) {
    const max = Math.max.apply(null, rows.map(r => Math.max(r.thisMonth, r.lastMonth)).concat([1]));
    const body = rows.map(r => {
      const w1 = Math.max(1, Math.round(100 * r.thisMonth / max));
      const w2 = Math.max(1, Math.round(100 * r.lastMonth / max));
      return '<div class="cmp-row"><span class="cmp-label">' + esc(r.label) + '</span>' +
        '<div class="cmp-bars">' +
        '<div class="cmp-bar this" style="width:' + w1 + '%" title="November: ' + Store.money(r.thisMonth) + '"></div>' +
        '<div class="cmp-bar last" style="width:' + w2 + '%" title="October: ' + Store.money(r.lastMonth) + '"></div>' +
        '</div><span class="cmp-vals">' + Store.money(r.thisMonth) + ' <span class="cmp-last">vs ' + Store.money(r.lastMonth) + '</span></span></div>';
    }).join('');
    return '<div class="cmp-chart">' + body +
      '<p class="cmp-key"><span class="key-dot this"></span> November 2026 &nbsp; <span class="key-dot last"></span> October 2026</p></div>';
  }

  /* Vertical bars: daily spending across the month. days: [{day, value}] */
  function dailyBars(days) {
    const max = Math.max.apply(null, days.map(d => d.value).concat([1]));
    const w = 560, h = 160, pad = 24;
    const bw = (w - pad * 2) / days.length;
    let rects = '';
    days.forEach((d, i) => {
      const bh = Math.max(1, (h - pad - 18) * d.value / max);
      const x = pad + i * bw + 1;
      const y = h - 18 - bh;
      rects += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(2, bw - 2).toFixed(1) +
        '" height="' + bh.toFixed(1) + '" rx="2" fill="' + (d.value > 200 ? '#c96f4a' : '#3f8f6b') + '">' +
        '<title>Nov ' + d.day + ': ' + Store.money(d.value) + '</title></rect>';
    });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="daily-chart" role="img" aria-label="Daily spending in November">' +
      '<line x1="' + pad + '" y1="' + (h - 18) + '" x2="' + (w - pad) + '" y2="' + (h - 18) + '" stroke="#d8cfc0" />' +
      rects +
      '<text x="' + pad + '" y="' + (h - 2) + '" class="axis-label">Nov 1</text>' +
      '<text x="' + (w / 2) + '" y="' + (h - 2) + '" text-anchor="middle" class="axis-label">Nov 14</text>' +
      '<text x="' + (w - pad) + '" y="' + (h - 2) + '" text-anchor="end" class="axis-label">Nov 26</text>' +
      '</svg>';
  }

  /* Simple progress bar used by budgets and goals. */
  function progressBar(pct, tone) {
    const p = Math.max(0, Math.min(100, pct));
    return '<div class="progress" role="progressbar" aria-valuenow="' + Math.round(p) +
      '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill ' + (tone || '') +
      '" style="width:' + p.toFixed(1) + '%"></div></div>';
  }

  return { donut, compareBars, dailyBars, progressBar, esc };
})();
