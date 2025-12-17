import { StyleSheet, StatusBar } from 'react-native';
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
    height: StatusBar.currentHeight || 0,
    backgroundColor: colors.primary[600],
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
    marginBottom: 20,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  circularProgressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepsDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepsLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  stepsTarget: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressBarContainer: {
    width: 150,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[200],
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  circularProgressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  circularProgressLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  circularProgressTarget: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  progressPercentage: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
});







