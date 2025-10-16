// NetPulse - Ayarlar Sayfası

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elementleri
    const totalCoursesEl = document.getElementById('totalCourses');
    const totalTopicsEl = document.getElementById('totalTopics');
    const totalSessionsEl = document.getElementById('totalSessions');
    
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const importFileInput = document.getElementById('importFileInput');

    // Sayfa yüklendiğinde
    init();

    function init() {
        loadStatistics();
        setupEventListeners();
    }

    function setupEventListeners() {
        importBtn.addEventListener('click', handleImport);
        exportBtn.addEventListener('click', handleExport);
        deleteAllBtn.addEventListener('click', handleDeleteAll);
        importFileInput.addEventListener('change', handleFileSelect);
    }

    // === İSTATİSTİKLER ===

    function loadStatistics() {
        const courses = Storage.getCourses();
        const sessions = Storage.getSessions();
        
        // Toplam ders sayısı
        totalCoursesEl.textContent = courses.length;
        
        // Toplam konu sayısı
        let totalTopics = 0;
        courses.forEach(course => {
            totalTopics += course.topics.length;
        });
        totalTopicsEl.textContent = totalTopics;
        
        // Toplam kayıt sayısı
        totalSessionsEl.textContent = sessions.length;
    }

    // === VERİ DIŞA AKTAR ===

    function handleExport() {
        try {
            const courses = Storage.getCourses();
            const sessions = Storage.getSessions();
            
            if (courses.length === 0 && sessions.length === 0) {
                showNotification('Dışa aktarılacak veri yok!', 'error');
                return;
            }
            
            // Tüm verileri topla
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                data: {
                    courses: courses,
                    sessions: sessions
                }
            };
            
            // JSON'a çevir
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Blob oluştur
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // İndirme linki oluştur
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Dosya adı (tarih ile)
            const date = new Date().toISOString().split('T')[0];
            link.download = `netpulse-backup-${date}.json`;
            
            // İndir
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // URL'i temizle
            URL.revokeObjectURL(url);
            
            showNotification('Veriler başarıyla dışa aktarıldı!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Dışa aktarma sırasında hata oluştu!', 'error');
        }
    }

    // === VERİ İÇE AKTAR ===

    function handleImport() {
        // Dosya seçiciyi tetikle
        importFileInput.click();
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        // Dosya tipini kontrol et
        if (!file.name.endsWith('.json')) {
            showNotification('Lütfen geçerli bir JSON dosyası seçin!', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Veri yapısını kontrol et
                if (!importData.data || !importData.data.courses || !importData.data.sessions) {
                    showNotification('Geçersiz veri formatı!', 'error');
                    return;
                }
                
                // Onay iste
                const confirmMsg = `Bu işlem mevcut verilerin üzerine yazacak!\n\n` +
                    `İçe aktarılacak:\n` +
                    `- ${importData.data.courses.length} ders\n` +
                    `- ${importData.data.sessions.length} kayıt\n\n` +
                    `Devam etmek istiyor musunuz?`;
                
                if (!confirm(confirmMsg)) {
                    return;
                }
                
                // Verileri kaydet
                Storage.set(Storage.KEYS.COURSES, importData.data.courses);
                Storage.set(Storage.KEYS.SESSIONS, importData.data.sessions);
                
                // İstatistikleri güncelle
                loadStatistics();
                
                showNotification('Veriler başarıyla içe aktarıldı!', 'success');
                
                // 2 saniye sonra sayfayı yenile
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                console.error('Import error:', error);
                showNotification('Dosya okuma hatası! Geçerli bir yedek dosyası seçin.', 'error');
            }
        };
        
        reader.onerror = function() {
            showNotification('Dosya okuma hatası!', 'error');
        };
        
        reader.readAsText(file);
        
        // Input'u temizle (aynı dosya tekrar seçilebilsin)
        event.target.value = '';
    }

    // === TÜM VERİLERİ SİL ===

    function handleDeleteAll() {
        const courses = Storage.getCourses();
        const sessions = Storage.getSessions();
        
        if (courses.length === 0 && sessions.length === 0) {
            showNotification('Silinecek veri yok!', 'error');
            return;
        }
        
        // Modal'ı aç
        openModal('deleteAllModal');
    }

    window.confirmDeleteAll = function() {
        // Tüm verileri sil
        Storage.set(Storage.KEYS.COURSES, []);
        Storage.set(Storage.KEYS.SESSIONS, []);
        Storage.remove(Storage.KEYS.TIMER_STATE);
        
        // Modal'ı kapat
        closeModal('deleteAllModal');
        
        // İstatistikleri güncelle
        loadStatistics();
        
        showNotification('Tüm veriler silindi!', 'success');
        
        // 2 saniye sonra ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    };

    // === MODAL YÖNETİMİ ===

    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    // ESC tuşu ile modal kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('[id$="Modal"]');
            modals.forEach(modal => {
                if (!modal.classList.contains('hidden')) {
                    closeModal(modal.id);
                }
            });
        }
    });

    // Modal dışına tıklayınca kapatma
    document.addEventListener('click', function(e) {
        if (e.target.id && e.target.id.endsWith('Modal')) {
            closeModal(e.target.id);
        }
    });

    // === YARDIMCI FONKSİYONLAR ===

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0`;
        
        if (type === 'success') {
            notification.classList.add('bg-green-500');
        } else if (type === 'error') {
            notification.classList.add('bg-red-500');
        } else {
            notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
