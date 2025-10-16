// NetPulse - LocalStorage Veri Yönetimi Modülü

const Storage = {
    // Storage anahtarları
    KEYS: {
        COURSES: 'netpulse_courses',
        SESSIONS: 'netpulse_sessions',
        TIMER_STATE: 'netpulse_timer_state'
    },

    // Veri okuma
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Veri okuma hatası (${key}):`, error);
            return null;
        }
    },

    // Veri yazma
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Veri yazma hatası (${key}):`, error);
            return false;
        }
    },

    // Veri silme
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Veri silme hatası (${key}):`, error);
            return false;
        }
    },

    // Tüm verileri temizle
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Veri temizleme hatası:', error);
            return false;
        }
    },

    // === DERS YÖNETİMİ ===

    // Tüm dersleri getir
    getCourses() {
        const courses = this.get(this.KEYS.COURSES);
        return courses || [];
    },

    // Ders ekle
    addCourse(courseName) {
        if (!courseName || courseName.trim() === '') {
            return { success: false, message: 'Ders adı boş olamaz!' };
        }

        const courses = this.getCourses();
        
        // Aynı isimde ders var mı kontrol et
        if (courses.some(c => c.name.toLowerCase() === courseName.toLowerCase())) {
            return { success: false, message: 'Bu ders zaten mevcut!' };
        }

        const newCourse = {
            id: this.generateId(),
            name: courseName.trim(),
            topics: [],
            createdAt: new Date().toISOString()
        };

        courses.push(newCourse);
        this.set(this.KEYS.COURSES, courses);

        return { success: true, message: 'Ders başarıyla eklendi!', course: newCourse };
    },

    // Ders sil
    deleteCourse(courseId) {
        const courses = this.getCourses();
        const filteredCourses = courses.filter(c => c.id !== courseId);
        
        if (courses.length === filteredCourses.length) {
            return { success: false, message: 'Ders bulunamadı!' };
        }

        this.set(this.KEYS.COURSES, filteredCourses);
        
        // İlgili oturumları da sil
        const sessions = this.getSessions();
        const filteredSessions = sessions.filter(s => s.courseId !== courseId);
        this.set(this.KEYS.SESSIONS, filteredSessions);

        return { success: true, message: 'Ders ve ilgili kayıtlar silindi!' };
    },

    // ID'ye göre ders getir
    getCourseById(courseId) {
        const courses = this.getCourses();
        return courses.find(c => c.id === courseId);
    },

    // === KONU YÖNETİMİ ===

    // Derse konu ekle
    addTopic(courseId, topicName) {
        if (!topicName || topicName.trim() === '') {
            return { success: false, message: 'Konu adı boş olamaz!' };
        }

        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);

        if (!course) {
            return { success: false, message: 'Ders bulunamadı!' };
        }

        // Aynı isimde konu var mı kontrol et
        if (course.topics.some(t => t.name.toLowerCase() === topicName.toLowerCase())) {
            return { success: false, message: 'Bu konu zaten mevcut!' };
        }

        const newTopic = {
            id: this.generateId(),
            courseId: courseId,
            name: topicName.trim(),
            createdAt: new Date().toISOString()
        };

        course.topics.push(newTopic);
        this.set(this.KEYS.COURSES, courses);

        return { success: true, message: 'Konu başarıyla eklendi!', topic: newTopic };
    },

    // Dersin konularını getir
    getTopicsByCourse(courseId) {
        const course = this.getCourseById(courseId);
        return course ? course.topics : [];
    },

    // Konu sil
    deleteTopic(courseId, topicId) {
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);

        if (!course) {
            return { success: false, message: 'Ders bulunamadı!' };
        }

        const originalLength = course.topics.length;
        course.topics = course.topics.filter(t => t.id !== topicId);

        if (course.topics.length === originalLength) {
            return { success: false, message: 'Konu bulunamadı!' };
        }

        this.set(this.KEYS.COURSES, courses);

        // İlgili oturumları da sil
        const sessions = this.getSessions();
        const filteredSessions = sessions.filter(s => s.topicId !== topicId);
        this.set(this.KEYS.SESSIONS, filteredSessions);

        return { success: true, message: 'Konu ve ilgili kayıtlar silindi!' };
    },

    // === ÇALIŞMA OTURUMU YÖNETİMİ ===

    // Tüm oturumları getir
    getSessions() {
        const sessions = this.get(this.KEYS.SESSIONS);
        return sessions || [];
    },

    // Oturum ekle
    addSession(sessionData) {
        const { courseId, topicId, date, correct, incorrect, blank, duration } = sessionData;

        // Validasyon
        if (!courseId || !topicId || !date) {
            return { success: false, message: 'Ders, konu ve tarih seçilmelidir!' };
        }

        // Ders ve konu kontrolü
        const course = this.getCourseById(courseId);
        if (!course) {
            return { success: false, message: 'Seçilen ders bulunamadı!' };
        }

        const topic = course.topics.find(t => t.id === topicId);
        if (!topic) {
            return { success: false, message: 'Seçilen konu bulunamadı!' };
        }

        // Net hesaplama (Doğru - (Yanlış / 4))
        const net = correct - (incorrect / 4);

        const newSession = {
            id: this.generateId(),
            courseId: courseId,
            courseName: course.name,
            topicId: topicId,
            topicName: topic.name,
            date: date,
            correct: parseInt(correct) || 0,
            incorrect: parseInt(incorrect) || 0,
            blank: parseInt(blank) || 0,
            net: parseFloat(net.toFixed(2)),
            duration: parseInt(duration) || 0, // dakika cinsinden
            createdAt: new Date().toISOString()
        };

        const sessions = this.getSessions();
        sessions.push(newSession);
        this.set(this.KEYS.SESSIONS, sessions);

        return { success: true, message: 'Çalışma kaydı başarıyla eklendi!', session: newSession };
    },

    // Oturum sil
    deleteSession(sessionId) {
        const sessions = this.getSessions();
        const filteredSessions = sessions.filter(s => s.id !== sessionId);

        if (sessions.length === filteredSessions.length) {
            return { success: false, message: 'Kayıt bulunamadı!' };
        }

        this.set(this.KEYS.SESSIONS, filteredSessions);
        return { success: true, message: 'Kayıt silindi!' };
    },

    // Oturumları tarihe göre sırala (en yeni önce)
    getSessionsSorted() {
        const sessions = this.getSessions();
        return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Derse göre oturumları getir
    getSessionsByCourse(courseId) {
        const sessions = this.getSessions();
        return sessions.filter(s => s.courseId === courseId);
    },

    // Konuya göre oturumları getir
    getSessionsByTopic(topicId) {
        const sessions = this.getSessions();
        return sessions.filter(s => s.topicId === topicId);
    },

    // === YARDIMCI FONKSİYONLAR ===

    // Benzersiz ID üret
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Tarih formatla (DD.MM.YYYY)
    formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    },

    // Süreyi formatla (dakika -> saat:dakika formatı)
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}s ${mins}dk`;
        }
        return `${mins}dk`;
    }
};

// Global erişim için
window.Storage = Storage;
