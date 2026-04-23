// ---------- Estado Global ----------
let currentDate = new Date(2026, 3, 10); // abril 2026, dia 10
let selectedDate = new Date(2026, 3, 10);   // data selecionada
selectedDate.setHours(0,0,0,0);

// Compromissos simulados: armazenar com chave YYYY-MM-DD
let appointments = new Map(); // key: "2026-04-10", value: array

// ---------- Dados iniciais para demonstração ----------
function initMockData() {
    const sample = [
        { title: "Reunião de equipe", time: "09:30", desc: "Planejamento semana de refrigeração", tag: "Reunião", colorBar: "#3b82f6" },
        { title: "Manutenção preventiva", time: "14:00", desc: "Check-up no compressor", tag: "Manutenção", colorBar: "#10b981" }
    ];
    appointments.set("2026-04-10", sample);
    
    const sample2 = [
        { title: "Entrega de peças", time: "11:00", desc: "Recebimento de componentes", tag: "Pessoal", colorBar: "#f59e0b" }
    ];
    appointments.set("2026-04-15", sample2);
    
    const sample3 = [
        { title: "Treinamento técnico", time: "15:30", desc: "Novos protocolos", tag: "Reunião", colorBar: "#8b5cf6" }
    ];
    appointments.set("2026-04-18", sample3);
}

// ---------- Helpers ----------
function formatDateKey(date) {
    let y = date.getFullYear();
    let m = String(date.getMonth() + 1).padStart(2,'0');
    let d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}

function getAppointmentsForDate(date) {
    let key = formatDateKey(date);
    return appointments.has(key) ? [...appointments.get(key)] : [];
}

function saveAppointmentsForDate(date, list) {
    let key = formatDateKey(date);
    appointments.set(key, list);
    updateUIAfterChanges();
}

function addAppointment(date, newApp) {
    let key = formatDateKey(date);
    let current = appointments.has(key) ? appointments.get(key) : [];
    current.push(newApp);
    appointments.set(key, current);
    updateUIAfterChanges();
}

function deleteAppointment(date, index) {
    let key = formatDateKey(date);
    if(appointments.has(key)) {
        let list = appointments.get(key);
        list.splice(index, 1);
        if(list.length === 0) appointments.delete(key);
        else appointments.set(key, list);
        updateUIAfterChanges();
    }
}

// ---------- Renderização do Calendário ----------
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0=domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    
    for(let i = 0; i < 42; i++) {
        let dayNumber;
        let isCurrentMonth = true;
        let dateObj;
        
        if(i < startWeekday) {
            // dias do mês anterior
            dayNumber = prevMonthDays - startWeekday + i + 1;
            isCurrentMonth = false;
            dateObj = new Date(year, month - 1, dayNumber);
        } else if(i >= startWeekday + daysInMonth) {
            // próximo mês
            dayNumber = i - (startWeekday + daysInMonth) + 1;
            isCurrentMonth = false;
            dateObj = new Date(year, month + 1, dayNumber);
        } else {
            dayNumber = i - startWeekday + 1;
            isCurrentMonth = true;
            dateObj = new Date(year, month, dayNumber);
        }
        
        const cell = document.createElement('div');
        cell.classList.add('day-cell');
        if(!isCurrentMonth) cell.classList.add('other-month');
        cell.textContent = dayNumber;
        
        // verifica se é hoje
        if(dateObj.toDateString() === todayDate.toDateString()) {
            cell.classList.add('today');
        }
        // verifica se é selecionado
        if(selectedDate && dateObj.toDateString() === selectedDate.toDateString()) {
            cell.classList.add('selected');
        }
        cell.addEventListener('click', (function(d) {
            return function() { selectDate(d); };
        })(dateObj));
        
        calendarGrid.appendChild(cell);
    }
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('monthYearDisplay').innerHTML = `${monthNames[month]} ${year}`;
}

// ---------- Selecionar Data ----------
function selectDate(date) {
    selectedDate = new Date(date);
    selectedDate.setHours(0,0,0,0);
    renderCalendar();
    updateCompromissosList();
    updateResumo();
}

// ---------- Atualizar Lista de Compromissos ----------
function updateCompromissosList() {
    const container = document.getElementById('compromissosListContainer');
    const appointmentsList = getAppointmentsForDate(selectedDate);
    const formattedDate = selectedDate.toLocaleDateString('pt-BR');
    document.getElementById('selectedDateBadge').innerText = formattedDate;
    
    if(appointmentsList.length === 0) {
        container.innerHTML = `<div class="empty-message">📭 Nenhum compromisso para este dia.<br>Clique em "+ Novo Compromisso"</div>`;
        return;
    }
    
    container.innerHTML = '';
    appointmentsList.forEach((app, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'compromisso-item';
        // cor lateral dinâmica baseada na tag
        let borderColor = '#3b82f6';
        if(app.tag === 'Reunião') borderColor = '#3b82f6';
        else if(app.tag === 'Manutenção') borderColor = '#10b981';
        else if(app.tag === 'Urgente') borderColor = '#ef4444';
        else if(app.tag === 'Pessoal') borderColor = '#f59e0b';
        else borderColor = '#8b5cf6';
        itemDiv.style.borderLeftColor = borderColor;
        
        itemDiv.innerHTML = `
            <div class="compromisso-info">
                <div class="compromisso-titulo">
                    <span>${escapeHtml(app.title)}</span>
                    <span class="tag">${escapeHtml(app.tag)}</span>
                </div>
                <div class="horario">🕒 ${app.time}</div>
                <div class="descricao">${app.desc ? escapeHtml(app.desc) : 'Sem descrição'}</div>
            </div>
            <div class="acoes">
                <button class="edit-icon" data-index="${idx}" title="Editar">✏️</button>
                <button class="delete-icon" data-index="${idx}" title="Excluir">🗑️</button>
            </div>
        `;
        const delBtn = itemDiv.querySelector('.delete-icon');
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteAppointment(selectedDate, idx);
        });
        const editBtn = itemDiv.querySelector('.edit-icon');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(idx, app);
        });
        container.appendChild(itemDiv);
    });
}

// ---------- Editar Compromisso ----------
function openEditModal(index, oldApp) {
    document.getElementById('modalTitle').value = oldApp.title;
    document.getElementById('modalTime').value = oldApp.time;
    document.getElementById('modalDesc').value = oldApp.desc || '';
    document.getElementById('modalTag').value = oldApp.tag;
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');
    
    const saveHandler = () => {
        const newTitle = document.getElementById('modalTitle').value.trim();
        if(!newTitle) return;
        const updated = {
            title: newTitle,
            time: document.getElementById('modalTime').value,
            desc: document.getElementById('modalDesc').value,
            tag: document.getElementById('modalTag').value,
        };
        let list = getAppointmentsForDate(selectedDate);
        list[index] = updated;
        let key = formatDateKey(selectedDate);
        appointments.set(key, list);
        updateUIAfterChanges();
        modal.classList.remove('active');
        document.getElementById('saveModalBtn').removeEventListener('click', saveHandler);
        document.getElementById('cancelModalBtn').removeEventListener('click', cancelHandler);
    };
    const cancelHandler = () => {
        modal.classList.remove('active');
        document.getElementById('saveModalBtn').removeEventListener('click', saveHandler);
        document.getElementById('cancelModalBtn').removeEventListener('click', cancelHandler);
    };
    document.getElementById('saveModalBtn').addEventListener('click', saveHandler, { once: true });
    document.getElementById('cancelModalBtn').addEventListener('click', cancelHandler, { once: true });
}

// ---------- Atualizar UI após mudanças ----------
function updateUIAfterChanges() {
    renderCalendar();
    updateCompromissosList();
    updateResumo();
}

// ---------- Atualizar Card Resumo ----------
function updateResumo() {
    let total = 0;
    for(let list of appointments.values()) total += list.length;
    const dayAppointments = getAppointmentsForDate(selectedDate);
    document.getElementById('totalCount').innerText = total;
    document.getElementById('dayCount').innerText = dayAppointments.length;
    document.getElementById('resumoData').innerText = selectedDate.toLocaleDateString('pt-BR');
}

// ---------- Utilitário de Escape HTML ----------
function escapeHtml(str) { 
    if(!str) return ''; 
    return str.replace(/[&<>]/g, function(m){
        if(m==='&') return '&amp;'; 
        if(m==='<') return '&lt;'; 
        if(m==='>') return '&gt;'; 
        return m;
    });
}

// ---------- Modal Novo Compromisso ----------
function openNewAppointmentModal() {
    document.getElementById('modalTitle').value = '';
    document.getElementById('modalTime').value = '12:00';
    document.getElementById('modalDesc').value = '';
    document.getElementById('modalTag').value = 'Reunião';
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');
    
    const saveNew = () => {
        const title = document.getElementById('modalTitle').value.trim();
        if(!title) return;
        const newApp = {
            title: title,
            time: document.getElementById('modalTime').value,
            desc: document.getElementById('modalDesc').value,
            tag: document.getElementById('modalTag').value,
        };
        addAppointment(selectedDate, newApp);
        modal.classList.remove('active');
        document.getElementById('saveModalBtn').removeEventListener('click', saveNew);
        document.getElementById('cancelModalBtn').removeEventListener('click', cancelNew);
    };
    const cancelNew = () => {
        modal.classList.remove('active');
        document.getElementById('saveModalBtn').removeEventListener('click', saveNew);
        document.getElementById('cancelModalBtn').removeEventListener('click', cancelNew);
    };
    document.getElementById('saveModalBtn').addEventListener('click', saveNew, { once: true });
    document.getElementById('cancelModalBtn').addEventListener('click', cancelNew, { once: true });
}

// ---------- Navegação entre Meses ----------
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// ---------- Troca de Abas ----------
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(`${tabId}Content`).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}

// ---------- Inicialização da Aplicação ----------
function init() {
    initMockData();
    renderCalendar();
    selectDate(selectedDate);
    updateResumo();
    
    // Event Listeners
    document.getElementById('prevMonthBtn').addEventListener('click', prevMonth);
    document.getElementById('nextMonthBtn').addEventListener('click', nextMonth);
    document.getElementById('newAppointmentBtn').addEventListener('click', openNewAppointmentModal);
    document.getElementById('cancelModalBtn').addEventListener('click', () => document.getElementById('modalOverlay').classList.remove('active'));
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

// Inicia a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);