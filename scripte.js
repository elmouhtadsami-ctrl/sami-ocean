document.addEventListener('DOMContentLoaded', () => {

    // Header Scroll Effect
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const bars = document.querySelectorAll('.bar');

    mobileMenuBtn.addEventListener('click', () => {
        toggleMenu();
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    function toggleMenu() {
        mobileMenuOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll'); // Prevent background scrolling

        // Animate Hamburger
        if (mobileMenuOverlay.classList.contains('active')) {
            bars[0].style.transform = 'rotate(45deg) translate(8px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(7px, -5px)';
            mobileMenuBtn.style.position = 'fixed';
            mobileMenuBtn.style.right = '20px'; // Align with padding
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
            mobileMenuBtn.style.position = 'relative';
            mobileMenuBtn.style.right = '0';
        }
    }

    // Scroll Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Menu Filtering
    const tabBtns = document.querySelectorAll('.tab-btn');
    const menuItemsForFilter = document.querySelectorAll('.menu-item');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            menuItemsForFilter.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Re-trigger animation for filtered items
                    setTimeout(() => {
                        item.classList.add('active');
                    }, 50);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('active');
                }
            });
        });
    });

    // Smooth Scroll for Anchor Links (Polyfill-like behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize Cart
    if (typeof Cart !== 'undefined') {
        Cart.init();
    }

    // Menu Item Add-To-Cart Handlers (buttons)
    const addBtns = document.querySelectorAll('.add-btn');

    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemEl = btn.closest('.menu-item');
            const id = itemEl.dataset.id || itemEl.querySelector('h3').textContent.trim().toLowerCase().replace(/\s+/g,'-');
            const name = itemEl.dataset.name || itemEl.querySelector('h3').textContent.trim();
            const price = parseFloat((itemEl.dataset.price || (itemEl.querySelector('.price') ? itemEl.querySelector('.price').textContent.replace(/[^\d.]/g,'') : '0')) || 0);
            const image = itemEl.dataset.image || (itemEl.querySelector('img') ? itemEl.querySelector('img').src : '');

            // Add to cart
            Cart.addItem(id, name, price, image);

            // Button feedback
            btn.classList.add('added');
            setTimeout(() => btn.classList.remove('added'), 600);

            // Flying image animation
            const img = itemEl.querySelector('img');
            if (img) animateFlyToCart(img, document.getElementById('openCartBtn'));
        });
    });

    function animateFlyToCart(imgEl, targetEl) {
        if (!imgEl || !targetEl) return;
        const rect = imgEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const clone = imgEl.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.opacity = '1';
        clone.style.zIndex = 2000;
        clone.style.borderRadius = '8px';
        clone.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
        document.body.appendChild(clone);
        requestAnimationFrame(() => {
            clone.style.transform = `translate(${targetRect.left - rect.left}px, ${targetRect.top - rect.top}px) scale(0.2)`;
            clone.style.opacity = '0.2';
        });
        setTimeout(() => clone.remove(), 900);
    }

    // Cart Icon Buttons - Open Cart Sheet
    const openCartBtn = document.getElementById('openCartBtn');
    if (openCartBtn) openCartBtn.addEventListener('click', openCartSheet);

    // Close cart via overlay or close button
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartOverlayEl = document.getElementById('cartOverlay');
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartSheet);
    if (cartOverlayEl) cartOverlayEl.addEventListener('click', closeCartSheet);

    // Order Type Toggle - Desktop
    const orderTypeToggle = document.getElementById('orderTypeToggle');
    const mobileOrderTypeToggle = document.getElementById('mobileOrderTypeToggle');
    const cartOrderTypeLabel = document.getElementById('cartOrderTypeLabel');

    function updateOrderType(isTakeaway) {
        const type = isTakeaway ? 'takeaway' : 'dine-in';
        Cart.setOrderType(type);

        // Sync both toggles
        if (orderTypeToggle) orderTypeToggle.checked = isTakeaway;
        if (mobileOrderTypeToggle) mobileOrderTypeToggle.checked = isTakeaway;

        // Update cart label
        if (cartOrderTypeLabel) {
            cartOrderTypeLabel.textContent = isTakeaway ? 'Order Type: Takeaway' : 'Order Type: Dine-in';
        }

        // Update CTA button
        const ctaBtn = document.getElementById('cartCtaBtn');
        if (ctaBtn) {
            if (isTakeaway) {
                ctaBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Checkout (Takeaway)';
            } else {
                ctaBtn.innerHTML = '<i class="fa-solid fa-chair"></i> Checkout';
            }
        }
    }

    if (orderTypeToggle) {
        orderTypeToggle.addEventListener('change', (e) => {
            updateOrderType(e.target.checked);
        });
    }

    if (mobileOrderTypeToggle) {
        mobileOrderTypeToggle.addEventListener('change', (e) => {
            updateOrderType(e.target.checked);
        });
    }

    // Use Cart's built-in badge update/animation (single badge in navbar)

    // CTA Button Click Handler -> Redirect to WhatsApp with order details
    const cartCtaBtn = document.getElementById('cartCtaBtn');
    if (cartCtaBtn) {
        cartCtaBtn.addEventListener('click', () => {
            const count = Cart.getItemCount();
            if (count === 0) return;

            const total = Cart.getTotal().toFixed(0);
            const type = Cart.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway';

            // Build message
            let message = `Sami Ocean - New Order\n\nOrder type: ${type}\n\nItems:`;

            Cart.items.forEach(item => {
                const lineTotal = (item.price * item.quantity).toFixed(0);
                message += `\n- ${item.name} x ${item.quantity} @ ${item.price} DH = ${lineTotal} DH`;
            });

            message += `\n\nTotal: ${total} DH\n\nPlease add delivery address or any notes here:`;

            const encoded = encodeURIComponent(message);
            // Use the business WhatsApp number from footer (international, no + or 00)
            const waNumber = '212655555555';
            const waUrl = `https://wa.me/${waNumber}?text=${encoded}`;

            // Open WhatsApp in a new tab/window
            window.open(waUrl, '_blank');

            // Clear cart after redirect
            if (typeof Cart.clearAll === 'function') {
                Cart.clearAll();
            } else {
                Cart.items = [];
                Cart.save();
                Cart.updateUI();
            }

            closeCartSheet();
        });
    }

    // Clear All button (in cart header)
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (!confirm('Clear all items from the cart?')) return;
            if (typeof Cart.clearAll === 'function') {
                Cart.clearAll();
            } else {
                Cart.items = [];
                Cart.save();
                Cart.updateUI();
            }
            closeCartSheet();
            console.log('localStorage cleared');
        });
    }

    // Initialize order type from saved state
    if (Cart.orderType === 'takeaway') {
        updateOrderType(true);
    }

});
