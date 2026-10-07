import {Product, getUniqueCategories} from './model.js';

const STORAGE_KEY = 'lab4_products';
const DELAY_MS = 300;

let products = [];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatId(id) {
  return String(id).padStart(4, '0');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getImagePlaceholder(name) {
  const initial = escapeHtml(
    String(name || '?')
      .charAt(0)
      .toUpperCase(),
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#e8eaf6"/>
    <text x="100" y="98" font-family="Arial, sans-serif" font-size="68" font-weight="bold" fill="#5c6bc0" text-anchor="middle">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    products = [];
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    products = parsed.map(
      (p) => new Product(p.id, p.name, p.categories, p.price),
    );
  } catch {
    products = [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function renderCategoriesCheckboxes() {
  const container = document.getElementById('categories-container');
  if (!container) {
    return;
  }

  const uniqueCategories = getUniqueCategories(products);

  if (uniqueCategories.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = uniqueCategories
    .map(
      (cat) => `
      <label class="checkbox-label">
        <input type="checkbox" name="categories" value="${escapeHtml(cat)}" />
        ${escapeHtml(cat)}
      </label>
    `,
    )
    .join('');
}

function renderProducts() {
  const listEl = document.querySelector('[data-testid="entity-list"]');
  listEl.innerHTML = '';

  if (products.length === 0) {
    listEl.innerHTML = `<p class="empty-hint">Товаров пока нет. Добавьте первый через форму выше.</p>`;
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');
    card.className = 'product-card';

    const categoriesHtml =
      product.categories.length > 0
        ? `<ul class="categories-list">${product.categories
            .map(
              (c) => `
            <li>
              <span>${escapeHtml(c)}</span>
              <button
                type="button"
                data-testid="remove-category"
                data-id="${product.id}"
                data-category="${escapeHtml(c)}"
                aria-label="Удалить категорию ${escapeHtml(c)}"
              >×</button>
            </li>
          `,
            )
            .join('')}</ul>`
        : `<p class="empty-hint">Категорий нет</p>`;

    card.innerHTML = `
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${getImagePlaceholder(product.name)}"
          alt="${escapeHtml(product.name)}"
        />
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-price">${product.price} ₽</p>
        <p class="product-id">ID: ${formatId(product.id)}</p>
        <div class="product-categories">
          <p class="categories-title">Категории (${product.categoryCount}):</p>
          ${categoriesHtml}
        </div>
        <button
          type="button"
          data-testid="delete-entity"
          data-id="${product.id}"
          class="delete-product-btn"
        >Удалить товар</button>
      </div>
    `;

    listEl.appendChild(card);
  });
}

function render() {
  renderCategoriesCheckboxes();
  renderProducts();
  saveToStorage();
}

function initProductForm() {
  const form = document.querySelector('[data-testid="entity-form"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const id = Number(formData.get('id'));
    const name = String(formData.get('name') || '').trim();
    const price = Number(formData.get('price'));

    const selected = formData.getAll('categories');
    const newRaw = String(formData.get('newCategories') || '');
    const newCategories = newRaw
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const categories = [...new Set([...selected, ...newCategories])];

    if (products.some((p) => p.id === id)) {
      alert(`Товар с ID ${formatId(id)} уже существует`);
      return;
    }

    const product = new Product(id, name, categories, price);

    await delay(DELAY_MS);
    products.push(product);
    render();
    form.reset();
  });
}

function initCategoryForm() {
  const form = document.querySelector('[data-testid="category-form"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const id = Number(formData.get('id'));
    const category = String(formData.get('category') || '').trim();

    if (!category) {
      return;
    }

    const product = products.find((p) => p.id === id);
    if (!product) {
      alert(`Товар с ID ${formatId(id)} не найден`);
      return;
    }

    if (product.categories.includes(category)) {
      alert(`Категория "${category}" уже есть у товара`);
      return;
    }

    await delay(DELAY_MS);
    product.addCategory(category);
    render();
    form.reset();
  });
}

function initListDelegation() {
  const listEl = document.querySelector('[data-testid="entity-list"]');
  listEl.addEventListener('click', async (e) => {
    const target = e.target;

    if (target.getAttribute('data-testid') === 'delete-entity') {
      const id = Number(target.getAttribute('data-id'));
      await delay(DELAY_MS);
      products = products.filter((p) => p.id !== id);
      render();
      return;
    }

    if (target.getAttribute('data-testid') === 'remove-category') {
      const id = Number(target.getAttribute('data-id'));
      const category = target.getAttribute('data-category');
      const product = products.find((p) => p.id === id);
      if (!product) {
        return;
      }

      await delay(DELAY_MS);
      product.removeCategory(category);
      render();
    }
  });
}

function init() {
  loadFromStorage();
  initProductForm();
  initCategoryForm();
  initListDelegation();
  render();
}

init();
