// Health Data Interpretation Service
// Analyzes health metrics and provides insights and recommendations

import { HealthContext, VitalSigns, Symptom } from '../types/chatbot.types';
import { healthDataService } from './health-data.service';

interface HealthTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  severity: 'normal' | 'concerning' | 'critical';
  description: string;
  recommendation: string;
}

interface HealthInsight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  recommendations: string[];
  dataPoints: string[];
}

export class HealthInterpreterService {
  
  // Normal ranges for vital signs
  private readonly normalRanges = {
    blood_pressure: {
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 }
    },
    heart_rate: { min: 60, max: 100 },
    temperature: { min: 36.1, max: 37.2 },
    weight: { min: 0, max: 1000 }, // Will be personalized based on user
    blood_sugar: {
      fasting: { min: 70, max: 100 },
      postprandial: { min: 70, max: 140 }
    }
  };

  /**
   * Analyze recent health data trends
   */
  async analyzeHealthMetrics(userId: string, days: number = 30): Promise<HealthInsight[]> {
    try {
      const healthContext = await healthDataService.getUserHealthContext(userId);
      const recentVitals = await healthDataService.getRecentVitals(userId, days);
      
      const insights: HealthInsight[] = [];
      
      // Analyze vital signs trends
      const vitalTrends = this.analyzeVitalTrends(recentVitals);
      vitalTrends.forEach(trend => {
        insights.push(this.convertTrendToInsight(trend));
      });
      
      // Analyze symptom patterns
      const symptomInsights = await this.analyzeSymptomPatterns(userId, days);
      insights.push(...symptomInsights);
      
      // Analyze medication adherence (if applicable)
      const medicationInsights = this.analyzeMedicationAdherence(healthContext);
      if (medicationInsights) {
        insights.push(medicationInsights);
      }
      
      // Overall health assessment
      const overallAssessment = this.generateOverallAssessment(healthContext, recentVitals);
      insights.push(overallAssessment);
      
      return insights;
    } catch (error: any) {
      console.error('HealthInterpreter analyzeHealthMetrics error:', error);
      return [{
        title: 'Analysis Error',
        description: 'Your health data could not be analyzed.',
        severity: 'warning',
        recommendations: ['Please try again later', 'Check your data'],
        dataPoints: []
      }];
    }
  }

  /**
   * Interpret specific vital sign values
   */
  interpretVitalSigns(vitals: VitalSigns[]): string {
    if (vitals.length === 0) {
      return 'No vital sign data available for analysis.';
    }

    let interpretation = '📊 **Interpretation of Your Vital Signs**\n\n';
    
    // Group vitals by type
    const vitalsByType = this.groupVitalsByType(vitals);
    
    Object.entries(vitalsByType).forEach(([type, values]) => {
      const typeInterpretation = this.interpretVitalType(type as VitalSigns['type'], values);
      interpretation += `${typeInterpretation}\n\n`;
    });
    
    interpretation += '💡 **General Recommendations:**\n';
    interpretation += '• Continue regular measurements\n';
    interpretation += '• Share abnormal values with your doctor\n';
    interpretation += '• Track the impact of lifestyle changes';
    
    return interpretation;
  }

  /**
   * Detect abnormal patterns in health data
   */
  detectAbnormalPatterns(healthContext: HealthContext): HealthInsight[] {
    const abnormalPatterns: HealthInsight[] = [];
    
    try {
      // Check for concerning vital sign patterns
      const vitalPatterns = this.detectVitalAbnormalities(healthContext.recentVitals);
      abnormalPatterns.push(...vitalPatterns);
      
      // Check for symptom escalation
      const symptomPatterns = this.detectSymptomEscalation(healthContext.recentSymptoms);
      abnormalPatterns.push(...symptomPatterns);
      
      // Check for medication-related patterns
      const medicationPatterns = this.detectMedicationIssues(healthContext);
      abnormalPatterns.push(...medicationPatterns);
      
    } catch (error: any) {
      console.error('HealthInterpreter detectAbnormalPatterns error:', error);
    }
    
    return abnormalPatterns;
  }

  /**
   * Generate lifestyle recommendations based on health data
   */
  generateLifestyleRecommendations(healthContext: HealthContext): string[] {
    const recommendations: string[] = [];
    
    try {
      // Analyze vital signs for lifestyle recommendations
      if (healthContext.recentVitals.length > 0) {
        const bpVitals = healthContext.recentVitals.filter(v => v.type === 'blood_pressure');
        if (bpVitals.length > 0) {
          const avgBP = this.calculateAverageBloodPressure(bpVitals);
          if (avgBP.systolic > 130 || avgBP.diastolic > 85) {
            recommendations.push('Reduce salt intake and exercise regularly');
            recommendations.push('Learn stress management techniques');
          }
        }
        
        const weightVitals = healthContext.recentVitals.filter(v => v.type === 'weight');
        if (weightVitals.length >= 2) {
          const weightTrend = this.calculateWeightTrend(weightVitals);
          if (weightTrend === 'increasing') {
            recommendations.push('Review your eating habits');
            recommendations.push('Increase your daily physical activity');
          }
        }
      }
      
      // Analyze symptoms for lifestyle recommendations
      if (healthContext.recentSymptoms.length > 0) {
        const stressSymptoms = healthContext.recentSymptoms.filter(s => 
          s.name.toLowerCase().includes('headache') || 
          s.name.toLowerCase().includes('fatigue')
        );
        
        if (stressSymptoms.length > 0) {
          recommendations.push('Regulate your sleep schedule (7-8 hours)');
          recommendations.push('Take regular rest breaks');
        }
      }
      
      // General recommendations
      if (recommendations.length === 0) {
        recommendations.push('Continue balanced nutrition');
        recommendations.push('Exercise regularly (150 minutes per week)');
        recommendations.push('Drink enough water (8-10 glasses per day)');
        recommendations.push('Apply stress management techniques');
      }
      
    } catch (error: any) {
      console.error('HealthInterpreter generateLifestyleRecommendations error:', error);
    }
    
    return recommendations;
  }

  /**
   * Format health data interpretation for display
   */
  formatHealthInterpretation(insights: HealthInsight[]): string {
    if (insights.length === 0) {
      return 'Your health data appears to be within normal ranges. 👍';
    }

    let formatted = '🔍 **Analysis of Your Health Data**\n\n';
    
    // Group by severity
    const critical = insights.filter(i => i.severity === 'critical');
    const warnings = insights.filter(i => i.severity === 'warning');
    const info = insights.filter(i => i.severity === 'info');
    
    // Show critical first
    if (critical.length > 0) {
      formatted += '🔴 **Conditions Requiring Attention:**\n';
      critical.forEach(insight => {
        formatted += `• **${insight.title}**: ${insight.description}\n`;
        insight.recommendations.forEach(rec => {
          formatted += `  - ${rec}\n`;
        });
      });
      formatted += '\n';
    }
    
    // Then warnings
    if (warnings.length > 0) {
      formatted += '🟡 **Items to Monitor:**\n';
      warnings.forEach(insight => {
        formatted += `• **${insight.title}**: ${insight.description}\n`;
        insight.recommendations.slice(0, 2).forEach(rec => {
          formatted += `  - ${rec}\n`;
        });
      });
      formatted += '\n';
    }
    
    // Finally info
    if (info.length > 0) {
      formatted += '💡 **General Assessment:**\n';
      info.forEach(insight => {
        formatted += `• **${insight.title}**: ${insight.description}\n`;
      });
    }
    
    return formatted;
  }

  // Private helper methods

  /**
   * Analyze vital signs trends
   */
  private analyzeVitalTrends(vitals: VitalSigns[]): HealthTrend[] {
    const trends: HealthTrend[] = [];
    const vitalsByType = this.groupVitalsByType(vitals);
    
    Object.entries(vitalsByType).forEach(([type, values]) => {
      if (values.length >= 3) { // Need at least 3 data points for trend
        const trend = this.calculateTrend(values);
        trends.push(trend);
      }
    });
    
    return trends;
  }

  /**
   * Group vitals by type
   */
  private groupVitalsByType(vitals: VitalSigns[]): { [key: string]: VitalSigns[] } {
    return vitals.reduce((groups, vital) => {
      if (!groups[vital.type]) {
        groups[vital.type] = [];
      }
      groups[vital.type].push(vital);
      return groups;
    }, {} as { [key: string]: VitalSigns[] });
  }

  /**
   * Calculate trend for a specific vital type
   */
  private calculateTrend(values: VitalSigns[]): HealthTrend {
    // Sort by date
    const sortedValues = values.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const numericValues = sortedValues.map(v => parseFloat(v.value));
    
    // Simple trend calculation
    const firstHalf = numericValues.slice(0, Math.floor(numericValues.length / 2));
    const secondHalf = numericValues.slice(Math.floor(numericValues.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    let trend: HealthTrend['trend'];
    let severity: HealthTrend['severity'] = 'normal';
    
    if (Math.abs(change) < 5) {
      trend = 'stable';
    } else if (change > 5) {
      trend = 'increasing';
      if (change > 20) severity = 'concerning';
    } else {
      trend = 'decreasing';
      if (change < -20) severity = 'concerning';
    }
    
    const vitalType = sortedValues[0].type;
    const description = this.getTrendDescription(vitalType, trend, change);
    const recommendation = this.getTrendRecommendation(vitalType, trend, severity);
    
    return {
      metric: this.getVitalDisplayName(vitalType),
      trend,
      severity,
      description,
      recommendation
    };
  }

  /**
   * Convert trend to insight
   */
  private convertTrendToInsight(trend: HealthTrend): HealthInsight {
    return {
      title: `${trend.metric} Trend`,
      description: trend.description,
      severity: trend.severity === 'concerning' ? 'warning' : 'info',
      recommendations: [trend.recommendation],
      dataPoints: [trend.metric]
    };
  }

  /**
   * Analyze symptom patterns
   */
  private async analyzeSymptomPatterns(userId: string, days: number): Promise<HealthInsight[]> {
    try {
      const symptoms = await healthDataService.getSymptomHistory(userId, days);
      const insights: HealthInsight[] = [];
      
      if (symptoms.length === 0) {
        return insights;
      }
      
      // Check for recurring symptoms
      const symptomCounts = this.countSymptomOccurrences(symptoms);
      const recurringSymptoms = Object.entries(symptomCounts)
        .filter(([_, count]) => count >= 3)
        .map(([symptom, count]) => ({ symptom, count }));
      
      if (recurringSymptoms.length > 0) {
        insights.push({
          title: 'Recurring Symptoms',
          description: `Symptoms ${recurringSymptoms.map(s => s.symptom).join(', ')} are recurring frequently.`,
          severity: 'warning',
          recommendations: [
            'Consult your doctor',
            'Identify symptom triggers',
            'Evaluate lifestyle changes'
          ],
          dataPoints: recurringSymptoms.map(s => s.symptom)
        });
      }
      
      return insights;
    } catch (error: any) {
      console.error('HealthInterpreter analyzeSymptomPatterns error:', error);
      return [];
    }
  }

  /**
   * Generate overall health assessment
   */
  private generateOverallAssessment(healthContext: HealthContext, recentVitals: VitalSigns[]): HealthInsight {
    let score = 100;
    const issues: string[] = [];
    
    // Deduct points for concerning patterns
    if (healthContext.recentSymptoms.length > 5) {
      score -= 20;
      issues.push('Multiple symptoms');
    }
    
    if (recentVitals.length === 0) {
      score -= 30;
      issues.push('Missing vital sign tracking');
    }
    
    // Assess based on score
    let severity: HealthInsight['severity'] = 'info';
    let description = '';
    
    if (score >= 80) {
      description = 'Your overall health condition appears good.';
      severity = 'info';
    } else if (score >= 60) {
      description = 'There are points in your health condition that require attention.';
      severity = 'warning';
    } else {
      description = 'Your health condition requires close monitoring.';
      severity = 'critical';
    }
    
    return {
      title: 'Overall Health Assessment',
      description,
      severity,
      recommendations: [
        'Schedule regular checkups',
        'Maintain a healthy lifestyle',
        'Track changes'
      ],
      dataPoints: ['Overall assessment']
    };
  }

  // Additional helper methods for specific analyses...
  
  private interpretVitalType(type: VitalSigns['type'], values: VitalSigns[]): string {
    const displayName = this.getVitalDisplayName(type);
    const latest = values[0];
    const interpretation = this.interpretSingleVital(type, latest.value);
    
    return `**${displayName}**: ${latest.value} ${latest.unit} - ${interpretation}`;
  }

  private interpretSingleVital(type: VitalSigns['type'], value: string): string {
    const numValue = parseFloat(value);
    
    switch (type) {
      case 'blood_pressure':
        const [systolic, diastolic] = value.split('/').map(v => parseFloat(v));
        if (systolic < 90 || diastolic < 60) return 'Low blood pressure';
        if (systolic > 140 || diastolic > 90) return 'High blood pressure';
        return 'Within normal range';
        
      case 'heart_rate':
        if (numValue < 60) return 'Low heart rate';
        if (numValue > 100) return 'High heart rate';
        return 'Within normal range';
        
      case 'temperature':
        if (numValue < 36.1) return 'Low temperature';
        if (numValue > 37.2) return 'High temperature';
        return 'Within normal range';
        
      default:
        return 'Unable to assess';
    }
  }

  private getVitalDisplayName(type: VitalSigns['type']): string {
    const names = {
      blood_pressure: 'Blood Pressure',
      heart_rate: 'Heart Rate',
      temperature: 'Body Temperature',
      weight: 'Weight',
      blood_sugar: 'Blood Sugar'
    };
    return names[type] || type;
  }

  private getTrendDescription(type: VitalSigns['type'], trend: string, change: number): string {
    const direction = trend === 'increasing' ? 'increasing' : trend === 'decreasing' ? 'decreasing' : 'stable';
    return `${this.getVitalDisplayName(type)} values show ${direction} trend (${Math.abs(change).toFixed(1)}%)`;
  }

  private getTrendRecommendation(type: VitalSigns['type'], trend: string, severity: string): string {
    if (severity === 'concerning') {
      return 'Consult your doctor and monitor closely';
    }
    return 'Continue tracking the values';
  }

  private countSymptomOccurrences(symptoms: Symptom[]): { [key: string]: number } {
    return symptoms.reduce((counts, symptom) => {
      counts[symptom.name] = (counts[symptom.name] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
  }

  private detectVitalAbnormalities(vitals: VitalSigns[]): HealthInsight[] {
    // Implementation for detecting vital abnormalities
    return [];
  }

  private detectSymptomEscalation(symptoms: Symptom[]): HealthInsight[] {
    // Implementation for detecting symptom escalation
    return [];
  }

  private detectMedicationIssues(healthContext: HealthContext): HealthInsight[] {
    // Implementation for detecting medication-related issues
    return [];
  }

  private analyzeMedicationAdherence(healthContext: HealthContext): HealthInsight | null {
    // Implementation for analyzing medication adherence
    return null;
  }

  private calculateAverageBloodPressure(bpVitals: VitalSigns[]): { systolic: number; diastolic: number } {
    const values = bpVitals.map(v => {
      const [sys, dia] = v.value.split('/').map(n => parseFloat(n));
      return { systolic: sys, diastolic: dia };
    });
    
    const avgSys = values.reduce((sum, v) => sum + v.systolic, 0) / values.length;
    const avgDia = values.reduce((sum, v) => sum + v.diastolic, 0) / values.length;
    
    return { systolic: avgSys, diastolic: avgDia };
  }

  private calculateWeightTrend(weightVitals: VitalSigns[]): 'increasing' | 'decreasing' | 'stable' {
    const sorted = weightVitals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = parseFloat(sorted[0].value);
    const last = parseFloat(sorted[sorted.length - 1].value);
    const change = ((last - first) / first) * 100;
    
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }
}

// Export singleton instance
export const healthInterpreterService = new HealthInterpreterService();