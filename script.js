const state = {
  authMode: "login",
  isAuthenticated: false,
  screen: "Главная",
  selectedCategory: "Все",
  selectedProductId: null,
  search: "",
  favorites: ["perf-09"],
  cart: [
    { productId: "serum-01", quantity: 1 },
    { productId: "lip-03", quantity: 2 },
  ],
  notice: "",
  checkoutCount: 0,
  loginForm: {
    email: "hello@nur-beauty.com",
    password: "nur123",
  },
  registerForm: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
  },
  profile: {
    fullName: "Nur Client",
    email: "hello@nur-beauty.com",
    phone: "+7 700 123 4567",
    city: "Almaty",
    address: "Abylai Khan Ave 125",
  },
};

const categories = ["Все", "Уход", "Губы", "Глаза", "Тело", "Парфюм"];

const products = [
  {
    id: "serum-01",
    name: "Шелковая розовая сыворотка",
    category: "Уход",
    price: 29,
    rating: 4.8,
    tint: "#ffd7d9",
    description: "Увлажняющая сыворотка с экстрактом розы и ниацинамидом для гладкой и сияющей кожи.",
  },
  {
    id: "mist-02",
    name: "Освежающий mist Cloud Dew",
    category: "Уход",
    price: 18,
    rating: 4.6,
    tint: "#ffe6d9",
    description: "Легкий мист для лица, который освежает макияж и придает коже мягкое сияние.",
  },
  {
    id: "lip-03",
    name: "Тинт Velvet Kiss",
    category: "Губы",
    price: 16,
    rating: 4.7,
    tint: "#f8bcc4",
    description: "Невесомый тинт для губ с бархатным эффектом и комфортным стойким покрытием.",
  },
  {
    id: "lip-04",
    name: "Блеск-бальзам Berry Balm",
    category: "Губы",
    price: 14,
    rating: 4.5,
    tint: "#efb0ba",
    description: "Питательный гибрид блеска и бальзама с легким ягодным сиянием.",
  },
  {
    id: "eye-05",
    name: "Палетка Soft Taupe",
    category: "Глаза",
    price: 34,
    rating: 4.9,
    tint: "#dfc7c1",
    description: "Шесть шелковистых оттенков для глаз, подходящих и для дня, и для вечера.",
  },
  {
    id: "eye-06",
    name: "Тушь Lash Lift",
    category: "Глаза",
    price: 21,
    rating: 4.4,
    tint: "#d9d4db",
    description: "Наслаиваемая тушь, которая разделяет, подкручивает и подчеркивает ресницы без комочков.",
  },
  {
    id: "body-07",
    name: "Крем для рук Cashmere",
    category: "Тело",
    price: 19,
    rating: 4.8,
    tint: "#f4dfd8",
    description: "Насыщенный крем для рук с маслом ши и ванильным цветком для мягкой кожи.",
  },
  {
    id: "body-08",
    name: "Масло для тела Glow",
    category: "Тело",
    price: 26,
    rating: 4.6,
    tint: "#f8d7b8",
    description: "Легкое масло с сиянием, которое придает коже здоровый сатиновый блеск.",
  },
  {
    id: "perf-09",
    name: "Аромат Noor Bloom",
    category: "Парфюм",
    price: 48,
    rating: 4.9,
    tint: "#f6d6de",
    description: "Мягкий цветочный аромат с пионом, мускусом и теплой кашемировой базой.",
  },
  {
    id: "perf-10",
    name: "Аромат Amber Veil",
    category: "Парфюм",
    price: 52,
    rating: 4.7,
    tint: "#e9d1c1",
    description: "Элегантный амбровый аромат со сливочным сандалом и розовым перцем.",
  },
];

const app = document.getElementById("app");
const SEARCH_DEBOUNCE_MS = 120;
let searchRenderTimer = null;
const productSearchText = new Map(
  products.map((product) => [product.id, product.name.toLowerCase()])
);

function money(value) {
  return `$${value.toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setNotice(message, duration = 1600) {
  state.notice = message;
  render();
  clearTimeout(setNotice.timer);
  setNotice.timer = setTimeout(() => {
    state.notice = "";
    render();
  }, duration);
}

function normalizeInput(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

function getFavoriteProducts() {
  return products.filter((product) => state.favorites.includes(product.id));
}

function getFilteredProducts() {
  const q = state.search.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory =
      state.selectedCategory === "Все" || product.category === state.selectedCategory;
    const matchesSearch = !q || productSearchText.get(product.id).includes(q);
    return matchesCategory && matchesSearch;
  });
}

function getCartItems() {
  return state.cart
    .map((line) => {
      const product = getProduct(line.productId);
      if (!product) return null;
      return {
        ...line,
        product,
        lineTotal: product.price * line.quantity,
      };
    })
    .filter(Boolean);
}

function toggleFavorite(productId) {
  if (state.favorites.includes(productId)) {
    state.favorites = state.favorites.filter((id) => id !== productId);
  } else {
    state.favorites = [...state.favorites, productId];
  }
  render();
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }
    setNotice("Добавлено в корзину");
}

function updateQuantity(productId, delta) {
  state.cart = state.cart
    .map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    )
    .filter((item) => item.quantity > 0);
  render();
}

function login() {
  const email = normalizeInput(state.loginForm.email).toLowerCase();
  const password = state.loginForm.password;

  if (!email || !password) {
    setNotice("Введите email и пароль");
    return;
  }
  if (!isValidEmail(email)) {
    setNotice("Введите корректный email");
    return;
  }

  state.loginForm.email = email;
  state.profile.email = email;
  state.isAuthenticated = true;
  state.screen = "Главная";
  setNotice("С возвращением в Nur");
}

function register() {
  const fullName = normalizeInput(state.registerForm.fullName);
  const email = normalizeInput(state.registerForm.email).toLowerCase();
  const password = state.registerForm.password;
  const confirmPassword = state.registerForm.confirmPassword;
  const city = normalizeInput(state.registerForm.city);

  if (!fullName || !email || !password || !confirmPassword) {
    setNotice("Заполните имя, email и оба поля пароля");
    return;
  }
  if (fullName.length < 2) {
    setNotice("Имя должно быть не короче 2 символов");
    return;
  }
  if (!isValidEmail(email)) {
    setNotice("Введите корректный email");
    return;
  }
  if (password.length < 6) {
    setNotice("Пароль должен быть не короче 6 символов");
    return;
  }
  if (password !== confirmPassword) {
    setNotice("Пароли не совпадают");
    return;
  }

  state.profile.fullName = fullName;
  state.profile.email = email;
  state.profile.city = city || state.profile.city;
  state.loginForm.email = email;
  state.loginForm.password = password;
  state.registerForm = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
  };
  state.isAuthenticated = true;
  state.screen = "Главная";
  setNotice("Аккаунт успешно создан");
}

function checkout() {
  if (!state.cart.length) {
    setNotice("Ваша корзина пуста");
    return;
  }
  state.cart = [];
  state.checkoutCount += 1;
  state.screen = "Главная";
  setNotice("Заказ успешно оформлен", 1800);
}

function logout() {
  state.isAuthenticated = false;
  state.authMode = "login";
  state.selectedProductId = null;
  setNotice("Вы вышли из аккаунта");
}

function renderProductCard(product) {
  const saved = state.favorites.includes(product.id);
  return `
    <article class="product-card fade-in">
      <div class="product-head">
        <div>
          <div class="product-overline">${escapeHtml(product.category)}</div>
          <button class="product-name-button" data-action="open-product" data-id="${product.id}">
            <h4>${escapeHtml(product.name)}</h4>
          </button>
        </div>
        <div class="rating-pill">★ ${product.rating}</div>
      </div>
      <p class="description-snippet">${escapeHtml(product.description)}</p>
      <div class="price-row">
        <div class="price-stack">
          <span class="price-label">Цена</span>
          <strong class="price-value">${money(product.price)}</strong>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" data-action="toggle-favorite" data-id="${product.id}">
          ${saved ? "Сохранено" : "Сохранить"}
        </button>
        <button class="btn btn-primary" data-action="add-cart" data-id="${product.id}">В корзину</button>
      </div>
    </article>
  `;
}

function renderAuth() {
  return `
    <section class="auth-screen fade-in">
      <div class="badge">Мягкая красота, каждый день</div>
      <h1 class="brand-title">Nur</h1>
      <p class="lead">
        Стильный магазин косметики с мягкой премиальной эстетикой, удобным просмотром и приятным процессом покупок.
      </p>
      ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ""}
      <div class="segment">
        <button class="${state.authMode === "login" ? "active" : ""}" data-action="switch-auth" data-mode="login">Вход</button>
        <button class="${state.authMode === "register" ? "active" : ""}" data-action="switch-auth" data-mode="register">Регистрация</button>
      </div>
      ${
        state.authMode === "login"
          ? `
            <section class="card">
              <h2 class="section-title">С возвращением</h2>
              <input class="field" name="login-email" placeholder="Электронная почта" value="${escapeHtml(state.loginForm.email)}" />
              <input class="field" name="login-password" type="password" placeholder="Пароль" value="${escapeHtml(state.loginForm.password)}" />
              <button class="btn btn-primary" data-action="login">Войти в Nur</button>
              <p class="subtle">Демо-вход работает с любой почтой и паролем.</p>
            </section>
          `
          : `
            <section class="card">
              <h2 class="section-title">Создать аккаунт</h2>
              <input class="field" name="register-fullName" placeholder="Полное имя" value="${escapeHtml(state.registerForm.fullName)}" />
              <input class="field" name="register-email" placeholder="Электронная почта" value="${escapeHtml(state.registerForm.email)}" />
              <input class="field" name="register-password" type="password" placeholder="Пароль" value="${escapeHtml(state.registerForm.password)}" />
              <input class="field" name="register-confirmPassword" type="password" placeholder="Повторите пароль" value="${escapeHtml(state.registerForm.confirmPassword)}" />
              <input class="field" name="register-city" placeholder="Город" value="${escapeHtml(state.registerForm.city)}" />
              <button class="btn btn-primary" data-action="register">Создать аккаунт</button>
            </section>
          `
      }
      <section class="card">
        <h2 class="section-title">Почему Nur?</h2>
        <p class="subtle">Подобранные коллекции ухода, косметики для губ и глаз, средств для тела, парфюма, избранного и удобного оформления заказа.</p>
      </section>
    </section>
  `;
}

function renderHome() {
  const bestSellers = products.slice(0, 4).map(renderProductCard).join("");
  return `
    <section class="screen-wrap fade-in">
      <section class="hero">
        <div class="eyebrow">ФИРМЕННАЯ КОЛЛЕКЦИЯ NUR</div>
        <h2>Мягкий уход, макияж и аромат в одном приложении.</h2>
        <p>Откройте для себя уход, макияж и парфюм в удобном формате, который ощущается как настоящее мобильное приложение.</p>
        <div class="hero-grid">
          <div>
            <button class="btn btn-primary" data-nav="Магазин">Перейти к покупкам</button>
          </div>
          <div class="hero-note">
            <strong>24h</strong>
            <span>Быстрая доставка</span>
          </div>
        </div>
      </section>
      <section class="stats">
        <div class="stat"><strong>${products.length}+</strong><span>Товаров</span></div>
        <div class="stat"><strong>${state.favorites.length}</strong><span>В избранном</span></div>
        <div class="stat"><strong>${state.checkoutCount}</strong><span>Заказов</span></div>
      </section>
      <div class="section-row">
        <h3>Популярное</h3>
        <button class="linkish" data-nav="Магазин">Смотреть все</button>
      </div>
      <section class="shop-grid">${bestSellers}</section>
    </section>
  `;
}

function renderShop() {
  const productMarkup = getFilteredProducts().map(renderProductCard).join("");
  const chips = categories
    .map(
      (category) => `
        <button class="chip ${state.selectedCategory === category ? "active" : ""}" data-action="set-category" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join("");

  return `
    <section class="screen-wrap fade-in">
      <section class="card toolbar-card">
        <div class="section-row">
          <h3 class="stack-title">Магазин</h3>
          <button class="linkish" data-nav="Избранное">Избранное</button>
        </div>
        <p class="subtle">Ищите только по названию товара.</p>
        <input class="field" name="shop-search" placeholder="Поиск косметики..." value="${escapeHtml(state.search)}" />
        <div class="chips">${chips}</div>
      </section>
      <section class="shop-grid">
        ${
          productMarkup ||
          `<div class="empty"><h3 class="stack-title">Ничего не найдено</h3><p class="subtle">Попробуйте другой запрос или смените категорию.</p></div>`
        }
      </section>
    </section>
  `;
}

function renderFavorites() {
  const favorites = getFavoriteProducts().map(renderProductCard).join("");
  return `
    <section class="screen-wrap fade-in">
      <div class="section-row">
        <div>
          <h3 class="stack-title">Избранное</h3>
          <p class="subtle">Ваши сохраненные бьюти-находки, к которым можно быстро вернуться в любой момент.</p>
        </div>
      </div>
      <section class="shop-grid">
        ${
          favorites ||
          `<div class="empty"><h3 class="stack-title">Пока пусто</h3><p class="subtle">Сохраняйте товары из магазина, чтобы собрать свой список желаний.</p></div>`
        }
      </section>
    </section>
  `;
}

function renderCart() {
  const cartItems = getCartItems();
  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = cartItems.length ? 5 : 0;
  const total = subtotal + shipping;

  return `
    <section class="screen-wrap fade-in">
      <div class="section-row">
        <div>
          <h3 class="stack-title">Корзина</h3>
          <p class="subtle">Проверьте заказ перед оформлением.</p>
        </div>
      </div>
      <section class="stack">
        ${
          cartItems.length
            ? cartItems
                .map(
                  (item) => `
                    <article class="cart-item">
                      <div class="cart-main">
                        <div class="product-overline">${escapeHtml(item.product.category)}</div>
                        <h4>${escapeHtml(item.product.name)}</h4>
                        <div class="meta">${money(item.product.price)} за штуку</div>
                        <div class="qty-row">
                          <button data-action="qty" data-id="${item.productId}" data-delta="-1">-</button>
                          <strong>${item.quantity}</strong>
                          <button data-action="qty" data-id="${item.productId}" data-delta="1">+</button>
                        </div>
                      </div>
                      <div class="price">${money(item.lineTotal)}</div>
                    </article>
                  `
                )
                .join("") +
              `
                <section class="summary">
                  <div class="summary-row"><span>Товары</span><strong>${money(subtotal)}</strong></div>
                  <div class="summary-row"><span>Доставка</span><strong>${money(shipping)}</strong></div>
                  <div class="summary-row total"><span>Итого</span><strong>${money(total)}</strong></div>
                  <button class="btn btn-primary" data-action="checkout">Оформить заказ</button>
                </section>
              `
            : `<div class="empty"><h3 class="stack-title">Корзина пуста</h3><p class="subtle">Добавьте что-нибудь красивое из магазина.</p></div>`
        }
      </section>
    </section>
  `;
}

function renderProfile() {
  return `
    <section class="screen-wrap fade-in">
      <section class="profile-head">
        <div class="profile-topline">
          <div class="avatar">${escapeHtml(state.profile.fullName.slice(0, 1).toUpperCase())}</div>
          <div class="profile-kicker">Клиент Nur</div>
        </div>
        <div class="profile-copy">
          <h3 class="stack-title">${escapeHtml(state.profile.fullName)}</h3>
          <p class="subtle">${escapeHtml(state.profile.email)}</p>
        </div>
      </section>
      <section class="card">
        <h3 class="stack-title">Данные профиля</h3>
        <input class="field" name="profile-fullName" placeholder="Полное имя" value="${escapeHtml(state.profile.fullName)}" />
        <input class="field" name="profile-email" placeholder="Электронная почта" value="${escapeHtml(state.profile.email)}" />
        <input class="field" name="profile-phone" placeholder="Телефон" value="${escapeHtml(state.profile.phone)}" />
        <input class="field" name="profile-city" placeholder="Город" value="${escapeHtml(state.profile.city)}" />
        <input class="field" name="profile-address" placeholder="Адрес" value="${escapeHtml(state.profile.address)}" />
        <button class="btn btn-primary" data-action="save-profile">Сохранить профиль</button>
        <button class="btn btn-secondary" data-action="logout">Выйти</button>
      </section>
    </section>
  `;
}

function renderDetail() {
  const product = getProduct(state.selectedProductId);
  if (!product) {
    state.selectedProductId = null;
    return renderHome();
  }

  return `
    <section class="screen-wrap fade-in">
      <button class="back" data-action="back">← Назад</button>
      <section class="detail-panel">
        <div class="detail-category">${escapeHtml(product.category)}</div>
        <h3 class="stack-title">${escapeHtml(product.name)}</h3>
        <div class="meta">★ ${product.rating} · ${money(product.price)}</div>
      </section>
      <p class="detail-text">${escapeHtml(product.description)}</p>
      <div class="detail-notes">
        <span>Мягкий финиш</span>
        <span>На каждый день</span>
        <span>Выбор Nur</span>
      </div>
      <div class="stack">
        <button class="btn btn-secondary" data-action="toggle-favorite" data-id="${product.id}">
          ${state.favorites.includes(product.id) ? "Убрать из избранного" : "Сохранить в избранное"}
        </button>
        <button class="btn btn-primary" data-action="add-cart" data-id="${product.id}">Добавить в корзину</button>
      </div>
    </section>
  `;
}

function renderAppScreen() {
  if (state.selectedProductId) return renderDetail();
  if (state.screen === "Главная") return renderHome();
  if (state.screen === "Магазин") return renderShop();
  if (state.screen === "Избранное") return renderFavorites();
  if (state.screen === "Корзина") return renderCart();
  return renderProfile();
}

function renderMainApp() {
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  return `
    <header class="topbar">
      <div>
        <h1>Nur</h1>
        <p>Красота мягко и удобно</p>
      </div>
      <div class="topbar-meta">
        <div class="topbar-pill">Корзина <strong>${cartCount}</strong></div>
        ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ""}
      </div>
    </header>
    <section class="content">${renderAppScreen()}</section>
    ${
      state.selectedProductId
        ? ""
        : `
          <nav class="bottom-nav">
            ${["Главная", "Магазин", "Избранное", "Корзина", "Профиль"]
              .map(
                (item) => `
                  <button class="${state.screen === item ? "active" : ""}" data-nav="${item}">
                    ${item}
                  </button>
                `
              )
              .join("")}
          </nav>
        `
    }
  `;
}

function render() {
  app.innerHTML = state.isAuthenticated ? renderMainApp() : renderAuth();
}

document.addEventListener("input", (event) => {
  const { name, value } = event.target;
  if (!name) return;

  if (name.startsWith("login-")) {
    state.loginForm[name.replace("login-", "")] = value;
  }
  if (name.startsWith("register-")) {
    state.registerForm[name.replace("register-", "")] = value;
  }
  if (name.startsWith("profile-")) {
    state.profile[name.replace("profile-", "")] = value;
  }
  if (name === "shop-search") {
    if (state.search === value) return;
    state.search = value;
    clearTimeout(searchRenderTimer);
    searchRenderTimer = setTimeout(() => {
      if (state.isAuthenticated && state.screen === "Магазин" && !state.selectedProductId) {
        render();
      }
    }, SEARCH_DEBOUNCE_MS);
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-nav]");
  if (!target) return;

  const nav = target.dataset.nav;
  const action = target.dataset.action;

  if (nav) {
    state.screen = nav;
    state.selectedProductId = null;
    render();
    return;
  }

  if (action === "switch-auth") {
    state.authMode = target.dataset.mode;
    render();
    return;
  }
  if (action === "login") {
    login();
    return;
  }
  if (action === "register") {
    register();
    return;
  }
  if (action === "set-category") {
    state.selectedCategory = target.dataset.category;
    render();
    return;
  }
  if (action === "open-product") {
    state.selectedProductId = target.dataset.id;
    render();
    return;
  }
  if (action === "toggle-favorite") {
    toggleFavorite(target.dataset.id);
    return;
  }
  if (action === "add-cart") {
    addToCart(target.dataset.id);
    return;
  }
  if (action === "qty") {
    updateQuantity(target.dataset.id, Number(target.dataset.delta));
    return;
  }
  if (action === "checkout") {
    checkout();
    return;
  }
  if (action === "save-profile") {
    setNotice("Профиль обновлен");
    return;
  }
  if (action === "logout") {
    logout();
    return;
  }
  if (action === "back") {
    state.selectedProductId = null;
    render();
  }
});

render();
