document.addEventListener("DOMContentLoaded", () => {
  const STORAGE = "jugueteria_coliseo_editor_v2";
  const $ = s => document.querySelector(s);
  let data = load();
  let editingId = null;

  fillSite();
  renderCategories();
  renderProducts();

  $("#saveSite").onclick = saveSite;
  $("#categoryForm").onsubmit = addCategory;
  $("#productForm").onsubmit = saveProduct;
  $("#cancelEdit").onclick = cancelEdit;
  $("#download").onclick = downloadData;
  $("#clearLocal").onclick = () => {
    if (confirm("¿Restaurar los datos originales? Se perderán los cambios guardados localmente.")) {
      localStorage.removeItem(STORAGE);
      location.reload();
    }
  };

  $("#pImagenFile").onchange = e => {
    const f = e.target.files[0];
    if (f) $("#pImagen").value = "img/" + f.name;
  };

  function fillSite() {
    const n = data.negocio;
    $("#siteName").value=n.nombre||"";
    $("#tagline").value=n.lema||"";
    $("#direccion").value=n.direccion||"";
    $("#telefono1").value=n.telefono1||"";
    $("#telefono2").value=n.telefono2||"";
    $("#whatsapp").value=n.whatsapp||"";
    $("#horario").value=n.horario||"";
    $("#facebook").value=n.facebook||"";
    $("#instagram").value=n.instagram||"";
    $("#mapa").value=n.mapa||"";
  }

  function saveSite() {
    data.negocio = {
      nombre: $("#siteName").value.trim(),
      lema: $("#tagline").value.trim(),
      direccion: $("#direccion").value.trim(),
      telefono1: $("#telefono1").value.trim(),
      telefono2: $("#telefono2").value.trim(),
      whatsapp: $("#whatsapp").value.trim(),
      horario: $("#horario").value.trim(),
      facebook: $("#facebook").value.trim(),
      instagram: $("#instagram").value.trim(),
      mapa: $("#mapa").value.trim()
    };
    save();
    flash("Datos del negocio guardados.");
  }

  function addCategory(e) {
    e.preventDefault();
    const name = $("#newCategory").value.trim();
    if (!name) return;
    if (data.categorias.some(c => c.toLowerCase() === name.toLowerCase())) return flash("Esa categoría ya existe.", true);
    data.categorias.push(name);
    $("#newCategory").value = "";
    save(); renderCategories(); updateCategorySelect(); flash("Categoría agregada.");
  }

  function renderCategories() {
    const list = $("#categoryList");
    list.innerHTML = "";
    data.categorias.forEach((cat,i) => {
      const li=document.createElement("li");
      li.innerHTML=`<span>🏷️ <b>${esc(cat)}</b></span><button class="danger" data-i="${i}">Eliminar</button>`;
      li.querySelector("button").onclick=()=>{
        const used=data.productos.some(p=>p.categoria===cat);
        if(used) return flash("No se puede eliminar: hay productos usando esta categoría.", true);
        data.categorias.splice(i,1); save(); renderCategories(); updateCategorySelect();
      };
      list.appendChild(li);
    });
    updateCategorySelect();
  }

  function updateCategorySelect() {
    const select=$("#pCategoria");
    select.innerHTML='<option value="">Seleccionar categoría...</option>';
    data.categorias.forEach(c=>{
      const o=document.createElement("option"); o.value=c; o.textContent=c; select.appendChild(o);
    });
    if (editingId) select.value = data.productos.find(p=>p.id===editingId)?.categoria || "";
  }

  function saveProduct(e) {
    e.preventDefault();
    const product = {
      id: editingId || slug($("#pNombre").value.trim()) + "-" + Date.now(),
      nombre: $("#pNombre").value.trim(),
      precio: Number($("#pPrecio").value),
      imagen: $("#pImagen").value.trim(),
      categoria: $("#pCategoria").value,
      descripcion: $("#pDescripcion").value.trim(),
      activo: $("#pActivo").checked
    };
    if (!product.nombre || !product.imagen || !product.categoria || !Number.isFinite(product.precio)) {
      return flash("Completa nombre, precio, imagen y categoría.", true);
    }
    if (editingId) {
      const idx=data.productos.findIndex(p=>p.id===editingId);
      if(idx>=0) data.productos[idx]=product;
    } else data.productos.push(product);
    save(); renderProducts(); resetProductForm(); flash(editingId ? "Producto actualizado." : "Producto agregado.");
  }

  function renderProducts() {
    const list=$("#productList");
    list.innerHTML="";
    data.productos.forEach(p=>{
      const li=document.createElement("li");
      li.className = p.activo === false ? "inactive" : "";
      li.innerHTML=`
        <div class="admin-product-info">
          <img src="${escAttr(p.imagen)}" onerror="this.style.visibility='hidden'">
          <div><strong>${esc(p.nombre)}</strong><small>${esc(p.categoria)} · CUP ${Number(p.precio).toLocaleString("es-CU",{minimumFractionDigits:2})}</small></div>
        </div>
        <div class="row-actions">
          <button class="mini" data-action="edit">Editar</button>
          <button class="mini" data-action="duplicate">Duplicar</button>
          <button class="mini" data-action="toggle">${p.activo===false?"Activar":"Ocultar"}</button>
          <button class="danger" data-action="delete">Eliminar</button>
        </div>`;
      li.querySelector('[data-action="edit"]').onclick=()=>editProduct(p.id);
      li.querySelector('[data-action="duplicate"]').onclick=()=>duplicateProduct(p.id);
      li.querySelector('[data-action="toggle"]').onclick=()=>toggleProduct(p.id);
      li.querySelector('[data-action="delete"]').onclick=()=>deleteProduct(p.id);
      list.appendChild(li);
    });
  }

  function editProduct(id) {
    const p=data.productos.find(x=>x.id===id); if(!p)return;
    editingId=id;
    $("#pNombre").value=p.nombre; $("#pPrecio").value=p.precio; $("#pImagen").value=p.imagen;
    updateCategorySelect(); $("#pCategoria").value=p.categoria; $("#pDescripcion").value=p.descripcion||"";
    $("#pActivo").checked=p.activo!==false; $("#formTitle").textContent="Editar producto";
    $("#saveProductText").textContent="Guardar cambios"; $("#cancelEdit").hidden=false;
    window.scrollTo({top:document.querySelector("#productForm").offsetTop-100,behavior:"smooth"});
  }

  function duplicateProduct(id) {
    const p=data.productos.find(x=>x.id===id); if(!p)return;
    data.productos.push({...p,id:slug(p.nombre)+"-"+Date.now(),nombre:p.nombre+" (copia)"});
    save(); renderProducts(); flash("Producto duplicado.");
  }

  function toggleProduct(id) {
    const p=data.productos.find(x=>x.id===id); if(!p)return;
    p.activo=p.activo===false; save(); renderProducts(); flash(p.activo?"Producto visible.":"Producto ocultado.");
  }

  function deleteProduct(id) {
    const p=data.productos.find(x=>x.id===id); if(!p)return;
    if(confirm(`¿Eliminar "${p.nombre}"?`)){data.productos=data.productos.filter(x=>x.id!==id);save();renderProducts();flash("Producto eliminado.");}
  }

  function cancelEdit(){ resetProductForm(); }
  function resetProductForm(){
    editingId=null; $("#productForm").reset(); $("#pActivo").checked=true;
    $("#formTitle").textContent="Agregar producto"; $("#saveProductText").textContent="Agregar producto"; $("#cancelEdit").hidden=true;
    updateCategorySelect();
  }

  function downloadData(){
    const clean={negocio:data.negocio,categorias:data.categorias,productos:data.productos};
    const text="/* JUGUETERÍA COLISEO - archivo generado por el panel */\nconst SITE_DATA = "+JSON.stringify(clean,null,2)+";\n";
    const blob=new Blob([text],{type:"text/javascript;charset=utf-8"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="data.js";a.click();URL.revokeObjectURL(url);
    flash("data.js descargado. Súbelo a js/data.js en GitHub.");
  }

  function load(){try{return JSON.parse(localStorage.getItem(STORAGE))||clone(SITE_DATA)}catch(e){return clone(SITE_DATA)}}
  function save(){localStorage.setItem(STORAGE,JSON.stringify(data))}
  function clone(x){return JSON.parse(JSON.stringify(x))}
  function slug(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
  function escAttr(v){return esc(v)}
  function flash(msg,error=false){const el=$("#message");el.textContent=msg;el.className=error?"message error":"message";clearTimeout(flash.t);flash.t=setTimeout(()=>el.textContent="",3500)}
});
