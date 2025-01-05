# Sistema de Toma de Pedidos - SURA

## Descripción
Sistema web para la gestión y toma de pedidos desarrollado para SURA. Permite visualizar productos, crear órdenes y gestionar pedidos de manera eficiente.

## Estructura del Proyecto 
```
├toma-pedidos-sura/
├── index.html
├── css/
│ └── main.css
├── js/
│ └── app.js
└── data/
└── products.json
```


## Tecnologías Utilizadas
- HTML5
- CSS3
- JavaScript (ES6+)
- JSON para almacenamiento de datos

## Instalación
1. Clona el repositorio:

    bash
    git clone (https://github.com/CRISTIAN3322/pedidos-sura.git)

2. No requiere instalación de dependencias adicionales
3. Abre `index.html` en tu navegador web

## Documentación de Archivos

### index.html
El archivo principal que contiene la estructura de la aplicación.

**Componentes principales:**
- Barra de navegación
- Sección de productos
- Formulario de pedidos
- Carrito de compras

### main.css
Archivo de estilos que define la apariencia visual de la aplicación.

**Características principales:**
- Diseño responsive
- Sistema de grid
- Estilos de componentes
- Variables CSS para consistencia visual

### app.js
Archivo JavaScript que maneja la lógica de la aplicación.

**Funcionalidades principales:**
- Carga de productos desde JSON
- Gestión del carrito de compras
- Validación de formularios
- Procesamiento de pedidos

### products.json
Archivo de datos que contiene la información de los productos.

**Estructura del JSON:**
```json
{
    "products": [
    {
        "id": "string",
        "name": "string",
        "price": "number",
        "description": "string",
        "category": "string"
    }
    ]
}

```

## Uso
1. Abre la aplicación en el navegador
2. Navega por el catálogo de productos
3. Agrega productos al carrito
4. Completa el formulario de pedido
5. Confirma y envía el pedido

## Mantenimiento
Para actualizar los productos:
1. Modifica el archivo `products.json`
2. Sigue la estructura existente del JSON
3. Asegúrate de mantener los tipos de datos correctos

## Soporte
Para reportar problemas o sugerir mejoras:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## Licencia
[Especificar tipo de licencia]

---
