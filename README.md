# Juguetería Coliseo — GitHub Pages

Plantilla estática para catálogo de juguetes. 

## Lo que puedes editar desde `admin.html`

- Nombre y lema del negocio
- Dirección
- Móviles
- WhatsApp
- Horario
- Facebook / Instagram / Google Maps
- Crear y eliminar categorías
- Agregar productos
- Editar productos
- Duplicar productos
- Ocultar/activar productos
- Eliminar productos
- Precio
- Imagen
- Descripción

## Publicar

1. Sube todo el proyecto a un repositorio de GitHub.
2. Activa GitHub Pages desde `Settings > Pages`.
3. Abre `admin.html` en tu sitio.
4. Realiza los cambios.
5. Pulsa `Descargar data.js`.
6. Reemplaza `js/data.js` en GitHub.
7. Sube las imágenes nuevas a `img/`.
8. Espera la actualización de GitHub Pages.

## Producto

```js
{
  id: "oso-peluche",
  nombre: "Oso de Peluche",
  precio: 1250,
  imagen: "img/oso.jpg",
  categoria: "Peluches",
  descripcion: "Suave y perfecto para regalar.",
  activo: true
}
```

### ¿Por qué hay que subir `data.js`?

GitHub Pages sirve archivos estáticos. Una página pública no debe contener un token privado de GitHub para escribir automáticamente en tu repositorio. Por eso el panel genera el archivo final y tú lo subes de forma segura.

### Imágenes

El panel puede ayudarte a obtener el nombre del archivo, pero por seguridad del navegador no puede copiar una imagen directamente al repositorio. Sube la imagen a `img/` y escribe, por ejemplo:

`img/oso.jpg`

Los formatos recomendados son JPG, PNG, WEBP o SVG.
