
"use strict";

const TELEGRAM_USERNAME = "DERILAZ";
const STORAGE_KEY = "neon_stars_orders_v1";
const DEMO_BALANCE = 0;

const packages = [
    { stars: 50, price: 13000 },
    { stars: 100, price: 24000 },
    { stars: 200, price: 46000 },
    { stars: 350, price: 79000 },
    { stars: 500, price: 112000 },
    { stars: 750, price: 167000 },
    { stars: 1000, price: 222000 },
    { stars: 2000, price: 442000 },
    { stars: 5000, price: 1102000 },
    { stars: 10000, price: 2202000 }
];

let selectedStars = 100;
let selectedPrice = 24000;

const $ = (selector) => document.querySelector(selector);

function getOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(orders) ? orders : [];
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error("Не удалось сохранить историю:", error);
        return false;
    }
}

function formatPrice(price) {
    return Number(price).toLocaleString("ru-RU") + " сум";
}

function getPriceForStars(stars) {
    const count = Math.max(1, Math.floor(Number(stars) || 1));

    if (count <= packages[0].stars) {
        return Math.round(packages[0].price * count / packages[0].stars);
    }

    for (let i = 1; i < packages.length; i++) {
        if (count <= packages[i].stars) {
            const previous = packages[i - 1];
            const current = packages[i];
            const ratio =
                (count - previous.stars) /
                (current.stars - previous.stars);

            return Math.round(
                previous.price + ratio * (current.price - previous.price)
            );
        }
    }

    const last = packages[packages.length - 1];
    return Math.round(count * last.price / last.stars);
}

function showToast(message) {
    const toast = $("#toast");

    if (toast) {
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    } else {
        console.log(message);
    }
}

function createOrder(stars, price, username) {
    const orders = getOrders();

    const order = {
        id: Date.now(),
        stars,
        price,
        username,
        date: new Date().toLocaleString("ru-RU"),
        status: "Ожидает оплаты"
    };

    orders.unshift(order);

    if (!saveOrders(orders)) {
        return null;
    }

    return order;
}

function renderPackages() {
    const catalog = $("#catalogPackages");
    const popular = $("#popularPackages");

    const createPackageCard = (item) => `
        <article class="package-card">
            <div class="package-stars">⭐ ${item.stars.toLocaleString("ru-RU")}</div>
            <div class="package-price">${formatPrice(item.price)}</div>
            <button
                class="buy-btn"
                type="button"
                data-buy="${item.stars}"
            >
                Купить звёзды
            </button>
        </article>
    `;

    if (catalog) {
        catalog.innerHTML = packages.map(createPackageCard).join("");
    }

    if (popular) {
        popular.innerHTML = packages
            .filter(item => [100, 500, 1000, 5000].includes(item.stars))
            .map(createPackageCard)
            .join("");
    }
}

function renderDashboard() {
    const orders = getOrders();

    const balance = $("#balanceValue");
    const totalOrders = $("#totalOrders");
    const totalStars = $("#totalStars");
    const recentOrders = $("#recentOrders");

    if (balance) {
        balance.textContent = formatPrice(DEMO_BALANCE);
    }

    if (totalOrders) {
        totalOrders.textContent = orders.length;
    }

    if (totalStars) {
        totalStars.textContent = orders
            .reduce((sum, order) => sum + Number(order.stars || 0), 0)
            .toLocaleString("ru-RU");
    }

    if (recentOrders) {
        recentOrders.innerHTML = orders.length
            ? orders.slice(0, 5).map(order => `
                <div class="history-item">
                    <span>⭐ ${Number(order.stars).toLocaleString("ru-RU")}</span>
                    <span>${formatPrice(order.price)}</span>
                    <span>${order.status}</span>
                </div>
            `).join("")
            : "<p>Пока заказов нет.</p>";
    }
}

function renderHistory() {
    const orders = getOrders();

    const historyCount = $("#historyCount");
    const historyTotal = $("#historyTotal");
    const historyStars = $("#historyStars");
    const historyAmount = $("#historyAmount");
    const historyList = $("#historyList");

    if (historyCount) {
        historyCount.textContent = orders.length;
    }

    if (historyTotal) {
        historyTotal.textContent = formatPrice(
            orders.reduce((sum, order) => sum + Number(order.price || 0), 0)
        );
    }

    if (historyStars) {
        historyStars.textContent = orders
            .reduce((sum, order) => sum + Number(order.stars || 0), 0)
            .toLocaleString("ru-RU");
    }

    if (historyAmount) {
        historyAmount.textContent = orders.length;
    }

    if (historyList) {
        historyList.innerHTML = orders.length
            ? orders.map(order => `
                <div class="history-item">
                    <div>
                        <strong>⭐ ${Number(order.stars).toLocaleString("ru-RU")} Stars</strong>
                        <p>${order.date || ""}</p>
                        <p>${order.username || ""}</p>
                    </div>
                    <div>
                        <strong>${formatPrice(order.price)}</strong>
                        <p>${order.status || "Заказ создан"}</p>
                    </div>
                </div>
            `).join("")
            : "<p>История заказов пока пуста.</p>";
    }
}

function openOrderModal(stars, price) {
    selectedStars = Number(stars);
    selectedPrice = Number(price);

    const modal = $("#modalOverlay");
    const starsCount = $("#modalStarsCount");
    const totalPrice = $("#modalTotalPrice");
    const error = $("#formError");

    if (starsCount) {
        starsCount.textContent =
            selectedStars.toLocaleString("ru-RU") + " ⭐";
    }

    if (totalPrice) {
        totalPrice.textContent = formatPrice(selectedPrice);
    }

    if (error) {
        error.textContent = "";
    }

    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}

function closeOrderModal() {
    const modal = $("#modalOverlay");

    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}

function goToTelegram(stars, price, username) {
    const message =
        `Здравствуйте! Хочу купить Telegram Stars ⭐\n` +
        `Количество: ${stars} звёзд\n` +
        `Цена: ${formatPrice(price)}\n` +
        `Мой Telegram: ${username || "Не указан"}`;

    const telegramURL =
        `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

    window.open(telegramURL, "_blank", "noopener,noreferrer");
}

function updateCalculator() {
    const input = $("#starInput");
    const priceElement = $("#calcPrice");
    const hint = $("#inputHint");

    if (!input) {
        return;
    }

    const stars = Math.max(1, Math.floor(Number(input.value) || 1));
    const price = getPriceForStars(stars);

    if (priceElement) {
        priceElement.textContent = formatPrice(price);
    }

    if (hint) {
        hint.textContent = `⭐ ${stars.toLocaleString("ru-RU")} звёзд`;
    }

    selectedStars = stars;
    selectedPrice = price;
}

function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
        page.style.display = "none";
    });

    const target = $(`#page-${pageName}`);

    if (target) {
        target.classList.add("active");
        target.style.display = "block";
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });
}

function createParticles() {
    const canvas = $("#particles");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    let particles = [];
    let width = 0;
    let height = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        particles = Array.from({ length: 45 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.15,
            alpha: Math.random() * 0.5 + 0.2
        }));
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(particle => {
            particle.y -= particle.speed;

            if (particle.y < 0) {
                particle.y = height;
                particle.x = Math.random() * width;
            }

            ctx.beginPath();
            ctx.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = `rgba(170, 100, 255, ${particle.alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();
}

document.addEventListener("DOMContentLoaded", () => {
    renderPackages();
    renderDashboard();
    renderHistory();
    createParticles();

    document.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.go);
        });
    });

    document.addEventListener("click", event => {
        const buyButton = event.target.closest("[data-buy], [data-add]");

        if (buyButton) {
            const stars = Number(
                buyButton.dataset.buy || buyButton.dataset.add
            );

            openOrderModal(stars, getPriceForStars(stars));
            return;
        }

        if (event.target.closest("#closeModalBtn")) {
            closeOrderModal();
        }
    });

    const starInput = $("#starInput");

    if (starInput) {
        starInput.addEventListener("input", updateCalculator);
        updateCalculator();
    }

    const calcOrderBtn = $("#calcOrderBtn");

    if (calcOrderBtn) {
        calcOrderBtn.addEventListener("click", () => {
            updateCalculator();
            openOrderModal(selectedStars, selectedPrice);
        });
    }

    const orderForm = $("#orderForm");

    if (orderForm) {
        orderForm.addEventListener("submit", event => {
            event.preventDefault();

            const usernameInput = $("#usernameInput");
            const formError = $("#formError");

            const username = usernameInput
                ? usernameInput.value.trim()
                : "";

            if (formError) {
                formError.textContent = "";
            }

            if (!username) {
                if (formError) {
                    formError.textContent =
                        "Введите свой Telegram username.";
                }
                return;
            }

            if (!/^[a-zA-Z0-9_]{5,32}$/.test(username.replace(/^@/, ""))) {
                if (formError) {
                    formError.textContent =
                        "Проверьте свой Telegram username.";
                }
                return;
            }

            const cleanUsername = username.replace(/^@/, "");

            const message =
                `Здравствуйте! Хочу купить Telegram Stars ⭐\n` +
                `Количество: ${selectedStars} звёзд\n` +
                `Цена: ${formatPrice(selectedPrice)}\n` +
                `Мой Telegram: @${cleanUsername}`;

            const telegramURL =
                `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

            const telegramWindow = window.open(
                telegramURL,
                "_blank"
            );

            if (!telegramWindow) {
                if (formError) {
                    formError.textContent =
                        "Браузер заблокировал Telegram. Разреши всплывающие окна и повтори попытку.";
                }
                return;
            }

            try {
                telegramWindow.opener = null;
            } catch (error) {
                console.warn("Не удалось изменить opener:", error);
            }

            const order = createOrder(
                selectedStars,
                selectedPrice,
                "@" + cleanUsername
            );

            if (!order) {
                showToast(
                    "Telegram открыт, но историю сохранить не удалось."
                );
            } else {
                renderDashboard();
                renderHistory();
                showToast("Заявка подготовлена и добавлена в историю.");
            }

            closeOrderModal();
        });
    }

    const clearHistoryBtn = $("#clearHistoryBtn");

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", () => {
            if (confirm("Удалить всю историю заказов?")) {
                saveOrders([]);
                renderDashboard();
                renderHistory();
                showToast("История заказов очищена.");
            }
        });
    }

    const modalOverlay = $("#modalOverlay");

    if (modalOverlay) {
        modalOverlay.addEventListener("click", event => {
            if (event.target === modalOverlay) {
                closeOrderModal();
            }
        });
    }

    showPage("dashboard");
});
