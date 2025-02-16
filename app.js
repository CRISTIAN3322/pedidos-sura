// Referencias a elementos HTML
const elements = {
    productsContainer: document.getElementById("products"),
    cartContainer: document.getElementById("cart"),
    sendWhatsAppButton: document.getElementById("send-whatsapp"),
    searchInput: document.getElementById("search"),
    clearCartButton: document.getElementById('clear-cart'),
    descripcionInput: document.getElementById("descripcion")
};

// Variables globales
const state = {
    cart: [],
    products: [],
    productsPerPage: 12,
    currentPage: 1,
    filteredProducts: []
};

// Función para cargar el carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('suraCart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Asegurarnos de que el DOM esté completamente cargado antes de ejecutar loadCart
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    elements.cartContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-item__remove')) {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        }
    });
});

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('suraCart', JSON.stringify(state.cart));
}

// Cargar productos desde JSON
async function loadProducts() {
    try {
        const response = await fetch("products.json");
        state.products = await response.json();
        displayProducts(state.products);
    } catch (error) {
        console.error("Error cargando los productos:", error);
    }
}

// Función para mostrar productos
function displayProducts(productsList) {
    // Filtrar solo productos activos
    state.filteredProducts = productsList.filter(product => product.activo);

    elements.productsContainer.innerHTML = "";

    // Mostrar todos los productos filtrados
    state.filteredProducts.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.innerHTML = `
        <img src="${product.imagen}" alt="${product.nombre}">
        <h4>${product.nombre}</h4>
        <p>Código: ${product.codigo}</p>
        <p>Precio: $${product.precio.toFixed(0)}</p>
        <p class="size-font">${product.barra}</p>
        <div class="cantidad-container">
          <input type="number" 
                 min="1" 
                 value="1" 
                 class="cantidad-input" 
                 id="cantidad-${product.id}">
          <button onclick="addToCart(${product.id}, '${product.codigo}', '${product.nombre}', ${product.precio}, document.getElementById('cantidad-${product.id}').value)">
            Agregar al Carrito
          </button>
        </div>
      `;
        elements.productsContainer.appendChild(productDiv);
    });
}

// Modificar la función que agrega productos al carrito
function addToCart(id, codigo, nombre, precio, cantidad) {
    cantidad = parseInt(cantidad);
    const totalCantidad = state.cart.reduce((sum, item) => sum + item.cantidad, 0) + cantidad;

    // Verificar si la cantidad total excede 200
    if (totalCantidad > 300) {
        alert("No se pueden agregar más de 200 productos al carrito.");
        return;
    }

    const product = state.cart.find((item) => item.id === id);
    if (product) {
        product.cantidad += cantidad;
    } else {
        state.cart.push({ id, codigo, nombre, precio, cantidad });
    }
    updateCart();
    saveCart(); // Guardar después de cada modificación
}

function updateCart() {
    elements.cartContainer.innerHTML = `
    <div class="pedido">
      <div class="descripcion-pedido">
        <label for="descripcion">Pedido para:</label>
        <textarea id="descripcion" rows="3" placeholder="Ingrese nombre ó nit del cliente para el pedido" required></textarea>
      </div>

      <table class="cart-table">
        <thead>
          <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Precio Unit.</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4"><strong>Total del Pedido:</strong></td>
            <td colspan="2"><strong>$${calculateTotal().toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
    `;

    const tbody = elements.cartContainer.querySelector("tbody");

    state.cart.forEach((item) => {
        const total = item.precio * item.cantidad;
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${item.codigo}</td>
      <td>${item.nombre}</td>
      <td>$${item.precio.toFixed(2)}</td>
      <td>
          <input type="number" min="1" value="${item.cantidad}" 
                 onchange="changeQuantity(${item.id}, this.value)">
        </td>
        <td>$${total.toFixed(2)}</td>
        <td>
          <button class="btn-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
        </td>
      `;
        tbody.appendChild(tr);
    });
}

// Modificar el envío por WhatsApp para incluir la descripción y exportar a XLS
const sendWhatsAppOrder = () => {
    if (state.cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const descripcion = document.getElementById("descripcion").value.trim();

    // Agregamos la validación de la descripción
    if (!descripcion) {
        alert("Por favor ingrese el nombre o NIT del cliente. Este campo es obligatorio.");
        return;
    }

    const message = `Hola, quiero hacer un pedido:%0A%0A${
        descripcion ? `Notas adicionales:%0A${descripcion}%0A%0A` : ''
    }${
        state.cart.map(item => 
            `- ${item.nombre} (Código: ${item.codigo}) x${item.cantidad} ($${(item.precio * item.cantidad).toFixed(2)})`
        ).join('%0A')
    }%0A%0ATotal: $${calculateTotal().toFixed(2)}`;

    window.open(`https://wa.me/573118711256?text=${message}`, "_blank");

    // Exportar el carrito a XLS
    exportCartToXLS();

    // Limpiar datos después de enviar
    state.cart = [];
    elements.descripcionInput.value = "";
    updateCart(); // Actualizar la vista del carrito después de limpiar
}

// Función para exportar el carrito a XLS
function exportCartToXLS() {
    const worksheet = XLSX.utils.json_to_sheet(state.cart.map(item => ({
        Código: item.codigo,
        Producto: item.nombre,
        Precio: item.precio,
        Cantidad: item.cantidad,
        Total: (item.precio * item.cantidad).toFixed(2)
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Carrito");

    // Generar el archivo XLSX
    XLSX.writeFile(workbook, "carrito.xlsx");
}

// Event Listeners
elements.sendWhatsAppButton.addEventListener("click", sendWhatsAppOrder);
elements.searchInput.addEventListener("input", () => {
  const searchTerm = elements.searchInput.value.toLowerCase();
  state.currentPage = 1;
  const filteredProducts = state.products.filter(product =>
    product.activo && (
      product.nombre.toLowerCase().includes(searchTerm) ||
      product.codigo.toLowerCase().includes(searchTerm)
    )
  );
  displayProducts(filteredProducts);
});

// Agregar función para calcular el total
function calculateTotal() {
  return state.cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

// Eliminar producto del carrito
function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  updateCart();
  saveCart();
}

// Función para limpiar el carrito
function clearCart() {
    state.cart = [];
    localStorage.removeItem('suraCart');
    updateCart();
}

// Agregar event listener para el botón de limpiar
elements.clearCartButton.addEventListener('click', clearCart);

// Cargar productos al iniciar
loadProducts();

// Función para cambiar la cantidad de un producto
function changeQuantity(id, newQuantity) {
    const item = state.cart.find((item) => item.id === id);
    if (item) {
        item.cantidad = parseInt(newQuantity);
        updateCart();
        saveCart();
    }
}