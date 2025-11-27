// ===============================
// 1) VARIABLES GLOBALES
// ===============================
let localesData = {};
let localesConvertidos = [];

// ===============================
// 2) CARGAR JSON
// ===============================
async function loadLocalesJson() {
    try {
        const res = await fetch("./locales.json");
        localesData = await res.json();

        console.log("localesData cargado:", localesData);

        // convertir todas las categorías en un array plano
        localesConvertidos = convertToMallLocales(localesData);

        console.log("localesConvertidos:", localesConvertidos);

    } catch (e) {
        console.error("Error cargando locales.json:", e);
    }
}

// ===============================
// 3) CONVERTIR JSON POR CATEGORÍAS A LISTA PLANA
// ===============================
function convertToMallLocales(data) {
    const salida = [];

    Object.keys(data).forEach(categoria => {
        data[categoria].forEach(r => {
            salida.push({
                nombre: r.name,
                rubro: r.cuisine,
                url: r.website,
                img: r.image,
                top: r.top,
                left: r.left
            });
        });
    });

    return salida;
}

// ===============================
// 4) RENDERIZAR MAPA + CARDS
// ===============================
function renderLocalesMall() {

    const $mapContainer = $('#map-container');
    const $listaLocales = $('#lista-locales');
    const $modalOverlay = $('#modal-overlay');

    // NO borrar el mapa, solo los pines
    $mapContainer.find('.map-pin').remove();
    $listaLocales.empty();

    localesConvertidos.forEach((local, index) => {

        // ---------- PIN ----------
        $mapContainer.append(`
            <div class="map-pin" id="pin-${index}"
                style="top:${local.top}; left:${local.left};">
                <div class="pin-tooltip">${local.nombre}</div>
            </div>
        `);

        // ---------- CARD ----------
        $listaLocales.append(`
            <article class="card" id="card-${index}">
                <img class="card__media" src="${local.img}" 
                     alt="${local.nombre}" 
                     style="height:200px;object-fit:cover;">
                <div class="card__body">
                    <h3 class="card__title">${local.nombre}</h3>
                    <p class="card__meta">${local.rubro}</p>
                    <div class="mt-2">
                        <button class="btn btn--primary trigger-modal" data-index="${index}">
                            Ver detalles
                        </button>
                    </div>
                </div>
            </article>
        `);
    });


    // ===============================
    // EVENTOS DE CLICK
    // ===============================

    // PIN → abrir modal
    $('.map-pin').off().click(function () {
        const index = $(this).attr('id').split('-')[1];
        abrirModal(localesConvertidos[index]);
    });

    // CARD → abrir modal
    $('.trigger-modal').off().click(function (e) {
        e.preventDefault();
        const index = $(this).data('index');
        abrirModal(localesConvertidos[index]);
    });

    // Cerrar modal
    $('#close-modal').off().click(() => {
        $modalOverlay.fadeOut(200, () =>
            $modalOverlay.css("display", "none")
        );
    });

    // Click fuera
    $modalOverlay.off().click(function (e) {
        if (e.target === this) {
            $(this).fadeOut(200, () =>
                $(this).css("display", "none")
            );
        }
    });

    // Escape
    $(document).off('keydown').keydown(function (e) {
        if (e.key === "Escape")
            $modalOverlay.fadeOut(200, () =>
                $modalOverlay.css("display", "none")
            );
    });
}

// ===============================
// 5) BUSCADOR DE INFO EXTENDIDA (REUTILIZABLE)
// ===============================
function buscarInfoPorNombre(nombreBuscado) {
    let resultado = null;

    Object.keys(localesData).forEach(categoria => {
        localesData[categoria].forEach(local => {
            if (local.name.toLowerCase() === nombreBuscado.toLowerCase()) {
                resultado = local;
            }
        });
    });

    return resultado;
}

// ===============================
// 6) ABRIR MODAL EXTENDIDO
// ===============================
function abrirModal(local) {

    // 1. Buscar datos extendidos
    const dataCompleta = buscarInfoPorNombre(local.nombre);

    if (!dataCompleta) {
        console.error("No se encontró información extendida para:", local.nombre);
        return;
    }

    // 2. Llenar datos
    $('#modal-img-src').attr('src', dataCompleta.image);
    $('#modal-title').text(dataCompleta.name);
    $('#modal-rubro').text(dataCompleta.cuisine);

    $('#modal-descripcion').text(dataCompleta.description || "Descripción no disponible.");
    $('#modal-especialidad').text(dataCompleta.speciality || "No especificado");
    $('#modal-horarios').text(dataCompleta.hours || "Consultar horarios");
    $('#modal-telefono').text(dataCompleta.phone || "N/A");
    $('#modal-precio').text(dataCompleta.price || "Consultar");

    $('#modal-rating').html(
        `${'★'.repeat(Math.floor(dataCompleta.rating || 4))} ${(dataCompleta.rating || 4)}/5`
    );

    $('#modal-link').attr('href', dataCompleta.website);

    // 3. Mostrar modal centrado
    $("#modal-overlay")
        .css("display", "flex")   // obligatorio para centrar
        .hide()
        .fadeIn(200);
}


// ===============================
// 7) BUSCADOR DE LOCALES
// ===============================
function initSearchFunctionality() {
    const searchInput = $('#buscar-locales');
    
    searchInput.on('input', function() {
        const query = $(this).val().toLowerCase().trim();
        let matches = 0;
        
        if (query === '') {
            $('.card').fadeIn(200);
            $('.map-pin').fadeIn(200);
            $('#no-results').hide();
            return;
        }
        
        // Filtrar cards
        $('.card').each(function() {
            const card = $(this);
            const nombre = card.find('h3').text().toLowerCase();
            const categoria = card.find('p').text().toLowerCase();
            const match = nombre.includes(query) || categoria.includes(query);

            if (match) {
                matches++;
                card.stop(true, true).fadeIn(200);
            } else {
                card.stop(true, true).fadeOut(200);
            }
        });

        // Filtrar pines del mapa
        $('.map-pin').each(function() {
            const pin = $(this);
            const tooltipText = pin.find('.pin-tooltip').text().toLowerCase();
            const match = tooltipText.includes(query);

            if (match) {
                pin.stop(true, true).fadeIn(200);
            } else {
                pin.stop(true, true).fadeOut(200);
            }
        });

        // Mostrar mensaje si no hay resultados
        if (matches === 0) {
            $('#no-results').fadeIn(150);
        } else {
            $('#no-results').fadeOut(150);
        }
    });
}


// ===============================
// 8) TOOLTIP EN HOVER
// ===============================
$(document).ready(async function () {

    $('#year').text(new Date().getFullYear());

    await loadLocalesJson();

    renderLocalesMall();
    
    // Inicializar funcionalidad de búsqueda
    initSearchFunctionality();
});


// ===============================
// 8) TOOLTIP EN HOVER
// ===============================
$(document).on("mouseenter", ".map-pin", function () {
    $(this).find(".pin-tooltip").css("opacity", "1");
});

$(document).on("mouseleave", ".map-pin", function () {
    $(this).find(".pin-tooltip").css("opacity", "0");
});
