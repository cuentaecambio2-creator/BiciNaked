// ============================================
// 🚴‍♂️ PEDALSHOP - CONFIGURADOR COMPLETO
// ============================================

class PedalShop {
    constructor() {
        this.productos = [];
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.configBici = {
            cuadro: 'carbon-negro',
            ruedas: '29-aluminio',
            grupo: 'deore',
            precioBase: 1899,
            extras: 0
        };
        this.init();
    }

    init() {
        this.cargarProductos();
        this.setupEventListeners();
        this.renderProductos();
        this.actualizarCarritoUI();
        this.iniciarConfigurador();
    }

    // 📦 PRODUCTOS
    async cargarProductos() {
        // Productos demo (puedes cargar desde JSON)
        this.productos = [
            {
                id: 1, nombre: "MTB Carbon Pro 29", precio: 2899, categoria: "mountain",
                imagen: "🚵‍♂️", stock: 8,
                specs: ["🔧 Carbono 29er", "⚙️ Shimano XT 12v", "💨 1200g cuadro"]
            },
            {
                id: 2, nombre: "Ruta Aero SL8", precio: 4599, categoria: "ruta",
                imagen: "🚴‍♂️", stock: 5,
                specs: ["✈️ Aero Carbono", "⚙️ SRAM Red eTap", "🔥 6.8kg completa"]
            },
            {
                id: 3, nombre: "Gravel Allroad", precio: 2199, categoria: "gravel",
                imagen: "🚴", stock: 12,
                specs: ["🌾 Aluminio 6061", "⚙️ Shimano GRX", "💧 Bidón incluido"]
            },
            {
                id: 4, nombre: "E-Bike Urban X", precio: 3499, categoria: "electrica",
                imagen: "🔋🚴", stock: 6,
                specs: ["⚡ 750Wh Batería", "🏙️ Motor 85Nm", "📱 App conectada"]
            },
            {
                id: 5, nombre: "Casco MIPS Elite", precio: 189, categoria: "accesorios",
                imagen: "⛑️", stock: 25,
                specs: ["🛡️ MIPS Safety", "💨 250g ultraligero", "🎨 12 colores"]
            }
        ];
    }

    renderProductos(filtro = 'all') {
        const grid = document.getElementById('productos-grid');
        const productosFiltrados = filtro === 'all' 
            ? this.productos 
            : this.productos.filter(p => p.categoria === filtro);

        grid.innerHTML = productosFiltrados.map(producto => `
            <div class="producto-card" data-id="${producto.id}">
                <div class="producto-img">${producto.imagen}</div>
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <div class="precio">$${producto.precio.toLocaleString()}</div>
                    <div class="specs">
                        ${producto.specs.map(spec => `<span>${spec}</span>`).join('')}
                    </div>
                    <button class="btn-agregar" data-id="${producto.id}">
                        <i class="fas fa-plus"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        `).join('');

        // Re-asignar event listeners
        this.setupProductoListeners();
    }

    // 🛒 CARRITO
    agregarAlCarrito(idProducto, custom = false) {
        const producto = custom 
            ? { ...this.configBici, id: Date.now(), nombre: 'Bici Personalizada', custom: true }
            : this.productos.find(p => p.id === idProducto);

        const existe = this.carrito.find(item => item.id === producto.id);
        
        if (existe) {
            existe.cantidad += 1;
        } else {
            this.carrito.push({ ...producto, cantidad: 1 });
        }

        this.guardarCarrito();
        this.actualizarCarritoUI();
        this.mostrarNotificacion('¡Agregado al carrito! 🚀');
    }

    removerDelCarrito(id) {
        this.carrito = this.carrito.filter(item => item.id !== id);
        this.guardarCarrito();
        this.actualizarCarritoUI();
    }

    actualizarCantidad(id, cantidad) {
        const item = this.carrito.find(item => item.id === id);
        if (item) {
            item.cantidad = parseInt(cantidad);
            if (item.cantidad <= 0) {
                this.removerDelCarrito(id);
            } else {
                this.guardarCarrito();
                this.actualizarCarritoUI();
            }
        }
    }

    getTotalCarrito() {
        return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    actualizarCarritoUI() {
        document.getElementById('cart-count').textContent = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
        document.getElementById('cartTotal').textContent = this.getTotalCarrito().toLocaleString();
    }

    renderCarrito() {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = this.carrito.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <div class="item-emoji">${item.custom ? '🎨' : item.imagen}</div>
                    <div>
                        <h4>${item.nombre}</h4>
                        <p>$${item.precio.toLocaleString()}</p>
                    </div>
                </div>
                <div class="item-controls">
                    <button onclick="shop.actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="shop.actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    <button class="remove-btn" onclick="shop.removerDelCarrito(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="item-total">$${(item.precio * item.cantidad).toLocaleString()}</div>
            </div>
        `).join('') || '<p style="text-align:center;color:#666;">Tu carrito está vacío 😢</p>';
    }

    // 🎨 CONFIGURADOR 3D
    iniciarConfigurador() {
        this.canvas = document.getElementById('bikeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupConfigListeners();
        this.animarBici();
    }

    setupConfigListeners() {
        // Opciones configurador
        document.querySelectorAll('.opcion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.closest('.opcion').dataset.tipo;
                const valor = e.target.dataset.valor;
                
                // Actualizar selección visual
                e.target.closest('.opciones-lista').querySelectorAll('.opcion-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Actualizar config
                this.configBici[tipo] = valor;
                this.calcularPrecioConfig();
                this.redibujarBici();
            });
        });

        // Comprar config
        document.getElementById('comprarConfig').addEventListener('click', () => {
            this.agregarAlCarrito(null, true);
        });
    }

    calcularPrecioConfig() {
        const precios = {
            'carbon-negro': 0, 'carbon-blanco': 200, 'carbon-rojo': 150,
            '29-aluminio': 0, '275-carbono': 350,
            'deore': 0, 'xt': 450, 'sram': 380
        };

        this.configBici.extras = 
            precios[this.configBici.cuadro] + 
            precios[this.configBici.ruedas] + 
            precios[this.configBici.grupo];

        const precioFinal = this.configBici.precioBase + this.configBici.extras;
        
        document.getElementById('precioConfig').textContent = `$${precioFinal.toLocaleString()}`;
        document.getElementById('precioFinalConfig').textContent = precioFinal.toLocaleString();
    }

    redibujarBici() {
        // Colores según configuración
        const colores = {
            'carbon-negro': '#1a1a1a', 'carbon-blanco': '#f0f0f0', 'carbon-rojo': '#c41e3a'
        };
        
        this.biciColor = colores[this.configBici.cuadro] || '#1a1a1a';
        this.rotation += 0.05;
    }

    animarBici() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar bici simple 3D-like
        this.ctx.save();
        this.ctx.translate(250, 250);
        this.ctx.rotate(this.rotation);
        
        // Cuadro
        this.ctx.fillStyle = this.biciColor;
        this.ctx.fillRect(-80, -20, 160, 40);
        this.ctx.fillRect(-60, -60, 40, 100);
        this.ctx.fillRect(20, -60, 40, 100);
        
        // Ruedas
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(-60, 0, 50, 0, Math.PI * 2);
        this.ctx.arc(60, 0, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Manubrio
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-100, -30);
        this.ctx.lineTo(-140, -50);
        this.ctx.lineTo(-140, -10);
        this.ctx.stroke();
        
        this.ctx.restore();
        this.rotation = this.rotation || 0;
        
        requestAnimationFrame(() => this.animarBici());
    }

    // 🎛️ FILTROS Y EVENTOS
    setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderProductos(e.target.dataset.categoria);
            });
        });

        // Carrito toggle
        document.getElementById('cart-icon').addEventListener('click', () => {
            this.toggleCarrito();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            this.toggleCarrito();
        });

        // Checkout
        document.querySelector('.btn-checkout').addEventListener('click', () => {
            if (this.carrito.length > 0) {
                alert(`¡Redirect a checkout! Total: $${this.getTotalCarrito().toLocaleString()}`);
                // Aquí iría Stripe/PayPal
            }
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    setupProductoListeners() {
        document.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.agregarAlCarrito(id);
                e.target.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
                setTimeout(() => {
                    e.target.innerHTML = '<i class="fas fa-plus"></i> Agregar al carrito';
                }, 1500);
            });
        });
    }

    toggleCarrito() {
        const overlay = document.getElementById('cartOverlay');
        overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
