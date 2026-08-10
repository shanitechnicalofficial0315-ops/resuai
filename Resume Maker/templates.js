// templates.js - Shared module for rendering templates from LocalStorage

document.addEventListener('DOMContentLoaded', () => {
    // If we're on a page that needs public templates, render them.
    const grid = document.querySelector('.template-grid');
    if (grid) {
        renderPublicTemplates();
    }
});

function renderPublicTemplates() {
    const grid = document.querySelector('.template-grid');
    if (!grid) return;
    
    // Clear existing static templates if any
    grid.innerHTML = '';
    
    // Load from local storage, default if none
    const templates = JSON.parse(localStorage.getItem('resuai_templates') || '[]');
    
    const activeTemplates = templates.filter(t => (t.active === true || t.status === 'active'));

    if (activeTemplates.length === 0) {
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: #64748b;">No active templates available.</p>';
        return;
    }

    activeTemplates.forEach(tpl => {
        const card = document.createElement('div');
        card.className = 'template-card';

        // Badge if there is a primary tag
        let badgeHtml = '';
        if (Array.isArray(tpl.tags) && tpl.tags.length > 0) {
            badgeHtml = `<span class="template-badge">${tpl.tags[0]}</span>`;
        } else if (tpl.tag) {
            badgeHtml = `<span class="template-badge">${tpl.tag}</span>`;
        }

        // Image with fallback icon
        const imgUrl = tpl.previewImg || tpl.img;
        const icon = tpl.icon || '📄';
        
        card.innerHTML = `
            ${badgeHtml}
            <div style="width: 100%; height: 280px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                <img src="${imgUrl}" alt="${tpl.name} Template" class="template-thumbnail" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 64px; color: #94a3b8; background: #e2e8f0;">
                    ${icon}
                    <span style="font-size: 14px; margin-top: 12px; font-weight: 500;">Preview Unavailable</span>
                </div>
            </div>
            <div class="template-overlay">
                <button class="btn-blue-pill" onclick="${window.location.pathname.includes('dashboard') ? `selectTemplate('${tpl.id}')` : `useTemplate('${tpl.id}')`}">${window.location.pathname.includes('dashboard') ? 'Select' : 'Use This Template'}</button>
            </div>
            <div class="template-info">
                <h4>${tpl.name}</h4>
                <p>${tpl.category}</p>
            </div>
        `;
        
        grid.appendChild(card);
    });
}
