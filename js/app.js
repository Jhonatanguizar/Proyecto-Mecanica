// Pasar a php para guardar los datos en una base de datos para mas facilidad

document.addEventListener("DOMContentLoaded", cargarCitas);

const form = document.getElementById("formCita");
const lista = document.getElementById("listaCitas");

form.addEventListener("submit", e => {
    e.preventDefault();

    const cita = {
        id: Date.now(),
        nombre: document.getElementById("nombre").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        servicio: document.getElementById("servicio").value,
        descripcion: document.getElementById("descripcion").value
    };

    guardarCita(cita);
    crearCard(cita);

    form.reset();
});

function guardarCita(cita) {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas.push(cita);
    localStorage.setItem("citas", JSON.stringify(citas));
}

function cargarCitas() {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas.forEach(crearCard);
}

function crearCard(cita) {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
        <h3>${cita.nombre}</h3>
        <p><b>Fecha:</b> ${cita.fecha}</p>
        <p><b>Hora:</b> ${cita.hora}</p>
        <p><b>Servicio:</b> ${cita.servicio}</p>
        <p>${cita.descripcion}</p>
        <button onclick="eliminarCita(${cita.id})">Eliminar</button>
    `;

    lista.appendChild(div);
}

function eliminarCita(id) {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas = citas.filter(cita => cita.id !== id);
    localStorage.setItem("citas", JSON.stringify(citas));

    lista.innerHTML = "";
    cargarCitas();
}


/* =============================================
   motorlink — Pagos Pendientes
   js/pagos.js
   ============================================= */

// ---------- DATOS INICIALES ----------
let payments = [
  { id: 1,  cliente: 'Carlos Méndez',  tel: '961 234 5678', servicio: 'Diagnóstico de Motor',    monto: 500, estado: 'vencido',   fecha: '2026-03-10' },
  { id: 2,  cliente: 'Laura Jiménez',  tel: '961 345 6789', servicio: 'Sistema de Frenos',        monto: 700, estado: 'parcial',   fecha: '2026-03-26' },
  { id: 3,  cliente: 'Roberto Torres', tel: '961 456 7890', servicio: 'Mantenimiento General',    monto: 800, estado: 'vencido',   fecha: '2026-03-05' },
  { id: 4,  cliente: 'Ana García',     tel: '961 567 8901', servicio: 'Cambio de Aceite',         monto: 450, estado: 'pendiente', fecha: '2026-03-28' },
  { id: 5,  cliente: 'Miguel Ruiz',    tel: '961 678 9012', servicio: 'Sistema Eléctrico',        monto: 600, estado: 'vencido',   fecha: '2026-03-01' },
  { id: 6,  cliente: 'Sofía Vargas',   tel: '961 789 0123', servicio: 'Alineación y Balanceo',   monto: 400, estado: 'pendiente', fecha: '2026-03-30' },
  { id: 7,  cliente: 'Pedro Castillo', tel: '961 890 1234', servicio: 'Mantenimiento General',   monto: 800, estado: 'parcial',   fecha: '2026-03-27' },
  { id: 8,  cliente: 'Valeria Mora',   tel: '961 901 2345', servicio: 'Diagnóstico de Motor',    monto: 500, estado: 'vencido',   fecha: '2026-03-12' },
  { id: 9,  cliente: 'Ernesto Leal',   tel: '961 012 3456', servicio: 'Sistema de Frenos',       monto: 700, estado: 'pendiente', fecha: '2026-04-02' },
  { id: 10, cliente: 'Diana Solís',    tel: '961 123 4567', servicio: 'Cambio de Aceite',        monto: 450, estado: 'parcial',   fecha: '2026-03-25' },
];

// Colores para los avatares
const AVATAR_COLORS = [
  '#f59e0b', '#6366f1', '#22c55e', '#ef4444',
  '#ec4899', '#0ea5e9', '#14b8a6', '#f97316'
];

let currentFilter = 'todos';

// ---------- UTILIDADES ----------

/**
 * Genera iniciales y color de avatar para un nombre dado.
 */
function getAvatar(name) {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return { initials, color };
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) en formato legible en español.
 */
function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Devuelve el HTML del indicador de días restantes o vencidos.
 */
function daysLabel(str) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d    = new Date(str + 'T00:00:00');
  const diff = Math.round((d - today) / 86400000);

  if (diff < 0)  return `<div class="days-left red">${Math.abs(diff)} días vencido</div>`;
  if (diff === 0) return `<div class="days-left yellow">Vence hoy</div>`;
  return `<div class="days-left">${diff} días restantes</div>`;
}

/**
 * Devuelve el HTML del badge según el estado del pago.
 */
function badgeHTML(estado) {
  const map = {
    vencido:   `<span class="badge badge-red"><span class="dot"></span>Vencido</span>`,
    parcial:   `<span class="badge badge-yellow"><span class="dot"></span>Parcial</span>`,
    pendiente: `<span class="badge badge-blue"><span class="dot"></span>Pendiente</span>`,
  };
  return map[estado] || '';
}

// ---------- RENDERIZADO ----------

/**
 * Renderiza la tabla con el array de pagos recibido.
 */
function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:2.5rem;color:var(--text-muted)">
          Sin resultados
        </td>
      </tr>`;
    return;
  }

  data.forEach(p => {
    const av      = getAvatar(p.cliente);
    const isOv    = p.estado === 'vencido';
    const amtClass = isOv ? 'amount-pending' : p.estado === 'parcial' ? 'amount-partial' : '';

    const tr = document.createElement('tr');
    if (isOv) tr.classList.add('highlight-row');

    tr.innerHTML = `
      <td>
        <div class="client-info">
          <div class="avatar" style="background:${av.color}22;color:${av.color}">${av.initials}</div>
          <div>
            <div class="client-name">${p.cliente}</div>
            <div class="client-phone">${p.tel}</div>
          </div>
        </div>
      </td>
      <td><span class="service-tag">${p.servicio}</span></td>
      <td><span class="amount ${amtClass}">$${p.monto.toLocaleString()} MXN</span></td>
      <td>${badgeHTML(p.estado)}</td>
      <td>
        <div class="due-date ${isOv ? 'overdue' : ''}">${formatDate(p.fecha)}</div>
        ${daysLabel(p.fecha)}
      </td>
      <td>
        <div class="actions">
          <button class="icon-btn pay"  title="Registrar pago"     data-action="pay"    data-id="${p.id}">✓</button>
          <button class="icon-btn"      title="Enviar recordatorio" data-action="remind" data-id="${p.id}" data-name="${p.cliente}">✉</button>
          <button class="icon-btn"      title="Eliminar"            data-action="delete" data-id="${p.id}">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Actualiza las tarjetas de estadísticas.
 */
function updateStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const vencidos   = payments.filter(p => p.estado === 'vencido').length;
  const porVencer  = payments.filter(p => {
    const d    = new Date(p.fecha + 'T00:00:00');
    const diff = Math.round((d - today) / 86400000);
    return diff >= 0 && diff <= 7 && p.estado !== 'vencido';
  }).length;
  const total = payments.reduce((s, p) => s + p.monto, 0);

  document.getElementById('stat-vencidos').textContent  = vencidos;
  document.getElementById('stat-porvencer').textContent = porVencer;
  document.getElementById('stat-total').textContent     = '$' + total.toLocaleString();
}

// ---------- FILTRADO ----------

/**
 * Devuelve los pagos filtrados según el estado activo y el texto de búsqueda.
 */
function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  return payments.filter(p => {
    const matchFilter = currentFilter === 'todos' || p.estado === currentFilter;
    const matchSearch = !q
      || p.cliente.toLowerCase().includes(q)
      || p.servicio.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

// ---------- ACCIONES ----------

/**
 * Marca un pago como liquidado (lo elimina de la lista).
 */
function markPaid(id) {
  payments = payments.filter(p => p.id !== id);
  updateStats();
  renderTable(getFiltered());
  showToast('✓ Pago liquidado y removido');
}

/**
 * Simula el envío de un recordatorio al cliente.
 */
function remind(name) {
  showToast(`📨 Recordatorio enviado a ${name.split(' ')[0]}`);
}

/**
 * Elimina un registro de la lista.
 */
function removeRow(id) {
  payments = payments.filter(p => p.id !== id);
  updateStats();
  renderTable(getFiltered());
  showToast('🗑 Registro eliminado');
}

// ---------- MODAL ----------

function openModal() {
  document.getElementById('modal').classList.add('open');
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('m-fecha').value = today;
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

/**
 * Guarda un nuevo pago desde el formulario del modal.
 */
function savePayment() {
  const c = document.getElementById('m-cliente').value.trim();
  const t = document.getElementById('m-tel').value.trim();
  const s = document.getElementById('m-servicio').value.trim();
  const m = parseFloat(document.getElementById('m-monto').value);
  const e = document.getElementById('m-estado').value;
  const f = document.getElementById('m-fecha').value;

  if (!c || !s || !m || !f) {
    showToast('⚠ Completa los campos requeridos');
    return;
  }

  const newId = payments.length ? Math.max(...payments.map(p => p.id)) + 1 : 1;
  payments.unshift({ id: newId, cliente: c, tel: t || '—', servicio: s, monto: m, estado: e, fecha: f });

  closeModal();
  updateStats();
  renderTable(getFiltered());
  showToast('✓ Pago registrado exitosamente');

  // Limpiar campos
  ['m-cliente', 'm-tel', 'm-servicio', 'm-monto'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ---------- TOAST ----------

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ---------- EVENT LISTENERS ----------

document.addEventListener('DOMContentLoaded', () => {

  // Botón abrir modal
  document.getElementById('btnAbrirModal').addEventListener('click', openModal);

  // Botones cerrar modal
  document.getElementById('btnCerrarModal').addEventListener('click', closeModal);
  document.getElementById('btnCancelar').addEventListener('click', closeModal);

  // Cerrar modal al hacer clic en el overlay
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Guardar pago
  document.getElementById('btnGuardar').addEventListener('click', savePayment);

  // Filtros de estado
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTable(getFiltered());
    });
  });

  // Búsqueda en tiempo real
  document.getElementById('searchInput').addEventListener('input', () => {
    renderTable(getFiltered());
  });

  // Acciones en la tabla (delegación de eventos)
  document.getElementById('tableBody').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id     = parseInt(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === 'pay')    markPaid(id);
    if (action === 'remind') remind(btn.dataset.name);
    if (action === 'delete') removeRow(id);
  });

  // Inicializar
  updateStats();
  renderTable(getFiltered());
});