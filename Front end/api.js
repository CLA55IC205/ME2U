/**
 * ME2U API client — talks to Backend on port 3001.
 * Configure: localStorage.setItem('me2u-api-base', 'http://localhost:3001')
 */
const ME2U_API = (function () {
  const BASE = () =>
    localStorage.getItem('me2u-api-base') || 'http://localhost:3001';

  let roleUserIds = JSON.parse(localStorage.getItem('me2u-role-users') || 'null');
  let currentRole = 'buyer';

  function userIdForRole(role) {
    if (!roleUserIds || !roleUserIds[role]) {
      throw new Error('API users not loaded. Is the backend running?');
    }
    return roleUserIds[role];
  }

  async function request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (!options.skipAuth) {
      headers['X-User-Id'] = userIdForRole(currentRole);
    }

    const res = await fetch(`${BASE()}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error?.message || data.message || res.statusText;
      throw new Error(msg);
    }
    return data;
  }

  function pickRoleUsers(users) {
    const byRole = (r) => users.filter((u) => u.role === r);
    const buyer =
      users.find((u) => u.role === 'BUYER' && u.name.includes('Chanda')) ||
      byRole('BUYER')[0];
    const seller =
      users.find((u) => u.role === 'SELLER' && u.name.includes('TechZone')) ||
      byRole('SELLER')[0];
    const admin = byRole('ADMIN')[0];
    if (!buyer || !seller || !admin) {
      throw new Error('Seed users missing. Run: cd Backend && npm run db:seed');
    }
    return {
      buyer: buyer.id,
      seller: seller.id,
      admin: admin.id,
    };
  }

  function profileFromUsers(users) {
    const find = (id) => users.find((u) => u.id === id);
    const initials = (name) =>
      name
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return {
      buyer: (() => {
        const u = find(roleUserIds.buyer);
        return { name: u.name, phone: u.phone, initials: initials(u.name), id: u.id };
      })(),
      seller: (() => {
        const u = find(roleUserIds.seller);
        return { name: u.name, phone: u.phone, initials: initials(u.name), id: u.id };
      })(),
      admin: (() => {
        const u = find(roleUserIds.admin);
        return { name: u.name, phone: u.phone || '', initials: initials(u.name), id: u.id };
      })(),
    };
  }

  let cachedUsers = [];

  return {
    setRole(role) {
      currentRole = role;
    },

    async bootstrapUsers() {
      const { users } = await request('/api/dev/users', { skipAuth: true });
      cachedUsers = users;
      roleUserIds = pickRoleUsers(users);
      localStorage.setItem('me2u-role-users', JSON.stringify(roleUserIds));
      return profileFromUsers(users);
    },

    getUserProfiles() {
      return profileFromUsers(cachedUsers);
    },

    async health() {
      return request('/health', { skipAuth: true, method: 'GET' });
    },

    async getOrders() {
      const data = await request('/api/orders');
      return data.orders || [];
    },

    async createOrder(body) {
      return request('/api/orders', { method: 'POST', body: JSON.stringify(body) });
    },

    async confirmPayment(publicId) {
      return request(`/api/orders/${encodeURIComponent(publicId)}/confirm-payment`, {
        method: 'POST',
      });
    },

    async dispatch(publicId, body) {
      return request(`/api/orders/${encodeURIComponent(publicId)}/dispatch`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },

    async markArrival(publicId) {
      return request(`/api/orders/${encodeURIComponent(publicId)}/arrival`, {
        method: 'POST',
      });
    },

    async confirmReceipt(publicId) {
      return request(`/api/orders/${encodeURIComponent(publicId)}/confirm-receipt`, {
        method: 'POST',
      });
    },

    async raiseDispute(publicId, body) {
      return request(`/api/orders/${encodeURIComponent(publicId)}/disputes`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    async track(trackingNumber) {
      return request(`/api/tracking/${encodeURIComponent(trackingNumber)}`, {
        skipAuth: true,
        method: 'GET',
      });
    },

    async getEscrow() {
      return request('/api/admin/escrow');
    },

    async getAdminUsers() {
      const data = await request('/api/admin/users');
      return data.users || [];
    },

    async getAutoReleases() {
      const data = await request('/api/admin/auto-releases');
      return data.pending || [];
    },

    async runAutoReleases() {
      return request('/api/admin/auto-releases/run', { method: 'POST' });
    },

    async forceRelease(publicId) {
      return request(`/api/admin/orders/${encodeURIComponent(publicId)}/release`, {
        method: 'POST',
      });
    },

    async resolveDispute(publicId, resolution) {
      return request(`/api/admin/disputes/${encodeURIComponent(publicId)}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution }),
      });
    },
  };
})();

window.ME2U_API = ME2U_API;
