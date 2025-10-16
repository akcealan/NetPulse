// Tema tercihini localStorage'a kaydet
function saveThemePreference(isDark) {
    localStorage.setItem('netpulse_theme', isDark ? 'dark' : 'light');
}

// Tema tercihini localStorage'dan al
function loadThemePreference() {
    const savedTheme = localStorage.getItem('netpulse_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Eğer kayıtlı tema varsa onu kullan, yoksa sistem tercihini kullan
    return savedTheme ? savedTheme === 'dark' : systemPrefersDark;
}

// Temayı uygula
function applyTheme(isDark) {
    const html = document.querySelector('html');
    if (isDark) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

// Sayfa yüklendiğinde tema tercihini kontrol et ve uygula
document.addEventListener('DOMContentLoaded', () => {
    const isDark = loadThemePreference();
    applyTheme(isDark);

    // Tema değiştirme butonuna tıklandığında
    const themeToggle = document.querySelector('button');
    themeToggle.addEventListener('click', () => {
        const html = document.querySelector('html');
        const isDark = html.classList.toggle('dark');
        saveThemePreference(isDark);
    });
});