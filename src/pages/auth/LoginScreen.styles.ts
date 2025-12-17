import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
    color: colors.text.primary,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary[600],
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
});







