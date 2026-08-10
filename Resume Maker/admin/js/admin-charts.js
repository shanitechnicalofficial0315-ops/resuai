// admin-charts.js - Handles all visualization logic for the Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // Wait for a short delay to ensure Chart.js is loaded if deferred
    setTimeout(initDashboardCharts, 100);
});

function initDashboardCharts() {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded.");
        return;
    }

    renderGrowthChart();
    renderTemplatePopularityChart();
}

function renderGrowthChart() {
    const growthCtx = document.getElementById('growthChart');
    if (!growthCtx) return;

    const ctx = growthCtx.getContext('2d');
    
    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(2, 132, 199, 0.4)'); // ResuAI blue (#0284C7)
    gradient.addColorStop(1, 'rgba(2, 132, 199, 0.0)');

    // Parse real data from localStorage
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('resuai_users')) || [];
    } catch(e) {}

    let dates = [];
    let counts = [];

    if (users.length > 5) {
        // Group by date
        const countsByDate = {};
        users.forEach(u => {
            if (!u.date) return;
            const d = new Date(u.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            countsByDate[d] = (countsByDate[d] || 0) + 1;
        });
        
        dates = Object.keys(countsByDate).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
        counts = dates.map(d => countsByDate[d]);
    } else {
        // Mock fallback data (Last 7 days)
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        counts = [12, 19, 15, 25, 22, 30, 42]; // Realistic step size
    }

    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'New Users',
                data: counts,
                borderColor: '#0284C7',
                borderWidth: 3,
                tension: 0.4, // Smooth bezier curves
                fill: true,
                backgroundColor: gradient,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#0284C7',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0F172A',
                    titleFont: { size: 13, family: 'Inter' },
                    bodyFont: { size: 14, weight: 'bold', family: 'Inter' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `New Users: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#64748b', font: { weight: 500, family: 'Inter' } } 
                },
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(15, 23, 42, 0.05)', drawBorder: false }, 
                    ticks: { 
                        color: '#64748b', 
                        font: { weight: 500, family: 'Inter' },
                        stepSize: 10
                    } 
                }
            }
        }
    });
}

function renderTemplatePopularityChart() {
    const tplCtx = document.getElementById('templateChart');
    if (!tplCtx) return;

    new Chart(tplCtx, {
        type: 'doughnut',
        data: {
            labels: ['Modern', 'Executive', 'Creative', 'ATS Standard'],
            datasets: [{
                data: [40, 30, 18, 12],
                backgroundColor: [
                    '#1A8CF8', // Blue
                    '#00D4A0', // Mint Green
                    '#F59E0B', // Orange
                    '#0F172A'  // Dark Slate
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Clean thin ring look
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: '#475569',
                        font: { family: 'Inter', weight: 500 }
                    }
                },
                tooltip: {
                    backgroundColor: '#0F172A',
                    bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}
