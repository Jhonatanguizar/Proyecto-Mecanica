

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