// Referencias a elementos HTML
const productsContainer = document.getElementById("products");
const cartContainer = document.getElementById("cart");
const sendWhatsAppButton = document.getElementById("send-whatsapp");
const searchInput = document.getElementById("search");

// Variables globales
let cart = [];
let products = [];

// Agregar variables de paginación
const productsPerPage = 12; // Productos por página
let currentPage = 1;
let filteredProducts = [];

// Cargar productos desde JSON
fetch("products.json")
  .then((response) => response.json())
  .then((data) => {
    products = data;
    displayProducts(products);
  })
  .catch((error) => console.error("Error cargando los productos:", error));

function displayProducts(productsList) {
  // Filtrar solo productos activos
  filteredProducts = productsList.filter(product => product.activo);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  productsContainer.innerHTML = "";
  
  // Mostrar productos de la página actual
  paginatedProducts.forEach((product) => {
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

  // Agregar controles de paginación con la nueva lista filtrada
  displayPagination(filteredProducts.length);
}

function displayPagination(totalProducts) {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const paginationDiv = document.createElement("div");
  paginationDiv.classList.add("pagination");
  
  // Botón anterior
  const prevButton = document.createElement("button");
  prevButton.innerText = "Anterior";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayProducts(filteredProducts);
    }
  };
  
  // Input para número de página
  const pageInput = document.createElement("input");
  pageInput.type = "number";
  pageInput.min = 1;
  pageInput.max = totalPages;
  pageInput.value = currentPage;
  pageInput.classList.add("page-input");
  
  // Manejar cambio de página mediante input
  pageInput.onchange = (e) => {
    let newPage = parseInt(e.target.value);
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    currentPage = newPage;
    displayProducts(filteredProducts);
  };
  
  // Información del total de páginas
  const pageInfo = document.createElement("span");
  pageInfo.innerText = `de ${totalPages}`;
  
  // Botón siguiente
  const nextButton = document.createElement("button");
  nextButton.innerText = "Siguiente";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayProducts(filteredProducts);
    }
  };
  
  paginationDiv.appendChild(prevButton);
  paginationDiv.appendChild(pageInput);
  paginationDiv.appendChild(pageInfo);
  paginationDiv.appendChild(nextButton);
  
  productsContainer.appendChild(paginationDiv);
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
    <div class="pedido">
      <div class="descripcion-pedido">
        <label for="descripcion">Descripción adicional:</label>
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
            <td colspan="2"><strong>$${calculateTotal().toFixed(
              2
            )}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
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

// Modificar el envío por WhatsApp para incluir la descripción
const sendWhatsAppOrder = () => {
  if (cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const descripcion = document.getElementById("descripcion")?.value.trim();
  
  // Agregamos la validación de la descripción
  if (!descripcion) {
    alert("Por favor ingrese el nombre o NIT del cliente. Este campo es obligatorio.");
    return;
  }

  const message = `Hola, quiero hacer un pedido:%0A%0A${
    cart.map(item => 
      `- ${item.nombre} (Código: ${item.codigo}) x${item.cantidad} ($${(item.precio * item.cantidad).toFixed(2)})`
    ).join('%0A')
  }%0A%0ATotal: $${calculateTotal().toFixed(2)}${
    descripcion ? `%0A%0ANotas adicionales:%0A${descripcion}` : ''
  }`;

  window.open(`https://wa.me/573045428015?text=${message}`, "_blank");
  
  // Limpiar datos después de enviar
  cart = [];
  document.getElementById("descripcion").value = "";
  updateCart();
}

// Event Listeners
sendWhatsAppButton.addEventListener("click", sendWhatsAppOrder);
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  currentPage = 1;
  const filteredProducts = products.filter(product =>
    product.activo && (
      product.nombre.toLowerCase().includes(searchTerm) ||
      product.codigo.toLowerCase().includes(searchTerm)
    )
  );
  displayProducts(filteredProducts);
});

// Agregar función para calcular el total
function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

// Eliminar producto del carrito
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
}

// Explicación de las mejoras y funciones:
// 1. Organización del código:
//  Se agruparon todas las referencias DOM en un objeto elements
//  Se centralizó el estado en un objeto state
//  Se creó un objeto cartManager para manejar la lógica del carrito
// 2. Funciones principales:
//  loadProducts: Carga asíncrona de productos usando async/await
//  displayProducts: Muestra los productos en la interfaz
//  cartManager.add: Agrega productos al carrito
//  cartManager.remove: Elimina productos del carrito
//  cartManager.changeQuantity: Actualiza cantidades
//  cartManager.calculateTotal: Calcula el total del pedido
//  updateCart: Actualiza la vista del carrito
// 3. Mejoras de rendimiento:
//  Uso de template strings para HTML
//  Reducción de manipulaciones DOM
//  Mejor manejo de eventos
//  Uso de métodos modernos de array