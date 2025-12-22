/* =============================================================
   SMART HUB - UNIFIED SCRIPT (script.js)
   (Frontend Connected to Backend Database)
============================================================= */

// --- CONFIGURATION ---
// CHANGE THIS to your Render URL when deployed (e.g., 'https://smart-hub-api.onrender.com')
// For local testing, keep it as localhost:5000
const API_URL = 'https://smart-calculator-hub.onrender.com';
// const API_URL = 'http://localhost:5000'; 

// 1. Immediate Theme Loader (Prevent Flash)
(function() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Smart Hub: Active & Connected");

    // --- GLOBAL SELECTORS ---
    const body = document.body;
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const overlay = document.getElementById('mobile-overlay');
    const wrapper = document.getElementById('dashboard-wrapper');
    const sidebarLinks = document.querySelectorAll('.side-menu a');
    const header = document.querySelector('.content-header');
    const mainContent = document.querySelector('.main-content');
    const themeToggle = document.getElementById('darkModeToggle');

    // --- SIDEBAR & MENU ---
    if (mobileBtn) mobileBtn.addEventListener('click', (e) => { e.stopPropagation(); wrapper.classList.toggle('sidebar-active'); });
    if (overlay) overlay.addEventListener('click', () => wrapper.classList.remove('sidebar-active'));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && wrapper) wrapper.classList.remove('sidebar-active');
    });

    // --- ACTIVE LINK HIGHLIGHTER ---
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === "" && href === "index.html")) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- HEADER SCROLL EFFECT ---
    if (mainContent && header) {
        mainContent.addEventListener('scroll', () => {
            if (mainContent.scrollTop > 10) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // --- SETTINGS: DARK MODE ---
    if (themeToggle) {
        themeToggle.checked = body.classList.contains('dark-mode');
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- AUTHENTICATION & UI ---
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    updateUserInterface(isLoggedIn);

    // If logged in, fetch data from database
    if (isLoggedIn) {
        fetchHistoryFromDB();
    }

    // Login Button Logic
    const loginBtn = document.querySelector('.btn-primary');
    if (loginBtn && loginBtn.textContent.trim() === "Log In") {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // Logout Button Logic
    const logoutBtn = document.querySelector('.btn-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("Are you sure you want to log out?")) {
                localStorage.clear(); // Clears token, user info, and isLoggedIn flag
                updateUserInterface(false);
                window.location.href = 'login.html';
            }
        });
    }

    // --- CHART.JS (Dashboard Only) ---
    const usageChartCanvas = document.getElementById('usageChart');
    if (usageChartCanvas && typeof Chart !== 'undefined') {
        const ctx = usageChartCanvas.getContext('2d');
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#a5b4fc');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Calculations',
                    data: [65, 59, 80, 81, 56, 55, 40, 60, 75, 90, 100, 120],
                    backgroundColor: gradient,
                    borderRadius: 6,
                    barPercentage: 0.6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
});

// --- HELPER: UPDATE UI BASED ON LOGIN STATE ---
function updateUserInterface(isLoggedIn) {
    const userNameEl = document.querySelector('.profile-header h4');
    const userStatusEl = document.querySelector('.profile-header p');
    const authGroup = document.querySelector('.auth-btn-group');
    const logoutBtn = document.querySelector('.btn-danger');
    const greetingEl = document.getElementById('welcome-msg');
    const profilePic = document.querySelector('.profile-pic');

    if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('user'));
        const name = user ? user.name : "User";

        // Update Settings Page
        if (userNameEl) {
            userNameEl.textContent = name;
            userStatusEl.textContent = "Premium Member";
            userStatusEl.style.color = "var(--primary-color)";
            if(authGroup) authGroup.style.display = 'none';
            if(logoutBtn) logoutBtn.style.display = 'block';
            if(profilePic) {
                profilePic.innerHTML = '<i class="fa-solid fa-user-check"></i>';
                profilePic.style.background = "#10b981"; // Green
            }
        }

        // Update Dashboard Greeting
        if (greetingEl) {
            const hour = new Date().getHours();
            let timeGreet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
            const firstName = name.split(' ')[0];
            greetingEl.innerHTML = `${timeGreet}, ${firstName}. <span class="accent-text">Welcome Back</span>`;
        }
    } else {
        // Reset to Guest State
        if (userNameEl) {
            userNameEl.textContent = "Guest User";
            userStatusEl.textContent = "Not logged in";
            userStatusEl.style.color = "var(--text-body)";
            if(authGroup) authGroup.style.display = 'flex';
            if(logoutBtn) logoutBtn.style.display = 'none';
            if(profilePic) {
                profilePic.innerHTML = '<i class="fa-solid fa-user"></i>';
                profilePic.style.background = "var(--primary-gradient)";
            }
        }
    }
}

// --- HISTORY SYSTEM (DATABASE CONNECTED) ---

// 1. Fetch History (GET) - Automatically called on page load if logged in
async function fetchHistoryFromDB() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/api/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const history = await res.json();

            // Update Dashboard Stats
            const totalEl = document.getElementById('total-calcs');
            const lastActiveEl = document.getElementById('last-active');
            const recentList = document.getElementById('recent-activity-list');
            const fullHistoryList = document.getElementById('history-list');

            if (totalEl) totalEl.innerText = history.length;
            if (lastActiveEl) lastActiveEl.innerText = history.length > 0 ? history[0].date.split(',')[0] : "No activity";

            // Render Recent Activity (Dashboard)
            if (recentList) {
                const recent = history.slice(0, 5);
                if (recent.length === 0) {
                    recentList.innerHTML = `<div style="padding:30px; text-align:center; opacity:0.6;">No calculations yet.</div>`;
                } else {
                    recentList.innerHTML = recent.map(item => `
                        <div style="padding: 15px 25px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center;">
                            <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(99, 102, 241, 0.1); color: var(--primary-color); display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <i class="fa-solid fa-calculator"></i>
                            </div>
                            <div style="flex: 1;">
                                <h4 style="margin: 0; font-size: 1rem;">${item.tool}</h4>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${item.result}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Render Full List (History Page)
            if (fullHistoryList) {
                if (history.length === 0) {
                    fullHistoryList.innerHTML = `
                        <div class="text-center" style="margin-top:50px; opacity:0.6;">
                            <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                            <p>No calculation history found.</p>
                        </div>`;
                } else {
                    fullHistoryList.innerHTML = history.map(item => `
                        <div class="cat-card fade-in" style="margin-bottom: 20px; padding: 20px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                                <h4 style="margin:0; color:var(--primary-color);">${item.tool}</h4>
                                <span style="font-size:0.8rem; opacity:0.7;">${item.date}</span>
                            </div>
                            <div style="background:var(--bg-main); padding:10px; border-radius:8px;">
                                <p style="margin:0; font-size:0.9rem;"><strong>Input:</strong> ${item.inputs}</p>
                                <p style="margin:5px 0 0 0; font-weight:bold;">Result: ${item.result}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (err) {
        console.error("Error fetching history:", err);
    }
}

// 2. Save Calculation (POST) - CALL THIS IN YOUR CALCULATORS
async function saveCalculation(toolName, inputs, result) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert("Please log in to save your history!");
        return;
    }

    const token = localStorage.getItem('token');
    const date = new Date().toLocaleString('en-IN', { hour12: true });

    try {
        await fetch(`${API_URL}/api/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tool: toolName, inputs, result, date })
        });
        console.log("Calculation saved to DB");
        
        // Refresh dashboard data if on dashboard (optional)
        // fetchHistoryFromDB(); 
    } catch (err) {
        console.error("Error saving history:", err);
    }
}

// 3. Clear History (DELETE)
const clearBtn = document.getElementById('clear-history-btn');
if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
        if(confirm("Are you sure you want to clear all history? This cannot be undone.")) {
            const token = localStorage.getItem('token');
            try {
                await fetch(`${API_URL}/api/history`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                window.location.reload();
            } catch (err) {
                console.error("Error clearing history:", err);
            }
        }
    });
}