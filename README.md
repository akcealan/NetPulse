# NetPulse

NetPulse, öğrencilerin ders çalışma süreçlerini düzenlemesine ve performanslarını takip etmesine yardımcı olan tarayıcı tabanlı bir çalışma takip uygulamasıdır.

[Canlı Demoyu Aç](https://huxkon.github.io/NetPulse/) | [Kaynak Kodları Görüntüle](https://github.com/huxkon/NetPulse)

## Proje Hakkında

NetPulse ile kullanıcılar derslerini ve konularını oluşturabilir, çözdükleri soruları kaydedebilir, çalışma sürelerini takip edebilir ve performanslarını ayrıntılı istatistikler üzerinden inceleyebilir.

Uygulama herhangi bir üyelik veya sunucu gerektirmeden doğrudan tarayıcı üzerinde çalışır. Kullanıcı verileri tarayıcının LocalStorage alanında saklanır.

## Özellikler

- Ders ve konu oluşturma
- Çalışma kayıtları ekleme
- Doğru, yanlış ve boş soru takibi
- Otomatik net hesaplama
- Çalışma süresi kaydetme
- Dahili çalışma kronometresi
- Günlük, haftalık ve aylık istatistikler
- Ders ve konu bazlı performans analizi
- Son çalışma kayıtlarını görüntüleme
- Açık ve koyu tema desteği
- JSON formatında veri yedekleme
- Yedeklenen verileri tekrar içe aktarma
- Tarayıcıdaki bütün verileri sıfırlama
- Telefon, tablet ve bilgisayarlarla uyumlu responsive tasarım

## Net Hesaplama

NetPulse, net sonucunu aşağıdaki formüle göre hesaplar:

```text
Net = Doğru Sayısı - (Yanlış Sayısı / 4)
```

## Kullanılan Teknolojiler

- HTML5
- Tailwind CSS
- JavaScript
- LocalStorage
- Google Fonts
- Material Symbols

## Sayfalar

- `index.html` — Genel çalışma paneli
- `dataentry.html` — Ders, konu ve çalışma kaydı işlemleri
- `stats.html` — İstatistikler ve performans analizi
- `timer.html` — Çalışma kronometresi
- `settings.html` — Yedekleme ve veri yönetimi

## Proje Yapısı

```text
NetPulse/
├── index.html
├── dataentry.html
├── stats.html
├── timer.html
├── settings.html
└── js/
    ├── dashboard.js
    ├── dataentry.js
    ├── settings.js
    ├── stats.js
    ├── storage.js
    ├── theme.js
    └── timer.js
```

## Yerel Olarak Çalıştırma

Projeyi bilgisayarınıza klonlayın:

```bash
git clone https://github.com/huxkon/NetPulse.git
cd NetPulse
```

Daha sonra `index.html` dosyasını tarayıcıda açabilirsiniz.

Visual Studio Code kullanıyorsanız projeyi **Live Server** eklentisiyle de çalıştırabilirsiniz.

## Veri Saklama

Dersler, konular, çalışma kayıtları, kronometre bilgileri ve tema tercihi tarayıcının LocalStorage alanında saklanır.

Tarayıcı verileri temizlendiğinde kayıtlar silinebileceği için ayarlar sayfasındaki JSON yedekleme özelliğinin kullanılması önerilir.

## English

NetPulse is a responsive, browser-based study tracking application. Users can manage courses and topics, record study sessions, calculate net scores, track study time, and analyse their performance through detailed statistics.

The application works without an account or backend. All user data is stored locally in the browser.

## Geliştirici

[huxkon](https://github.com/huxkon)
