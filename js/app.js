document.addEventListener("DOMContentLoaded", () => {
  const d = SITE_DATA;
  const $ = (s) => document.querySelector(s);
  const icons = ["🧸","🚗","🧱","🎲","🧩","👧","🎓","🎁"];

  document.title = d.negocio.nombre + " | Catálogo de juguetes";
  $("#brandName").textContent = d.negocio.nombre;
  $("#brandTagline").textContent = d.negocio.lema;
  $("#heroTitle").textContent = "Los mejores juguetes para grandes sonrisas";
  $("#heroText").textContent = "Descubre nuestros productos y encuentra el juguete perfecto para cada ocasión.";
  $("#direccion").textContent = d.negocio.direccion;
  $("#telefono1").textContent = d.negocio.telefono1;
  $("#telefono2").textContent = d.negocio.telefono2;
  $("#horario").textContent = d.negocio.horario;
  $("#footerName").textContent = d.negocio.nombre;

  const wa = "https://wa.me/" + String(d.negocio.whatsapp || "").replace(/\D/g, "");
  $("#whatsappMain").href = wa;
  $("#facebook").href = d.negocio.facebook || "#";
  $("#instagram").href = d.negocio.instagram || "#";
  $("#mapa").href = d.negocio.mapa || "#";

  renderCategories(d.categorias);
  renderProducts();

  $("#search").addEventListener("input", renderProducts);
  $("#categorySelect").addEventListener("change", renderProducts);

  function renderCategories(categories) {
    const wrap = $("#categoryButtons");
    wrap.innerHTML = "";
    categories.forEach((cat, i) => {
      const b = document.createElement("button");
      b.className = "category-pill";
      b.dataset.cat = cat;
      b.innerHTML = `<span>${icons[i % icons.length]}</span> ${escapeHtml(cat)}`;
      wrap.appendChild(b);
    });
    wrap.querySelectorAll(".category-pill").forEach(b => {
      b.addEventListener("click", () => {
        $("#categorySelect").value = b.dataset.cat;
        wrap.querySelectorAll(".category-pill").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        renderProducts();
      });
    });
    $("#categorySelect").innerHTML = '<option value="Todos">Todas las categorías</option>';
    categories.forEach(cat => {
      const o = document.createElement("option");
      o.value = cat; o.textContent = cat;
      $("#categorySelect").appendChild(o);
    });
  }

  function renderProducts() {
    const grid = $("#products");
    const q = $("#search").value.toLowerCase().trim();
    const cat = $("#categorySelect").value;
    grid.innerHTML = "";

    d.productos.filter(p => p.activo !== false).filter(p =>
      (!q || `${p.nombre} ${p.categoria} ${p.descripcion || ""}`.toLowerCase().includes(q)) &&
      (cat === "Todos" || p.categoria === cat)
    ).forEach(p => {
      const card = document.createElement("article");
      card.className = "product-card";
      const price = Number(p.precio || 0).toLocaleString("es-CU", {minimumFractionDigits:2});
      const msg = encodeURIComponent(`Hola, estoy interesado en ${p.nombre} por CUP ${price}.`);
      card.innerHTML = `
        <img src="${escapeAttr(p.imagen)}" alt="${escapeAttr(p.nombre)}" onerror="this.src='img/oso.svg'">
        <div class="product-body">
          <span class="product-category">${escapeHtml(p.categoria)}</span>
          <h3>${escapeHtml(p.nombre)}</h3>
          <p>${escapeHtml(p.descripcion || "")}</p>
          <div class="product-bottom">
            <strong>CUP ${price}</strong>
            <a class="btn-whatsapp" target="_blank" rel="noopener" href="${wa}?text=${msg}">WhatsApp</a>
          </div>
        </div>`;
      grid.appendChild(card);
    });
    $("#productCount").textContent = `${grid.children.length} producto(s)`;
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }
  function escapeAttr(v) { return escapeHtml(v); }
});
