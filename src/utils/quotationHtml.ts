import { UserProfile } from '../context/AuthContext';

export type QuoteLine = {
  id: string;
  service: string;
  description: string;
  qty: string;
  rate: string;
};

export type QuoteMeta = {
  quoteNo: string;
  clientName: string;
  clientPhone: string;
  notes: string;
  taxPercent: string;
  validityDays: string;
};

const money = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export function computeTotals(lines: QuoteLine[], taxPercent: string) {
  const subtotal = lines.reduce((sum, l) => {
    const q = parseFloat(l.qty) || 0;
    const r = parseFloat(l.rate) || 0;
    return sum + q * r;
  }, 0);

  const tax = (subtotal * (parseFloat(taxPercent) || 0)) / 100;
  return { subtotal, tax, total: subtotal + tax };
}

export function buildQuotationHtml(
  profile: UserProfile,
  meta: QuoteMeta,
  lines: QuoteLine[],
  logoBase64: string | null
) {
  const { subtotal, tax, total } = computeTotals(lines, meta.taxPercent);

  const now = new Date();
  const stamp = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const validTill = new Date(
    now.getTime() + (parseInt(meta.validityDays) || 15) * 86400000
  ).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const rows = lines
    .filter((l) => l.service.trim())
    .map((l, i) => {
      const amount = (parseFloat(l.qty) || 0) * (parseFloat(l.rate) || 0);
      return `
        <tr>
          <td class="num">${i + 1}</td>
          <td>
            <div class="svc">${escapeHtml(l.service)}</div>
            ${l.description ? `<div class="desc">${escapeHtml(l.description)}</div>` : ''}
          </td>
          <td class="right">${l.qty || '1'}</td>
          <td class="right">${money(parseFloat(l.rate) || 0)}</td>
          <td class="right bold">${money(amount)}</td>
        </tr>`;
    })
    .join('');

  const watermark = logoBase64
    ? `<div class="watermark"><img src="data:image/jpeg;base64,${logoBase64}" /></div>`
    : `<div class="watermark text">${escapeHtml(profile.companyName || 'LASAN MART')}</div>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 36px 32px;
    color: #1A1A1A;
    position: relative;
  }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-24deg);
    opacity: 0.06;
    z-index: 0;
    pointer-events: none;
  }
  .watermark img { width: 420px; }
  .watermark.text {
    font-size: 78px;
    font-weight: 800;
    letter-spacing: -2px;
    white-space: nowrap;
  }
  .sheet { position: relative; z-index: 1; }

  .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .co-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .co-line { font-size: 11px; color: #767676; margin-top: 3px; }
  .logo-box img { width: 74px; height: 74px; object-fit: contain; border-radius: 10px; }

  .title-row {
    margin-top: 26px;
    padding: 14px 16px;
    background: #FFF1EA;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title { font-size: 19px; font-weight: 800; color: #F2542D; letter-spacing: -0.4px; }
  .qno { font-size: 11px; color: #767676; text-align: right; line-height: 1.6; }

  .parties { display: flex; gap: 28px; margin-top: 22px; }
  .party { flex: 1; }
  .plabel {
    font-size: 9px; font-weight: 700; letter-spacing: 1px;
    color: #767676; text-transform: uppercase; margin-bottom: 5px;
  }
  .pval { font-size: 13px; font-weight: 600; }
  .psub { font-size: 11px; color: #767676; margin-top: 2px; }

  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  thead th {
    font-size: 9px; font-weight: 700; letter-spacing: 0.8px;
    text-transform: uppercase; color: #767676;
    text-align: left; padding: 9px 8px;
    border-bottom: 1.5px solid #E0E0E0;
  }
  thead th.right { text-align: right; }
  tbody td { padding: 12px 8px; border-bottom: 1px solid #F0F0F0; font-size: 12px; vertical-align: top; }
  td.num { color: #767676; width: 26px; }
  td.right { text-align: right; }
  td.bold { font-weight: 700; }
  .svc { font-weight: 600; font-size: 12.5px; }
  .desc { font-size: 10.5px; color: #767676; margin-top: 2px; line-height: 1.45; }

  .totals { margin-top: 18px; margin-left: auto; width: 260px; }
  .trow { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
  .trow .lbl { color: #767676; }
  .grand {
    margin-top: 8px; padding: 12px 14px;
    background: #1A1A1A; color: #fff; border-radius: 10px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .grand .lbl { font-size: 11px; opacity: 0.8; }
  .grand .val { font-size: 19px; font-weight: 800; letter-spacing: -0.5px; }

  .notes { margin-top: 26px; font-size: 11px; color: #767676; line-height: 1.6; }
  .notes .h { font-weight: 700; color: #1A1A1A; margin-bottom: 4px; font-size: 11px; }

  .foot {
    margin-top: 34px; padding-top: 14px;
    border-top: 1px solid #E0E0E0;
    display: flex; justify-content: space-between;
    font-size: 9.5px; color: #999;
  }
</style>
</head>
<body>
  ${watermark}

  <div class="sheet">
    <div class="top">
      <div>
        <div class="co-name">${escapeHtml(profile.companyName || profile.name || 'Your Company')}</div>
        ${profile.companyDescription ? `<div class="co-line">${escapeHtml(profile.companyDescription)}</div>` : ''}
        <div class="co-line">
          ${profile.phone ? `${escapeHtml(profile.phone)}` : ''}
          ${profile.phone && profile.email ? ' · ' : ''}
          ${profile.email ? `${escapeHtml(profile.email)}` : ''}
        </div>
      </div>
      ${
        logoBase64
          ? `<div class="logo-box"><img src="data:image/jpeg;base64,${logoBase64}" /></div>`
          : ''
      }
    </div>

    <div class="title-row">
      <div class="title">QUOTATION</div>
      <div class="qno">
        <b>${escapeHtml(meta.quoteNo)}</b><br/>
        Generated ${stamp}
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="plabel">Quotation for</div>
        <div class="pval">${escapeHtml(meta.clientName || '—')}</div>
        ${meta.clientPhone ? `<div class="psub">${escapeHtml(meta.clientPhone)}</div>` : ''}
      </div>
      <div class="party">
        <div class="plabel">Valid until</div>
        <div class="pval">${validTill}</div>
        <div class="psub">${meta.validityDays || 15} days from issue</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Service</th>
          <th class="right">Qty</th>
          <th class="right">Rate</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="trow"><span class="lbl">Subtotal</span><span>${money(subtotal)}</span></div>
      <div class="trow"><span class="lbl">Tax (${meta.taxPercent || 0}%)</span><span>${money(tax)}</span></div>
      <div class="grand">
        <span class="lbl">TOTAL</span>
        <span class="val">${money(total)}</span>
      </div>
    </div>

    ${
      meta.notes
        ? `<div class="notes"><div class="h">Notes</div>${escapeHtml(meta.notes).replace(/\n/g, '<br/>')}</div>`
        : ''
    }

    <div class="foot">
      <span>Generated with Lasan Mart</span>
      <span>${stamp}</span>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}