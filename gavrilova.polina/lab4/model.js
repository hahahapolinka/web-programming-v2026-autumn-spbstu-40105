export class Product {
  constructor(id, name, categories, price) {
    this.id = id;
    this.name = name;
    this.categories = categories || [];
    this.price = price;
  }

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
    }
  }

  removeCategory(category) {
    this.categories = this.categories.filter((c) => c !== category);
  }

  get categoryCount() {
    return this.categories.length;
  }
}

export function groupProductsByCategory(products) {
  const map = new Map();
  products.forEach((product) => {
    product.categories.forEach((category) => {
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category).push(product);
    });
  });
  return map;
}

export function getUniqueCategories(products) {
  const categories = new Set();
  products.forEach((product) => {
    product.categories.forEach((c) => categories.add(c));
  });
  return Array.from(categories);
}

function getPriceRange(price) {
  if (price < 1000) {
    return '0-999';
  }
  if (price < 5000) {
    return '1000-4999';
  }
  if (price < 10000) {
    return '5000-9999';
  }
  return '10000+';
}

export function groupProductsByPriceRange(products) {
  const grouped = {};
  products.forEach((product) => {
    const range = getPriceRange(product.price);
    if (!grouped[range]) {
      grouped[range] = [];
    }
    grouped[range].push(product);
  });
  return grouped;
}

export function findProductsByCategory(products, category) {
  return products.filter((p) => p.categories.includes(category));
}

export function findProductsAbovePrice(products, minPrice) {
  return products.filter((p) => p.price > minPrice);
}
