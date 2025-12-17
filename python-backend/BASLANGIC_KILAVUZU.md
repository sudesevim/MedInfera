# 🏥 Python Backend Başlangıç Kılavuzu

Bu kılavuz, MedInfera Python backend'ini nasıl çalıştıracağınızı adım adım açıklar.

## 📋 Gereksinimler

- Python 3.11 veya üzeri
- Ollama (AI model servisi)
- pip (Python paket yöneticisi)

## 🚀 Hızlı Başlangıç

### 1. Virtual Environment Oluşturma ve Bağımlılıkları Yükleme

```bash
cd python-backend

# Virtual environment oluştur
python3 -m venv venv

# Virtual environment'ı aktif et
source venv/bin/activate  # macOS/Linux için
# veya
# venv\Scripts\activate  # Windows için

# Bağımlılıkları yükle
pip install -r requirements.txt
```

### 2. Ollama Kurulumu ve Yapılandırması

**macOS için:**
```bash
# Homebrew ile kurulum
brew install ollama

# Ollama servisini başlat (arka planda çalışır)
ollama serve

# Yeni bir terminal açın ve modeli indirin
ollama pull llama2
```

**Yöntem 1: Python ile direkt çalıştırma**
```bash
cd python-backend
source venv/bin/activate  # Virtual environment'ı aktif et
python main.py
```

**Yöntem 2: start.sh scripti ile (macOS/Linux)**
```bash
cd python-backend
chmod +x start.sh
./start.sh
```

**Yöntem 3: uvicorn ile**
```bash
cd python-backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Backend Durumunu Kontrol Etme

Backend başladıktan sonra tarayıcınızda şu adresleri kontrol edin:

- **Health Check:** http://localhost:8000/health
- **API Dokümantasyonu:** http://localhost:8000/docs
- **Ollama Durumu:** http://localhost:8000/api/ollama/status

## 📱 React Native Uygulamasını Bağlama

### iOS Simulator için:
`src/config/environment.ts` dosyasında zaten doğru yapılandırılmış:
```typescript
PYTHON_BACKEND_URL: 'http://localhost:8000'
```

### Android Emulator için:
`src/config/environment.ts` dosyasını güncelleyin:
```typescript
PYTHON_BACKEND_URL: 'http://10.0.2.2:8000'
```

### Fiziksel Cihaz için:
Bilgisayarınızın IP adresini bulun ve güncelleyin:
```bash
# macOS/Linux için IP adresini bulma
ifconfig | grep "inet " | grep -v 127.0.0.1

# veya
ipconfig getifaddr en0  # macOS için
```

Sonra `src/config/environment.ts` dosyasını güncelleyin:
```typescript
PYTHON_BACKEND_URL: 'http://192.168.1.XXX:8000'  // IP adresinizi yazın
```

## 🔧 Sorun Giderme

### Backend başlamıyor
1. Virtual environment'ın aktif olduğundan emin olun: `which python` komutu `venv` içinde bir yol göstermeli
2. Port 8000'in kullanımda olmadığından emin olun:
   ```bash
   lsof -i :8000  # macOS/Linux
   # Eğer bir process varsa, onu durdurun
   ```

### Ollama bağlantı hatası
1. Ollama'nın çalıştığını kontrol edin:
   ```bash
   curl http://localhost:11434/api/tags
   ```
2. Modelin indirildiğini kontrol edin:
   ```bash
   ollama list
   ```
3. Model yoksa indirin:
   ```bash
   ollama pull llama2
   ```

### React Native uygulaması backend'e bağlanamıyor
1. Backend'in çalıştığını kontrol edin: http://localhost:8000/health
2. IP adresinin doğru olduğundan emin olun (fiziksel cihaz için)
3. Firewall ayarlarını kontrol edin
4. Aynı WiFi ağında olduğunuzdan emin olun (fiziksel cihaz için)

## 📝 Notlar

- Backend varsayılan olarak `http://localhost:8000` adresinde çalışır
- Ollama olmadan da çalışır, ancak mock (sahte) yanıtlar verir
- Production ortamında `.env` dosyası oluşturup güvenlik ayarlarını yapılandırın
- API dokümantasyonu için: http://localhost:8000/docs

## 🎯 Sonraki Adımlar

1. Backend'i başlatın
2. React Native uygulamasını çalıştırın
3. Chat ekranından bir mesaj gönderin
4. Backend'in yanıt verdiğini kontrol edin

Başarılar! 🎉

