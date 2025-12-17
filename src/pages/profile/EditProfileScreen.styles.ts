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
  headerIconText: {
    fontSize: 40,
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
    fontSize: 24,
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
  inputDisabled: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[200],
    backgroundColor: colors.surface,
  },
  optionButtonActive: {
    borderWidth: 2,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[200],
    backgroundColor: colors.surface,
    minWidth: 75,
    justifyContent: 'center',
  },
  bloodTypeButtonActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  bloodTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  bloodTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  bloodTypeTextActive: {
    color: '#ef4444',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
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
    fontSize: 20,
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







