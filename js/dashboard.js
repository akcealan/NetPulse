// NetPulse - Dashboard/Index Sayfası

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elementleri
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const totalCorrectEl = document.getElementById('totalCorrect');
    const totalDurationEl = document.getElementById('totalDuration');
    
    const todayPercentageEl = document.getElementById('todayPercentage');
    const todayProgressBarEl = document.getElementById('todayProgressBar');
    const todayStatsEl = document.getElementById('todayStats');
    
    const recentSessionsEl = document.getElementById('recentSessions');
    const courseDistributionEl = document.getElementById('courseDistribution');

    // Sayfa yüklendiğinde
    init();

    function init() {
        loadDashboardStats();
        loadTodayProgress();
        loadRecentSessions();
        loadCourseDistribution();
    }

    // === GENEL İSTATİSTİKLER ===

    function loadDashboardStats() {
        const sessions = Storage.getSessions();
        
        if (sessions.length === 0) {
            totalQuestionsEl.textContent = '0';
            totalCorrectEl.textContent = '0';
            totalDurationEl.textContent = '0dk';
            return;
        }

        // Toplam soru sayısı
        const totalQuestions = sessions.reduce((sum, s) => 
            sum + s.correct + s.incorrect + s.blank, 0
        );

        // Toplam doğru sayısı
        const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);

        // Toplam süre (dakika)
        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

        // Animasyonlu güncelleme
        animateNumber(totalQuestionsEl, totalQuestions);
        animateNumber(totalCorrectEl, totalCorrect);
        
        // Süreyi formatla
        totalDurationEl.textContent = formatDuration(totalDuration);
    }

    // === BUGÜNKÜ İLERLEME ===

    function loadTodayProgress() {
        const today = new Date().toISOString().split('T')[0];
        const sessions = Storage.getSessions();
        const todaySessions = sessions.filter(s => s.date === today);

        if (todaySessions.length === 0) {
            todayPercentageEl.textContent = '0%';
            todayProgressBarEl.style.width = '0%';
            todayStatsEl.textContent = 'Bugün henüz çalışma kaydı yok';
            return;
        }

        // Bugünkü istatistikler
        const todayCorrect = todaySessions.reduce((sum, s) => sum + s.correct, 0);
        const todayIncorrect = todaySessions.reduce((sum, s) => sum + s.incorrect, 0);
        const todayBlank = todaySessions.reduce((sum, s) => sum + s.blank, 0);
        const todayTotal = todayCorrect + todayIncorrect + todayBlank;
        const todayDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const todayNet = todaySessions.reduce((sum, s) => sum + s.net, 0);

        // Başarı yüzdesi (doğru / toplam)
        const successRate = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

        // Progress bar'ı güncelle
        todayPercentageEl.textContent = `${successRate}%`;
        setTimeout(() => {
            todayProgressBarEl.style.width = `${successRate}%`;
        }, 100);

        // İstatistik metnini güncelle
        todayStatsEl.textContent = `${todaySessions.length} çalışma • ${todayTotal} soru • ${todayNet.toFixed(2)} net • ${formatDuration(todayDuration)}`;
    }

    // === SON ÇALIŞMALAR ===

    function loadRecentSessions() {
        const sessions = Storage.getSessionsSorted();
        const recentSessions = sessions.slice(0, 5); // Son 5 çalışma

        if (recentSessions.length === 0) {
            recentSessionsEl.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <p>Henüz çalışma kaydı yok</p>
                    <a href="dataentry.html" class="text-primary hover:underline text-sm mt-2 inline-block">
                        İlk kaydını ekle →
                    </a>
                </div>
            `;
            return;
        }

        recentSessionsEl.innerHTML = '';

        recentSessions.forEach(session => {
            const sessionEl = document.createElement('div');
            sessionEl.className = 'flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors';
            
            sessionEl.innerHTML = `
                <div class="flex-1">
                    <p class="text-text-light dark:text-text-dark font-medium text-sm">${session.courseName}</p>
                    <p class="text-text-light/60 dark:text-text-dark/60 text-xs">${session.topicName}</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <p class="text-text-light dark:text-text-dark font-bold text-sm">${session.net}</p>
                        <p class="text-text-light/60 dark:text-text-dark/60 text-xs">net</p>
                    </div>
                    <div class="text-right">
                        <p class="text-text-light/70 dark:text-text-dark/70 text-xs">${Storage.formatDate(session.date)}</p>
                        <p class="text-text-light/60 dark:text-text-dark/60 text-xs">${session.duration}dk</p>
                    </div>
                </div>
            `;

            recentSessionsEl.appendChild(sessionEl);
        });
    }

    // === DERS DAĞILIMI ===

    function loadCourseDistribution() {
        const sessions = Storage.getSessions();
        const courses = Storage.getCourses();

        if (courses.length === 0) {
            courseDistributionEl.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <p class="text-sm">Henüz ders eklenmemiş</p>
                    <a href="dataentry.html" class="text-primary hover:underline text-sm mt-2 inline-block">
                        Ders ekle →
                    </a>
                </div>
            `;
            return;
        }

        // Her ders için çalışma sayısını hesapla
        const courseStats = courses.map(course => {
            const courseSessions = sessions.filter(s => s.courseId === course.id);
            const totalQuestions = courseSessions.reduce((sum, s) => 
                sum + s.correct + s.incorrect + s.blank, 0
            );
            return {
                name: course.name,
                sessionCount: courseSessions.length,
                totalQuestions: totalQuestions
            };
        }).filter(c => c.sessionCount > 0); // Sadece çalışma yapılmış dersleri göster

        if (courseStats.length === 0) {
            courseDistributionEl.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <p class="text-sm">Henüz çalışma kaydı yok</p>
                </div>
            `;
            return;
        }

        // Toplam soru sayısı
        const totalQuestions = courseStats.reduce((sum, c) => sum + c.totalQuestions, 0);

        courseDistributionEl.innerHTML = '';

        // Dersleri soru sayısına göre sırala
        courseStats.sort((a, b) => b.totalQuestions - a.totalQuestions);

        courseStats.forEach(course => {
            const percentage = totalQuestions > 0 
                ? Math.round((course.totalQuestions / totalQuestions) * 100) 
                : 0;

            const courseEl = document.createElement('div');
            courseEl.className = 'flex flex-col gap-2';
            
            courseEl.innerHTML = `
                <div class="flex justify-between items-center">
                    <p class="text-text-light dark:text-text-dark text-sm font-medium">${course.name}</p>
                    <p class="text-text-light/70 dark:text-text-dark/70 text-xs">${percentage}%</p>
                </div>
                <div class="w-full rounded-full bg-gray-200 dark:bg-gray-700 h-2">
                    <div class="h-2 rounded-full bg-primary transition-all duration-500" style="width: 0%;"></div>
                </div>
                <p class="text-text-light/60 dark:text-text-dark/60 text-xs">
                    ${course.sessionCount} çalışma • ${course.totalQuestions} soru
                </p>
            `;

            courseDistributionEl.appendChild(courseEl);

            // Progress bar animasyonu
            setTimeout(() => {
                const progressBar = courseEl.querySelector('.bg-primary');
                progressBar.style.width = `${percentage}%`;
            }, 100);
        });
    }

    // === YARDIMCI FONKSİYONLAR ===

    function animateNumber(element, targetValue, duration = 1000) {
        const startValue = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = targetValue;
            }
        }

        requestAnimationFrame(update);
    }

    function formatDuration(minutes) {
        if (minutes === 0) return '0dk';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
        }
        return `${mins}dk`;
    }

    // Sayfa her görüntülendiğinde verileri yenile
    window.addEventListener('focus', function() {
        loadDashboardStats();
        loadTodayProgress();
        loadRecentSessions();
        loadCourseDistribution();
    });
});
