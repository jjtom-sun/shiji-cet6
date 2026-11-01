/* Lightweight SVG charts — no external libraries */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  const SERIES_COLORS = ['var(--accent)', 'var(--jade)', 'var(--blue)', 'var(--gold)', 'var(--violet)'];

  function polar(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function pointsStr(pts) {
    return pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
  }

  function radar(opts) {
    const labels = opts.labels || [];
    const series = opts.series || [];
    const size = opts.size || 330;
    const cx = size / 2, cy = size / 2 + 2;
    const r = size * 0.315;
    const n = labels.length;
    if (!n) return '';
    const rings = [0.25, 0.5, 0.75, 1];
    let out = '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="能力雷达图">';
    out += '<defs><radialGradient id="radarFill" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="100%" stop-color="var(--accent)" stop-opacity=".06"/></radialGradient></defs>';
    rings.forEach(function (ring) {
      const pts = [];
      for (let i = 0; i < n; i++) pts.push(polar(cx, cy, r * ring, (360 / n) * i));
      out += '<polygon points="' + pointsStr(pts) + '" fill="none" stroke="var(--line)" stroke-width="1"' + (ring === 1 ? '' : ' stroke-dasharray="2 4"') + '/>';
    });
    for (let i = 0; i < n; i++) {
      const p = polar(cx, cy, r, (360 / n) * i);
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="var(--line)" stroke-width="1"/>';
    }
    series.forEach(function (s, si) {
      const values = (s.values || []).map(function (v) { return C.clamp(v, 0, 100); });
      const pts = values.map(function (v, i) { return polar(cx, cy, r * (v / 100), (360 / n) * i); });
      const color = s.color || SERIES_COLORS[si % SERIES_COLORS.length];
      const fill = s.fill === false ? 'none' : (si === 0 ? 'url(#radarFill)' : 'none');
      out += '<polygon points="' + pointsStr(pts) + '" fill="' + fill + '" stroke="' + color + '" stroke-width="' + (s.width || 1.8) + '"' +
        (s.dashed ? ' stroke-dasharray="4 4"' : '') + ' stroke-linejoin="round"/>';
      if (s.dots !== false) {
        pts.forEach(function (p) {
          out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6" fill="var(--surface)" stroke="' + color + '" stroke-width="1.6"/>';
        });
      }
    });
    labels.forEach(function (label, i) {
      const angle = (360 / n) * i;
      const p = polar(cx, cy, r + 26, angle);
      let anchor = 'middle';
      if (Math.cos((angle - 90) * Math.PI / 180) > 0.28) anchor = 'start';
      else if (Math.cos((angle - 90) * Math.PI / 180) < -0.28) anchor = 'end';
      out += '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="10.5" font-family="var(--sans)" fill="var(--ink-soft)">' + C.esc(label) + '</text>';
    });
    out += '</svg>';
    return out;
  }

  function smoothPath(points) {
    if (!points.length) return '';
    if (points.length === 1) return 'M' + points[0][0] + ',' + points[0][1];
    let d = 'M' + points[0][0].toFixed(1) + ',' + points[0][1].toFixed(1);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const t = 0.16;
      const c1x = p1[0] + (p2[0] - p0[0]) * t;
      const c1y = p1[1] + (p2[1] - p0[1]) * t;
      const c2x = p2[0] - (p3[0] - p1[0]) * t;
      const c2y = p2[1] - (p3[1] - p1[1]) * t;
      d += ' C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }

  function line(opts) {
    const labels = opts.labels || [];
    const series = opts.series || [];
    const W = 660, H = opts.height || 250;
    const padL = 40, padR = 16, padT = 18, padB = 28;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const values = [];
    series.forEach(function (s) { (s.values || []).forEach(function (v) { values.push(Number(v) || 0); }); });
    let min = typeof opts.min === 'number' ? opts.min : Math.min.apply(null, values.concat([0]));
    let max = typeof opts.max === 'number' ? opts.max : Math.max.apply(null, values.concat([100]));
    if (max === min) max = min + 10;
    min = Math.floor(min / 10) * 10;
    max = Math.ceil(max / 10) * 10;
    if (opts.max == null && max < (opts.suggestMax || 100)) max = opts.suggestMax || 100;
    const n = Math.max(labels.length, ...series.map(function (s) { return s.values.length; }));
    function xAt(i) { return n === 1 ? padL + innerW / 2 : padL + (innerW * i) / (n - 1); }
    function yAt(v) { return padT + innerH - ((v - min) / (max - min)) * innerH; }
    let out = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="趋势图" style="width:100%;height:auto">';
    const gid = C.uid('grad');
    out += '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>';
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = min + ((max - min) * i) / ticks;
      const y = yAt(v);
      out += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="' + (i === 0 ? '0' : '3 5') + '"/>';
      out += '<text x="' + (padL - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="6.5" font-family="var(--mono)" fill="var(--faint)">' + Math.round(v) + '</text>';
    }
    labels.forEach(function (label, i) {
      if (n > 8 && i % 2 !== 0 && i !== n - 1) return;
      out += '<text x="' + xAt(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="6.5" font-family="var(--mono)" fill="var(--faint)">' + C.esc(label) + '</text>';
    });
    series.forEach(function (s, si) {
      const color = s.color || SERIES_COLORS[si % SERIES_COLORS.length];
      const pts = (s.values || []).map(function (v, i) { return [xAt(i), yAt(Number(v) || 0)]; });
      if (!pts.length) return;
      const d = smoothPath(pts);
      if (si === 0 && opts.area !== false) {
        out += '<path d="' + d + ' L' + pts[pts.length - 1][0].toFixed(1) + ',' + (padT + innerH) + ' L' + pts[0][0].toFixed(1) + ',' + (padT + innerH) + ' Z" fill="url(#' + gid + ')"/>';
      }
      out += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (s.dashed ? ' stroke-dasharray="4 4"' : '') + '/>';
      pts.forEach(function (p, i) {
        out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.8" fill="var(--surface)" stroke="' + color + '" stroke-width="1.8"><title>' + C.esc(labels[i] || '') + ': ' + C.esc(String((s.values || [])[i])) + '</title></circle>';
      });
    });
    out += '</svg>';
    return out;
  }

  function donut(items, opts) {
    opts = opts || {};
    const size = opts.size || 150;
    const stroke = opts.stroke || 16;
    const r = (size - stroke) / 2 - 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = items.reduce(function (s, i) { return s + (Number(i.value) || 0); }, 0);
    let out = '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="占比图">';
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--surface-3)" stroke-width="' + stroke + '"/>';
    let offset = 0;
    if (total > 0) {
      items.forEach(function (item, i) {
        const len = (Number(item.value) / total) * circ;
        const color = item.color || SERIES_COLORS[i % SERIES_COLORS.length];
        out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke +
          '" stroke-dasharray="' + Math.max(0, len - 2).toFixed(1) + ' ' + (circ - Math.max(0, len - 2)).toFixed(1) +
          '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" stroke-linecap="butt"><title>' + C.esc(item.label) + ': ' + item.value + '</title></circle>';
        offset += len;
      });
    }
    out += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-family="var(--serif)" font-size="22" font-weight="600" fill="var(--ink)">' + C.esc(opts.center || total) + '</text>';
    out += '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" font-family="var(--mono)" font-size="7" fill="var(--muted)">' + C.esc(opts.centerLabel || 'TOTAL') + '</text>';
    out += '</svg>';
    return out;
  }

  function ring(percent, size, opts) {
    opts = opts || {};
    const s = size || 96;
    const stroke = opts.stroke || 5;
    const r = (s - stroke) / 2 - 1;
    const circ = 2 * Math.PI * r;
    const value = C.clamp(percent, 0, 100);
    const color = opts.color || 'var(--accent)';
    return '<svg class="progress-ring" viewBox="0 0 ' + s + ' ' + s + '" width="' + s + '" height="' + s + '" aria-label="' + value + '%">' +
      '<circle class="track" cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + r + '" fill="none" stroke-width="' + stroke + '"/>' +
      '<circle class="value" cx="' + (s / 2) + '" cy="' + (s / 2) + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + (circ * (1 - value / 100)).toFixed(1) + '" transform="rotate(-90 ' + (s / 2) + ' ' + (s / 2) + ')"/>' +
      '</svg>';
  }

  C.charts = { radar: radar, line: line, donut: donut, ring: ring, colors: SERIES_COLORS };
})();
