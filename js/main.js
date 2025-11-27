// ===============================
// main.js - Inicialización global del sitio
// ===============================

document.addEventListener('DOMContentLoaded', async () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Solo cargo restaurantData si la página lo necesita
  loadRestaurantData();

});
document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("chatbot-container");

    // 1) cargar el HTML del chatbot
    const response = await fetch("/chatbot/chatbot.html");
    const html = await response.text();
    container.innerHTML = html;

    // 2) cargar chatbot.js DESPUÉS de cargar el HTML
    const script = document.createElement("script");
    script.src = "/js/chatbot.js";

    script.onload = () => {
        if (typeof initChatbot === "function") {
            initChatbot();   // 👍 ahora chat-content sí existe
        }
    };

    document.body.appendChild(script);

    }
    

    // try {
    //     // Crear chatbot simple inline si no se puede cargar dinámicamente
    //     container.innerHTML = `
    //         <div id="chatbot-toggle">💬</div>
    //         <div id="chatbot-window" style="display:none;">
    //             <div id="chatbot-header">
    //                 <span>Asistente del Shopping</span>
    //                 <button id="chatbot-close">✖</button>
    //             </div>
    //             <div id="chat-content">
    //                 <div class="message-bot">
    //                     <p>¡Hola! Soy el asistente de Alto Saavedra Mall 👋</p>
    //                     <p>¿En qué puedo ayudarte?</p>
    //                     <div class="chat-options">
    //                         <button class="chat-option" onclick="showInfo('horarios')">🕒 Horarios</button>
    //                         <button class="chat-option" onclick="showInfo('ubicacion')">📍 Ubicación</button>
    //                         <button class="chat-option" onclick="showInfo('servicios')">🛠️ Servicios</button>
    //                         <button class="chat-option" onclick="showInfo('contacto')">📞 Contacto</button>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div id="chatbot-footer"></div>
    //         </div>
    //     `;
        
    //     // Configurar funcionalidad básica
    //     setupBasicChatbot();
        
    // } catch (error) {
    //     console.warn('Error cargando chatbot:', error);
    //     container.style.display = 'none';
    // }
);

// Función para chatbot básico
function setupBasicChatbot() {
    const toggle = document.getElementById("chatbot-toggle");
    const window_el = document.getElementById("chatbot-window");
    const close_btn = document.getElementById("chatbot-close");
    
    if (!toggle || !window_el || !close_btn) return;
    
    let isOpen = false;
    
    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        window_el.style.display = isOpen ? 'block' : 'none';
    });
    
    close_btn.addEventListener('click', () => {
        isOpen = false;
        window_el.style.display = 'none';
    });
    
    // Click fuera para cerrar
    window_el.addEventListener('click', (e) => {
        if (e.target === window_el) {
            isOpen = false;
            window_el.style.display = 'none';
        }
    });
}

// Función para mostrar información
function showInfo(type) {
    const content = document.getElementById('chat-content');
    if (!content) return;
    
    const responses = {
        horarios: `
            <div class="message-bot">
                <p><strong>Horarios del Shopping:</strong></p>
                <p>🗓️ Lunes a Domingo: 10:00 - 22:00 hs</p>
                <p>🎄 Días especiales pueden tener horarios diferentes</p>
                <button class="chat-option" onclick="location.reload()">↩️ Volver al inicio</button>
            </div>
        `,
        ubicacion: `
            <div class="message-bot">
                <p><strong>Ubicación:</strong></p>
                <p>📍 Saavedra, Ciudad Autónoma de Buenos Aires</p>
                <p>🚌 Fácil acceso en transporte público</p>
                <p>🚗 Amplio estacionamiento disponible</p>
                <button class="chat-option" onclick="location.reload()">↩️ Volver al inicio</button>
            </div>
        `,
        servicios: `
            <div class="message-bot">
                <p><strong>Nuestros Servicios:</strong></p>
                <p>🅿️ Estacionamiento gratuito</p>
                <p>📶 WiFi libre en todo el shopping</p>
                <p>🏦 Cajeros automáticos</p>
                <p>👶 Zona para niños</p>
                <p>♿ Accesibilidad completa</p>
                <button class="chat-option" onclick="location.reload()">↩️ Volver al inicio</button>
            </div>
        `,
        contacto: `
            <div class="message-bot">
                <p><strong>Contacto:</strong></p>
                <p>📞 Teléfono: +54 11 1234-5678</p>
                <p>✉️ Email: info@altosaavedra.com</p>
                <p>🌐 Web: altosaavedra.com</p>
                <button class="chat-option" onclick="location.reload()">↩️ Volver al inicio</button>
            </div>
        `
    };
    
    content.innerHTML = responses[type] || responses.horarios;
}

// ===============================
// VARIABLES
// ===============================

// ===============================
// VARIABLES - DATOS DE GASTRONOMÍA POPULARES
// ===============================

let restaurantData = {};
// ===============================
// 1) CARGAR DATA DE LOCALES/GASTRONOMÍA
// ===============================

async function loadRestaurantData() {
  try {
    const res = await fetch("./locales/locales.json");
    restaurantData = await res.json();

  } catch (e) {
    console.error("Error cargando locales.json", e);
  }
}

// ===============================
// 2) PASAR DATA A FORMATO PLANO (OPCIONAL)
//    Igual que restaurantDataToLocales que ya usás
// ===============================

function restaurantDataToLocales() {
  const localesConvertidos = [];

  Object.keys(restaurantData).forEach(categoria => {
    restaurantData[categoria].forEach(r => {
      localesConvertidos.push({
        nombre: r.name,
        rubro: r.cuisine,
        url: r.website,
        img: r.image,
        top: r.top,
        left: r.left
      });
    });
  });

  return localesConvertidos;
}

// ===============================
// 3) MOSTRAR RESTAURANTES POR CATEGORÍA
// ===============================

function showRestaurants(category) {
  document.getElementById('categorySection').style.display = 'none';
  document.getElementById('backBtn').style.display = 'block';

  const grid = document.getElementById('restaurantGrid');
  grid.innerHTML = '';
  grid.style.display = 'grid';

  const restaurants = restaurantData[category];

  restaurants.forEach(restaurant => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.onclick = () => openRestaurantModal(restaurant);

    card.innerHTML = `
      <div class="restaurant-image" style="background-image: url('${restaurant.image}')"></div>
      <div class="restaurant-info">
        <h3 class="restaurant-name">${restaurant.name}</h3>
        <p class="restaurant-cuisine">${restaurant.cuisine}</p>
        <p class="restaurant-brief">${restaurant.description.substring(0, 80)}...</p>
        <div class="restaurant-rating">
          <span class="stars">${'★'.repeat(Math.floor(parseFloat(restaurant.rating)))}${'☆'.repeat(5 - Math.floor(parseFloat(restaurant.rating)))}</span>
          <span>${restaurant.rating}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ===============================
// 4) VOLVER A LAS CATEGORÍAS
// ===============================

function showCategories() {
  document.getElementById('categorySection').style.display = 'grid';
  document.getElementById('restaurantGrid').style.display = 'none';
  document.getElementById('backBtn').style.display = 'none';
}

// ===============================
// 5) MODAL RESTAURANTE
// ===============================

function openRestaurantModal(restaurant) {
  document.getElementById('modalTitle').textContent = restaurant.name;
  document.getElementById('modalSubtitle').textContent = restaurant.cuisine;

  const details = document.getElementById('modalDetails');
  details.innerHTML = `
    <div class="restaurant-modal-image" style="background-image: url('${restaurant.image}')"></div>
    <div class="detail-item">
      <span class="detail-label">Descripción:</span>
      <span>${restaurant.description}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Horarios:</span>
      <span>${restaurant.horarios}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Precio:</span>
      <span>${restaurant.precio}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Calificación:</span>
      <span>${'★'.repeat(Math.floor(parseFloat(restaurant.rating)))}${'☆'.repeat(5 - Math.floor(parseFloat(restaurant.rating)))} ${restaurant.rating}</span>
    </div>
  `;

  document.getElementById('visitBtn').href = restaurant.website;
  document.getElementById('restaurantModal').style.display = 'block';
}

function closeRestaurantModal() {
  document.getElementById('restaurantModal').style.display = 'none';
}

// ===============================
// 6) EVENTOS DE MODAL
// ===============================

if (document.getElementById('restaurantModal')) {

  window.addEventListener('click', function (event) {
    const modal = document.getElementById('restaurantModal');
    if (event.target === modal) {
      closeRestaurantModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeRestaurantModal();
    }
  });
}
