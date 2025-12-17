import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: colors.background,
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 8,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  logoContainer: {
    backgroundColor: colors.primary[100],
    borderRadius: 100,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    paddingLeft: 2,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.primary[100],
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
    width: '31%',
    minWidth: 100,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  metricEmpty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  recentSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  placeholderBox: {
    backgroundColor: colors.primary[100],
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    marginRight: 8,
  },
});







