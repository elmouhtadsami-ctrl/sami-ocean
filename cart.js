// Cart State Management Module
const Cart = {
    items: [],
    orderType: 'dine-in', // 'dine-in' or 'takeaway'

    // Initialize cart from localStorage
    init() {
        const savedCart = localStorage.getItem('samiOceanCart');
        const savedOrderType = localStorage.getItem('samiOceanOrderType');

        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        if (savedOrderType) {
            this.orderType = savedOrderType;
        }

        this.updateUI();
    },

    // Save cart to localStorage
    save() {
        localStorage.setItem('samiOceanCart', JSON.stringify(this.items));
        localStorage.setItem('samiOceanOrderType', this.orderType);
    },

    // Add item to cart
    addItem(id, name, price, image) {
        const idStr = id != null ? String(id) : null;
        const nameStr = name != null ? String(name) : '';

        const existingItem = this.items.find(item => (
            (idStr && item.id === idStr) ||
            (item.name && item.name.toLowerCase() === nameStr.toLowerCase())
        ));

        if (existingItem) {
            existingItem.quantity += 1;
            // update price/image if provided
            if (price) existingItem.price = parseFloat(price);
            if (image) existingItem.image = image;
        } else {
            this.items.push({
                id: idStr || (nameStr.toLowerCase().replace(/\s+/g, '-')),
                name: nameStr,
                price: parseFloat(price) || 0,
                image: image || '',
                quantity: 1
            });
        }

        this.save();
        this.updateUI();
        this.animateBadge();
        return true;
    },

    // Remove item from cart
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
        this.updateUI();
    },

    // Update item quantity
    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.save();
                this.updateUI();
            }
        }
    },

    // Get total item count
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get total price
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Set order type
    setOrderType(type) {
        this.orderType = type;
        this.save();
        this.updateOrderTypeUI();
    },

    // Animate badge on add
    animateBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.classList.remove('pulse');
            void badge.offsetWidth; // Trigger reflow
            badge.classList.add('pulse');
        }
    },

    // Update all UI elements
    updateUI() {
        this.updateBadge();
        this.updateCartSheet();
        this.updateOrderTypeUI();
    },

    // Update badge count
    updateBadge() {
        const badge = document.getElementById('cartBadge');
        const count = this.getItemCount();

        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    // Update order type toggle UI
    updateOrderTypeUI() {
        const toggle = document.getElementById('orderTypeToggle');
        const ctaBtn = document.getElementById('cartCtaBtn');

        if (toggle) {
            toggle.checked = this.orderType === 'takeaway';
        }

        if (ctaBtn) {
            if (this.orderType === 'dine-in') {
                ctaBtn.innerHTML = '<i class="fa-solid fa-check"></i> Checkout';
            } else {
                ctaBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Checkout (Takeaway)';
            }
        }
    },

    // Update cart sheet content
    updateCartSheet() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.getElementById('cartContent');

        if (!cartItemsContainer) return;

        const count = this.getItemCount();

        if (count === 0) {
            if (emptyCart) emptyCart.style.display = 'flex';
            if (cartContent) cartContent.style.display = 'none';
        } else {
            if (emptyCart) emptyCart.style.display = 'none';
            if (cartContent) cartContent.style.display = 'block';

            cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">${item.price} DH</span>
                    </div>
                    <div class="cart-item-controls" aria-label="Quantity">
                        <button class="qty-control" onclick="Cart.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-control" onclick="Cart.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <button class="cart-item-delete" onclick="Cart.removeItem('${item.id}')" aria-label="Remove">
                        <i class="fa-solid fa-trash"></i>
                        <span class="sr-only">Remove</span>
                    </button>
                </div>
            `).join('');
        }

        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(0) + ' DH';
        }
    }
};

// Add clearing helper
Cart.clearAll = function () {
    this.items = [];
    try {
        localStorage.removeItem('samiOceanCart');
    } catch (e) {
        console.warn('Could not remove cart from localStorage', e);
    }
    this.updateUI();
};

// Cart Sheet Controls
function openCartSheet() {
    const sheet = document.getElementById('cartSheet');
    const overlay = document.getElementById('cartOverlay');
    if (sheet) {
        sheet.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

function closeCartSheet() {
    const sheet = document.getElementById('cartSheet');
    const overlay = document.getElementById('cartOverlay');
    if (sheet) {
        sheet.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// Make Cart globally available
window.Cart = Cart;
window.openCartSheet = openCartSheet;
window.closeCartSheet = closeCartSheet;
