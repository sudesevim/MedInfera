# 🏥 MedInfera - AI-Powered Health Assistant

MedInfera is a comprehensive mobile health application that allows users to track their health data, receive AI-powered health consultations, and manage medications.

## 🎯 Project Goal

The primary goal of MedInfera is to provide users with a safe, accessible, and intelligent health management platform. The application uses artificial intelligence technologies to answer users' health questions, analyze health data, and detect emergencies.

## ✨ Features

### 🤖 AI-Powered Health Chatbot
- Natural language processing for health questions
- Personalized recommendations based on health context
- Emergency detection and alert system
- Safety filters and medical warnings

### 📊 Health Data Tracking
- **Vital Signs:** Weight, heart rate, blood pressure
- **Lifestyle:** Sleep hours, water intake, step count
- **Health History:** Data trends over time
- **Visualization:** Charts and statistics

### 💊 Medication Management
- Medication list and tracking
- Drug interaction checks
- Medication information and warnings

### 🚨 Emergency Support
- Emergency symptom detection
- Automatic alert system
- Emergency service referrals

### 🔐 Security and Privacy
- Secure login with Firebase Authentication
- Data storage with Firestore
- Medical information security filters
- User data encryption

### 📱 Platform Support
- iOS and Android support
- Modern and user-friendly interface
- Offline operation support

## 🛠️ Technologies

### Frontend (React Native)
- **React Native 0.82.1** - Cross-platform mobile development
- **TypeScript** - Type safety
- **React Navigation** - Navigation management
- **Firebase SDK** - Authentication, Firestore, Storage
- **React Native Vector Icons** - Icon library

### Backend (Python FastAPI)
- **FastAPI** - Modern Python web framework
- **Ollama** - Local AI model service (Llama2)
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Infrastructure
- **Firebase** - Authentication, Firestore, Storage
- **Ollama** - AI model service
- **Node.js 20+** - Runtime environment

## 📋 Requirements

### For Mobile Application
- Node.js >= 20
- npm or yarn
- React Native CLI
- iOS: Xcode 14+ (for macOS)
- Android: Android Studio and JDK

### For Backend
- Python 3.11+
- pip
- Ollama (AI model service)

## 🚀 Installation

### 1. Clone the Project

```bash
git clone https://github.com/sudesevim/MedInfera.git
cd MedInfera
```

### 2. Install Dependencies

```bash
# Node.js dependencies
npm install

# iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### 3. Firebase Configuration

1. Create a new project in Firebase Console
2. Add iOS and Android applications
3. Copy `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) files to their respective folders
4. Enable Firebase Authentication, Firestore, and Storage

### 4. Backend Installation

```bash
cd python-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 5. Ollama Installation

**macOS:**
```bash
brew install ollama
ollama serve
ollama pull llama2
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull llama2
```

**Windows:**
Download and install from [Ollama website](https://ollama.ai).

## 🏃 Running

### Starting the Backend

**Method 1: Automatic Script (Recommended)**
```bash
cd python-backend
chmod +x start.sh
./start.sh
```

**Method 2: Manual Start**
```bash
cd python-backend
source venv/bin/activate
python main.py
```

**Method 3: Using Uvicorn**
```bash
cd python-backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

After the backend starts:
- Health Check: http://localhost:8000/health
- API Documentation: http://localhost:8000/docs

### Starting the Mobile Application

**Start Metro Bundler:**
```bash
npm start
```

**For iOS:**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

### Restarting the Backend

```bash
chmod +x restart-backend.sh
./restart-backend.sh
```

## ⚙️ Configuration

### Backend URL Configuration

Configure the backend URL in `src/config/environment.ts`:

- **iOS Simulator:** `http://localhost:8000`
- **Android Emulator:** `http://10.0.2.2:8000`
- **Physical Device:** Your computer's IP address (e.g., `http://192.168.1.XXX:8000`)

To find your IP address:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1
# or
ipconfig getifaddr en0  # macOS
```

### Firebase Configuration

Make sure your Firebase configuration files are in the correct locations:
- iOS: `ios/MedInfera/GoogleService-Info.plist`
- Android: `android/app/google-services.json`

## 📱 Usage

1. **Sign Up/Login:** Create an account or log in with Firebase Authentication
2. **Health Data:** Enter and track your health data from the home screen
3. **Chat:** Ask health questions with the AI assistant
4. **Medications:** Manage your medication list and check interactions
5. **Profile:** Update your personal information and settings

## 🧪 Testing

```bash
# Run all tests
npm test

# Test backend connection
node test-backend-connection.js

# Test chat request
node test-chat-request.js
```

## 📁 Project Structure

```
MedInfera/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Screens
│   ├── services/       # Business logic services
│   ├── navigation/     # Navigation configuration
│   ├── config/         # Configuration files
│   └── types/          # TypeScript type definitions
├── python-backend/     # FastAPI backend
│   ├── services/       # Backend services
│   ├── models/         # Data models
│   └── main.py         # Main application file
├── ios/                # iOS native code
├── android/            # Android native code
└── __tests__/          # Test files
```

## 🔒 Security

- All medical information passes through security filters
- Emergencies are automatically detected
- User data is encrypted with Firebase
- API requests are protected with security tokens

## ⚠️ Important Notes

- This application does not provide medical advice, it is for informational purposes only
- Always seek professional medical help in emergencies
- Consult your doctor regarding medication use
- AI responses always come with medical warnings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This is a private project. All rights reserved.

## 📞 Contact

You can open an issue for questions or contact the project owner.

## 🙏 Acknowledgments

- React Native community
- Firebase team
- Ollama project
- All open source contributors

---

**Track your health with MedInfera, make informed decisions! 🏥💚**
