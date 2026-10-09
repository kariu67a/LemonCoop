const S = {
    clasica: { n: 'Limonada clásica', d: 'El sabor de siempre: limón fresco, hielo y el punto justo de dulzor. Perfecta para cualquier tarde.' },
    fresa: { n: 'Limonada con fresa', d: 'Limón con fresa en un vaso color de rosa. Dulce, frutal y muy divertida.' },
    hierbabuena: { n: 'Limonada con hierbabuena', d: 'Limón con hojitas de hierbabuena: fresca, aromática y súper refrescante.' }
};

let currentSabor = 'clasica';
const currentCart = {};
const allOrders = []; // Almacena múltiples pedidos independientes

const $ = id => document.getElementById(id);

// Cambiar la visualización del sabor principal
function setSabor(k) {
    currentSabor = k;
    document.body.dataset.sabor = k;
    $('titulo').textContent = S[k].n;
    $('desc').textContent = S[k].d;
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-checked', c.dataset.s === k));
}

document.querySelectorAll('.chip').forEach(c => c.onclick = () => setSabor(c.dataset.s));

// Ajustador de cantidad en tarjetas
function adjustQty(key, delta) {
    const el = $(`qty-${key}`);
    let val = parseInt(el.textContent) + delta;
    if (val < 1) val = 1;
    el.textContent = val;
}

// Agregar al Carrito Temporal
function addToCart(key, qty) {
    currentCart[key] = (currentCart[key] || 0) + qty;
    updateCartUI();
}

function removeFromCart(key) {
    delete currentCart[key];
    updateCartUI();
}

function updateCartUI() {
    const cartList = $('cartList');
    const cartCount = $('cartCount');
    const keys = Object.keys(currentCart);

    let totalCount = 0;
    cartList.innerHTML = '';

    if (keys.length === 0) {
        cartList.innerHTML = '<li class="empty-cart">El carrito está vacío. ¡Agrega limonadas desde las secciones superiores!</li>';
        cartCount.textContent = '0';
        return;
    }

    keys.forEach(key => {
        const qty = currentCart[key];
        totalCount += qty;
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
      <div class="cart-item-info">
        <strong>${S[key].n}</strong>
      </div>
      <div class="cart-controls">
        <span>x${qty}</span>
        <button class="btn sm danger" onclick="removeFromCart('${key}')">Eliminar</button>
      </div>
    `;
        cartList.appendChild(li);
    });

    cartCount.textContent = totalCount;
}

// Botones de agregar desde tarjetas de sabores
document.querySelectorAll('.btn-add-card').forEach(btn => {
    btn.onclick = () => {
        const key = btn.dataset.key;
        const qty = parseInt($(`qty-${key}`).textContent);
        addToCart(key, qty);
    };
});

// Botón "Agregar al Carrito" en la sección superior
$('addHeroBtn').onclick = () => {
    addToCart(currentSabor, 1);
    $('pedido').scrollIntoView({ behavior: 'smooth' });
};

// Guardar e Ingresar Pedido
$('formPedido').onsubmit = e => {
    e.preventDefault();
    const keys = Object.keys(currentCart);
    if (keys.length === 0) {
        alert('Por favor agrega al menos una limonada al carrito antes de registrar un pedido.');
        return;
    }

    const nombre = $('nombre').value.trim();
    const direccion = $('direccion').value.trim();
    const notas = $('notas').value.trim();

    // Crear estructura del nuevo pedido
    const newOrder = {
        id: Date.now(),
        nombre,
        direccion,
        notas,
        items: { ...currentCart }
    };

    allOrders.push(newOrder);

    // Limpiar el carrito actual y el formulario
    Object.keys(currentCart).forEach(key => delete currentCart[key]);
    updateCartUI();
    $('formPedido').reset();

    // Actualizar historial
    renderOrdersHistory();
};

// Renderizar Historial de Pedidos Registrados
function renderOrdersHistory() {
    const container = $('ordersContainer');
    const countEl = $('ordersCount');
    countEl.textContent = allOrders.length;

    if (allOrders.length === 0) {
        container.innerHTML = '<p class="empty-cart">No hay pedidos registrados aún.</p>';
        return;
    }

    container.innerHTML = '';
    allOrders.forEach((order, index) => {
        const card = document.createElement('div');
        card.className = 'order-card';

        let itemsHtml = '';
        Object.keys(order.items).forEach(k => {
            itemsHtml += `<li>${order.items[k]}x ${S[k].n}</li>`;
        });

        card.innerHTML = `
      <div class="order-header">
        <span class="order-title">Pedido #${index + 1} - ${order.nombre}</span>
        <button class="btn sm danger" onclick="deleteOrder(${order.id})">Cancelar Pedido</button>
      </div>
      <div class="order-details">
        <p><strong>Dirección:</strong> ${order.direccion}</p>
        ${order.notas ? `<p><strong>Notas:</strong> ${order.notas}</p>` : ''}
        <strong>Productos:</strong>
        <ul class="order-items-list">${itemsHtml}</ul>
      </div>
    `;
        container.appendChild(card);
    });
}

function deleteOrder(id) {
    const idx = allOrders.findIndex(o => o.id === id);
    if (idx !== -1) {
        allOrders.splice(idx, 1);
        renderOrdersHistory();
    }
}

// Menú móvil
const burger = $('burger'), links = $('links');
burger.onclick = () => {
    const o = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
};
links.querySelectorAll('a').forEach(a => a.onclick = () => {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
});

// Enlace activo según scroll
const secs = [...document.querySelectorAll('main section, footer')];
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
        links.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }
}), { rootMargin: '-40% 0px -40% 0px' });
secs.forEach(s => io.observe(s));

// Año dinámico
$('year').textContent = new Date().getFullYear();
