// ─── DATA ───
const ORDERS = [
  { id: 'ME2U-0041', buyer: 'Chanda Mwale', seller: 'TechZone Lusaka', item: 'Wireless Earbuds (2×)', amount: 380, status: 'in_transit', tracking: 'ZAM-2947831', courier: 'Zampost', origin: 'Lusaka CBD', destination: 'Chilenje', dispatched: '2025-06-02 09:14', estimated: '2025-06-03 17:00', arrivalConfirmed: false, buyerConfirmed: false, dispute: false, autoReleaseHours: 18 },
  { id: 'ME2U-0038', buyer: 'Mulenga Bwalya', seller: 'ChizyShop', item: 'Phone Case + Screen Guard', amount: 95, status: 'delivered', tracking: '', courier: 'Own driver', origin: 'Kabwata', destination: 'Matero', dispatched: '2025-06-01 11:30', estimated: '2025-06-01 15:00', arrivalConfirmed: true, buyerConfirmed: true, dispute: false, autoReleaseHours: 0 },
  { id: 'ME2U-0035', buyer: 'Thandiwe Phiri', seller: 'FreshMarket ZM', item: 'Kapenta 10kg + Groundnuts', amount: 620, status: 'dispute', tracking: 'ZAM-2939012', courier: 'Zampost', origin: 'Livingstone', destination: 'Lusaka', dispatched: '2025-05-30 08:00', estimated: '2025-06-01 12:00', arrivalConfirmed: true, buyerConfirmed: false, dispute: true, disputeReason: 'Package arrived damaged — kapenta bag was torn open. Photos submitted.', autoReleaseHours: 0 },
  { id: 'ME2U-0033', buyer: 'Brian Lungu', seller: 'TechZone Lusaka', item: 'USB-C Hub', amount: 210, status: 'awaiting_dispatch', tracking: '', courier: '', origin: 'Lusaka CBD', destination: 'Woodlands', dispatched: '', estimated: '', arrivalConfirmed: false, buyerConfirmed: false, dispute: false, autoReleaseHours: 0 },
  { id: 'ME2U-0029', buyer: 'Namukolo Sikazwe', seller: 'BabyGear ZM', item: 'Feeding Bottles Set', amount: 155, status: 'delivered', tracking: '', courier: 'Own driver', origin: 'Ibex Hill', destination: 'Kabulonga', dispatched: '2025-05-28 10:00', estimated: '2025-05-28 13:00', arrivalConfirmed: true, buyerConfirmed: true, dispute: false, autoReleaseHours: 0 },
];

const USERS = {
  buyer: { name: 'Chanda Mwale', initials: 'CM', phone: '0977-441-882' },
  seller: { name: 'TechZone Lusaka', initials: 'TZ', phone: '0955-330-221' },
  admin: { name: 'Admin · ME2U', initials: 'AD', phone: '' },
};

const NAV = {
  buyer: [
    { id: 'b-dashboard', label: 'Dashboard', icon: '⊞', page: 'buyer-dashboard' },
    { id: 'b-orders', label: 'My Orders', icon: '◫', page: 'buyer-orders', badge: '1', badgeColor: 'amber' },
    { id: 'b-track', label: 'Track Parcel', icon: '◎', page: 'buyer-track' },
    { id: 'b-new', label: 'New Transaction', icon: '+', page: 'buyer-new' },
    { id: 'b-history', label: 'History', icon: '≡', page: 'buyer-history' },
  ],
  seller: [
    { id: 's-dashboard', label: 'Dashboard', icon: '⊞', page: 'seller-dashboard' },
    { id: 's-orders', label: 'Orders', icon: '◫', page: 'seller-orders', badge: '2', badgeColor: 'amber' },
    { id: 's-dispatch', label: 'Dispatch', icon: '▷', page: 'seller-dispatch' },
    { id: 's-history', label: 'History', icon: '≡', page: 'seller-history' },
    { id: 's-profile', label: 'My Profile', icon: '◯', page: 'seller-profile' },
  ],
  admin: [
    { id: 'a-dashboard', label: 'Overview', icon: '⊞', page: 'admin-dashboard' },
    { id: 'a-escrow', label: 'Escrow Wallet', icon: '◈', page: 'admin-escrow' },
    { id: 'a-orders', label: 'All Orders', icon: '◫', page: 'admin-orders' },
    { id: 'a-disputes', label: 'Disputes', icon: '⚠', page: 'admin-disputes', badge: '1', badgeColor: 'red' },
    { id: 'a-users', label: 'Users', icon: '◯', page: 'admin-users' },
    { id: 'a-releases', label: 'Auto-Releases', icon: '⏱', page: 'admin-releases' },
  ],
};

let currentRole = 'buyer';
let currentPage = 'buyer-dashboard';

// ─── INIT ───
function init() {
  renderSidebar();
  renderPage(currentPage);
}

function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.role-btn.' + role).classList.add('active');
  const firstPage = NAV[role][0].page;
  currentPage = firstPage;
  renderSidebar();
  renderPage(currentPage);
}

function renderSidebar() {
  const user = USERS[currentRole];
  const navItems = NAV[currentRole];

  // nav
  const navEl = document.getElementById('nav-section');
  navEl.innerHTML = navItems.map(n => `
    <div class="nav-item ${n.page === currentPage ? 'active' : ''}" onclick="navigateTo('${n.page}', '${n.id}')" id="nav-${n.id}">
      <span class="nav-icon">${n.icon}</span>
      <span>${n.label}</span>
      ${n.badge ? `<span class="nav-badge ${n.badgeColor || ''}">${n.badge}</span>` : ''}
    </div>
  `).join('');

  // user
  const userEl = document.getElementById('sidebar-user');
  userEl.innerHTML = `
    <div class="avatar ${currentRole}">${user.initials}</div>
    <div>
      <div class="user-name">${user.name}</div>
      <div class="user-role">${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</div>
    </div>
  `;
}

function navigateTo(page, navId) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nav-' + navId);
  if (el) el.classList.add('active');
  renderPage(page);
}

function renderPage(page) {
  const content = document.getElementById('content');
  const titleEl = document.getElementById('page-title');
  const actionsEl = document.getElementById('header-actions');
  actionsEl.innerHTML = '';

  content.innerHTML = '';
  content.scrollTop = 0;

  const pages = {
    'buyer-dashboard': pageBuyerDashboard,
    'buyer-orders': pageBuyerOrders,
    'buyer-track': pageBuyerTrack,
    'buyer-new': pageBuyerNew,
    'buyer-history': pageBuyerHistory,
    'seller-dashboard': pageSellerDashboard,
    'seller-orders': pageSellerOrders,
    'seller-dispatch': pageSellerDispatch,
    'seller-history': pageSellerHistory,
    'seller-profile': pageSellerProfile,
    'admin-dashboard': pageAdminDashboard,
    'admin-escrow': pageAdminEscrow,
    'admin-orders': pageAdminOrders,
    'admin-disputes': pageAdminDisputes,
    'admin-users': pageAdminUsers,
    'admin-releases': pageAdminReleases,
  };

  if (pages[page]) {
    const result = pages[page]();
    titleEl.textContent = result.title;
    if (result.actions) actionsEl.innerHTML = result.actions;
    content.innerHTML = result.html;
    content.classList.remove('page-fade');
    void content.offsetWidth;
    content.classList.add('page-fade');
    if (result.init) result.init();
  }
}

// ─── STATUS HELPERS ───
function statusPill(status) {
  const map = {
    in_transit: ['amber', 'In transit'],
    delivered: ['green', 'Delivered'],
    dispute: ['red', 'Dispute'],
    awaiting_dispatch: ['blue', 'Awaiting dispatch'],
    released: ['green', 'Funds released'],
  };
  const [color, label] = map[status] || ['gray', status];
  return `<span class="pill ${color}">${label}</span>`;
}

function fmtAmt(n) { return 'K ' + n.toLocaleString('en-ZM', {minimumFractionDigits: 2}); }

// ─── BUYER PAGES ───
function pageBuyerDashboard() {
  const myOrders = ORDERS.filter(o => o.buyer === 'Chanda Mwale');
  const active = myOrders.filter(o => o.status === 'in_transit' || o.status === 'awaiting_dispatch');
  const totalEscrowed = active.reduce((s, o) => s + o.amount, 0);

  return {
    title: 'Dashboard',
    actions: `<button class="hbtn primary" onclick="navigateTo('buyer-new','b-new')">+ New transaction</button>`,
    html: `
      <div class="stats-row">
        <div class="stat-card amber">
          <div class="stat-label">Active orders</div>
          <div class="stat-value amber">${active.length}</div>
          <div class="stat-sub">Awaiting confirmation</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Total delivered</div>
          <div class="stat-value green">${myOrders.filter(o=>o.status==='delivered').length}</div>
          <div class="stat-sub">All time</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-label">In escrow</div>
          <div class="stat-value blue">${fmtAmt(totalEscrowed)}</div>
          <div class="stat-sub">Held by ME2U</div>
        </div>
      </div>

      <div class="alert info">
        <span class="alert-icon">ℹ</span>
        <div>Your money is safe. ME2U holds all payments in escrow until you confirm delivery or 24 hours after the seller marks arrival.</div>
      </div>

      <div class="card">
        <div class="card-title">◎ Order ME2U-0041 — in transit</div>
        <div class="escrow-flow">
          <div class="flow-node">
            <div class="flow-icon done">💳</div>
            <div class="flow-lbl">Paid</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-node">
            <div class="flow-icon done">🔒</div>
            <div class="flow-lbl">Escrowed</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-node">
            <div class="flow-icon done">📦</div>
            <div class="flow-lbl">Dispatched</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-node">
            <div class="flow-icon active">🚚</div>
            <div class="flow-lbl">In transit</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-node">
            <div class="flow-icon pending">✓</div>
            <div class="flow-lbl">Confirm</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-node">
            <div class="flow-icon pending">💚</div>
            <div class="flow-lbl">Released</div>
          </div>
        </div>
        <div style="margin-top:16px" class="action-row">
          <button class="btn primary" onclick="confirmReceipt('ME2U-0041')">✓ Confirm received</button>
          <button class="btn danger" onclick="openDispute('ME2U-0041')">⚠ Raise dispute</button>
          <button class="btn" onclick="navigateTo('buyer-track','b-track')">Track parcel →</button>
        </div>
      </div>

      <div>
        <div class="sec-header">
          <div class="sec-title">Recent orders</div>
          <div class="sec-action" onclick="navigateTo('buyer-orders','b-orders')">See all</div>
        </div>
        <div class="table-wrap" style="margin-top:10px">
          <table>
            <thead><tr><th>Order ID</th><th>Item</th><th>Seller</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              ${myOrders.map(o => `
                <tr onclick="navigateTo('buyer-orders','b-orders')">
                  <td class="mono">${o.id}</td>
                  <td>${o.item}</td>
                  <td>${o.seller}</td>
                  <td class="mono">${fmtAmt(o.amount)}</td>
                  <td>${statusPill(o.status)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  };
}

function pageBuyerOrders() {
  const myOrders = ORDERS.filter(o => o.buyer === 'Chanda Mwale');
  const order = myOrders[0]; // active one

  return {
    title: 'My Orders',
    html: `
      <div class="two-col-grid">
        <div>
          <div class="sec-header" style="margin-bottom:10px">
            <div class="sec-title">Orders</div>
          </div>
          ${myOrders.map(o => `
            <div class="tx-item" onclick="loadOrderDetail('${o.id}')">
              <div class="tx-icon ${o.status==='delivered'?'':'amber-dim'}" style="background:${o.status==='delivered'?'var(--accent-dim)':o.status==='dispute'?'var(--red-dim)':'var(--amber-dim)'}">
                ${o.status==='delivered'?'✓':o.status==='dispute'?'⚠':'📦'}
              </div>
              <div class="tx-info">
                <div class="tx-id">${o.id}</div>
                <div class="tx-desc">${o.item} · ${o.seller}</div>
              </div>
              <div class="tx-right">
                <div class="tx-amount">${fmtAmt(o.amount)}</div>
                <div style="margin-top:4px">${statusPill(o.status)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div id="order-detail-panel">
          ${renderOrderDetailBuyer(order)}
        </div>
      </div>
    `,
    init: () => {}
  };
}

window.loadOrderDetail = function(id) {
  const o = ORDERS.find(x => x.id === id);
  const panel = document.getElementById('order-detail-panel');
  if (panel && o) panel.innerHTML = renderOrderDetailBuyer(o);
};

function renderOrderDetailBuyer(o) {
  const isActive = o.status === 'in_transit';
  const isDispute = o.status === 'dispute';
  const autoRelease = isActive ? `
    <div class="countdown-box">
      <div class="countdown-num">${o.autoReleaseHours}h</div>
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--amber)">Auto-release countdown</div>
        <div class="countdown-label">If you don't confirm or dispute, funds release automatically when this hits 0.</div>
      </div>
    </div>` : '';

  const trackingSection = o.tracking ? `
    <div class="tracking-display">
      <div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Tracking number · ${o.courier}</div>
        <div class="tracking-num">${o.tracking}</div>
      </div>
      <span class="pill amber">Out for delivery</span>
    </div>` : `
    <div class="alert info">
      <span class="alert-icon">ℹ</span>
      <div>No tracking number. Estimated arrival based on ${o.origin} → ${o.destination} distance records.</div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">📦 ${o.id} ${statusPill(o.status)}</div>
      <div class="order-meta" style="margin-bottom:16px">
        <div class="meta-item"><div class="meta-key">Item</div><div class="meta-val">${o.item}</div></div>
        <div class="meta-item"><div class="meta-key">Seller</div><div class="meta-val">${o.seller}</div></div>
        <div class="meta-item"><div class="meta-key">Amount (held)</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">${fmtAmt(o.amount)}</div></div>
        <div class="meta-item"><div class="meta-key">Courier</div><div class="meta-val">${o.courier || '—'}</div></div>
        <div class="meta-item"><div class="meta-key">Origin</div><div class="meta-val">${o.origin}</div></div>
        <div class="meta-item"><div class="meta-key">Destination</div><div class="meta-val">${o.destination}</div></div>
        ${o.dispatched ? `<div class="meta-item"><div class="meta-key">Dispatched</div><div class="meta-val" style="font-size:12px">${o.dispatched}</div></div>` : ''}
        ${o.estimated ? `<div class="meta-item"><div class="meta-key">Est. arrival</div><div class="meta-val" style="font-size:12px">${o.estimated}</div></div>` : ''}
      </div>
      ${trackingSection}
      <div style="margin-top:14px">${autoRelease}</div>
      ${isDispute ? `<div class="dispute-card" style="margin-top:14px"><div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:6px">⚠ Dispute open</div><div style="font-size:12px;color:var(--text2)">${o.disputeReason}</div><div style="font-size:11px;color:var(--text3);margin-top:6px">Admin is reviewing. Response within 24–48 hours.</div></div>` : ''}
      ${isActive ? `<div class="action-row" style="margin-top:16px">
        <button class="btn primary" onclick="confirmReceipt('${o.id}')">✓ Confirm received</button>
        <button class="btn danger" onclick="openDispute('${o.id}')">⚠ Dispute</button>
      </div>` : ''}
      ${o.status === 'delivered' ? `<div class="alert success" style="margin-top:14px"><span class="alert-icon">✓</span><div>Delivered & confirmed. Funds released to seller.</div></div>` : ''}
    </div>
  `;
}

function pageBuyerTrack() {
  return {
    title: 'Track Parcel',
    html: `
      <div class="card">
        <div class="card-title">◎ Enter tracking number</div>
        <div class="form-group">
          <label class="form-label">Tracking number (e.g. ZAM-2947831)</label>
          <div style="display:flex;gap:10px">
            <input class="form-input" id="track-input" placeholder="ZAM-XXXXXXX" value="ZAM-2947831" style="flex:1">
            <button class="btn primary" onclick="doTrack()">Track →</button>
          </div>
        </div>
      </div>

      <div id="track-result">
        ${renderTrackResult('ZAM-2947831')}
      </div>
    `,
    init: () => {
      document.getElementById('track-input').addEventListener('keydown', e => { if (e.key==='Enter') doTrack(); });
    }
  };
}

window.doTrack = function() {
  const val = document.getElementById('track-input').value.trim();
  document.getElementById('track-result').innerHTML = renderTrackResult(val);
};

function renderTrackResult(num) {
  if (!num) return '';
  const found = ORDERS.find(o => o.tracking === num);
  if (!found) return `<div class="alert danger"><span class="alert-icon">✗</span><div>No parcel found for tracking number <strong>${num}</strong>. Check the number and try again.</div></div>`;
  return `
    <div class="card">
      <div class="card-title">📦 Parcel: ${num} &nbsp; ${statusPill('in_transit')}</div>
      <div class="order-meta" style="margin-bottom:18px">
        <div class="meta-item"><div class="meta-key">ME2U Order</div><div class="meta-val mono">${found.id}</div></div>
        <div class="meta-item"><div class="meta-key">Courier</div><div class="meta-val">${found.courier}</div></div>
        <div class="meta-item"><div class="meta-key">From</div><div class="meta-val">${found.origin}</div></div>
        <div class="meta-item"><div class="meta-key">To</div><div class="meta-val">${found.destination}</div></div>
      </div>
      <div class="timeline">
        <div class="tl-step">
          <div class="tl-left"><div class="tl-dot done">✓</div><div class="tl-line done"></div></div>
          <div class="tl-body"><div class="tl-title">Parcel received by courier</div><div class="tl-desc">Collected from TechZone Lusaka</div><div class="tl-time">2025-06-02 09:14</div></div>
        </div>
        <div class="tl-step">
          <div class="tl-left"><div class="tl-dot done">✓</div><div class="tl-line done"></div></div>
          <div class="tl-body"><div class="tl-title">Arrived at sorting facility</div><div class="tl-desc">Lusaka CBD Zampost hub</div><div class="tl-time">2025-06-02 11:55</div></div>
        </div>
        <div class="tl-step">
          <div class="tl-left"><div class="tl-dot done">✓</div><div class="tl-line done"></div></div>
          <div class="tl-body"><div class="tl-title">Departed for delivery area</div><div class="tl-desc">Chilenje sorting — out for delivery</div><div class="tl-time">2025-06-03 08:30</div></div>
        </div>
        <div class="tl-step">
          <div class="tl-left"><div class="tl-dot active">▶</div><div class="tl-line"></div></div>
          <div class="tl-body"><div class="tl-title">Out for delivery</div><div class="tl-desc">Estimated delivery by 17:00 today</div><div class="tl-time">2025-06-03 10:40</div></div>
        </div>
        <div class="tl-step">
          <div class="tl-left"><div class="tl-dot pending">◯</div></div>
          <div class="tl-body"><div class="tl-title">Delivered to recipient</div><div class="tl-desc" style="color:var(--text3)">Waiting...</div></div>
        </div>
      </div>
    </div>
  `;
}

function pageBuyerNew() {
  return {
    title: 'New Transaction',
    html: `
      <div class="card" style="max-width:580px">
        <div class="card-title">+ Start a new transaction</div>
        <div class="alert info" style="margin-bottom:20px">
          <span class="alert-icon">ℹ</span>
          <div>ME2U doesn't sell goods. Enter the order details you already agreed on with the seller, then pay into escrow.</div>
        </div>

        <div class="steps-indicator">
          <div class="step-seg done" id="seg1"></div>
          <div class="step-seg" id="seg2"></div>
          <div class="step-seg" id="seg3"></div>
        </div>

        <div id="new-step-1">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Seller name / business</label>
              <input class="form-input" id="ns-seller" placeholder="e.g. TechZone Lusaka">
            </div>
            <div class="form-group">
              <label class="form-label">Seller phone number</label>
              <input class="form-input" id="ns-phone" placeholder="e.g. 0955-330-221">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Item description</label>
            <input class="form-input" id="ns-item" placeholder="e.g. Wireless Earbuds (2×)">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Agreed amount (ZMW)</label>
              <input class="form-input" id="ns-amount" type="number" placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="form-label">Seller's town / origin</label>
              <input class="form-input" id="ns-origin" placeholder="e.g. Lusaka CBD">
            </div>
          </div>
          <button class="btn primary" onclick="newStep2()">Next — Delivery details →</button>
        </div>

        <div id="new-step-2" style="display:none">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Your delivery address</label>
              <input class="form-input" id="ns-dest" placeholder="e.g. Chilenje, Lusaka">
            </div>
            <div class="form-group">
              <label class="form-label">Expected courier</label>
              <select class="form-select" id="ns-courier">
                <option value="">Not sure yet</option>
                <option value="Zampost">Zampost</option>
                <option value="Own driver">Seller's own driver</option>
                <option value="Other">Other courier</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes for ME2U (optional)</label>
            <input class="form-input" id="ns-notes" placeholder="Any special instructions...">
          </div>
          <div class="action-row">
            <button class="btn" onclick="newStep1Back()">← Back</button>
            <button class="btn primary" onclick="newStep3()">Next — Payment →</button>
          </div>
        </div>

        <div id="new-step-3" style="display:none">
          <div class="card-title" style="margin-bottom:12px">💳 Payment summary</div>
          <div class="order-meta" style="margin-bottom:16px" id="ns-summary"></div>
          <div class="form-group">
            <label class="form-label">Pay via</label>
            <select class="form-select" id="ns-payment">
              <option value="airtel">Airtel Money</option>
              <option value="mtn">MTN Money</option>
            </select>
          </div>
          <div class="alert warning" style="margin-bottom:16px">
            <span class="alert-icon">⚠</span>
            <div>You'll be prompted to complete payment to ME2U's escrow number. The seller will NOT receive funds until you confirm delivery.</div>
          </div>
          <div class="action-row">
            <button class="btn" onclick="newStep2Back()">← Back</button>
            <button class="btn primary" onclick="submitNewOrder()">Pay & create order →</button>
          </div>
        </div>
      </div>
    `
  };
}

window.newStep2 = function() {
  const seller = document.getElementById('ns-seller').value;
  const item = document.getElementById('ns-item').value;
  if (!seller || !item) { toast('Please fill in seller and item', 'warning'); return; }
  document.getElementById('new-step-1').style.display = 'none';
  document.getElementById('new-step-2').style.display = 'block';
  document.getElementById('seg2').classList.add('active');
};
window.newStep1Back = function() {
  document.getElementById('new-step-2').style.display = 'none';
  document.getElementById('new-step-1').style.display = 'block';
};
window.newStep3 = function() {
  const dest = document.getElementById('ns-dest').value;
  if (!dest) { toast('Please enter your delivery address', 'warning'); return; }
  const seller = document.getElementById('ns-seller').value;
  const item = document.getElementById('ns-item').value;
  const amount = document.getElementById('ns-amount').value;
  const origin = document.getElementById('ns-origin').value;
  const courier = document.getElementById('ns-courier').value;
  document.getElementById('ns-summary').innerHTML = `
    <div class="meta-item"><div class="meta-key">Seller</div><div class="meta-val">${seller||'—'}</div></div>
    <div class="meta-item"><div class="meta-key">Item</div><div class="meta-val">${item||'—'}</div></div>
    <div class="meta-item"><div class="meta-key">Amount</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">K ${parseFloat(amount||0).toFixed(2)}</div></div>
    <div class="meta-item"><div class="meta-key">Route</div><div class="meta-val">${origin||'?'} → ${dest}</div></div>
    <div class="meta-item"><div class="meta-key">Courier</div><div class="meta-val">${courier||'TBD'}</div></div>
  `;
  document.getElementById('new-step-2').style.display = 'none';
  document.getElementById('new-step-3').style.display = 'block';
  document.getElementById('seg3').classList.add('active');
};
window.newStep2Back = function() {
  document.getElementById('new-step-3').style.display = 'none';
  document.getElementById('new-step-2').style.display = 'block';
};
window.submitNewOrder = function() {
  toast('✓ Order created! Pay K ' + (document.getElementById('ns-amount')?.value||'0') + ' to ME2U Airtel: 0977-ME2U-ESC', 'success');
  setTimeout(() => navigateTo('buyer-orders','b-orders'), 1800);
};

function pageBuyerHistory() {
  return {
    title: 'Transaction History',
    html: `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Order ID</th><th>Item</th><th>Seller</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${ORDERS.filter(o=>o.buyer==='Chanda Mwale').map(o=>`
              <tr>
                <td class="mono">${o.id}</td>
                <td>${o.item}</td>
                <td>${o.seller}</td>
                <td class="mono">${fmtAmt(o.amount)}</td>
                <td>${statusPill(o.status)}</td>
                <td style="font-size:12px;color:var(--text3)">${o.dispatched||'—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
  };
}

// ─── SELLER PAGES ───
function pageSellerDashboard() {
  const myOrders = ORDERS.filter(o => o.seller === 'TechZone Lusaka');
  const pending = myOrders.filter(o => o.status === 'awaiting_dispatch' || o.status === 'in_transit');
  const totalEarned = myOrders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.amount,0);
  return {
    title: 'Seller Dashboard',
    actions: `<button class="hbtn primary" onclick="navigateTo('seller-dispatch','s-dispatch')">Mark dispatch</button>`,
    html: `
      <div class="stats-row">
        <div class="stat-card amber">
          <div class="stat-label">Pending action</div>
          <div class="stat-value amber">${pending.length}</div>
          <div class="stat-sub">Need dispatch or confirmation</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Total earned</div>
          <div class="stat-value green">${fmtAmt(totalEarned)}</div>
          <div class="stat-sub">Released to you</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-label">Trust score</div>
          <div class="stat-value blue">96%</div>
          <div class="stat-sub">Excellent · 12 orders</div>
        </div>
      </div>

      <div class="alert success">
        <span class="alert-icon">✓</span>
        <div>Order ME2U-0038 (K 95.00) — funds released to your MTN Money. Well done!</div>
      </div>

      <div class="card">
        <div class="card-title">⏳ Action needed — ME2U-0033</div>
        <div class="order-meta" style="margin-bottom:16px">
          <div class="meta-item"><div class="meta-key">Buyer</div><div class="meta-val">Brian Lungu</div></div>
          <div class="meta-item"><div class="meta-key">Item</div><div class="meta-val">USB-C Hub</div></div>
          <div class="meta-item"><div class="meta-key">Amount (in escrow)</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">K 210.00</div></div>
          <div class="meta-item"><div class="meta-key">Status</div><div class="meta-val">${statusPill('awaiting_dispatch')}</div></div>
        </div>
        <div class="alert warning">
          <span class="alert-icon">⚠</span>
          <div>Payment confirmed by buyer. Mark as dispatched once you've sent the goods.</div>
        </div>
        <div class="action-row" style="margin-top:14px">
          <button class="btn primary" onclick="navigateTo('seller-dispatch','s-dispatch')">Mark as dispatched →</button>
        </div>
      </div>

      <div>
        <div class="sec-header" style="margin-bottom:10px"><div class="sec-title">My orders</div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Buyer</th><th>Item</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              ${myOrders.map(o=>`<tr onclick="navigateTo('seller-orders','s-orders')">
                <td class="mono">${o.id}</td><td>${o.buyer}</td><td>${o.item}</td>
                <td class="mono">${fmtAmt(o.amount)}</td><td>${statusPill(o.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  };
}

function pageSellerOrders() {
  const myOrders = ORDERS.filter(o => o.seller === 'TechZone Lusaka');
  return {
    title: 'Orders',
    html: `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Order ID</th><th>Buyer</th><th>Item</th><th>Destination</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${myOrders.map(o=>`
              <tr onclick="showSellerOrderModal('${o.id}')">
                <td class="mono">${o.id}</td>
                <td>${o.buyer}</td>
                <td>${o.item}</td>
                <td>${o.destination}</td>
                <td class="mono">${fmtAmt(o.amount)}</td>
                <td>${statusPill(o.status)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="alert info">
        <span class="alert-icon">ℹ</span>
        <div>Click any order to see details and available actions. Funds are held by ME2U until the buyer confirms receipt or the 24-hour timer expires.</div>
      </div>
    `
  };
}

window.showSellerOrderModal = function(id) {
  const o = ORDERS.find(x=>x.id===id);
  if (!o) return;
  openModal(
    `Order ${o.id}`,
    `<div class="order-meta">
      <div class="meta-item"><div class="meta-key">Buyer</div><div class="meta-val">${o.buyer}</div></div>
      <div class="meta-item"><div class="meta-key">Item</div><div class="meta-val">${o.item}</div></div>
      <div class="meta-item"><div class="meta-key">Amount</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">${fmtAmt(o.amount)}</div></div>
      <div class="meta-item"><div class="meta-key">Status</div><div class="meta-val">${statusPill(o.status)}</div></div>
      <div class="meta-item"><div class="meta-key">Destination</div><div class="meta-val">${o.destination}</div></div>
      <div class="meta-item"><div class="meta-key">Courier</div><div class="meta-val">${o.courier||'Not set'}</div></div>
    </div>
    ${o.tracking ? `<div class="tracking-display" style="margin-top:14px"><div><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Tracking</div><div class="tracking-num">${o.tracking}</div></div></div>` : ''}
    ${o.status==='delivered'?'<div class="alert success" style="margin-top:14px"><span class="alert-icon">✓</span><div>Delivered & confirmed. Funds released.</div></div>':''}`,
    `<button class="btn" onclick="closeModal()">Close</button>`
  );
};

function pageSellerDispatch() {
  const toDo = ORDERS.filter(o => o.seller === 'TechZone Lusaka' && (o.status === 'awaiting_dispatch' || o.status === 'in_transit'));
  return {
    title: 'Dispatch',
    html: `
      ${toDo.map(o => `
      <div class="card">
        <div class="card-title">${statusPill(o.status)} &nbsp; ${o.id} — ${o.item}</div>
        <div class="order-meta" style="margin-bottom:16px">
          <div class="meta-item"><div class="meta-key">Buyer</div><div class="meta-val">${o.buyer}</div></div>
          <div class="meta-item"><div class="meta-key">Destination</div><div class="meta-val">${o.destination}</div></div>
          <div class="meta-item"><div class="meta-key">Amount in escrow</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">${fmtAmt(o.amount)}</div></div>
        </div>
        ${o.status === 'awaiting_dispatch' ? `
          <div class="form-group">
            <label class="form-label">Delivery method</label>
            <select class="form-select" id="courier-${o.id}">
              <option value="Own driver">My own driver</option>
              <option value="Zampost">Zampost</option>
              <option value="Other">Other courier</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tracking number (optional — enter if courier provides one)</label>
            <input class="form-input" id="tracking-${o.id}" placeholder="e.g. ZAM-XXXXXXX">
          </div>
          <div class="action-row">
            <button class="btn primary" onclick="markDispatched('${o.id}')">✓ Confirm dispatch</button>
          </div>
        ` : `
          <div class="alert success">
            <span class="alert-icon">✓</span>
            <div>Dispatched via ${o.courier}${o.tracking ? ` · Tracking: ${o.tracking}` : ''}. Waiting for buyer confirmation.</div>
          </div>
          <div class="countdown-box" style="margin-top:12px">
            <div class="countdown-num">${o.autoReleaseHours}h</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:var(--amber)">Auto-release timer</div>
              <div class="countdown-label">Funds auto-release to you if buyer doesn't respond in time.</div>
            </div>
          </div>
          ${o.courier === 'Own driver' ? `
          <div style="margin-top:14px">
            <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Driver confirmation link</div>
            <div class="tracking-display">
              <div class="tracking-num" style="font-size:13px">me2u.zm/confirm/${o.id}/DRV9X2</div>
              <button class="btn" style="padding:6px 12px;font-size:12px" onclick="toast('Link copied!','success')">Copy</button>
            </div>
            <div style="font-size:11px;color:var(--text3);margin-top:6px">Share this link with your driver. When they tap it after meeting the buyer, it serves as delivery confirmation.</div>
          </div>` : ''}
        `}
      </div>`).join('')}
      ${toDo.length===0?`<div class="empty"><div class="empty-icon">✓</div>No orders pending dispatch.</div>`:''}
    `
  };
}

window.markDispatched = function(id) {
  const o = ORDERS.find(x=>x.id===id);
  if (!o) return;
  o.status = 'in_transit';
  o.courier = document.getElementById('courier-'+id)?.value || 'Own driver';
  o.tracking = document.getElementById('tracking-'+id)?.value || '';
  o.dispatched = new Date().toLocaleString('en-ZM');
  o.autoReleaseHours = 24;
  toast('✓ Dispatch confirmed! Buyer notified.', 'success');
  setTimeout(() => renderPage(currentPage), 400);
};

function pageSellerHistory() {
  return pageBuyerHistory();
}
function pageSellerProfile() {
  return {
    title: 'My Profile',
    html: `
      <div class="two-col-grid">
        <div class="card">
          <div class="card-title">◯ Seller profile</div>
          <div class="order-meta">
            <div class="meta-item"><div class="meta-key">Business name</div><div class="meta-val">TechZone Lusaka</div></div>
            <div class="meta-item"><div class="meta-key">Phone</div><div class="meta-val">0955-330-221</div></div>
            <div class="meta-item"><div class="meta-key">Payout wallet</div><div class="meta-val">MTN Money</div></div>
            <div class="meta-item"><div class="meta-key">Member since</div><div class="meta-val">March 2024</div></div>
            <div class="meta-item"><div class="meta-key">Total orders</div><div class="meta-val">12</div></div>
            <div class="meta-item"><div class="meta-key">Disputes</div><div class="meta-val">0</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">⭐ Trust score</div>
          <div style="text-align:center;padding:12px 0">
            <div style="font-family:var(--mono);font-size:48px;font-weight:700;color:var(--accent)">96%</div>
            <div style="font-size:13px;color:var(--text2);margin-top:6px">Excellent standing</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
            ${[['Delivery rate','100%','green'],['Dispatch speed','Avg 1.2 hrs','green'],['Dispute outcomes','0 disputes','green'],['Account age','15 months','amber']].map(([k,v,c])=>`
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">
                <span style="color:var(--text2)">${k}</span>
                <span style="color:var(--${c==='green'?'accent':'amber'});font-weight:600">${v}</span>
              </div>`).join('')}
          </div>
          <div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:96%"></div></div>
        </div>
      </div>
    `
  };
}

// ─── ADMIN PAGES ───
function pageAdminDashboard() {
  const total = ORDERS.reduce((s,o)=>s+o.amount,0);
  const escrow = ORDERS.filter(o=>o.status!=='delivered').reduce((s,o)=>s+o.amount,0);
  return {
    title: 'Admin Overview',
    html: `
      <div class="stats-row">
        <div class="stat-card green">
          <div class="stat-label">Escrow balance</div>
          <div class="stat-value green">${fmtAmt(escrow)}</div>
          <div class="stat-sub">Held in MTN/Airtel float</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">Active orders</div>
          <div class="stat-value amber">${ORDERS.filter(o=>o.status==='in_transit'||o.status==='awaiting_dispatch').length}</div>
          <div class="stat-sub">In progress</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">Open disputes</div>
          <div class="stat-value red">${ORDERS.filter(o=>o.dispute).length}</div>
          <div class="stat-sub">Needs review</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-label">Total volume</div>
          <div class="stat-value blue">${fmtAmt(total)}</div>
          <div class="stat-sub">All time</div>
        </div>
      </div>

      <div class="alert danger">
        <span class="alert-icon">⚠</span>
        <div><strong>1 dispute requires your attention</strong> — ME2U-0035 (Thandiwe Phiri vs FreshMarket ZM). <span style="text-decoration:underline;cursor:pointer" onclick="navigateTo('admin-disputes','a-disputes')">Review now →</span></div>
      </div>

      <div>
        <div class="sec-header" style="margin-bottom:10px"><div class="sec-title">All orders</div><div class="sec-action" onclick="navigateTo('admin-orders','a-orders')">View all</div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Courier</th><th>Status</th></tr></thead>
            <tbody>
              ${ORDERS.map(o=>`<tr onclick="navigateTo('admin-orders','a-orders')">
                <td class="mono">${o.id}</td><td>${o.buyer}</td><td>${o.seller}</td>
                <td class="mono">${fmtAmt(o.amount)}</td><td>${o.courier||'—'}</td><td>${statusPill(o.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  };
}

function pageAdminEscrow() {
  const held = ORDERS.filter(o=>o.status!=='delivered');
  const total = held.reduce((s,o)=>s+o.amount,0);
  return {
    title: 'Escrow Wallet',
    html: `
      <div class="two-col-grid">
        <div class="card green">
          <div class="card-title">◈ Escrow float — current balance</div>
          <div style="font-family:var(--mono);font-size:36px;font-weight:700;color:var(--accent);margin:12px 0">${fmtAmt(total)}</div>
          <div style="font-size:12px;color:var(--text2)">Held across Airtel Money + MTN Money accounts</div>
          <hr class="divider" style="margin:14px 0">
          <div style="display:flex;gap:20px">
            <div><div style="font-size:11px;color:var(--text3)">Airtel Money</div><div style="font-family:var(--mono);color:var(--blue)">${fmtAmt(total*0.6)}</div></div>
            <div><div style="font-size:11px;color:var(--text3)">MTN Money</div><div style="font-family:var(--mono);color:var(--amber)">${fmtAmt(total*0.4)}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">📋 Funds breakdown by order</div>
          ${held.map(o=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div>
                <div style="font-family:var(--mono);font-size:12px;color:var(--text)">${o.id}</div>
                <div style="font-size:11px;color:var(--text3)">${o.buyer} → ${o.seller}</div>
              </div>
              <div style="text-align:right">
                <div style="font-family:var(--mono);font-weight:600;color:var(--accent)">${fmtAmt(o.amount)}</div>
                <div style="margin-top:3px">${statusPill(o.status)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="alert info">
        <span class="alert-icon">ℹ</span>
        <div>Escrow funds are held in ME2U's registered mobile money float accounts. Payouts are triggered automatically on buyer confirmation or after the 24-hour auto-release window.</div>
      </div>
    `
  };
}

function pageAdminOrders() {
  return {
    title: 'All Orders',
    html: `
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Buyer</th><th>Seller</th><th>Item</th><th>Amount</th><th>Courier</th><th>Tracking</th><th>Status</th></tr></thead>
          <tbody>
            ${ORDERS.map(o=>`
              <tr onclick="adminOrderModal('${o.id}')">
                <td class="mono">${o.id}</td>
                <td>${o.buyer}</td>
                <td>${o.seller}</td>
                <td>${o.item}</td>
                <td class="mono">${fmtAmt(o.amount)}</td>
                <td>${o.courier||'—'}</td>
                <td class="mono" style="font-size:11px;color:var(--text3)">${o.tracking||'—'}</td>
                <td>${statusPill(o.status)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `
  };
}

window.adminOrderModal = function(id) {
  const o = ORDERS.find(x=>x.id===id);
  openModal(`${o.id} — Admin view`,
    `<div class="order-meta">
      <div class="meta-item"><div class="meta-key">Buyer</div><div class="meta-val">${o.buyer}</div></div>
      <div class="meta-item"><div class="meta-key">Seller</div><div class="meta-val">${o.seller}</div></div>
      <div class="meta-item"><div class="meta-key">Amount</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">${fmtAmt(o.amount)}</div></div>
      <div class="meta-item"><div class="meta-key">Status</div><div class="meta-val">${statusPill(o.status)}</div></div>
      <div class="meta-item"><div class="meta-key">Courier</div><div class="meta-val">${o.courier||'—'}</div></div>
      <div class="meta-item"><div class="meta-key">Tracking</div><div class="meta-val mono">${o.tracking||'—'}</div></div>
    </div>`,
    `<button class="btn" onclick="closeModal()">Close</button>
     ${o.status !== 'delivered' ? `<button class="btn primary" onclick="adminForceRelease('${o.id}')">Force release funds</button>` : ''}`
  );
};

window.adminForceRelease = function(id) {
  const o = ORDERS.find(x=>x.id===id);
  o.status = 'delivered'; o.buyerConfirmed = true;
  closeModal();
  toast('✓ Funds force-released to ' + o.seller, 'success');
  setTimeout(() => renderPage(currentPage), 400);
};

function pageAdminDisputes() {
  const disputes = ORDERS.filter(o=>o.dispute);
  return {
    title: 'Disputes',
    html: `
      ${disputes.length === 0 ? '<div class="empty"><div class="empty-icon">✓</div>No open disputes.</div>' : ''}
      ${disputes.map(o => `
        <div class="card">
          <div class="card-title">⚠ Dispute — ${o.id} &nbsp; ${statusPill('dispute')}</div>
          <div class="order-meta" style="margin-bottom:16px">
            <div class="meta-item"><div class="meta-key">Buyer</div><div class="meta-val">${o.buyer}</div></div>
            <div class="meta-item"><div class="meta-key">Seller</div><div class="meta-val">${o.seller}</div></div>
            <div class="meta-item"><div class="meta-key">Item</div><div class="meta-val">${o.item}</div></div>
            <div class="meta-item"><div class="meta-key">Amount held</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">${fmtAmt(o.amount)}</div></div>
          </div>
          <div class="dispute-card" style="margin-bottom:14px">
            <div style="font-size:11px;color:var(--red);font-weight:600;margin-bottom:6px">Buyer's claim</div>
            <div style="font-size:13px;color:var(--text)">${o.disputeReason}</div>
          </div>
          <div class="alert warning" style="margin-bottom:14px">
            <span class="alert-icon">⚠</span>
            <div>Seller claims goods were dispatched correctly. Tracking shows delivery to ${o.destination}. Review evidence before ruling.</div>
          </div>
          <div class="action-row">
            <button class="btn primary" onclick="resolveDispute('${o.id}','seller')">Release to seller</button>
            <button class="btn danger" onclick="resolveDispute('${o.id}','buyer')">Refund buyer</button>
            <button class="btn amber" onclick="resolveDispute('${o.id}','split')">Split 50/50</button>
          </div>
        </div>`).join('')}
    `
  };
}

window.resolveDispute = function(id, resolution) {
  const o = ORDERS.find(x=>x.id===id);
  o.dispute = false;
  o.status = 'delivered';
  const msgs = { seller: `Funds released to ${o.seller}`, buyer: `K${o.amount} refunded to ${o.buyer}`, split: `Split: K${o.amount/2} each` };
  closeModal();
  toast('✓ Dispute resolved — ' + msgs[resolution], 'success');
  setTimeout(() => renderPage(currentPage), 400);
};

function pageAdminUsers() {
  const buyers = [...new Set(ORDERS.map(o=>o.buyer))];
  const sellers = [...new Set(ORDERS.map(o=>o.seller))];
  return {
    title: 'Users',
    html: `
      <div class="two-col-grid">
        <div>
          <div class="sec-header" style="margin-bottom:10px"><div class="sec-title">Buyers</div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Orders</th><th>Trust</th></tr></thead>
              <tbody>
                ${buyers.map(b=>`<tr>
                  <td>${b}</td>
                  <td>${ORDERS.filter(o=>o.buyer===b).length}</td>
                  <td><span class="pill green">Good</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="sec-header" style="margin-bottom:10px"><div class="sec-title">Sellers</div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Orders</th><th>Trust</th></tr></thead>
              <tbody>
                ${sellers.map(s=>`<tr>
                  <td>${s}</td>
                  <td>${ORDERS.filter(o=>o.seller===s).length}</td>
                  <td><span class="pill ${s==='FreshMarket ZM'?'amber':'green'}">${s==='FreshMarket ZM'?'Review':'Good'}</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
  };
}

function pageAdminReleases() {
  const pending = ORDERS.filter(o=>o.status==='in_transit'&&o.autoReleaseHours>0);
  return {
    title: 'Auto-Releases',
    html: `
      <div class="alert warning">
        <span class="alert-icon">⏱</span>
        <div>Auto-release fires 24 hours after the seller marks arrival and the buyer has not confirmed or disputed. You can manually override at any time.</div>
      </div>
      ${pending.map(o=>`
        <div class="card">
          <div class="card-title">⏱ ${o.id} — auto-release in ${o.autoReleaseHours}h</div>
          <div class="order-meta">
            <div class="meta-item"><div class="meta-key">Buyer</div><div class="meta-val">${o.buyer}</div></div>
            <div class="meta-item"><div class="meta-key">Seller</div><div class="meta-val">${o.seller}</div></div>
            <div class="meta-item"><div class="meta-key">Amount</div><div class="meta-val" style="color:var(--accent);font-family:var(--mono)">${fmtAmt(o.amount)}</div></div>
          </div>
          <div class="progress-track">
            <div class="progress-fill amber" style="width:${Math.round((24-o.autoReleaseHours)/24*100)}%"></div>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">${24-o.autoReleaseHours}h of 24h elapsed</div>
          <div class="action-row" style="margin-top:14px">
            <button class="btn primary" onclick="adminForceRelease('${o.id}')">Release now</button>
            <button class="btn danger" onclick="toast('Auto-release paused for ${o.id}','warning')">Pause timer</button>
          </div>
        </div>`).join('')}
      ${pending.length===0?`<div class="empty"><div class="empty-icon">⏱</div>No pending auto-releases.</div>`:''}
    `
  };
}

// ─── ACTIONS ───
window.confirmReceipt = function(id) {
  openModal(
    'Confirm delivery',
    `<div class="alert success" style="margin-bottom:14px"><span class="alert-icon">✓</span><div>You're confirming that you received the goods for order <strong>${id}</strong> in good condition.</div></div>
     <div style="font-size:13px;color:var(--text2)">Once confirmed, funds will be immediately released to the seller. This action cannot be undone.</div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button>
     <button class="btn primary" onclick="doConfirm('${id}')">Yes, I received it</button>`
  );
};

window.doConfirm = function(id) {
  const o = ORDERS.find(x=>x.id===id);
  if (o) { o.status = 'delivered'; o.buyerConfirmed = true; }
  closeModal();
  toast('✓ Confirmed! Funds released to seller.', 'success');
  setTimeout(() => renderPage(currentPage), 400);
};

window.openDispute = function(id) {
  openModal(
    'Raise a dispute — ' + id,
    `<div class="alert danger" style="margin-bottom:14px"><span class="alert-icon">⚠</span><div>Only raise a dispute if goods were not received, arrived damaged, or were wrong. False disputes affect your trust score.</div></div>
     <div class="form-group">
       <label class="form-label">Reason for dispute</label>
       <select class="form-select" id="dispute-reason-sel">
         <option>Package not received</option>
         <option>Package arrived damaged</option>
         <option>Wrong items sent</option>
         <option>Incomplete order</option>
       </select>
     </div>
     <div class="form-group">
       <label class="form-label">Additional details</label>
       <input class="form-input" id="dispute-detail" placeholder="Describe the issue...">
     </div>`,
    `<button class="btn" onclick="closeModal()">Cancel</button>
     <button class="btn danger" onclick="submitDispute('${id}')">Submit dispute</button>`
  );
};

window.submitDispute = function(id) {
  const o = ORDERS.find(x=>x.id===id);
  const reason = document.getElementById('dispute-reason-sel')?.value;
  const detail = document.getElementById('dispute-detail')?.value;
  if (o) { o.status = 'dispute'; o.dispute = true; o.disputeReason = `${reason}${detail?' — '+detail:''}`; }
  closeModal();
  toast('Dispute submitted. Admin will review within 24–48h.', 'warning');
  setTimeout(() => renderPage(currentPage), 400);
};

// ─── MODAL ───
function openModal(title, body, actions) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-actions').innerHTML = actions;
  document.getElementById('modal-overlay').classList.add('open');
}
window.closeModal = function(e) {
  if (!e || e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
  }
};

// ─── TOAST ───
function toast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3000);
}

// ─── START ───
init();
