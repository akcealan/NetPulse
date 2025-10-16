// NetPulse - Gelişmiş İstatistikler Sayfası

document.addEventListener('DOMContentLoaded', function() {
    // Aktif filtre
    let activeFilter = 'all'; // all, today, week, month

    // Sayfa yüklendiğinde
    init();

    function init() {
        setupFilterButtons();
        loadAllStatistics();
    }

    function setupFilterButtons() {
        const filterBtns = document.querySelectorAll('[data-filter]');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Aktif butonu güncelle
                filterBtns.forEach(b => {
                    b.classList.remove('bg-primary', 'text-white');
                    b.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                });
                
                this.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                this.classList.add('bg-primary', 'text-white');
                
                activeFilter = this.dataset.filter;
                loadAllStatistics();
            });
        });
    }

    function getFilteredSessions() {
        const allSessions = Storage.getSessions();
        const now = new Date();
        
        switch(activeFilter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return allSessions.filter(s => new Date(s.date) >= today);
                
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return allSessions.filter(s => new Date(s.date) >= weekAgo);
                
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return allSessions.filter(s => new Date(s.date) >= monthAgo);
                
            default: // 'all'
                return allSessions;
        }
    }

    function loadAllStatistics() {
        const courses = Storage.getCourses();
        const allSessions = Storage.getSessions();
        const sessions = getFilteredSessions();

        // Hiç veri yoksa (tüm zamanlar için bile)
        if (allSessions.length === 0) {
            showEmptyState();
            return;
        }

        // Filtrelenmiş veri yoksa ama genel veri varsa
        if (sessions.length === 0) {
            showNoDataForFilter();
            return;
        }

        // Bölümleri göster (gizli olabilirler)
        showAllSections();

        // Genel istatistikleri göster
        displayGeneralStats(sessions);
        
        // Ders bazlı istatistikleri göster
        displayCourseStats(courses, sessions);
        
        // Konu bazlı istatistikleri göster
        displayTopicStats(courses, sessions);
        
        // Trend analizini göster
        displayTrendAnalysis(sessions);
        
        // Detaylı metrikleri göster
        displayDetailedMetrics(sessions);
        
        // Performans özetini göster
        displayPerformanceSummary(courses, sessions);
    }

    // === GENEL İSTATİSTİKLER ===

    function displayGeneralStats(sessions) {
        const container = document.getElementById('generalStats');
        if (!container) return;

        // Toplam soru sayısı
        const totalQuestions = sessions.reduce((sum, s) => 
            sum + s.correct + s.incorrect + s.blank, 0
        );

        // Toplam doğru
        const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);

        // Toplam yanlış
        const totalIncorrect = sessions.reduce((sum, s) => sum + s.incorrect, 0);

        // Toplam net
        const totalNet = sessions.reduce((sum, s) => sum + s.net, 0);

        // Ortalama net
        const avgNet = sessions.length > 0 ? (totalNet / sessions.length).toFixed(2) : 0;

        // Başarı oranı
        const successRate = totalQuestions > 0 
            ? ((totalCorrect / totalQuestions) * 100).toFixed(1) 
            : 0;

        // Toplam süre
        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Toplam Çalışma</p>
                    <p class="text-2xl font-bold text-primary">${sessions.length}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Toplam Soru</p>
                    <p class="text-2xl font-bold text-text-light dark:text-text-dark">${totalQuestions}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Ortalama Net</p>
                    <p class="text-2xl font-bold text-success">${avgNet}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Başarı Oranı</p>
                    <p class="text-2xl font-bold text-primary">${successRate}%</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">Doğru/Yanlış Dağılımı</p>
                    <div class="flex items-center gap-2 mb-1">
                        <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${totalQuestions > 0 ? (totalCorrect / totalQuestions * 100) : 0}%"></div>
                        </div>
                        <span class="text-sm font-medium text-green-500">${totalCorrect}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div class="bg-red-500 h-2 rounded-full" style="width: ${totalQuestions > 0 ? (totalIncorrect / totalQuestions * 100) : 0}%"></div>
                        </div>
                        <span class="text-sm font-medium text-red-500">${totalIncorrect}</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Toplam Net</p>
                    <p class="text-3xl font-bold text-success">${totalNet.toFixed(2)}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Toplam Süre</p>
                    <p class="text-3xl font-bold text-primary">${formatDuration(totalDuration)}</p>
                </div>
            </div>
        `;
    }

    // === DERS BAZLI İSTATİSTİKLER ===

    function displayCourseStats(courses, sessions) {
        const container = document.getElementById('courseStats');
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <p>Henüz ders eklenmemiş</p>
                </div>
            `;
            return;
        }

        // Her ders için istatistikleri hesapla
        const courseStats = courses.map(course => {
            const courseSessions = sessions.filter(s => s.courseId === course.id);
            
            if (courseSessions.length === 0) {
                return null;
            }

            const totalQuestions = courseSessions.reduce((sum, s) => 
                sum + s.correct + s.incorrect + s.blank, 0
            );
            const totalCorrect = courseSessions.reduce((sum, s) => sum + s.correct, 0);
            const totalNet = courseSessions.reduce((sum, s) => sum + s.net, 0);
            const avgNet = (totalNet / courseSessions.length).toFixed(2);
            const successRate = totalQuestions > 0 
                ? ((totalCorrect / totalQuestions) * 100).toFixed(1) 
                : 0;

            return {
                name: course.name,
                sessionCount: courseSessions.length,
                totalQuestions,
                totalCorrect,
                totalNet: totalNet.toFixed(2),
                avgNet,
                successRate
            };
        }).filter(c => c !== null);

        // Ortalama net'e göre sırala
        courseStats.sort((a, b) => parseFloat(b.avgNet) - parseFloat(a.avgNet));

        container.innerHTML = courseStats.map((course, index) => `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark">${course.name}</h3>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        index === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        index === courseStats.length - 1 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }">
                        ${course.sessionCount} çalışma
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Ortalama Net</p>
                        <p class="text-2xl font-bold text-success">${course.avgNet}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Başarı Oranı</p>
                        <p class="text-2xl font-bold text-primary">${course.successRate}%</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Toplam Soru</span>
                        <span class="font-medium">${course.totalQuestions}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Toplam Doğru</span>
                        <span class="font-medium text-green-600">${course.totalCorrect}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">Toplam Net</span>
                        <span class="font-medium text-success">${course.totalNet}</span>
                    </div>
                </div>
                
                <div class="mt-4">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full transition-all duration-500" style="width: ${course.successRate}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // === PERFORMANS ÖZETİ ===

    function displayPerformanceSummary(courses, sessions) {
        const container = document.getElementById('performanceSummary');
        if (!container) return;

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <p>Henüz veri yok</p>
                </div>
            `;
            return;
        }

        // En iyi dersi bul
        const courseStats = courses.map(course => {
            const courseSessions = sessions.filter(s => s.courseId === course.id);
            if (courseSessions.length === 0) return null;
            
            const totalNet = courseSessions.reduce((sum, s) => sum + s.net, 0);
            const avgNet = totalNet / courseSessions.length;
            
            return { name: course.name, avgNet, sessionCount: courseSessions.length };
        }).filter(c => c !== null);

        courseStats.sort((a, b) => b.avgNet - a.avgNet);

        const bestCourse = courseStats[0];
        const worstCourse = courseStats[courseStats.length - 1];

        // Son 7 günlük gelişim
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentSessions = sessions.filter(s => new Date(s.date) >= sevenDaysAgo);
        const olderSessions = sessions.filter(s => new Date(s.date) < sevenDaysAgo);

        let improvement = 0;
        if (recentSessions.length > 0 && olderSessions.length > 0) {
            const recentAvg = recentSessions.reduce((sum, s) => sum + s.net, 0) / recentSessions.length;
            const olderAvg = olderSessions.reduce((sum, s) => sum + s.net, 0) / olderSessions.length;
            improvement = ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1);
        }

        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-text-light dark:text-text-dark mb-4">Performans Özeti</h3>
                <div class="space-y-4">
                    ${improvement !== 0 ? `
                        <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-2xl ${improvement > 0 ? 'text-green-500' : 'text-red-500'}">
                                ${improvement > 0 ? 'trending_up' : 'trending_down'}
                            </span>
                            <div>
                                <p class="text-gray-600 dark:text-gray-300">
                                    Son 7 günde 
                                    <span class="font-bold ${improvement > 0 ? 'text-green-500' : 'text-red-500'}">
                                        ${Math.abs(improvement)}%
                                    </span>
                                    ${improvement > 0 ? 'gelişim' : 'düşüş'} gösterdiniz.
                                </p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${bestCourse ? `
                        <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-2xl text-primary">star</span>
                            <div>
                                <p class="text-gray-600 dark:text-gray-300">
                                    En başarılı dersiniz: 
                                    <span class="font-bold text-primary">${bestCourse.name}</span>
                                    (${bestCourse.avgNet.toFixed(2)} ortalama net)
                                </p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${worstCourse && courseStats.length > 1 ? `
                        <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-2xl text-orange-500">priority_high</span>
                            <div>
                                <p class="text-gray-600 dark:text-gray-300">
                                    Geliştirilmesi gereken ders: 
                                    <span class="font-bold text-orange-500">${worstCourse.name}</span>
                                    (${worstCourse.avgNet.toFixed(2)} ortalama net)
                                </p>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-2xl text-primary">functions</span>
                        <div>
                            <p class="text-gray-600 dark:text-gray-300">
                                Toplam <span class="font-bold text-primary">${sessions.reduce((sum, s) => sum + s.correct + s.incorrect + s.blank, 0)}</span> soru çözdünüz.
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-2xl text-primary">schedule</span>
                        <div>
                            <p class="text-gray-600 dark:text-gray-300">
                                Toplam <span class="font-bold text-primary">${formatDuration(sessions.reduce((sum, s) => sum + s.duration, 0))}</span> çalıştınız.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // === KONU BAZLI İSTATİSTİKLER ===

    function displayTopicStats(courses, sessions) {
        const container = document.getElementById('topicStats');
        if (!container) return;

        const topicStats = [];
        courses.forEach(course => {
            course.topics.forEach(topic => {
                const topicSessions = sessions.filter(s => s.topicId === topic.id);
                if (topicSessions.length === 0) return;

                const totalQuestions = topicSessions.reduce((sum, s) => sum + s.correct + s.incorrect + s.blank, 0);
                const totalCorrect = topicSessions.reduce((sum, s) => sum + s.correct, 0);
                const totalNet = topicSessions.reduce((sum, s) => sum + s.net, 0);
                const avgNet = (totalNet / topicSessions.length).toFixed(2);
                const successRate = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;

                topicStats.push({
                    courseName: course.name,
                    topicName: topic.name,
                    sessionCount: topicSessions.length,
                    totalQuestions,
                    totalCorrect,
                    avgNet,
                    successRate
                });
            });
        });

        if (topicStats.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-gray-400"><p>Henüz konu bazlı veri yok</p></div>`;
            return;
        }

        topicStats.sort((a, b) => parseFloat(b.avgNet) - parseFloat(a.avgNet));
        const topTopics = topicStats.slice(0, 5);
        const worstTopics = topicStats.slice(-5).reverse();

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-green-500">trending_up</span>
                        En Başarılı Konular
                    </h3>
                    <div class="space-y-3">
                        ${topTopics.map(topic => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex-1">
                                        <p class="font-semibold text-text-light dark:text-text-dark">${topic.topicName}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">${topic.courseName}</p>
                                    </div>
                                    <span class="text-2xl font-bold text-green-500">${topic.avgNet}</span>
                                </div>
                                <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                    <span>${topic.sessionCount} çalışma</span>
                                    <span>${topic.successRate}% başarı</span>
                                    <span>${topic.totalQuestions} soru</span>
                                </div>
                                <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div class="bg-green-500 h-1.5 rounded-full" style="width: ${topic.successRate}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-bold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-orange-500">priority_high</span>
                        Geliştirilmesi Gereken Konular
                    </h3>
                    <div class="space-y-3">
                        ${worstTopics.map(topic => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex-1">
                                        <p class="font-semibold text-text-light dark:text-text-dark">${topic.topicName}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">${topic.courseName}</p>
                                    </div>
                                    <span class="text-2xl font-bold text-orange-500">${topic.avgNet}</span>
                                </div>
                                <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                    <span>${topic.sessionCount} çalışma</span>
                                    <span>${topic.successRate}% başarı</span>
                                    <span>${topic.totalQuestions} soru</span>
                                </div>
                                <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div class="bg-orange-500 h-1.5 rounded-full" style="width: ${topic.successRate}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // === TREND ANALİZİ ===

    function displayTrendAnalysis(sessions) {
        const container = document.getElementById('trendAnalysis');
        if (!container) return;

        const now = new Date();
        let daysToShow = 7;
        let title = 'Son 7 Gün Trend Analizi';
        let dateFormat = { weekday: 'short' };
        
        // Filtreye göre gün sayısını belirle
        if (activeFilter === 'month') {
            // Bu ayın gün sayısını hesapla
            const year = now.getFullYear();
            const month = now.getMonth();
            daysToShow = new Date(year, month + 1, 0).getDate();
            title = `Bu Ay Trend Analizi (${daysToShow} Gün)`;
            dateFormat = { day: 'numeric' };
        } else if (activeFilter === 'week') {
            daysToShow = 7;
            title = 'Bu Hafta Trend Analizi';
            dateFormat = { weekday: 'short' };
        } else if (activeFilter === 'today') {
            daysToShow = 1;
            title = 'Bugün';
            dateFormat = { hour: '2-digit', minute: '2-digit' };
        } else {
            daysToShow = 7;
            title = 'Son 7 Gün Trend Analizi';
            dateFormat = { weekday: 'short' };
        }

        const trendDays = [];
        
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const daySessions = sessions.filter(s => s.date === dateStr);
            
            const totalNet = daySessions.reduce((sum, s) => sum + s.net, 0);
            const totalQuestions = daySessions.reduce((sum, s) => sum + s.correct + s.incorrect + s.blank, 0);
            
            trendDays.push({
                date: dateStr,
                dayName: date.toLocaleDateString('tr-TR', dateFormat),
                sessionCount: daySessions.length,
                totalNet,
                totalQuestions
            });
        }

        const maxNet = Math.max(...trendDays.map(d => d.totalNet), 1);
        const maxQuestions = Math.max(...trendDays.map(d => d.totalQuestions), 1);
        
        // Çok fazla gün varsa minimum genişlik belirle
        const minWidth = daysToShow > 15 ? 'min-w-[20px]' : '';
        const textSize = daysToShow > 20 ? 'text-[10px]' : 'text-xs';

        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-text-light dark:text-text-dark mb-6">${title}</h3>
                
                <div class="mb-8">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Günlük Net</p>
                    <div class="flex items-end justify-between gap-1 h-40 border-b-2 border-gray-300 dark:border-gray-600 pb-2 overflow-x-auto">
                        ${trendDays.map(day => {
                            const heightPx = day.totalNet > 0 ? Math.max((day.totalNet / maxNet * 150), 10) : 0;
                            return `
                            <div class="flex-1 ${minWidth} flex flex-col items-center justify-end gap-2">
                                ${day.totalNet > 0 ? `
                                    <div class="w-full rounded-t relative transition-all duration-300 bg-gradient-to-t from-primary to-blue-300" style="height: ${heightPx}px; min-height: 10px;"></div>
                                ` : `
                                    <div class="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                `}
                                <div class="text-center pt-2">
                                    <p class="${textSize} font-bold text-text-light dark:text-text-dark">${day.totalNet.toFixed(1)}</p>
                                    <p class="${textSize} text-gray-500 dark:text-gray-400">${day.dayName}</p>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Günlük Soru Sayısı</p>
                    <div class="flex items-end justify-between gap-1 h-32 border-b-2 border-gray-300 dark:border-gray-600 pb-2 overflow-x-auto">
                        ${trendDays.map(day => {
                            const heightPx = day.totalQuestions > 0 ? Math.max((day.totalQuestions / maxQuestions * 110), 10) : 0;
                            return `
                            <div class="flex-1 ${minWidth} flex flex-col items-center justify-end gap-2">
                                ${day.totalQuestions > 0 ? `
                                    <div class="w-full rounded-t relative transition-all duration-300 bg-gradient-to-t from-success to-green-300" style="height: ${heightPx}px; min-height: 10px;"></div>
                                ` : `
                                    <div class="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                `}
                                <div class="text-center pt-2">
                                    <p class="${textSize} font-bold text-text-light dark:text-text-dark">${day.totalQuestions}</p>
                                    <p class="${textSize} text-gray-500 dark:text-gray-400">${day.dayName}</p>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // === DETAYLI METRİKLER ===

    function displayDetailedMetrics(sessions) {
        const container = document.getElementById('detailedMetrics');
        if (!container) return;

        const totalQuestions = sessions.reduce((sum, s) => sum + s.correct + s.incorrect + s.blank, 0);
        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
        
        const avgTimePerQuestion = totalQuestions > 0 ? (totalDuration / totalQuestions).toFixed(2) : 0;
        const avgQuestionsPerSession = sessions.length > 0 ? (totalQuestions / sessions.length).toFixed(1) : 0;
        const avgDurationPerSession = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;
        const streak = calculateStreak(sessions);

        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-primary">speed</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Soru/Dakika</p>
                    </div>
                    <p class="text-2xl font-bold text-text-light dark:text-text-dark">${avgTimePerQuestion}</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-success">functions</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Ort. Soru/Çalışma</p>
                    </div>
                    <p class="text-2xl font-bold text-text-light dark:text-text-dark">${avgQuestionsPerSession}</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-primary">schedule</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Ort. Süre/Çalışma</p>
                    </div>
                    <p class="text-2xl font-bold text-text-light dark:text-text-dark">${formatDuration(avgDurationPerSession)}</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-orange-500">local_fire_department</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Çalışma Serisi</p>
                    </div>
                    <p class="text-2xl font-bold text-text-light dark:text-text-dark">${streak} gün</p>
                </div>
            </div>
        `;
    }

    function calculateStreak(sessions) {
        if (sessions.length === 0) return 0;
        
        const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        
        if (dates[0] !== today) return 0;
        
        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i-1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // === YARDIMCI FONKSİYONLAR ===

    function formatDuration(minutes) {
        if (minutes === 0) return '0dk';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
        }
        return `${mins}dk`;
    }

    function showEmptyState() {
        const main = document.querySelector('.layout-content-container');
        main.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">bar_chart</span>
                <h2 class="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">Henüz İstatistik Yok</h2>
                <p class="text-gray-400 dark:text-gray-500 mb-6">Çalışma kayıtları eklediğinizde istatistikleriniz burada görünecek.</p>
                <a href="dataentry.html" class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    İlk Kaydını Ekle
                </a>
            </div>
        `;
    }

    function showAllSections() {
        // Tüm bölümleri göster
        const sections = ['courseStatsSection', 'topicStatsSection', 'trendAnalysisSection', 'detailedMetricsSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = '';
            }
        });
    }

    function showNoDataForFilter() {
        const filterNames = {
            'today': 'Bugün',
            'week': 'Bu Hafta',
            'month': 'Bu Ay',
            'all': 'Tüm Zamanlar'
        };
        
        const filterName = filterNames[activeFilter] || 'Bu Filtre';
        
        // Tüm bölümleri gizle
        const sections = ['courseStatsSection', 'topicStatsSection', 'trendAnalysisSection', 'detailedMetricsSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Genel istatistikler alanına mesaj göster
        const generalStats = document.getElementById('generalStats');
        if (generalStats) {
            generalStats.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">event_busy</span>
                    <h2 class="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">${filterName} İçin Veri Yok</h2>
                    <p class="text-gray-400 dark:text-gray-500 mb-6">Bu zaman diliminde henüz çalışma kaydı bulunmuyor.</p>
                    <div class="flex gap-3">
                        <button onclick="document.querySelector('[data-filter=all]').click()" class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Tüm Verileri Göster
                        </button>
                        <a href="dataentry.html" class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Yeni Kayıt Ekle
                        </a>
                    </div>
                </div>
            `;
        }
    }
});
