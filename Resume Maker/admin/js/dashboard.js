/**
 * ResuAI Admin Dashboard Logic
 * Handles Tab Switching, Data Binding, Chart.js, and Mock Server actions.
 */

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    loadAdsTxt();
    loadAuditLogs();
});

// --- UI Navigation ---
window.switchTab = function(tabId, element) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Update nav link styles
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
};

// --- Mock Data Initialization ---
function initData() {
    // Users
    if (!localStorage.getItem('resuai_users')) {
        const defaultUsers = [
            { id: 1, name: 'Alice Smith', email: 'alice@example.com', date: '2026-08-01', status: 'Active', resumesCreated: 2 },
            { id: 2, name: 'Bob Jones', email: 'bob@example.com', date: '2026-08-03', status: 'Active', resumesCreated: 1 }
        ];
        // If there's an active session user, add them too
        const activeUserStr = localStorage.getItem('resuai_user');
        if (activeUserStr) {
            try {
                const au = JSON.parse(activeUserStr);
                defaultUsers.push({ id: 3, name: au.name, email: au.email, date: '2026-08-09', status: 'Active', resumesCreated: 0 });
            } catch(e){}
        }
        localStorage.setItem('resuai_users', JSON.stringify(defaultUsers));
    }
    
    // Templates
    if (!localStorage.getItem('resuai_templates')) {
        const defaultTemplates = [
            { id: 'template-modern-clean', name: 'Modern Clean', category: 'Professional', tags: ['Popular', 'Clean'], active: true, status: 'active', previewImg: '../assets/modern_clean_template_1786270401251.png', icon: '📄' },
            { id: 'template-executive-professional', name: 'Executive Professional', category: 'Corporate', tags: ['Premium', 'ATS Friendly'], active: true, status: 'active', previewImg: '../assets/executive_professional_template_1786270414815.png', icon: '💼' },
            { id: 'template-creative-minimal', name: 'Creative Minimal', category: 'Creative', tags: ['New', 'Minimal'], active: true, status: 'active', previewImg: '../assets/creative_minimal_template_1786270430246.png', icon: '🎨' },
            { id: 'template-ats-classic', name: 'ATS Standard', category: 'Standard', tags: ['ATS Safe', 'Classic'], active: true, status: 'active', previewImg: '../assets/ats_standard_template_1786270452761.png', icon: '🎓' }
        ];
        localStorage.setItem('resuai_templates', JSON.stringify(defaultTemplates));
    }
    
    if (!localStorage.getItem('resuai_audit_logs')) {
        const logs = [
            { time: new Date().toISOString(), type: 'SYSTEM_INIT', actor: 'System' }
        ];
        localStorage.setItem('resuai_audit_logs', JSON.stringify(logs));
    }
}

// --- Render Logic ---
function renderDashboard() {
    initData();
    const users = JSON.parse(localStorage.getItem('resuai_users'));
    const templates = JSON.parse(localStorage.getItem('resuai_templates'));
    
    // Update overview stats
    document.getElementById('statTotalUsers').textContent = (1248 + users.length).toLocaleString();
    
    // Render Users Table
    const userTableBody = document.getElementById('userTableBody');
    if (userTableBody) {
        userTableBody.innerHTML = '';
        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            const isBanned = user.status === 'Banned';
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.date}</td>
                <td>${user.resumesCreated || 0}</td>
                <td><span style="color: ${isBanned ? '#ef4444' : '#10b981'}; font-weight:600;">${user.status}</span></td>
                <td>
                    <button class="btn-sm" style="background:var(--brand-blue); color:white; margin-right:4px;" onclick="viewUserResume('${user.email}')">Inspect</button>
                    <button class="btn-sm" style="background:${isBanned ? '#10b981' : '#f59e0b'}; color:white;" onclick="toggleUserStatus(${index})">${isBanned ? 'Unban' : 'Suspend'}</button>
                    <button class="btn-sm" style="background:#fee2e2; color:#ef4444; margin-left: 4px;" onclick="deleteUser(${index})">Delete</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // Render Templates Table
    const templateTableBody = document.getElementById('templateTableBody');
    if (templateTableBody) {
        templateTableBody.innerHTML = '';
        let activeCount = 0;
        templates.forEach((tpl, index) => {
            const isActive = tpl.active !== undefined ? tpl.active : (tpl.status === 'active');
            if (isActive) activeCount++;
            const tr = document.createElement('tr');
            
            // Build tags HTML
            let tagsHtml = '';
            if (Array.isArray(tpl.tags)) {
                tagsHtml = tpl.tags.map(t => `<span style="background: #e0e7ff; color: #2563EB; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${t}</span>`).join('');
            } else if (tpl.tag) { // Fallback for old data
                tagsHtml = `<span style="background: #e0e7ff; color: #2563EB; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${tpl.tag}</span>`;
            }

            const imgUrl = tpl.previewImg || tpl.img;
            const fallbackIcon = tpl.icon || '📄';

            tr.innerHTML = `
                <td>
                    <div style="width: 40px; height: 50px; border-radius: 4px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f8fafc; font-size: 20px;">
                        <img src="${imgUrl}" alt="${tpl.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none;">${fallbackIcon}</span>
                    </div>
                </td>
                <td style="font-weight: 500; color: #0F172A;">${tpl.name}</td>
                <td>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 11px; border: 1px solid #e2e8f0;">${tpl.category || 'General'}</span>
                        ${tagsHtml}
                    </div>
                </td>
                <td>
                    <label class="switch" style="position:relative; display:inline-block; width:34px; height:20px;">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleTemplateStatus(${index})" style="opacity:0; width:0; height:0;">
                        <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:${isActive ? '#10b981' : '#cbd5e1'}; border-radius:34px; transition:.4s;"></span>
                    </label>
                </td>
                <td>
                    <button class="btn-sm" style="background:#2563EB; color:white; border:none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 500;" onclick="openTemplateModal('${tpl.id}')">Edit Config</button>
                </td>
            `;
            templateTableBody.appendChild(tr);
        });
        const activeCountEl = document.getElementById('statActiveTemplates');
        if (activeCountEl) activeCountEl.textContent = activeCount;
    }
}

// Chart.js integration moved to admin-charts.js

// --- Handlers & Mock Server Actions ---
window.toggleUserStatus = function(index) {
    const users = JSON.parse(localStorage.getItem('resuai_users'));
    if (users[index]) {
        users[index].status = users[index].status === 'Active' ? 'Banned' : 'Active';
        localStorage.setItem('resuai_users', JSON.stringify(users));
        logAudit(`User status toggled for ${users[index].email}`);
        renderDashboard();
    }
};

window.deleteUser = function(index) {
    if(confirm('Are you sure you want to permanently delete this user?')) {
        const users = JSON.parse(localStorage.getItem('resuai_users'));
        if (users[index]) {
            logAudit(`User deleted: ${users[index].email}`);
            users.splice(index, 1);
            localStorage.setItem('resuai_users', JSON.stringify(users));
            renderDashboard();
        }
    }
};

window.viewUserResume = function(email) {
    const draft = localStorage.getItem('resuai_draft');
    if (draft) {
        alert(`Inspecting resume draft state for ${email}:\n\n` + draft.substring(0, 300) + '...');
    } else {
        alert(`No resume draft found on this browser for ${email}.`);
    }
    logAudit(`Inspected resume for ${email}`);
};

window.toggleTemplateStatus = function(index) {
    const templates = JSON.parse(localStorage.getItem('resuai_templates'));
    if (templates[index]) {
        templates[index].active = !templates[index].active;
        localStorage.setItem('resuai_templates', JSON.stringify(templates));
        logAudit(`Template '${templates[index].name}' visibility changed`);
        renderDashboard();
    }
};

window.saveMockSettings = function(msg) {
    showToast(msg);
    logAudit(msg);
};

window.saveAdsTxt = function() {
    const val = document.getElementById('adsTxtEditor').value;
    localStorage.setItem('resuai_ads_txt', val);
    showToast('ads.txt updated successfully');
    logAudit('Modified ads.txt root file');
};

function loadAdsTxt() {
    const val = localStorage.getItem('resuai_ads_txt');
    if (val && document.getElementById('adsTxtEditor')) {
        document.getElementById('adsTxtEditor').value = val;
    }
}

// --- Audit Logging ---
function logAudit(eventMsg) {
    if (typeof MockDB !== 'undefined' && MockDB.saveEvent) {
        MockDB.saveEvent({ eventType: eventMsg, userId: 'Admin' });
    } else {
        // Fallback
        const logs = JSON.parse(localStorage.getItem('resuai_audit_logs') || '[]');
        logs.unshift({ time: new Date().toISOString(), type: eventMsg, actor: 'Admin' });
        localStorage.setItem('resuai_audit_logs', JSON.stringify(logs.slice(0, 50)));
    }
    loadAuditLogs();
}

function loadAuditLogs() {
    let logs = [];
    if (localStorage.getItem('resuai_analytics_events')) {
        logs = JSON.parse(localStorage.getItem('resuai_analytics_events')).reverse();
    } else if (localStorage.getItem('resuai_audit_logs')) {
        logs = JSON.parse(localStorage.getItem('resuai_audit_logs'));
    }
    
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    logs.slice(0, 15).forEach(log => {
        const tr = document.createElement('tr');
        const timeStr = new Date(log.timestamp || log.time).toLocaleString();
        tr.innerHTML = `
            <td style="font-size: 12px; color: var(--text-muted);">${timeStr}</td>
            <td style="font-size: 13px; font-weight: 500;">${log.eventType || log.type}</td>
            <td style="font-size: 13px;">${log.userId || log.actor}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Utility ---
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// --- Template Modal Handlers ---
window.openTemplateModal = function(templateId = null) {
    const modal = document.getElementById('templateModal');
    if (!modal) return;
    
    document.getElementById('modalTemplateId').value = templateId || '';
    
    if (templateId) {
        document.getElementById('modalTitle').textContent = 'Edit Template';
        const templates = JSON.parse(localStorage.getItem('resuai_templates') || '[]');
        const tpl = templates.find(t => t.id === templateId);
        if (tpl) {
            document.getElementById('tplName').value = tpl.name || '';
            document.getElementById('tplCategory').value = tpl.category || 'Modern';
            document.getElementById('tplTags').value = Array.isArray(tpl.tags) ? tpl.tags.join(', ') : (tpl.tag || '');
            document.getElementById('tplImage').value = tpl.previewImg || tpl.img || '';
            document.getElementById('tplCss').value = tpl.cssStructure || '';
            document.getElementById('tplStatus').checked = (tpl.status === 'active' || tpl.active === true);
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Upload New Template';
        document.getElementById('tplForm').reset();
        document.getElementById('tplStatus').checked = true;
    }
    
    modal.style.display = 'flex';
};

window.closeTemplateModal = function() {
    const modal = document.getElementById('templateModal');
    if (modal) modal.style.display = 'none';
};

window.saveTemplate = function(event) {
    event.preventDefault();
    const idField = document.getElementById('modalTemplateId').value;
    const name = document.getElementById('tplName').value.trim();
    const category = document.getElementById('tplCategory').value;
    const tagsStr = document.getElementById('tplTags').value;
    const img = document.getElementById('tplImage').value.trim();
    const cssText = document.getElementById('tplCss').value;
    const isActive = document.getElementById('tplStatus').checked;

    const tagsArray = tagsStr.split(',').map(s => s.trim()).filter(s => s);
    const iconMap = { 'Modern': '📄', 'Professional': '💼', 'Creative': '🎨', 'Standard': '🎓', 'Corporate': '🏢' };

    let templates = JSON.parse(localStorage.getItem('resuai_templates') || '[]');

    if (idField) {
        // Update existing
        const idx = templates.findIndex(t => t.id === idField);
        if (idx !== -1) {
            templates[idx].name = name;
            templates[idx].category = category;
            templates[idx].tags = tagsArray;
            templates[idx].previewImg = img;
            templates[idx].cssStructure = cssText;
            templates[idx].status = isActive ? 'active' : 'inactive';
            templates[idx].active = isActive;
            templates[idx].icon = iconMap[category] || '📄';
            logAudit(`Updated template: ${name}`);
        }
    } else {
        // Create new
        const newId = 'tpl_' + Date.now();
        templates.push({
            id: newId,
            name: name,
            category: category,
            tags: tagsArray,
            previewImg: img,
            cssStructure: cssText,
            status: isActive ? 'active' : 'inactive',
            active: isActive,
            icon: iconMap[category] || '📄'
        });
        logAudit(`Created template: ${name}`);
    }

    localStorage.setItem('resuai_templates', JSON.stringify(templates));
    closeTemplateModal();
    renderDashboard();
    showToast('Template saved successfully!');
};
