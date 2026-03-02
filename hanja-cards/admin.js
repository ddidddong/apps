// admin.js
// Supabase Configuration
const supabaseUrl = 'https://xaugjizlblujquqhpjfq.supabase.co';
const supabaseKey = 'sb_publishable_vkU4-pmsJWK5J_mgaGmOQQ_64VuXPbN';
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('login-error');

    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const logoutBtn = document.getElementById('logout-btn');

    const SECRET = "hanja1234";

    // Theme Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) themeToggleBtn.innerText = '☀️';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerText = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerText = '☀️';
            }
        });
    }

    if (sessionStorage.getItem('adminAuth') === 'true') {
        showDashboard();
    }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminAuth');
        passwordInput.value = '';
        errorMsg.classList.add('hidden');
        showScreen(loginScreen);
    });

    function attemptLogin() {
        const input = passwordInput.value;
        if (input === SECRET) {
            sessionStorage.setItem('adminAuth', 'true');
            errorMsg.classList.add('hidden');
            showDashboard();
        } else {
            errorMsg.classList.remove('hidden');
            passwordInput.focus();
        }
    }

    async function showDashboard() {
        showScreen(dashboardScreen);
        if (!supabase) {
            alert('Supabase 클라이언트를 불러오지 못했습니다. 새로고침 해주세요.');
            return;
        }

        try {
            // Fetch events from the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: events, error } = await supabase
                .from('analytics_events')
                .select('*')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            calculateAndRenderStats(events || []);

        } catch (e) {
            console.error(e);
            document.getElementById('stat-today-uv').innerText = '오류 발생';
        }
    }

    function calculateAndRenderStats(events) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const aWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Unique Visitors
        const todayVisitors = new Set(events.filter(e => e.created_at >= todayStart).map(e => e.visitor_id));
        const weeklyVisitors = new Set(events.filter(e => e.created_at >= aWeekAgo).map(e => e.visitor_id));
        const monthlyVisitors = new Set(events.map(e => e.visitor_id));

        document.getElementById('stat-today-uv').innerText = `${todayVisitors.size} 명`;
        document.getElementById('stat-period-uv').innerText = `${weeklyVisitors.size}명 / ${monthlyVisitors.size}명`;

        // New vs Returning (Simplified: if we see the visitor on multiple distinct days in the dataset)
        let newCount = 0;
        let returnCount = 0;

        const visitorDays = {};
        events.forEach(e => {
            const day = e.created_at.split('T')[0];
            if (!visitorDays[e.visitor_id]) visitorDays[e.visitor_id] = new Set();
            visitorDays[e.visitor_id].add(day);
        });

        Object.values(visitorDays).forEach(daysSet => {
            if (daysSet.size > 1) returnCount++;
            else newCount++;
        });

        const totalUsers = newCount + returnCount;
        const returnRate = totalUsers > 0 ? Math.round((returnCount / totalUsers) * 100) : 0;
        document.getElementById('stat-return').innerText = `${totalUsers > 0 ? returnRate : 0}% 재방문`;

        // Average Duration
        const durationEvents = events.filter(e => e.event_type === 'session_ping' && e.event_data && e.event_data.duration_seconds);
        let avgDur = 0;
        if (durationEvents.length > 0) {
            const totalSecs = durationEvents.reduce((sum, e) => sum + e.event_data.duration_seconds, 0);
            avgDur = totalSecs / durationEvents.length;
        }
        document.getElementById('stat-duration').innerText = `${Math.floor(avgDur / 60)}분 ${Math.floor(avgDur % 60)}초`;

        // Top Menus
        const menuEvents = events.filter(e => e.event_type === 'menu_change' && e.event_data && e.event_data.menu);
        const menuCounts = {};
        menuEvents.forEach(e => {
            const m = e.event_data.menu;
            menuCounts[m] = (menuCounts[m] || 0) + 1;
        });
        const topMenus = Object.entries(menuCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const menuHtml = topMenus.length ? topMenus.map(m => `<li><b style="color:var(--primary)">${m[0].toUpperCase()}</b> - ${m[1]}회 클릭</li>`).join('') : '<li>데이터 없음</li>';
        document.getElementById('list-top-menus').innerHTML = menuHtml;

        // Top Hanja
        const hanjaEvents = events.filter(e => e.event_type === 'hanja_view' && e.event_data && e.event_data.hanja);
        const hanjaCounts = {};
        hanjaEvents.forEach(e => {
            const h = e.event_data.hanja;
            hanjaCounts[h] = (hanjaCounts[h] || 0) + 1;
        });
        const topHanja = Object.entries(hanjaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const hanjaHtml = topHanja.length ? topHanja.map(h => `<li><b style="font-size:1.5rem">${h[0]}</b> - ${h[1]}회 학습</li>`).join('') : '<li>데이터 없음</li>';
        document.getElementById('list-top-hanja').innerHTML = hanjaHtml;
    }

    function showScreen(screenEl) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screenEl.classList.add('active');
    }
});
