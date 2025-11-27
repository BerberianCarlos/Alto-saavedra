let chatbotData = {};
let localesData = {};
let categoriaSeleccionada = null;

// ===============================
// INICIALIZAR CHATBOT
// ===============================
async function initChatbot() {

    // cargar chatbot.json
    chatbotData = await (await fetch("./chatbot/chatbot.json")).json();

    localesData = await (await fetch("./locales/locales.json")).json?.() 
        || window.localesData;
    configurarToggleChatbot();   // ← añadir esta línea

    renderNode("inicio");
}

// ===============================
// RENDERIZAR UN NODO DEL CHATBOT
// ===============================
function renderNode(nodeKey) {

    const node = chatbotData[nodeKey];
    if (!node) {
        console.error("Nodo inexistente:", nodeKey);
        return;
    }

    const chat = document.getElementById("chat-content");

    // Mensaje principal
    chat.innerHTML += `
        <div class="bot-msg msg-fade">${node.mensaje}</div>
    `;

    // --- NODO DINÁMICO -> LISTA DE CATEGORÍAS ---
    if (node.dinamico === "categorias") {

        const div = document.createElement("div");
        div.className = "options";

        for (const cat of Object.keys(localesData)) {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = formatearCategoria(cat);
            btn.onclick = () => {
                categoriaSeleccionada = cat;
                renderNode("locales");
            };
            div.appendChild(btn);
        }

        chat.appendChild(div);
    }

    // --- NODO DINÁMICO -> LISTA DE LOCALES ---
    if (node.dinamico === "locales") {

        const div = document.createElement("div");
        div.className = "options";

        for (const loc of localesData[categoriaSeleccionada]) {

            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerHTML = `
                ${loc.name}
                <br>
                <small>${loc.cuisine}</small>
            `;
            btn.onclick = () => mostrarLocal(loc);

            div.appendChild(btn);
        }

        chat.appendChild(div);
    }

    // --- BOTONES ESTÁTICOS ---
    if (node.opciones) {

        const cont = document.createElement("div");
        cont.className = "options";

        for (const op of node.opciones) {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = op.texto;
            btn.onclick = () => {
                chat.innerHTML += `<div class="user-msg">${op.texto}</div>`;
                renderNode(op.siguiente);
            };
            cont.appendChild(btn);
        }

        chat.appendChild(cont);
    }

    scrollChatToBottom();
}

// ===============================
// MOSTRAR UN LOCAL
// ===============================
function mostrarLocal(loc) {
    const chat = document.getElementById("chat-content");

    chat.innerHTML += `
        <div class="bot-msg msg-fade">
            <strong>${loc.name}</strong><br>
            ${loc.description}<br><br>
            <a href="${loc.website}" target="_blank" class="option-btn">
                Visitar página
            </a>
        </div>
    `;

    // Agregar botones para volver
    const cont = document.createElement("div");
    cont.className = "options";

    // Botón volver a categorías
    const btnCategorias = document.createElement("button");
    btnCategorias.className = "option-btn msg-fade";
    btnCategorias.textContent = "Volver a categorías";
    btnCategorias.onclick = () => {
        renderNode("categorias");
    };

    // Botón volver al inicio
    const btnInicio = document.createElement("button");
    btnInicio.className = "option-btn msg-fade";
    btnInicio.textContent = "Volver al inicio";
    btnInicio.onclick = () => {
        renderNode("inicio");
    };

    cont.appendChild(btnCategorias);
    cont.appendChild(btnInicio);
    chat.appendChild(cont);

    scrollChatToBottom();
}


// ===============================
// SCROLL AUTOMÁTICO
// ===============================
function scrollChatToBottom() {
    const chat = document.getElementById("chat-content");
    chat.scrollTop = chat.scrollHeight;
}

// ===============================
// FORMATEAR NOMBRE DE CATEGORIA
// ===============================
function formatearCategoria(cat) {
    return {
        cafeterias: "Cafeterías",
        restaurantes: "Restaurantes",
        rapida: "Comida rápida",
        mix: "Otros",
    }[cat] || cat;
}
function configurarToggleChatbot() {
    const toggle = document.getElementById("chatbot-toggle");
    const ventana = document.getElementById("chatbot-window");
    const cerrar = document.getElementById("chatbot-close");

    if (!toggle || !ventana) return;

    let abierto = false; // ESTADO REAL DEL CHATBOT

    const abrir = () => {
        ventana.style.display = "flex";
        ventana.style.opacity = "0";
        ventana.style.transform = "translateY(15px)";

        requestAnimationFrame(() => {
            ventana.style.transition = "opacity .30s ease, transform .30s ease";
            ventana.style.opacity = "1";
            ventana.style.transform = "translateY(0)";
        });

        abierto = true;
    };

    const cerrarVentana = () => {
        ventana.style.transition = "opacity .25s ease, transform .25s ease";
        ventana.style.opacity = "0";
        ventana.style.transform = "translateY(15px)";

        setTimeout(() => {
            ventana.style.display = "none";
            ventana.style.transition = "none";
        }, 250);

        abierto = false;
    };

    // CLICK EN EL BOTON FLOTANTE → TOGGLE
    toggle.onclick = () => {
        if (abierto) {
            cerrarVentana();
        } else {
            abrir();
        }
    };

    // SI USÁS LA X TAMBIÉN CIERRA
    if (cerrar) {
        cerrar.onclick = () => cerrarVentana();
    }
}
