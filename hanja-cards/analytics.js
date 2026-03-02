// analytics.js
// Supabase Configuration
const supabaseUrl = 'https://xaugjizlblujquqhpjfq.supabase.co';
const supabaseKey = 'sb_publishable_vkU4-pmsJWK5J_mgaGmOQQ_64VuXPbN';
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// Unique Visitor ID (persists across sessions)
function getVisitorId() {
    let vid = localStorage.getItem('hc_vid');
    if (!vid) {
        vid = 'vid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('hc_vid', vid);
    }
    return vid;
}

// Session ID (persists for the current browser session only)
function getSessionId() {
    let sid = sessionStorage.getItem('hc_sid');
    if (!sid) {
        sid = 'sid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        sessionStorage.setItem('hc_sid', sid);
    }
    return sid;
}

const Analytics = {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    pageLoadTime: Date.now(),
    lastActivityTime: Date.now(),

    async trackEvent(eventType, eventData = {}) {
        if (!supabase) return;

        try {
            await supabase.from('analytics_events').insert([{
                session_id: this.sessionId,
                visitor_id: this.visitorId,
                event_type: eventType,
                event_data: eventData,
                page_url: window.location.pathname,
                user_agent: navigator.userAgent
            }]);
        } catch (error) {
            console.error('Analytics tracking failed', error);
        }
    },

    // Record base page view
    recordPageView() {
        this.trackEvent('page_view', { source: document.referrer || 'direct' });
    },

    // Record when user switches tabs (menu change)
    recordMenuChange(menuName) {
        this.trackEvent('menu_change', { menu: menuName });
    },

    // Record when user flips a hanja card
    recordHanjaView(hanjaChar, type = 'flip') {
        this.trackEvent('hanja_view', { hanja: hanjaChar, interaction: type });
    },

    // Optional: send a heartbeat or duration when session ends (unload)
    recordSessionPing() {
        const durationSec = Math.floor((Date.now() - this.pageLoadTime) / 1000);
        this.trackEvent('session_ping', { duration_seconds: durationSec });
    },

    updateActivity() {
        this.lastActivityTime = Date.now();
    }
};

// Initialize base tracking when script loads
document.addEventListener('DOMContentLoaded', () => {
    Analytics.recordPageView();

    // Track activity
    document.addEventListener('click', () => Analytics.updateActivity());
    document.addEventListener('scroll', () => Analytics.updateActivity());

    // Heartbeat every 60 seconds of active use
    setInterval(() => {
        if (Date.now() - Analytics.lastActivityTime < 60000) {
            Analytics.recordSessionPing();
        }
    }, 60000);
});

// Update window object so app.js can call it
window.Analytics = Analytics;
