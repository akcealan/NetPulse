// NetPulse - Timer/Kronometre Sayfası

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elementleri
    const hoursDisplay = document.getElementById('hoursDisplay');
    const minutesDisplay = document.getElementById('minutesDisplay');
    const secondsDisplay = document.getElementById('secondsDisplay');
    
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const transferBtn = document.getElementById('transferBtn');

    // Timer durumu
    let timerState = {
        seconds: 0,
        isRunning: false,
        intervalId: null,
        isTransferring: false // Transfer işlemi sırasında true olacak
    };

    // Sayfa yüklendiğinde
    init();

    function init() {
        // LocalStorage'dan timer durumunu yükle
        loadTimerState();
        
        // Ekranı güncelle
        updateDisplay();
        
        // Event listener'ları ekle
        setupEventListeners();
        
        // Eğer timer çalışıyorsa devam ettir
        if (timerState.isRunning) {
            startTimer();
        }
        
        // Buton durumlarını güncelle
        updateButtonStates();
    }

    function setupEventListeners() {
        startBtn.addEventListener('click', handleStart);
        pauseBtn.addEventListener('click', handlePause);
        resetBtn.addEventListener('click', handleReset);
        transferBtn.addEventListener('click', handleTransfer);
        
        // Sayfa kapatılmadan önce durumu kaydet (transfer sırasında değil)
        window.addEventListener('beforeunload', function() {
            if (!timerState.isTransferring) {
                saveTimerState();
            }
        });
        
        // Sayfa gizlendiğinde durumu kaydet (transfer sırasında değil)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden && !timerState.isTransferring) {
                saveTimerState();
            }
        });
    }

    // === TIMER FONKSİYONLARI ===

    function handleStart() {
        if (!timerState.isRunning) {
            timerState.isRunning = true;
            startTimer();
            updateButtonStates();
            saveTimerState();
        }
    }

    function handlePause() {
        if (timerState.isRunning) {
            timerState.isRunning = false;
            stopTimer();
            updateButtonStates();
            saveTimerState();
        }
    }

    function handleReset() {
        // Onay iste
        if (timerState.seconds > 0) {
            if (!confirm('Kronometreyi sıfırlamak istediğinize emin misiniz?')) {
                return;
            }
        }
        
        timerState.isRunning = false;
        timerState.seconds = 0;
        stopTimer();
        updateDisplay();
        updateButtonStates();
        saveTimerState();
        
        showNotification('Kronometre sıfırlandı', 'info');
    }

    function handleTransfer() {
        if (timerState.seconds === 0) {
            showNotification('Aktarılacak süre yok!', 'error');
            return;
        }
        
        // Transfer işlemi başladı - flag'i set et
        timerState.isTransferring = true;
        
        // Timer'ı durdur
        if (timerState.isRunning) {
            timerState.isRunning = false;
            stopTimer();
        }
        
        // Süreyi LocalStorage'a kaydet (veri giriş sayfası için)
        const transferData = {
            seconds: timerState.seconds,
            transferToDataEntry: true,
            timestamp: new Date().toISOString()
        };
        
        console.log('Transferring data:', transferData); // Debug
        Storage.set(Storage.KEYS.TIMER_STATE, transferData);
        
        // Kontrol et
        const check = Storage.get(Storage.KEYS.TIMER_STATE);
        console.log('Saved data check:', check); // Debug
        
        showNotification('Süre aktarıldı! Veri giriş sayfasına yönlendiriliyorsunuz...', 'success');
        
        // 1.5 saniye sonra veri giriş sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'dataentry.html';
        }, 1500);
    }

    function startTimer() {
        // Önceki interval'i temizle
        if (timerState.intervalId) {
            clearInterval(timerState.intervalId);
        }
        
        // Her saniye güncelle
        timerState.intervalId = setInterval(() => {
            timerState.seconds++;
            updateDisplay();
            
            // Her 10 saniyede bir kaydet (performans için)
            if (timerState.seconds % 10 === 0) {
                saveTimerState();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerState.intervalId) {
            clearInterval(timerState.intervalId);
            timerState.intervalId = null;
        }
    }

    // === EKRAN GÜNCELLEMESİ ===

    function updateDisplay() {
        const hours = Math.floor(timerState.seconds / 3600);
        const minutes = Math.floor((timerState.seconds % 3600) / 60);
        const seconds = timerState.seconds % 60;
        
        hoursDisplay.textContent = padZero(hours);
        minutesDisplay.textContent = padZero(minutes);
        secondsDisplay.textContent = padZero(seconds);
        
        // Transfer butonunu aktif/pasif yap
        transferBtn.disabled = timerState.seconds === 0;
        
        // Disabled butonların stilini güncelle
        if (transferBtn.disabled) {
            transferBtn.classList.add('opacity-50', 'cursor-not-allowed');
            transferBtn.classList.remove('hover:scale-105', 'active:scale-95');
        } else {
            transferBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            transferBtn.classList.add('hover:scale-105', 'active:scale-95');
        }
    }

    function updateButtonStates() {
        if (timerState.isRunning) {
            // Timer çalışıyor
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
            
            startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            startBtn.classList.remove('hover:scale-105', 'active:scale-95');
            
            pauseBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            pauseBtn.classList.add('hover:scale-105', 'active:scale-95');
        } else {
            // Timer durmuş
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = timerState.seconds === 0;
            
            startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            startBtn.classList.add('hover:scale-105', 'active:scale-95');
            
            pauseBtn.classList.add('opacity-50', 'cursor-not-allowed');
            pauseBtn.classList.remove('hover:scale-105', 'active:scale-95');
            
            if (resetBtn.disabled) {
                resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
                resetBtn.classList.remove('hover:scale-105', 'active:scale-95');
            } else {
                resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                resetBtn.classList.add('hover:scale-105', 'active:scale-95');
            }
        }
    }

    // === LOCALSTORAGE İŞLEMLERİ ===

    function saveTimerState(preserveTransfer = false) {
        // Mevcut state'i al
        const currentState = Storage.get(Storage.KEYS.TIMER_STATE);
        
        const stateToSave = {
            seconds: timerState.seconds,
            isRunning: timerState.isRunning,
            lastUpdate: new Date().toISOString()
        };
        
        // Eğer transfer flag'i varsa ve korumamız isteniyorsa, koru
        if (preserveTransfer && currentState && currentState.transferToDataEntry) {
            stateToSave.transferToDataEntry = true;
            stateToSave.timestamp = currentState.timestamp;
        }
        
        Storage.set(Storage.KEYS.TIMER_STATE, stateToSave);
    }

    function loadTimerState() {
        const savedState = Storage.get(Storage.KEYS.TIMER_STATE);
        
        if (savedState) {
            // Transfer flag'i varsa ve aktifse, temizle
            if (savedState.transferToDataEntry) {
                // Transfer işlemi yapılmış, durumu sıfırla
                timerState.seconds = 0;
                timerState.isRunning = false;
                saveTimerState();
                return;
            }
            
            timerState.seconds = savedState.seconds || 0;
            timerState.isRunning = savedState.isRunning || false;
            
            // Eğer timer çalışıyordu ve sayfa yeniden yüklendiyse
            // Son güncelleme zamanından bu yana geçen süreyi ekle
            if (timerState.isRunning && savedState.lastUpdate) {
                const lastUpdate = new Date(savedState.lastUpdate);
                const now = new Date();
                const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
                
                // Makul bir süre kontrolü (max 1 saat)
                if (elapsedSeconds > 0 && elapsedSeconds < 3600) {
                    timerState.seconds += elapsedSeconds;
                }
            }
        }
    }

    // === YARDIMCI FONKSİYONLAR ===

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

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

    // Klavye kısayolları
    document.addEventListener('keydown', function(e) {
        // Space: Başlat/Durdur
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (timerState.isRunning) {
                handlePause();
            } else {
                handleStart();
            }
        }
        
        // R: Reset
        if (e.code === 'KeyR' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            handleReset();
        }
        
        // T: Transfer
        if (e.code === 'KeyT' && !e.target.matches('input, textarea') && !transferBtn.disabled) {
            e.preventDefault();
            handleTransfer();
        }
    });
});
