/* ===== MERCADO AMIGO - Main JavaScript v2 ===== */

// ---------- CATEGORÃAS POR DEFECTO ----------
const DEFAULT_CATEGORIAS = [
  { id: 'vehiculos', nombre: 'VehÃ­culos', icono: 'ðŸš—' },
  { id: 'inmuebles', nombre: 'Inmuebles', icono: 'ðŸ ' },
  { id: 'empleo', nombre: 'Empleo', icono: 'ðŸ’¼' },
  { id: 'servicios', nombre: 'Servicios', icono: 'ðŸ”§' },
  { id: 'venta', nombre: 'Venta', icono: 'ðŸ›’' },
  { id: 'compra', nombre: 'Compra', icono: 'ðŸ’°' },
  { id: 'mascotas', nombre: 'Mascotas', icono: 'ðŸ¾' },
  { id: 'educacion', nombre: 'EducaciÃ³n', icono: 'ðŸ“š' },
  { id: 'eventos', nombre: 'Eventos', icono: 'ðŸŽ‰' },
  { id: 'otros', nombre: 'Otros', icono: 'ðŸ“Œ' }
];

// ---------- CONFIGURACIÃ“N POR DEFECTO ----------
const DEFAULT_CONFIG = {
  maxFotos: 3,
  maxCaracteres: 500,
  maxAvisosPorUsuario: 5
};

// ---------- CREDENCIALES ADMIN POR DEFECTO ----------
const DEFAULT_ADMIN = {
  usuario: 'admin',
  contrasena: 'MercadoAmigo2026!'
};

// ---------- TEXTO DE NORMAS POR DEFECTO ----------
const DEFAULT_NORMAS = `Normas de Contenido y Claridad

â€¢ Claridad y sÃ­ntesis: Los mensajes deben ser fÃ¡ciles de leer, entender y recordar.
â€¢ Veracidad: La informaciÃ³n debe ser verÃ­dica y no prestarse a error, engaÃ±o o confusiÃ³n.
â€¢ Respeto: ProhibiciÃ³n de lenguaje ofensivo, discriminatorio, groserÃ­as o contenido inapropiado.
â€¢ IdentificaciÃ³n: Todo aviso debe incluir el emisor (quiÃ©n lo publica), la fecha y la finalidad clara.`;

// ---------- STORAGE HELPER ----------
const Storage = {
  get(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ---------- GETTERS / SETTERS ----------
function getAvisos() {
  return Storage.get('ma_avisos', []);
}

function saveAvisos(avisos) {
  Storage.set('ma_avisos', avisos);
}

function getConfig() {
  return Storage.get('ma_config', DEFAULT_CONFIG);
}

function saveConfig(config) {
  Storage.set('ma_config', config);
}

function getCategorias() {
  return Storage.get('ma_categorias', DEFAULT_CATEGORIAS);
}

function saveCategorias(cats) {
  Storage.set('ma_categorias', cats);
}

function getNormas() {
  return Storage.get('ma_normas', DEFAULT_NORMAS);
}

function saveNormas(texto) {
  Storage.set('ma_normas', texto);
}

function getAdmin() {
  return Storage.get('ma_admin', DEFAULT_ADMIN);
}

function saveAdmin(adminData) {
  Storage.set('ma_admin', adminData);
}

function isAdminLoggedIn() {
  return sessionStorage.getItem('ma_admin_logged') === 'true';
}

function setAdminLoggedIn(val) {
  sessionStorage.setItem('ma_admin_logged', val ? 'true' : 'false');
}

// ---------- GENERAR ID ÃšNICO ----------
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ---------- TOAST NOTIFICATION ----------
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ---------- CONVERTIR IMAGENES A BASE64 ----------
function filesToBase64(files) {
  return new Promise((resolve) => {
    const promises = [];
    const config = getConfig();
    const maxFiles = Math.min(files.length, config.maxFotos);

    for (let i = 0; i < maxFiles; i++) {
      promises.push(new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.readAsDataURL(files[i]);
      }));
    }
    Promise.all(promises).then(resolve);
  });
}

// ---------- CONTAR AVISOS POR USUARIO ----------
function contarAvisosUsuario(correo, telefono) {
  const avisos = getAvisos();
  const identificador = correo || telefono;
  if (!identificador) return 0;
  return avisos.filter(a => {
    if (correo && a.correo) return a.correo.toLowerCase() === correo.toLowerCase();
    if (telefono && a.telefono) return a.telefono === telefono;
    return false;
  }).length;
}

// ---------- OBTENER NOMBRE DE CATEGORÃA ----------
function getCategoryName(catId) {
  const cats = getCategorias();
  const cat = cats.find(c => c.id === catId);
  return cat ? cat.nombre : catId;
}

// ---------- RENDER CATEGORÃAS (index) ----------
function renderCategories(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cats = getCategorias();
  container.innerHTML = cats.map(cat => `
    <button class="cat-btn" data-cat="${cat.id}" onclick="${onSelect}('${cat.id}')">
      <div class="icon">${cat.icono}</div>
      <div>${cat.nombre}</div>
    </button>
  `).join('');
}

// ---------- RENDER AVISOS CARDS ----------
function renderCards(containerId, avisos) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (avisos.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#6b7280;padding:32px;">No hay avisos para mostrar.</p>';
    return;
  }

  container.innerHTML = avisos.map(aviso => {
    const fotoPrincipal = aviso.fotos && aviso.fotos.length > 0
      ? `<img src="${aviso.fotos[0]}" alt="${aviso.titulo}">`
      : '<span style="font-size:.8rem;color:#9ca3af;">Sin imagen</span>';

    const popularBadge = aviso.popular ? '<span class="popular-badge">â­ Popular</span>' : '';

    const whatsappLink = aviso.whatsapp
      ? `<a href="https://wa.me/${aviso.whatsapp.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp" onclick="event.stopPropagation()">ðŸ“± WhatsApp</a>`
      : '';

    const phoneLink = aviso.telefono
      ? `<a href="tel:${aviso.telefono}" class="btn-phone" onclick="event.stopPropagation()">ðŸ“ž Llamar</a>`
      : '';

    return `
      <div class="card" onclick="openAvisoModal('${aviso.id}')">
        ${popularBadge}
        <div class="card-img">${fotoPrincipal}</div>
        <div class="card-body">
          <span class="category-tag">${getCategoryName(aviso.categoria)}</span>
          <h3>${aviso.titulo}</h3>
          <p class="desc">${aviso.descripcion}</p>
          <div class="contact-row">
            ${phoneLink}
            ${whatsappLink}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- MODAL DE AVISO ----------
function openAvisoModal(avisoId) {
  const avisos = getAvisos();
  const aviso = avisos.find(a => a.id === avisoId);
  if (!aviso) return;

  const modal = document.getElementById('avisoModal');
  if (!modal) return;

  document.getElementById('modalTitle').textContent = aviso.titulo;
  document.getElementById('modalCategory').textContent = getCategoryName(aviso.categoria);
  document.getElementById('modalDesc').textContent = aviso.descripcion;

  const photosContainer = document.getElementById('modalPhotos');
  if (aviso.fotos && aviso.fotos.length > 0) {
    photosContainer.innerHTML = aviso.fotos.map(f => `<img src="${f}" alt="Foto">`).join('');
    photosContainer.style.display = 'grid';
  } else {
    photosContainer.style.display = 'none';
  }

  const contactContainer = document.getElementById('modalContact');
  let contactHTML = '';
  if (aviso.telefono) {
    contactHTML += `<a href="tel:${aviso.telefono}" class="btn-phone" style="padding:10px 20px;">ðŸ“ž ${aviso.telefono}</a>`;
  }
  if (aviso.whatsapp) {
    contactHTML += `<a href="https://wa.me/${aviso.whatsapp.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp" style="padding:10px 20px;">ðŸ“± WhatsApp: ${aviso.whatsapp}</a>`;
  }
  contactContainer.innerHTML = contactHTML;

  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('avisoModal');
  if (modal) modal.classList.remove('active');
}

// ---------- BUSCAR / FILTRAR ----------
let filtroActual = '';

function filtrarPorCategoria(catId) {
  if (filtroActual === catId) {
    limpiarFiltro();
    return;
  }

  filtroActual = catId;

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === catId);
  });

  buscarAvisos();
}

function buscarAvisos() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let avisos = getAvisos().filter(a => a.estado === 'aprobado');

  if (filtroActual) {
    avisos = avisos.filter(a => a.categoria === filtroActual);
  }

  if (query) {
    avisos = avisos.filter(a =>
      a.titulo.toLowerCase().includes(query) ||
      a.descripcion.toLowerCase().includes(query) ||
      getCategoryName(a.categoria).toLowerCase().includes(query) ||
      (a.nombre && a.nombre.toLowerCase().includes(query))
    );
  }

  renderCards('avisosGrid', avisos);
}

function limpiarFiltro() {
  filtroActual = '';
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  loadMainPage();
}

// ---------- POPUP NORMAS ----------
function openNormasPopup() {
  const popup = document.getElementById('normasPopup');
  if (!popup) return;

  const textoNormas = document.getElementById('normasTextDisplay');
  if (textoNormas) textoNormas.textContent = getNormas();

  const checkbox = document.getElementById('normasCheckbox');
  if (checkbox) checkbox.checked = false;

  const confirmBtn = document.getElementById('normasConfirmBtn');
  if (confirmBtn) confirmBtn.disabled = true;

  popup.classList.add('active');
}

function closeNormasPopup() {
  const popup = document.getElementById('normasPopup');
  if (popup) popup.classList.remove('active');
}

function toggleNormasConfirm() {
  const checkbox = document.getElementById('normasCheckbox');
  const confirmBtn = document.getElementById('normasConfirmBtn');
  if (checkbox && confirmBtn) {
    confirmBtn.disabled = !checkbox.checked;
  }
}

function confirmarNormas() {
  closeNormasPopup();
  const formSection = document.getElementById('publicar');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ---------- ENVIAR NUEVO AVISO ----------
async function submitAviso(event) {
  event.preventDefault();

  const config = getConfig();
  const avisos = getAvisos();

  const titulo = document.getElementById('avisoTitulo').value.trim();
  const categoria = document.getElementById('avisoCategoria').value;
  const descripcion = document.getElementById('avisoDescripcion').value.trim();
  const nombre = document.getElementById('avisoNombre').value.trim();
  const correo = document.getElementById('avisoCorreo').value.trim();
  const telefono = document.getElementById('avisoTelefono').value.trim();
  const whatsapp = document.getElementById('avisoWhatsapp').value.trim();
  const fileInput = document.getElementById('avisoFotos');

  // Validaciones
  if (!titulo || !categoria || !descripcion || !nombre || !correo) {
    showToast('Por favor completa todos los campos obligatorios', 'error');
    return;
  }

  if (descripcion.length > config.maxCaracteres) {
    showToast(`La descripciÃ³n no puede exceder ${config.maxCaracteres} caracteres`, 'error');
    return;
  }

  // Verificar lÃ­mite de avisos por usuario
  const avisoCount = contarAvisosUsuario(correo, telefono);
  if (avisoCount >= config.maxAvisosPorUsuario) {
    showToast(`Has alcanzado el lÃ­mite de ${config.maxAvisosPorUsuario} avisos`, 'error');
    return;
  }

  // Convertir fotos
  let fotos = [];
  if (fileInput && fileInput.files.length > 0) {
    if (fileInput.files.length > config.maxFotos) {
      showToast(`MÃ¡ximo ${config.maxFotos} fotos permitidas`, 'error');
      return;
    }
    fotos = await filesToBase64(fileInput.files);
  }

  const nuevoAviso = {
    id: generateId(),
    titulo,
    categoria,
    descripcion,
    nombre,
    correo,
    telefono,
    whatsapp,
    fotos,
    estado: 'pendiente',
    popular: false,
    fecha: new Date().toISOString()
  };

  avisos.push(nuevoAviso);
  saveAvisos(avisos);

  showToast('Aviso enviado correctamente. SerÃ¡ publicado tras aprobaciÃ³n.');
  event.target.reset();

  const preview = document.getElementById('fotosPreview');
  if (preview) preview.innerHTML = '';
}

// ---------- PREVIEW DE FOTOS ----------
function previewFotos(event) {
  const preview = document.getElementById('fotosPreview');
  if (!preview) return;

  preview.innerHTML = '';
  const config = getConfig();
  const files = Array.from(event.target.files).slice(0, config.maxFotos);

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;margin:4px;';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// ---------- CARGAR PÃGINA PRINCIPAL ----------
function loadMainPage() {
  const avisos = getAvisos().filter(a => a.estado === 'aprobado');
  const cats = getCategorias();

  // Populares
  const populares = avisos.filter(a => a.popular);
  renderCards('popularesGrid', populares);

  // Todos
  renderCards('avisosGrid', avisos);

  // CategorÃ­as
  renderCategories('categoriasContainer', 'filtrarPorCategoria');

  // Llenar select de categorÃ­as en el form
  const catSelect = document.getElementById('avisoCategoria');
  if (catSelect) {
    catSelect.innerHTML = '<option value="">Selecciona una categorÃ­a</option>' +
      cats.map(c => `<option value="${c.id}">${c.icono} ${c.nombre}</option>`).join('');
  }
}

// ============ FUNCIONES DEL LOGIN ADMIN ============

function checkAdminAccess() {
  if (!isAdminLoggedIn()) {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminContent').style.display = 'none';
  } else {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    loadAdmin();
  }
}

function adminLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById('loginUsuario').value.trim();
  const contrasena = document.getElementById('loginContrasena').value;

  const adminData = getAdmin();

  if (usuario === adminData.usuario && contrasena === adminData.contrasena) {
    setAdminLoggedIn(true);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    loadAdmin();
    showToast('Bienvenido al panel de administraciÃ³n');
  } else {
    showToast('Usuario o contraseÃ±a incorrectos', 'error');
  }
}

function adminLogout() {
  setAdminLoggedIn(false);
  document.getElementById('loginSection').style.display = 'flex';
  document.getElementById('adminContent').style.display = 'none';
  document.getElementById('loginUsuario').value = '';
  document.getElementById('loginContrasena').value = '';
  showToast('SesiÃ³n cerrada');
}

// ============ FUNCIONES DEL ADMIN ============

function loadAdmin() {
  const avisos = getAvisos();
  const config = getConfig();
  const normas = getNormas();
  const adminData = getAdmin();

  // Stats
  document.getElementById('statTotal').textContent = avisos.length;
  document.getElementById('statPendientes').textContent = avisos.filter(a => a.estado === 'pendiente').length;
  document.getElementById('statAprobados').textContent = avisos.filter(a => a.estado === 'aprobado').length;
  document.getElementById('statPopulares').textContent = avisos.filter(a => a.popular).length;

  // Settings
  document.getElementById('setFotos').value = config.maxFotos;
  document.getElementById('setCaracteres').value = config.maxCaracteres;
  document.getElementById('setAvisos').value = config.maxAvisosPorUsuario;

  // Normas
  const normasTextarea = document.getElementById('normasTextarea');
  if (normasTextarea) normasTextarea.value = normas;

  // Admin credentials display
  const adminUserDisplay = document.getElementById('adminUserDisplay');
  if (adminUserDisplay) adminUserDisplay.textContent = adminData.usuario;

  renderAdminTable();
  renderCategoriasAdmin();
}

// ---------- RENDER TABLA ADMIN ----------
function renderAdminTable(filter = 'todos') {
  let avisos = getAvisos();

  if (filter === 'pendientes') avisos = avisos.filter(a => a.estado === 'pendiente');
  else if (filter === 'aprobados') avisos = avisos.filter(a => a.estado === 'aprobado');
  else if (filter === 'restringidos') avisos = avisos.filter(a => a.estado === 'restringido');

  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;

  if (avisos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;">No hay avisos para mostrar.</td></tr>';
    return;
  }

  tbody.innerHTML = avisos.map(aviso => {
    const statusClass = {
      pendiente: 'status-pending',
      aprobado: 'status-approved',
      restringido: 'status-restricted'
    }[aviso.estado] || 'status-pending';

    const statusText = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      restringido: 'Restringido'
    }[aviso.estado] || aviso.estado;

    const fecha = new Date(aviso.fecha).toLocaleDateString('es-ES');
    const popularIcon = aviso.popular ? ' â­' : '';
    const autorInfo = aviso.nombre || 'N/A';

    return `
      <tr>
        <td>${aviso.titulo}</td>
        <td>${getCategoryName(aviso.categoria)}</td>
        <td>${autorInfo}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${fecha}${popularIcon}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn btn-approve" onclick="adminAction('${aviso.id}','aprobar')" title="Aprobar">âœ“</button>
            <button class="action-btn btn-restrict" onclick="adminAction('${aviso.id}','restringir')" title="Restringir">âš </button>
            <button class="action-btn btn-popular" onclick="adminAction('${aviso.id}','popular')" title="Marcar popular">â­</button>
            <button class="action-btn btn-delete" onclick="adminAction('${aviso.id}','eliminar')" title="Eliminar">âœ•</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ---------- ACCIONES DEL ADMIN ----------
function adminAction(avisoId, action) {
  let avisos = getAvisos();
  const index = avisos.findIndex(a => a.id === avisoId);

  if (index === -1) return;

  switch (action) {
    case 'aprobar':
      avisos[index].estado = 'aprobado';
      showToast('Aviso aprobado correctamente');
      break;
    case 'restringir':
      avisos[index].estado = 'restringido';
      showToast('Aviso restringido');
      break;
    case 'popular':
      avisos[index].popular = !avisos[index].popular;
      showToast(avisos[index].popular ? 'Marcado como popular' : 'Quitado de populares');
      break;
    case 'eliminar':
      if (confirm('Â¿EstÃ¡s seguro de eliminar este aviso?')) {
        avisos.splice(index, 1);
        showToast('Aviso eliminado');
      } else {
        return;
      }
      break;
  }

  saveAvisos(avisos);
  loadAdmin();
}

// ---------- GUARDAR CONFIGURACIÃ“N ----------
function saveAdminConfig() {
  const config = {
    maxFotos: parseInt(document.getElementById('setFotos').value) || 3,
    maxCaracteres: parseInt(document.getElementById('setCaracteres').value) || 500,
    maxAvisosPorUsuario: parseInt(document.getElementById('setAvisos').value) || 5
  };

  saveConfig(config);
  showToast('ConfiguraciÃ³n guardada correctamente');
}

// ---------- GUARDAR NORMAS ----------
function saveNormasAdmin() {
  const textarea = document.getElementById('normasTextarea');
  if (!textarea) return;

  const texto = textarea.value.trim();
  if (!texto) {
    showToast('El texto de normas no puede estar vacÃ­o', 'error');
    return;
  }

  saveNormas(texto);
  showToast('Normas actualizadas correctamente');
}

// ---------- CAMBIAR CREDENCIALES ADMIN ----------
function changeAdminCredentials(event) {
  event.preventDefault();

  const nuevoUsuario = document.getElementById('newUsuario').value.trim();
  const nuevaContrasena = document.getElementById('newContrasena').value;
  const confirmarContrasena = document.getElementById('confirmContrasena').value;

  if (!nuevoUsuario || !nuevaContrasena) {
    showToast('Todos los campos son obligatorios', 'error');
    return;
  }

  if (nuevaContrasena !== confirmarContrasena) {
    showToast('Las contraseÃ±as no coinciden', 'error');
    return;
  }

  if (nuevaContrasena.length < 6) {
    showToast('La contraseÃ±a debe tener al menos 6 caracteres', 'error');
    return;
  }

  saveAdmin({ usuario: nuevoUsuario, contrasena: nuevaContrasena });
  document.getElementById('adminUserDisplay').textContent = nuevoUsuario;

  document.getElementById('newUsuario').value = '';
  document.getElementById('newContrasena').value = '';
  document.getElementById('confirmContrasena').value = '';

  showToast('Credenciales actualizadas correctamente');
}

// ============ GESTIÃ“N DE CATEGORÃAS ============

function renderCategoriasAdmin() {
  const cats = getCategorias();
  const tbody = document.getElementById('categoriasTableBody');
  if (!tbody) return;

  if (cats.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;">No hay categorÃ­as.</td></tr>';
    return;
  }

  tbody.innerHTML = cats.map(cat => `
    <tr>
      <td>${cat.icono}</td>
      <td>${cat.nombre}</td>
      <td>${cat.id}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-restrict" onclick="editCategoria('${cat.id}')" title="Editar">âœï¸</button>
          <button class="action-btn btn-delete" onclick="deleteCategoria('${cat.id}')" title="Eliminar">âœ•</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function addCategoria(event) {
  event.preventDefault();

  const nombre = document.getElementById('catNombre').value.trim();
  const icono = document.getElementById('catIcono').value.trim();

  if (!nombre || !icono) {
    showToast('Nombre e icono son obligatorios', 'error');
    return;
  }

  const cats = getCategorias();
  const id = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  if (cats.find(c => c.id === id)) {
    showToast('Ya existe una categorÃ­a con ese nombre', 'error');
    return;
  }

  cats.push({ id, nombre, icono });
  saveCategorias(cats);

  document.getElementById('catNombre').value = '';
  document.getElementById('catIcono').value = '';

  renderCategoriasAdmin();
  showToast('CategorÃ­a agregada correctamente');
}

function editCategoria(catId) {
  const cats = getCategorias();
  const cat = cats.find(c => c.id === catId);
  if (!cat) return;

  const nuevoNombre = prompt('Nuevo nombre:', cat.nombre);
  if (nuevoNombre === null) return;

  const nuevoIcono = prompt('Nuevo icono:', cat.icono);
  if (nuevoIcono === null) return;

  if (!nuevoNombre.trim() || !nuevoIcono.trim()) {
    showToast('Nombre e icono son obligatorios', 'error');
    return;
  }

  const index = cats.findIndex(c => c.id === catId);
  cats[index].nombre = nuevoNombre.trim();
  cats[index].icono = nuevoIcono.trim();

  saveCategorias(cats);
  renderCategoriasAdmin();
  showToast('CategorÃ­a actualizada');
}

function deleteCategoria(catId) {
  const cats = getCategorias();
  const cat = cats.find(c => c.id === catId);
  if (!cat) return;

  if (!confirm(`Â¿Eliminar la categorÃ­a "${cat.nombre}"? Los avisos con esta categorÃ­a no se eliminarÃ¡n.`)) return;

  const newCats = cats.filter(c => c.id !== catId);
  saveCategorias(newCats);
  renderCategoriasAdmin();
  showToast('CategorÃ­a eliminada');
}

// ---------- TABS DEL ADMIN ----------
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
  document.getElementById(`panel-${tab}`).style.display = 'block';

  if (tab === 'avisos') {
    renderAdminTable('todos');
  } else if (tab === 'categorias') {
    renderCategoriasAdmin();
  }
}

// ---------- FILTRO TABLA ADMIN ----------
function filterAdminTable(filter) {
  renderAdminTable(filter);
}
