// NetPulse - Veri Giriş Sayfası

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elementleri
    const addCourseBtn = document.getElementById('addCourseBtn');
    const addTopicBtn = document.getElementById('addTopicBtn');
    const addSessionBtn = document.getElementById('addSessionBtn');
    
    const dateInput = document.getElementById('dateInput');
    const courseSelect = document.getElementById('courseSelect');
    const topicSelect = document.getElementById('topicSelect');
    const topicsList = document.getElementById('topicsList');
    
    const correctInput = document.getElementById('correctInput');
    const incorrectInput = document.getElementById('incorrectInput');
    const blankInput = document.getElementById('blankInput');
    
    const hoursInput = document.getElementById('hoursInput');
    const minutesInput = document.getElementById('minutesInput');
    const secondsInput = document.getElementById('secondsInput');
    
    const sessionsTableBody = document.getElementById('sessionsTableBody');

    // Sayfa yüklendiğinde
    init();

    function init() {
        // Bugünün tarihini ayarla
        setTodayDate();
        
        // Dersleri yükle
        loadCourses();
        
        // Oturumları yükle
        loadSessions();
        
        // Timer'dan gelen süreyi kontrol et
        checkTimerData();
        
        // Event listener'ları ekle
        setupEventListeners();
    }

    function setupEventListeners() {
        // Ders ekleme
        addCourseBtn.addEventListener('click', handleAddCourse);
        
        // Konu ekleme
        addTopicBtn.addEventListener('click', handleAddTopic);
        
        // Oturum ekleme
        addSessionBtn.addEventListener('click', handleAddSession);
        
        // Ders seçildiğinde konuları yükle
        courseSelect.addEventListener('change', handleCourseChange);
    }

    // === DERS YÖNETİMİ ===

    function loadCourses() {
        const courses = Storage.getCourses();
        courseSelect.innerHTML = '<option value="">Ders Seçin</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    }

    function handleAddCourse() {
        const courseName = prompt('Yeni ders adını girin:');
        
        if (!courseName) return;
        
        const result = Storage.addCourse(courseName);
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadCourses();
        } else {
            showNotification(result.message, 'error');
        }
    }

    // === KONU YÖNETİMİ ===

    function handleCourseChange() {
        const courseId = courseSelect.value;
        
        if (!courseId) {
            // Ders seçilmediğinde
            topicSelect.disabled = true;
            topicSelect.innerHTML = '<option value="">Konu Seçin</option>';
            topicSelect.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-400', 'dark:text-gray-500');
            topicSelect.classList.remove('bg-white', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
            
            topicsList.innerHTML = '<li>- Konuları görmek için bir ders seçin -</li>';
            return;
        }
        
        // Konuları yükle
        loadTopics(courseId);
        
        // Konu seçimini aktif et
        topicSelect.disabled = false;
        topicSelect.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-400', 'dark:text-gray-500');
        topicSelect.classList.add('bg-white', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
    }

    function loadTopics(courseId) {
        const topics = Storage.getTopicsByCourse(courseId);
        
        // Select'i güncelle
        topicSelect.innerHTML = '<option value="">Konu Seçin</option>';
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.name;
            topicSelect.appendChild(option);
        });
        
        // Konular listesini güncelle
        if (topics.length === 0) {
            topicsList.innerHTML = '<li class="text-gray-400">- Henüz konu eklenmemiş -</li>';
        } else {
            topicsList.innerHTML = '';
            topics.forEach(topic => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between';
                li.innerHTML = `
                    <span>• ${topic.name}</span>
                    <button onclick="deleteTopic('${courseId}', '${topic.id}')" 
                            class="text-red-500 hover:text-red-700 text-sm">
                        Sil
                    </button>
                `;
                topicsList.appendChild(li);
            });
        }
    }

    function handleAddTopic() {
        const courseId = courseSelect.value;
        
        if (!courseId) {
            showNotification('Önce bir ders seçin!', 'error');
            return;
        }
        
        const topicName = prompt('Yeni konu adını girin:');
        
        if (!topicName) return;
        
        const result = Storage.addTopic(courseId, topicName);
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadTopics(courseId);
        } else {
            showNotification(result.message, 'error');
        }
    }

    // Konu silme (global fonksiyon)
    window.deleteTopic = function(courseId, topicId) {
        if (!confirm('Bu konuyu ve ilgili tüm kayıtları silmek istediğinize emin misiniz?')) {
            return;
        }
        
        const result = Storage.deleteTopic(courseId, topicId);
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadTopics(courseId);
            loadSessions();
        } else {
            showNotification(result.message, 'error');
        }
    };

    // === OTURUM YÖNETİMİ ===

    function handleAddSession() {
        const courseId = courseSelect.value;
        const topicId = topicSelect.value;
        const date = dateInput.value;
        const correct = parseInt(correctInput.value) || 0;
        const incorrect = parseInt(incorrectInput.value) || 0;
        const blank = parseInt(blankInput.value) || 0;
        
        // Süreyi dakikaya çevir
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        const totalMinutes = (hours * 60) + minutes + Math.round(seconds / 60);
        
        // Validasyon
        if (!courseId || !topicId) {
            showNotification('Ders ve konu seçmelisiniz!', 'error');
            return;
        }
        
        if (!date) {
            showNotification('Tarih seçmelisiniz!', 'error');
            return;
        }
        
        if (correct === 0 && incorrect === 0 && blank === 0) {
            showNotification('En az bir soru sayısı girmelisiniz!', 'error');
            return;
        }
        
        const sessionData = {
            courseId,
            topicId,
            date,
            correct,
            incorrect,
            blank,
            duration: totalMinutes
        };
        
        const result = Storage.addSession(sessionData);
        
        if (result.success) {
            showNotification(result.message, 'success');
            resetForm();
            loadSessions();
        } else {
            showNotification(result.message, 'error');
        }
    }

    function loadSessions() {
        const sessions = Storage.getSessionsSorted();
        
        if (sessions.length === 0) {
            sessionsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-8 text-center text-gray-400">
                        Henüz kayıt bulunmuyor. Yukarıdaki formu kullanarak yeni kayıt ekleyebilirsiniz.
                    </td>
                </tr>
            `;
            return;
        }
        
        sessionsTableBody.innerHTML = '';
        
        sessions.forEach((session, index) => {
            const tr = document.createElement('tr');
            const borderClass = index < sessions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : '';
            tr.className = `${borderClass} hover:bg-gray-50 dark:hover:bg-gray-700/50`;
            
            tr.innerHTML = `
                <td class="px-6 py-4">${Storage.formatDate(session.date)}</td>
                <td class="px-6 py-4">${session.courseName}</td>
                <td class="px-6 py-4">${session.topicName}</td>
                <td class="px-6 py-4 text-center">${session.correct}</td>
                <td class="px-6 py-4 text-center">${session.incorrect}</td>
                <td class="px-6 py-4 text-center">${session.blank}</td>
                <td class="px-6 py-4 text-center font-bold">${session.net}</td>
                <td class="px-6 py-4 text-center">${session.duration}</td>
            `;
            
            sessionsTableBody.appendChild(tr);
        });
    }

    // === YARDIMCI FONKSİYONLAR ===

    function setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function resetForm() {
        // Tarih hariç formu sıfırla
        courseSelect.value = '';
        topicSelect.value = '';
        topicSelect.disabled = true;
        correctInput.value = '0';
        incorrectInput.value = '0';
        blankInput.value = '0';
        hoursInput.value = '0';
        minutesInput.value = '0';
        secondsInput.value = '0';
        
        // Konular listesini sıfırla
        topicsList.innerHTML = '<li>- Konuları görmek için bir ders seçin -</li>';
        
        // Konu select'ini deaktif et
        topicSelect.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-400', 'dark:text-gray-500');
        topicSelect.classList.remove('bg-white', 'dark:bg-gray-700', 'text-text-light', 'dark:text-text-dark');
    }

    function checkTimerData() {
        // Timer sayfasından gelen süre verisi varsa
        const timerData = Storage.get(Storage.KEYS.TIMER_STATE);
        
        if (timerData && timerData.transferToDataEntry) {
            const totalSeconds = timerData.seconds;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            hoursInput.value = hours;
            minutesInput.value = minutes;
            secondsInput.value = seconds;
            
            // Transfer flag'ini temizle
            timerData.transferToDataEntry = false;
            Storage.set(Storage.KEYS.TIMER_STATE, timerData);
            
            showNotification('Kronometre süresi aktarıldı!', 'success');
        }
    }

    function showNotification(message, type = 'info') {
        // Basit bir bildirim sistemi
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0`;
        
        // Tip'e göre renk
        if (type === 'success') {
            notification.classList.add('bg-green-500');
        } else if (type === 'error') {
            notification.classList.add('bg-red-500');
        } else {
            notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 3 saniye sonra kaldır
        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
