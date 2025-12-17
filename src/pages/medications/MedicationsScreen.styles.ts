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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  medicationsList: {
    marginBottom: 20,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    marginLeft: 8,
  },
});







