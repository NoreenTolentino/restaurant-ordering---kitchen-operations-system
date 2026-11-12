const MENU_KEY = 'restaurant_menu_data';
const ORDERS_KEY = 'restaurant_orders_data';
const THEME_KEY = 'restaurant_theme_preference';

const INITIAL_MENU = [
  { id: 'm1', name: 'Wagyu Truffle Burger', category: 'Mains', price: 16.50, description: 'Double patty, aged cheddar, brioche', available: true },
  { id: 'm2', name: 'Tonkotsu Ramen', category: 'Mains', price: 15.00, description: 'Chashu pork, soft egg, rich broth', available: true },
  { id: 'm3', name: 'Duck Fat Fries', category: 'Sides', price: 6.50, description: 'Sea salt, garlic aioli', available: true },
  { id: 'm4', name: 'Matcha Latte', category: 'Drinks', price: 5.25, description: 'Ceremonial grade, oat milk', available: true }
];

const INITIAL_ORDERS = [
  {
    id: 'o1',
    orderNumber: 101,
    customer: 'Table 4 - Marcus',
    type: 'DINE-IN',
    notes: 'No onions on burger',
    status: 'PREPARING',
    createdAt: Date.now() - 5 * 60 * 1000,
    items: [{ name: 'Wagyu Truffle Burger', price: 16.50, qty: 1 }]
  }
];

class App {
  constructor() {
    this.menu = JSON.parse(localStorage.getItem(MENU_KEY)) || INITIAL_MENU;
    this.orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || INITIAL_ORDERS;
    this.cart = [];
    this.categoryFilter = 'ALL';

    this.initTheme();
    this.init();
  }

  initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  init() {
    this.bindNavigation();
    this.bindStorefront();
    this.bindKitchen();
    this.bindAdmin();

    this.renderStorefront();
    this.renderKitchen();
    this.renderAdmin();
    this.startClock();
  }

  save() {
    localStorage.setItem(MENU_KEY, JSON.stringify(this.menu));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
  }

  notify(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  bindNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById(`view-${e.currentTarget.dataset.view}`).classList.add('active');
      });
    });
  }

  startClock() {
    const update = () => {
      document.getElementById('systemClock').textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
      this.updateKitchenTimers();
    };
    update();
    setInterval(update, 1000);
  }

  bindStorefront() {
    document.getElementById('categoryFilter').addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      this.categoryFilter = pill.dataset.cat;
      this.renderStorefront();
    });

    document.getElementById('menuGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const item = this.menu.find(m => m.id === btn.dataset.add);
      if (!item || !item.available) return;

      const cartItem = this.cart.find(c => c.id === item.id);
      if (cartItem) cartItem.qty++;
      else this.cart.push({ ...item, qty: 1 });
      this.renderCart();
    });

    document.getElementById('submitOrderBtn').addEventListener('click', () => {
      if (this.cart.length === 0) return this.notify('Cart is empty');
      const customer = document.getElementById('customerName').value.trim() || 'Walk-In';
      const type = document.getElementById('serviceType').value;
      const notes = document.getElementById('orderNotes').value.trim();

      const highest = this.orders.reduce((max, o) => Math.max(max, o.orderNumber), 100);
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: highest + 1,
        customer,
        type,
        notes,
        status: 'PENDING',
        createdAt: Date.now(),
        items: this.cart.map(c => ({ name: c.name, price: c.price, qty: c.qty }))
      };

      this.orders.push(newOrder);
      this.save();
      this.cart = [];
      document.getElementById('customerName').value = '';
      document.getElementById('orderNotes').value = '';
      this.renderCart();
      this.renderKitchen();
      this.notify(`Order #${newOrder.orderNumber} dispatched`);

      document.querySelector('[data-view="kitchen"]').click();
    });
  }

  renderStorefront() {
    const grid = document.getElementById('menuGrid');
    const items = this.menu.filter(m => this.categoryFilter === 'ALL' || m.category === this.categoryFilter);
    grid.innerHTML = items.map(m => `
      <div class="menu-card ${m.available ? '' : 'sold-out'}">
        <div>
          <h4>${m.name}</h4>
          <span class="menu-price">$${m.price.toFixed(2)}</span>
          <p class="menu-desc">${m.description}</p>
        </div>
        <button class="btn-primary" data-add="${m.id}" ${m.available ? '' : 'disabled'}>
          ${m.available ? 'Add to Order' : 'Unavailable'}
        </button>
      </div>
    `).join('');
  }

  renderCart() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotalPrice');
    if (this.cart.length === 0) {
      list.innerHTML = '<p class="empty-cart">Cart is empty.</p>';
      totalEl.textContent = '$0.00';
      return;
    }
    let total = 0;
    list.innerHTML = this.cart.map(c => {
      total += c.price * c.qty;
      return `<div class="cart-row"><span>${c.qty}x ${c.name}</span><strong>$${(c.price * c.qty).toFixed(2)}</strong></div>`;
    }).join('');
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  bindKitchen() {
    document.getElementById('kitchenTicketGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { id, next } = btn.dataset;

      if (next === 'READY') {
        this.orders = this.orders.filter(o => o.id !== id);
      } else {
        this.orders = this.orders.map(o => o.id === id ? { ...o, status: next } : o);
      }
      this.save();
      this.renderKitchen();
    });
  }

  renderKitchen() {
    document.getElementById('queueBadge').textContent = this.orders.length;
    const grid = document.getElementById('kitchenTicketGrid');
    const empty = document.getElementById('kitchenEmpty');

    if (this.orders.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      document.getElementById('kpiActive').textContent = '0';
      document.getElementById('kpiAvgTime').textContent = '00:00';
      document.getElementById('kpiDelayed').textContent = '0';
      return;
    }

    empty.classList.add('hidden');
    let totalSec = 0, delayed = 0;

    grid.innerHTML = this.orders.map(o => {
      const diff = Math.max(0, Math.floor((Date.now() - o.createdAt) / 1000));
      totalSec += diff;
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      if (mins >= 10) delayed++;

      let sla = 'sla-green';
      if (mins >= 20) sla = 'sla-red';
      else if (mins >= 10) sla = 'sla-amber';

      const actionBtn = o.status === 'PENDING'
        ? `<button class="btn-primary" data-action data-id="${o.id}" data-next="PREPARING">Start Preparing</button>`
        : `<button class="btn-primary btn-complete" data-action data-id="${o.id}" data-next="READY">Mark Complete</button>`;

      return `
        <div class="ticket ${sla}" data-created="${o.createdAt}">
          <div class="ticket-header">
            <div>
              <span class="ticket-num">#${o.orderNumber}</span>
              <span style="font-size:11px; color:var(--text-muted)">(${o.type})</span>
            </div>
            <span class="ticket-timer" data-timer>${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}</span>
          </div>
          <div class="ticket-customer">${o.customer}</div>
          <div class="ticket-body">
            ${o.items.map(i => `<div class="ticket-line"><span class="ticket-qty">${i.qty}x</span> <span>${i.name}</span></div>`).join('')}
          </div>
          ${o.notes ? `<div class="ticket-note">Note: ${o.notes}</div>` : ''}
          <div class="ticket-footer">${actionBtn}</div>
        </div>
      `;
    }).join('');

    document.getElementById('kpiActive').textContent = this.orders.length;
    const avg = Math.floor(totalSec / this.orders.length);
    document.getElementById('kpiAvgTime').textContent = `${String(Math.floor(avg/60)).padStart(2,'0')}:${String(avg%60).padStart(2,'0')}`;
    document.getElementById('kpiDelayed').textContent = delayed;
  }

  updateKitchenTimers() {
    document.querySelectorAll('.ticket').forEach(ticket => {
      const created = Number(ticket.dataset.created);
      const diff = Math.max(0, Math.floor((Date.now() - created) / 1000));
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      ticket.querySelector('[data-timer]').textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

      ticket.classList.remove('sla-green', 'sla-amber', 'sla-red');
      if (mins >= 20) ticket.classList.add('sla-red');
      else if (mins >= 10) ticket.classList.add('sla-amber');
      else ticket.classList.add('sla-green');
    });
  }

  bindAdmin() {
    const form = document.getElementById('menuForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editItemId').value;
      const data = {
        name: document.getElementById('itemName').value.trim(),
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDesc').value.trim(),
        available: document.getElementById('itemAvailable').checked
      };

      if (id) {
        this.menu = this.menu.map(m => m.id === id ? { ...m, ...data } : m);
        this.notify('Menu item updated');
      } else {
        this.menu.push({ id: `item-${Date.now()}`, ...data });
        this.notify('New item added');
      }

      this.resetAdminForm();
      this.save();
      this.renderAdmin();
      this.renderStorefront();
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => this.resetAdminForm());

    document.getElementById('adminTableBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-id]');
      if (!btn) return;
      const id = btn.dataset.id;

      if (btn.classList.contains('edit')) {
        const item = this.menu.find(m => m.id === id);
        if (!item) return;
        document.getElementById('adminFormTitle').textContent = 'Edit Menu Item';
        document.getElementById('editItemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemDesc').value = item.description;
        document.getElementById('itemAvailable').checked = item.available;
        document.getElementById('saveItemBtn').textContent = 'Update Item';
        document.getElementById('cancelEditBtn').classList.remove('hidden');
      } else if (btn.classList.contains('delete')) {
        this.menu = this.menu.filter(m => m.id !== id);
        this.save();
        this.renderAdmin();
        this.renderStorefront();
        this.notify('Item deleted');
      }
    });
  }

  resetAdminForm() {
    document.getElementById('menuForm').reset();
    document.getElementById('editItemId').value = '';
    document.getElementById('adminFormTitle').textContent = 'Add Menu Item';
    document.getElementById('saveItemBtn').textContent = 'Save Item';
    document.getElementById('cancelEditBtn').classList.add('hidden');
  }

  renderAdmin() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = this.menu.map(m => `
      <tr>
        <td><strong>${m.name}</strong><br><small style="color:var(--text-muted)">${m.description}</small></td>
        <td>${m.category}</td>
        <td>$${m.price.toFixed(2)}</td>
        <td><span class="badge ${m.available ? 'stock' : 'out'}">${m.available ? 'Available' : 'Sold Out'}</span></td>
        <td class="text-right">
          <button class="action-btn edit" data-id="${m.id}">Edit</button>
          <button class="action-btn delete" data-id="${m.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => new App());