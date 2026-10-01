// MOTORCYCLES GONZÁLEZ - LÓGICA INTERACTIVA GLOBAL

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }
    initAudioEffects();
    initPrepChecklist();
    initKmMaintenanceGuide();
    initQuotationCalculator();
    initBeforeAfterSlider();
});

/* ============================================================
   SISTEMA DE AUDIO SINTETIZADO (Web Audio API)
   ============================================================ */
let soundEnabled = true;
let audioCtx = null;

function initAudioEffects() {
    const toggleBtn = document.getElementById('toggle-sound-btn');
    const statusText = document.getElementById('sound-status');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (statusText) statusText.textContent = `Efectos: ${soundEnabled ? 'ON' : 'OFF'}`;
            if (soundEnabled) playClickSound();
        });
    }
}

function playClickSound() {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(240, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
}

/* ============================================================
   NUEVO MÓDULO INTERACTIVO DE SERVICIOS: 
   GENERADOR DE FICHA DE REVISIÓN TÉCNICA PRESENCIAL
   ============================================================ */
const prepChecklistItems = [
    { id: 'oil_change', label: 'Inspección / Cambio de Aceite y Filtro de Motor', icon: 'droplet' },
    { id: 'carb_sync', label: 'Carburación / Limpieza de Cuerpo de Aceleración', icon: 'zap' },
    { id: 'brake_pads', label: 'Verificación de Pastillas / Zapatas de Freno & Líquido', icon: 'disc' },
    { id: 'chain_slack', label: 'Limpieza, Tensión y Lubricación de Kit de Arrastre', icon: 'settings' },
    { id: 'spark_plug', label: 'Revisión / Cambio de Bujía & Filtro de Aire', icon: 'flame' },
    { id: 'battery_load', label: 'Diagnóstico de Batería, Sistema Eléctrico & Luces', icon: 'cpu' },
    { id: 'fork_seals', label: 'Inspección de Suspensión (Barra Delantera / Retenes)', icon: 'shield' },
    { id: 'general_scan', label: 'Evaluación General de Ruidos o Fugas Mecánicas', icon: 'activity' }
];

let selectedPrepItems = new Set(['oil_change', 'general_scan']);

function initPrepChecklist() {
    const container = document.getElementById('prep-checklist-container');
    const motoInput = document.getElementById('prep-moto');

    if (!container) return;

    if (motoInput) {
        motoInput.addEventListener('input', updatePrepSummary);
    }

    container.innerHTML = prepChecklistItems.map(item => {
        const checked = selectedPrepItems.has(item.id);
        return `
            <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border ${checked ? 'border-brand-orange bg-brand-orange/10' : 'border-slate-800'} cursor-pointer hover:border-brand-orange/40 transition">
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="togglePrepItem('${item.id}')" class="w-4 h-4 accent-brand-orange rounded cursor-pointer">
                    <span class="text-sm font-subheading font-medium text-slate-200">${item.label}</span>
                </div>
                <i data-lucide="${item.icon}" class="w-4 h-4 ${checked ? 'text-brand-orange' : 'text-slate-500'}"></i>
            </label>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    updatePrepSummary();
}

function togglePrepItem(id) {
    playClickSound();
    if (selectedPrepItems.has(id)) {
        selectedPrepItems.delete(id);
    } else {
        selectedPrepItems.add(id);
    }
    initPrepChecklist();
}

function updatePrepSummary() {
    const summaryList = document.getElementById('prep-summary-list');
    const motoInput = document.getElementById('prep-moto');

    if (!summaryList) return;

    const motoVal = motoInput?.value.trim() || 'No especificada';

    let html = `
        <div class="mb-3 font-semibold text-slate-200">
            🏍️ Motocicleta: <span class="text-brand-orange font-bold">${motoVal}</span>
        </div>
        <div class="text-slate-400 mb-1 font-bold">Puntos a evaluar en taller:</div>
    `;

    const selectedLabels = [];
    prepChecklistItems.forEach(item => {
        if (selectedPrepItems.has(item.id)) {
            selectedLabels.push(`• ${item.label}`);
        }
    });

    if (selectedLabels.length === 0) {
        html += `<p class="text-slate-500 italic">Selecciona al menos un punto de revisión...</p>`;
    } else {
        html += `<div class="space-y-1 text-slate-300 font-mono">${selectedLabels.map(l => `<div>${l}</div>`).join('')}</div>`;
    }

    summaryList.innerHTML = html;
}

function sendPrepAppointmentWhatsApp() {
    playClickSound();

    const motoInput = document.getElementById('prep-moto');
    const motoVal = motoInput?.value.trim() || 'Por definir en taller';

    if (selectedPrepItems.size === 0) {
        alert('Por favor selecciona al menos un punto de revisión para tu ficha.');
        return;
    }

    let text = `Hola *Motorcycles González* (Atn. Luis Fernando González),\n\n` +
               `Deseo agendar una *Revisión Técnica Presencial* para mi motocicleta:\n` +
               `🏍️ *Modelo/Marca:* ${motoVal}\n\n` +
               `*Puntos clave a revisar en taller:*\n`;

    prepChecklistItems.forEach(item => {
        if (selectedPrepItems.has(item.id)) {
            text += `• ${item.label}\n`;
        }
    });

    text += `\nEntiendo que el costo exacto y los repuestos necesarios dependerán del modelo, año y disponibilidad tras la revisión presencial.\n\n¿En qué horario tienen disponibilidad para llevar mi moto?`;

    window.open(`https://wa.me/593980583424?text=${encodeURIComponent(text)}`, '_blank');
}

/* ============================================================
   GUÍA INTERACTIVA DE MANTENIMIENTO POR KILOMETRAJE
   ============================================================ */
const kmData = [
    {
        range: '3,000 - 5,000 km',
        title: 'Mantenimiento Básico / Cambio de Aceite',
        badge: 'Servicio Frecuente',
        color: 'border-brand-orange text-brand-orange',
        points: [
            'Cambio de aceite de motor 4T e inspección de tamiz/filtro',
            'Tensionado, limpieza y lubricación profunda de cadena de arrastre',
            'Inspección visual de presión y desgaste de neumáticos',
            'Verificación de maneta de freno y juego libre de clutch'
        ]
    },
    {
        range: '6,000 - 8,000 km',
        title: 'Mantenimiento Intermedio & Frenos',
        badge: 'Seguridad Rodaje',
        color: 'border-emerald-500 text-emerald-400',
        points: [
            'Inspección y limpieza de filtro de aire',
            'Revisión de pastillas/zapatas de freno y nivel de líquido DOT4',
            'Carburación / limpieza básica de sistema de combustión',
            'Calibración de bujía de encendido'
        ]
    },
    {
        range: '10,000 - 12,000 km',
        title: 'Afinación & Revisión Eléctrica',
        badge: 'Rendimiento Óptimo',
        color: 'border-brand-neon text-brand-neon',
        points: [
            'Reemplazo de bujía de encendido (Iridium / Convencional)',
            'Prueba de carga de batería, alternador y luces',
            'Ajuste y calibración de holgura de válvulas de motor',
            'Inspección de retenes y líquido de suspensión delantera'
        ]
    },
    {
        range: '15,000+ km',
        title: 'Mantenimiento General / Correctivo',
        badge: 'Inspección Total',
        color: 'border-amber-500 text-amber-400',
        points: [
            'Inspección de kit de arrastre completo (piñón, catalina, cadena)',
            'Cambio de líquido de frenos y purga del sistema hidráulico',
            'Revisión de cunas de dirección y rodamientos de rueda',
            'Evaluación de discos de clutch / embrague'
        ]
    }
];

let selectedKmIndex = 0;

function initKmMaintenanceGuide() {
    const tabsContainer = document.getElementById('km-tabs-container');
    const panel = document.getElementById('km-info-panel');

    if (!tabsContainer || !panel) return;

    tabsContainer.innerHTML = kmData.map((item, idx) => `
        <button onclick="selectKmTab(${idx})" class="p-3.5 rounded-xl border text-center transition font-subheading font-bold text-xs ${
            idx === selectedKmIndex
                ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
        }">
            <i data-lucide="gauge" class="w-4 h-4 mx-auto mb-1"></i>
            <span>${item.range}</span>
        </button>
    `).join('');

    const active = kmData[selectedKmIndex];
    panel.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
                <span class="text-xs font-subheading uppercase text-slate-400">Rango Seleccionado</span>
                <h3 class="font-heading text-xl font-bold text-white">${active.title}</h3>
            </div>
            <span class="px-3 py-1 rounded bg-slate-900 border ${active.color} font-subheading font-bold text-xs">
                ${active.badge}
            </span>
        </div>
        <div class="space-y-2">
            <h4 class="text-xs font-subheading uppercase text-brand-orange font-bold">Puntos Clave Recomendados a Inspeccionar:</h4>
            <ul class="grid sm:grid-cols-2 gap-3 pt-2">
                ${active.points.map(p => `
                    <li class="flex items-start gap-2 text-slate-200 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                        <span>${p}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-800 text-right">
            <a href="contacto.html" class="inline-flex items-center gap-2 text-xs font-subheading font-bold text-brand-orange hover:text-white transition">
                <span>Agendar revisión para este rango de kilometraje</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function selectKmTab(idx) {
    playClickSound();
    selectedKmIndex = idx;
    initKmMaintenanceGuide();
}

/* ============================================================
   COTIZADOR INTERACTIVO PARA MOTOCICLETAS
   ============================================================ */
const motoTypes = [
    { id: 'scooter', name: 'Scooter / Pasola (110-150cc)', multiplier: 1.0, icon: 'bike' },
    { id: 'street', name: 'Trabajo / Utilitaria (125-250cc)', multiplier: 1.1, icon: 'bike' },
    { id: 'enduro', name: 'Doble Propósito / On-Off', multiplier: 1.25, icon: 'shield' },
    { id: 'sport', name: 'Deportiva / Naked (250cc+)', multiplier: 1.4, icon: 'zap' }
];

const motoServicesList = [
    { id: 'maint', name: 'Mantenimiento General Preventivo', basePrice: 25 },
    { id: 'oil', name: 'Cambio de Aceite 4T + Filtro de Aceite', basePrice: 15 },
    { id: 'carb', name: 'Lavado y Calibración de Carburador / Inyección', basePrice: 20 },
    { id: 'brakes', name: 'Servicio de Frenos (Pastillas + Caliper)', basePrice: 15 },
    { id: 'chain', name: 'Limpieza, Tensión y Lubricación de Cadena', basePrice: 8 },
    { id: 'spark', name: 'Cambio de Bujía Iridium + Filtro de Aire', basePrice: 12 }
];

let selectedMotoType = motoTypes[1];
let selectedMotoServices = new Set(['maint', 'oil']);

function initQuotationCalculator() {
    const typeContainer = document.getElementById('moto-type-selector');
    const servicesContainer = document.getElementById('moto-services-selector');

    if (!typeContainer || !servicesContainer) return;

    typeContainer.innerHTML = motoTypes.map(t => `
        <button onclick="setMotoType('${t.id}')" class="p-3 rounded-xl border text-center transition font-subheading text-xs font-bold ${
            t.id === selectedMotoType.id 
                ? 'bg-brand-orange text-white border-brand-orange shadow-md' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
        }">
            <i data-lucide="${t.icon}" class="w-5 h-5 mx-auto mb-1"></i>
            <span>${t.name}</span>
        </button>
    `).join('');

    servicesContainer.innerHTML = motoServicesList.map(s => {
        const cost = Math.round(s.basePrice * selectedMotoType.multiplier);
        const checked = selectedMotoServices.has(s.id);
        return `
            <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border ${checked ? 'border-brand-orange/60 bg-brand-orange/5' : 'border-slate-800'} cursor-pointer hover:border-brand-orange/40 transition">
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleMotoService('${s.id}')" class="w-4 h-4 accent-brand-orange rounded cursor-pointer">
                    <span class="text-sm font-subheading font-medium text-slate-200">${s.name}</span>
                </div>
                <span class="font-heading text-sm font-bold text-brand-orange">$${cost} USD*</span>
            </label>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    updateMotoQuoteSummary();
}

function setMotoType(id) {
    playClickSound();
    selectedMotoType = motoTypes.find(t => t.id === id) || motoTypes[0];
    initQuotationCalculator();
}

function toggleMotoService(id) {
    playClickSound();
    if (selectedMotoServices.has(id)) {
        selectedMotoServices.delete(id);
    } else {
        selectedMotoServices.add(id);
    }
    initQuotationCalculator();
}

function updateMotoQuoteSummary() {
    const list = document.getElementById('moto-quote-list');
    const totalEl = document.getElementById('moto-quote-total');

    if (!list || !totalEl) return;

    let total = 0;
    const items = [];

    motoServicesList.forEach(s => {
        if (selectedMotoServices.has(s.id)) {
            const cost = Math.round(s.basePrice * selectedMotoType.multiplier);
            total += cost;
            items.push(`
                <div class="flex justify-between items-center py-1 text-xs">
                    <span class="text-slate-300">• ${s.name}</span>
                    <span class="font-semibold text-slate-100">$${cost} USD*</span>
                </div>
            `);
        }
    });

    if (items.length === 0) {
        list.innerHTML = `<p class="text-slate-500 italic text-xs">Selecciona al menos un servicio para ver la estimación...</p>`;
    } else {
        list.innerHTML = items.join('');
    }

    totalEl.textContent = `$${total} USD*`;
}

function sendMotoQuoteWhatsApp() {
    playClickSound();
    if (selectedMotoServices.size === 0) {
        alert('Por favor selecciona al menos un servicio.');
        return;
    }

    let text = `Hola *Motorcycles González* (Atn. Luis Fernando González),\n\nDeseo consultar una estimación para mi moto tipo *${selectedMotoType.name}*:\n\n`;
    let total = 0;

    motoServicesList.forEach(s => {
        if (selectedMotoServices.has(s.id)) {
            const cost = Math.round(s.basePrice * selectedMotoType.multiplier);
            total += cost;
            text += `• ${s.name}: *$${cost} USD aprox.*\n`;
        }
    });

    text += `\n*Referencia Estimada:* *$${total} USD aprox.*\n\nComprendo que el precio final depende de la revisión presencial y escasez/marca de repuestos. ¿Cuándo puedo agendar una revisión técnica?`;

    window.open(`https://wa.me/593980583424?text=${encodeURIComponent(text)}`, '_blank');
}

/* ============================================================
   SLIDER ANTES Y DESPUÉS
   ============================================================ */
function initBeforeAfterSlider() {
    const container = document.getElementById('before-after-container');
    const beforeLayer = document.getElementById('before-image-layer');
    const handle = document.getElementById('slider-handle');

    if (!container || !beforeLayer || !handle) return;

    let isDragging = false;

    function setPos(x) {
        const rect = container.getBoundingClientRect();
        let posX = x - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;
        const pct = (posX / rect.width) * 100;
        beforeLayer.style.width = `${pct}%`;
        handle.style.left = `${pct}%`;
    }

    container.addEventListener('mousedown', (e) => { isDragging = true; setPos(e.clientX); });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (e) => { if (isDragging) setPos(e.clientX); });

    container.addEventListener('touchstart', (e) => { isDragging = true; setPos(e.touches[0].clientX); });
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', (e) => { if (isDragging) setPos(e.touches[0].clientX); });
}

/* ============================================================
   FORMULARIO DE CONTACTO DIRECTO POR WHATSAPP
   ============================================================ */
function sendContactForm(e) {
    e.preventDefault();
    playClickSound();

    const name = document.getElementById('c-name')?.value;
    const phone = document.getElementById('c-phone')?.value;
    const moto = document.getElementById('c-moto')?.value;
    const service = document.getElementById('c-service')?.value;
    const notes = document.getElementById('c-notes')?.value;

    const msg = `Hola *Motorcycles González* (Atn. Luis Fernando González), les contacto desde el sitio web:\n\n` +
                `👤 *Nombre:* ${name}\n` +
                `📱 *Teléfono:* ${phone}\n` +
                `🏍️ *Motocicleta:* ${moto}\n` +
                `🛠️ *Servicio Requerido:* ${service}\n` +
                `📝 *Detalles:* ${notes || 'Consulta general'}`;

    window.open(`https://wa.me/593980583424?text=${encodeURIComponent(msg)}`, '_blank');
}
