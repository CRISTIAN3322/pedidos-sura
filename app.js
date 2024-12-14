// Referencias a elementos HTML
const productsContainer = document.getElementById("products");
const cartContainer = document.getElementById("cart");
const sendWhatsAppButton = document.getElementById("send-whatsapp");
const searchInput = document.getElementById("search");

// Variables globales
let cart = [];
let products = [];

// Cargar productos desde JSON
fetch("products.json")
  .then((response) => response.json())
  .then((data) => {
    products = data;
    displayProducts(products);
  })
  .catch((error) => console.error("Error cargando los productos:", error));

function displayProducts(productsList) {
  productsContainer.innerHTML = "";
  productsList.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.innerHTML = `
        <img src="${product.imagen}" alt="${product.nombre}">
        <h3>${product.nombre}</h3>
        <p>Código: ${product.codigo}</p>
        <p>Precio: $${product.precio.toFixed(2)}</p>
        <div class="cantidad-container">
          <input type="number" 
                 min="1" 
                 value="1" 
                 class="cantidad-input" 
                 id="cantidad-${product.id}">
          <button onclick="addToCart(${product.id}, '${product.codigo}', '${
      product.nombre
    }', ${product.precio}, document.getElementById('cantidad-${
      product.id
    }').value)">
            Agregar al Carrito
          </button>
        </div>
      `;
    productsContainer.appendChild(productDiv);
  });
}

// También necesitamos modificar la función addToCart para aceptar la cantidad
function addToCart(id, codigo, nombre, precio, cantidad) {
  cantidad = parseInt(cantidad);
  const product = cart.find((item) => item.id === id);
  if (product) {
    product.cantidad += cantidad;
  } else {
    cart.push({ id, codigo, nombre, precio, cantidad });
  }
  updateCart();
}

function updateCart() {
  cartContainer.innerHTML = `
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
            <td colspan="2"><strong>$${calculateTotal().toFixed(
              2
            )}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

  const tbody = cartContainer.querySelector("tbody");

  cart.forEach((item) => {
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
          <button onclick="removeFromCart(${item.id})">Eliminar</button>
        </td>
      `;
    tbody.appendChild(tr);
  });
}

// Agregar función para calcular el total
function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

// Eliminar producto del carrito
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
}

// Enviar pedido por WhatsApp
sendWhatsAppButton.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  let message = "Hola, quiero hacer un pedido:%0A";
  cart.forEach((item) => {
    message += `- ${item.nombre} (Código: ${item.codigo}) x${
      item.cantidad
    } ($${(item.precio * item.cantidad).toFixed(2)})%0A`;
  });
  const total = cart.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );
  message += `Total: $${total.toFixed(2)}`;

  const whatsappURL = `https://wa.me/573045428015?text=${message}`;
  window.open(whatsappURL, "_blank");
});

// Filtrar productos por búsqueda
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm) ||
      product.codigo.toLowerCase().includes(searchTerm)
  );
  displayProducts(filteredProducts);
});
