import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getStats } from '../data/bombeData';

const MODES = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Thèmes fun et accessibles',
    icon: '💣',
    color: '#f59e0b',
  },
  /* 
  {
    id: 'spicy',
    name: 'Spicy',
    description: 'Thèmes gênants et osés',
    icon: '🌶️',
    color: '#ef4444',
  },
  {
    id: 'chaos',
    name: 'Chaos',
    description: 'Thèmes absurdes et WTF',
    icon: '💥',
    color: '#8b5cf6',
  },
  */
];

const TIMER_OPTIONS = [
  { value: 'short', label: 'Rapide', description: '5-15 sec', icon: '⚡' },
  { value: 'medium', label: 'Moyen', description: '5-30 sec', icon: '🎯' },
  { value: 'random', label: 'Aléatoire', description: '5-45 sec', icon: '🎲' },
  { value: 'long', label: 'Long', description: '30-60 sec', icon: '🐢' },
];

export default function BombeSetupScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState('classic');
  const [timerMode, setTimerMode] = useState('random');
  const stats = getStats();

  const handleStart = () => {
    navigation.navigate('BombeGame', {
      mode: selectedMode,
      timerMode: timerMode,
    });
  };

  const getModeStats = () => {
    const modeStats = stats[selectedMode];
    return `${modeStats.themes} thèmes disponibles`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>💣 Bombe</Text>
          <Text style={styles.subtitle}>Ne te fais pas exploser !</Text>
        </View>

        {/* Sélection du mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de jeu</Text>
          <View style={styles.modesContainer}>
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeCard,
                  selectedMode === mode.id && { borderColor: mode.color, borderWidth: 2 },
                ]}
                onPress={() => setSelectedMode(mode.id)}
              >
                <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
                  <Text style={styles.modeIconText}>{mode.icon}</Text>
                </View>
                <Text style={styles.modeName}>{mode.name}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
                {selectedMode === mode.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: mode.color }]}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.statsText}>{getModeStats()}</Text>
        </View>

        {/* Timer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vitesse de la bombe</Text>
          <Text style={styles.sectionSubtitle}>Tu ne verras pas le temps restant !</Text>
          <View style={styles.timerContainer}>
            {TIMER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timerOption,
                  timerMode === option.value && styles.timerOptionSelected,
                ]}
                onPress={() => setTimerMode(option.value)}
              >
                <Text style={styles.timerIcon}>{option.icon}</Text>
                <Text style={[
                  styles.timerLabel,
                  timerMode === option.value && styles.timerLabelSelected,
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.timerDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Règles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment jouer</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>💣 Un thème apparaît quand la bombe est allumée</Text>
            <Text style={styles.ruleText}>💬 Cite un mot sur le thème et passe le téléphone !</Text>
            <Text style={styles.ruleText}>⏱️ Tu ne sais PAS quand ça va exploser</Text>
            <Text style={styles.ruleText}>💥 Si la bombe explose sur toi = PERDU</Text>
            <Text style={styles.ruleText}>🍺 Le perdant subit le gage décidé par les autres</Text>
          </View>
        </View>

        {/* Bouton Jouer */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: MODES.find(m => m.id === selectedMode).color }]}
          onPress={handleStart}
        >
          <Text style={styles.playButtonText}>💣 Lancer la bombe !</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  modesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modeIconText: {
    fontSize: 20,
  },
  modeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modeDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xs,
  },
  statsText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timerOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  timerOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '20',
  },
  timerIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  timerLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  timerLabelSelected: {
    color: colors.primary,
  },
  timerDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rulesContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ruleText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  playButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  playButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
});
