import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: colors.primary[600],
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: colors.primary[600],
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 10,
    paddingBottom: 10,
    backgroundColor: colors.primary[600],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
    zIndex: 10,
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
  content: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  resultContent: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  symptomCardSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  symptomCardSelectedEmergency: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  symptomCardEmergency: {
    borderColor: colors.error,
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginLeft: 8,
  },
  symptomLabelSelected: {
    color: colors.surface,
  },
  symptomLabelSelectedEmergency: {
    color: colors.surface,
  },
  symptomLabelEmergency: {
    color: colors.error,
  },
  checkIcon: {
    marginLeft: 8,
  },
  riskFactorsContainer: {
    marginTop: 16,
  },
  exposureContainer: {
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary[300],
    backgroundColor: colors.surface,
  },
  radioButtonSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  radioTextSelected: {
    color: colors.surface,
  },
  saveButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0.1,
    elevation: 1,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    marginRight: 8,
  },
  saveButtonTextDisabled: {
    color: colors.gray[500],
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 3,
    width: '100%',
    marginBottom: 24,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  newScreeningButton: {
    backgroundColor: colors.primary[100],
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  newScreeningButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
});







