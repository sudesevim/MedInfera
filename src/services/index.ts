/**
 * Services Index
 * 
 * This file exports all services organized by category.
 * Services are kept in flat structure for simplicity.
 */

// ========================================
// 🔐 Authentication Services
// ========================================
export { authService } from './auth.service';

// ========================================
// 🔥 Firebase Services
// ========================================
export { firestoreService } from './firestore.service';
export { storageService } from './storage.service';

// ========================================
// 🤖 AI & Chat Services
// ========================================
export { aiService } from './ai.service';
export { chatService } from './chat.service';
export { pythonBackendService } from './python-backend.service';
export { conversationManagerService } from './conversation-manager.service';

// ========================================
// 🚨 Safety & Emergency Services
// ========================================
export { emergencyDetectorService } from './emergency-detector.service';
export { safetyFilterService } from './safety-filter.service';

// ========================================
// 🏥 Health Services
// ========================================
export { healthDataService } from './health-data.service';
export { healthInterpreterService } from './health-interpreter.service';
export { pdfExportService } from './pdf-export.service';

// ========================================
// 🛠️ Utility Services
// ========================================
export { errorHandlerService } from './error-handler.service';
