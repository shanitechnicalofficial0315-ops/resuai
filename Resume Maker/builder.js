/**
 * builder.js — Visual Dual-Pane Resume Builder with Real-time Rendering & Auto-Save
 */

let resumeState = {
    personal: { name: '', title: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: ''
};

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Populate User Profile Bar
    const user = getCurrentUser();
    if (user) {
        document.getElementById("dashGreeting").textContent = `Welcome back, ${user.name}!`;
        document.getElementById("dashAvatar").innerHTML = user.name.charAt(0).toUpperCase();
    }
    
    // 2. Load State from Local Storage
    const savedState = localStorage.getItem('resuai_draft');
    if (savedState) {
        resumeState = JSON.parse(savedState);
        populateFormsFromState();
    }

    // 3. Init SortableJS for drag-and-drop
    initSortable();

    // 4. Initial Render
    updatePreview();
});

// --- DATA BINDING & AUTO-SAVE ---

function updatePreview() {
    // Read from inputs
    resumeState.personal.name = document.getElementById('r_name').value;
    resumeState.personal.title = document.getElementById('r_title').value;
    resumeState.personal.email = document.getElementById('r_email').value;
    resumeState.personal.phone = document.getElementById('r_phone').value;
    resumeState.personal.location = document.getElementById('r_location').value;
    resumeState.personal.summary = document.getElementById('r_summary').value;
    resumeState.skills = document.getElementById('r_skills').value;

    // Read dynamic lists
    resumeState.experience = Array.from(document.querySelectorAll('.exp-item')).map(item => ({
        role: item.querySelector('.exp-role').value,
        company: item.querySelector('.exp-company').value,
        date: item.querySelector('.exp-date').value,
        desc: item.querySelector('.exp-desc').value
    }));

    resumeState.education = Array.from(document.querySelectorAll('.edu-item')).map(item => ({
        degree: item.querySelector('.edu-degree').value,
        school: item.querySelector('.edu-school').value,
        date: item.querySelector('.edu-date').value
    }));

    // Save & Render
    autoSave();
    renderResume();
    updateATSScore();
    updateProgress();
}

function autoSave() {
    localStorage.setItem('resuai_draft', JSON.stringify(resumeState));
    const status = document.getElementById('saveStatus');
    if(status) {
        status.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Saving...`;
        setTimeout(() => {
            status.innerHTML = `<i class="fa-solid fa-cloud-check"></i> Saved just now`;
        }, 500);
    }
}

// --- DYNAMIC SECTIONS ---

function addExperience(exp = {role: '', company: '', date: '', desc: ''}) {
    const list = document.getElementById('experienceList');
    const div = document.createElement('div');
    div.className = 'exp-item form-group';
    div.style.cssText = 'background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color); cursor: grab;';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-grip-vertical"></i> Drag to reorder</span>
            <button type="button" onclick="this.parentElement.parentElement.remove(); updatePreview();" class="btn-sm" style="background:#fee2e2; color:#ef4444; border:none; padding: 2px 6px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button>
        </div>
        <input type="text" class="exp-role" placeholder="Role/Title" value="${exp.role}" oninput="updatePreview()" style="margin-bottom:8px;">
        <div class="row-split" style="margin-bottom:8px;">
            <input type="text" class="exp-company" placeholder="Company" value="${exp.company}" oninput="updatePreview()">
            <input type="text" class="exp-date" placeholder="Date (e.g. 2020 - Present)" value="${exp.date}" oninput="updatePreview()">
        </div>
        <textarea class="exp-desc" placeholder="Bullet points..." oninput="updatePreview()" style="min-height: 60px;">${exp.desc}</textarea>
    `;
    list.appendChild(div);
    updatePreview();
}

function addEducation(edu = {degree: '', school: '', date: ''}) {
    const list = document.getElementById('educationList');
    const div = document.createElement('div');
    div.className = 'edu-item form-group';
    div.style.cssText = 'background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color); cursor: grab;';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-grip-vertical"></i> Drag to reorder</span>
            <button type="button" onclick="this.parentElement.parentElement.remove(); updatePreview();" class="btn-sm" style="background:#fee2e2; color:#ef4444; border:none; padding: 2px 6px; border-radius:4px;"><i class="fa-solid fa-trash"></i></button>
        </div>
        <input type="text" class="edu-degree" placeholder="Degree/Certificate" value="${edu.degree}" oninput="updatePreview()" style="margin-bottom:8px;">
        <div class="row-split">
            <input type="text" class="edu-school" placeholder="Institution" value="${edu.school}" oninput="updatePreview()">
            <input type="text" class="edu-date" placeholder="Date" value="${edu.date}" oninput="updatePreview()">
        </div>
    `;
    list.appendChild(div);
    updatePreview();
}

function initSortable() {
    if (typeof Sortable !== 'undefined') {
        Sortable.create(document.getElementById('experienceList'), {
            animation: 150,
            onEnd: () => updatePreview()
        });
        Sortable.create(document.getElementById('educationList'), {
            animation: 150,
            onEnd: () => updatePreview()
        });
    }
}

// --- RENDER PREVIEW ---

function renderResume() {
    const container = document.getElementById('resumePreviewContainer');
    if (!container) return;
    
    // We render a standard clean layout. CSS can be targeted by wrapping classes later if templates change.
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid var(--brand-blue); padding-bottom: 20px;">
            <h1 style="font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; letter-spacing: -0.5px;">${resumeState.personal.name || 'Your Name'}</h1>
            <h2 style="font-size: 18px; color: var(--brand-blue); font-weight: 500; margin-bottom: 12px;">${resumeState.personal.title || 'Professional Title'}</h2>
            <div style="font-size: 13px; color: var(--text-secondary); display: flex; justify-content: center; gap: 16px;">
                ${resumeState.personal.email ? `<span><i class="fa-solid fa-envelope"></i> ${resumeState.personal.email}</span>` : ''}
                ${resumeState.personal.phone ? `<span><i class="fa-solid fa-phone"></i> ${resumeState.personal.phone}</span>` : ''}
                ${resumeState.personal.location ? `<span><i class="fa-solid fa-location-dot"></i> ${resumeState.personal.location}</span>` : ''}
            </div>
        </div>
        
        ${resumeState.personal.summary ? `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--brand-blue); margin-bottom: 8px; font-weight: 700;">Professional Summary</h3>
            <p style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">${resumeState.personal.summary}</p>
        </div>` : ''}

        ${resumeState.experience.length > 0 ? `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--brand-blue); margin-bottom: 16px; font-weight: 700;">Experience</h3>
            ${resumeState.experience.map(exp => `
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                        <strong style="font-size: 14px; color: var(--text-primary);">${exp.role}</strong>
                        <span style="font-size: 12px; color: var(--brand-blue); font-weight: 600;">${exp.date}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--text-primary); font-weight: 500; margin-bottom: 8px;">${exp.company}</div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; padding-left: 12px; border-left: 2px solid #e2e8f0;">${exp.desc}</div>
                </div>
            `).join('')}
        </div>` : ''}

        ${resumeState.education.length > 0 ? `
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--brand-blue); margin-bottom: 16px; font-weight: 700;">Education</h3>
            ${resumeState.education.map(edu => `
                <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
                    <div>
                        <strong style="font-size: 14px; color: var(--text-primary); display: block;">${edu.degree}</strong>
                        <span style="font-size: 13px; color: var(--text-secondary);">${edu.school}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--brand-blue); font-weight: 600;">${edu.date}</span>
                </div>
            `).join('')}
        </div>` : ''}

        ${resumeState.skills ? `
        <div>
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--brand-blue); margin-bottom: 12px; font-weight: 700;">Skills</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${resumeState.skills.split(',').map(s => s.trim()).filter(s => s).map(skill => `
                    <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 4px; font-size: 12px; color: var(--text-primary); border: 1px solid #e2e8f0;">${skill}</span>
                `).join('')}
            </div>
        </div>` : ''}
    `;
}

// --- UTILITIES & EXPORT ---

function populateFormsFromState() {
    document.getElementById('r_name').value = resumeState.personal.name;
    document.getElementById('r_title').value = resumeState.personal.title;
    document.getElementById('r_email').value = resumeState.personal.email;
    document.getElementById('r_phone').value = resumeState.personal.phone;
    document.getElementById('r_location').value = resumeState.personal.location;
    document.getElementById('r_summary').value = resumeState.personal.summary;
    document.getElementById('r_skills').value = resumeState.skills;

    document.getElementById('experienceList').innerHTML = '';
    resumeState.experience.forEach(exp => addExperience(exp));
    
    document.getElementById('educationList').innerHTML = '';
    resumeState.education.forEach(edu => addEducation(edu));
}

function loadDemoData() {
    resumeState = {
        personal: { name: 'Sarah Jenkins', title: 'Senior Product Designer', email: 'sarah.j@example.com', phone: '(555) 123-4567', location: 'New York, NY', summary: 'Award-winning product designer with 8+ years of experience in creating user-centric digital products. Proven track record of increasing user engagement by 40% through intuitive UI/UX design and design system implementation.' },
        experience: [
            { role: 'Lead UI/UX Designer', company: 'TechNova Solutions', date: '2021 - Present', desc: '• Directed a team of 5 designers to overhaul the core SaaS platform.\n• Established a unified design system that reduced front-end dev time by 30%.\n• Conducted A/B testing leading to a 22% increase in conversion rates.' },
            { role: 'Product Designer', company: 'CreativePulse Agency', date: '2018 - 2021', desc: '• Designed responsive web apps for Fortune 500 clients.\n• Facilitated user research sessions and synthesized data into actionable user personas.' }
        ],
        education: [
            { degree: 'B.F.A. in Interaction Design', school: 'School of Visual Arts', date: '2014 - 2018' }
        ],
        skills: 'Figma, Sketch, Adobe Creative Suite, UI/UX Design, Prototyping, HTML/CSS, User Research, Agile'
    };
    populateFormsFromState();
    updatePreview();
    showToast('Demo data loaded!', 'success');
}

function exportResume() {
    const format = document.getElementById('exportFormat').value;
    if (format === 'pdf') {
        if (typeof html2pdf === 'undefined') {
            showToast('PDF Engine loading, please try again in a moment.', 'error');
            return;
        }
        const element = document.getElementById('resumePreviewContainer');
        const opt = {
            margin:       0,
            filename:     'Resume.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        showToast('Generating PDF...', 'success');
        html2pdf().set(opt).from(element).save().then(() => {
            showToast('PDF Downloaded!', 'success');
        });
    } else if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeState, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "resume_backup.json");
        dlAnchorElem.click();
        showToast('JSON Backup Downloaded!', 'success');
    } else if (format === 'txt') {
        const text = `${resumeState.personal.name}\n${resumeState.personal.title}\n\nSummary:\n${resumeState.personal.summary}`;
        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "resume.txt");
        dlAnchorElem.click();
        showToast('Text File Downloaded!', 'success');
    }
}

function shareResume() {
    const mockId = Math.random().toString(36).substr(2, 9);
    const mockUrl = `https://resuai.com/view/${mockId}`;
    navigator.clipboard.writeText(mockUrl).then(() => {
        showToast(`Copied shareable link: ${mockUrl}`, 'success');
    });
}

function enhanceText(elementId) {
    const el = document.getElementById(elementId);
    if (!el.value.trim()) {
        showToast('Please write some text first!', 'error');
        return;
    }
    const original = el.value;
    el.value = "AI is analyzing and rewriting...";
    el.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        el.value = original + " (Enhanced for clarity, professional tone, and ATS keyword optimization by ResuAI).";
        el.disabled = false;
        updatePreview();
        showToast('Text enhanced successfully!', 'success');
    }, 1500);
}

function updateATSScore() {
    let score = 20; // Base score
    if (resumeState.personal.summary.length > 50) score += 20;
    if (resumeState.experience.length > 0) score += 30;
    if (resumeState.education.length > 0) score += 10;
    if (resumeState.skills.split(',').length > 4) score += 20;
    
    document.getElementById('atsScoreValue').textContent = `${Math.min(score, 100)}%`;
}

function updateProgress() {
    let filled = 0;
    if (resumeState.personal.name) filled += 25;
    if (resumeState.personal.summary) filled += 25;
    if (resumeState.experience.length > 0) filled += 25;
    if (resumeState.skills) filled += 25;
    
    document.getElementById('builderProgress').style.width = `${filled}%`;
}

// Ensure showToast exists (carried over from user.js/auth.js context if needed)
if (typeof showToast !== 'function') {
    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };
}
