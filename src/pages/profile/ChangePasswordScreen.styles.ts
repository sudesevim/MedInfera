import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.primary[600],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerRight: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary[200],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    marginLeft: 4,
  },
  actions: {
    marginTop: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary[600],
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: colors.primary[100],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});







