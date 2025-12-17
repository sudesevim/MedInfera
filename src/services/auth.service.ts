import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Kullanıcı kayıt işlemi
  async signUp({ email, password, displayName }: SignUpData): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Kullanıcı adını güncelle
      if (displayName && userCredential.user) {
        await userCredential.user.updateProfile({
          displayName,
        });
      }
      
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Kullanıcı giriş işlemi
  async signIn({ email, password }: SignInData): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Kullanıcı çıkış işlemi
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Şifre sıfırlama
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Şifre değiştirme
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      // Önce mevcut şifre ile yeniden kimlik doğrulama
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);

      // Yeni şifreyi ayarla
      await user.updatePassword(newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Mevcut kullanıcıyı al
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  // Auth durumu değişikliklerini dinle
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  }

  // Handle and translate auth errors
  private handleAuthError(error: any): Error {
    let message = 'An error occurred. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email address is already in use. Try signing in.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address. Please enter a valid email.';
        break;
      case 'auth/invalid-credential':
        message = 'No user found with this email or incorrect password. Please sign up first.';
        break;
      case 'auth/operation-not-allowed':
        message = 'This operation is not allowed at the moment.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Must be at least 6 characters.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled. Contact support.';
        break;
      case 'auth/user-not-found':
        message = 'No user found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again in a few minutes.';
        break;
      case 'auth/network-request-failed':
        message = 'Network connection error. Check your internet connection.';
        break;
      case 'auth/requires-recent-login':
        message = 'You need to sign in again to perform this action.';
        break;
      case 'auth/invalid-verification-code':
        message = 'Invalid verification code.';
        break;
      case 'auth/invalid-verification-id':
        message = 'Invalid verification ID.';
        break;
      case 'auth/missing-email':
        message = 'Email address is required.';
        break;
      case 'auth/missing-password':
        message = 'Password is required.';
        break;
      case 'auth/internal-error':
        message = 'Firebase Authentication is not enabled yet. Please enable Email/Password authentication from Firebase Console.';
        break;
      default:
        // Use Firebase message if available
        if (error.message) {
          message = error.message;
        }
    }

    return new Error(message);
  }
}

export const authService = new AuthService();