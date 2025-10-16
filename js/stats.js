// NetPulse - İstatistikler Sayfası

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde
    init();

    function init() {
        loadAllStatistics();
    }

    function loadAllStatistics() {
        const courses = Storage.getCourses();
        const sessions = Storage.getSessions();

        if (sessions.length === 0) {
            showEmptyState();
            return;
        }

        // Genel istatistikleri hesapla ve göster
        displayGeneralStats(sessions);
        
        // Ders bazlı istatistikleri göster
        displayCourseStats(courses, sessions);
        
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
});
