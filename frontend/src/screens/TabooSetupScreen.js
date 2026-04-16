import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

const MODES = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Mots du quotidien, culture générale',
    icon: '🎯',
    color: '#22c55e',
  },
  /*
  {
    id: 'spicy',
    name: 'Spicy 🌶️',
    description: 'Contenu adulte, alcool, situations osées',
    icon: '🔥',
    color: '#ef4444',
  },
  */
];

export default function TabooSetupScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState('classic');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [turnDuration, setTurnDuration] = useState(60);
  const [cardsPerGame, setCardsPerGame] = useState(30);

  const handleStart = () => {
    const t1 = team1Name.trim() || 'Équipe 1';
    const t2 = team2Name.trim() || 'Équipe 2';

    if (t1.toLowerCase() === t2.toLowerCase()) {
      Alert.alert('Erreur', 'Les deux équipes doivent avoir des noms différents');
      return;
    }

    navigation.navigate('TabooGame', {
      mode: selectedMode,
      team1: t1,
      team2: t2,
      turnDuration,
      cardsPerGame,
    });
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
          <Text style={styles.title}>Taboo</Text>
          <Text style={styles.subtitle}>Faites deviner sans mots interdits !</Text>
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
        </View>

        {/* Noms des équipes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipes</Text>
          <View style={styles.teamsContainer}>
            <View style={styles.teamInput}>
              <Text style={styles.teamLabel}>🔵 Équipe 1</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom de l'équipe"
                placeholderTextColor={colors.textMuted}
                value={team1Name}
                onChangeText={setTeam1Name}
              />
            </View>
            <View style={styles.teamInput}>
              <Text style={styles.teamLabel}>🔴 Équipe 2</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom de l'équipe"
                placeholderTextColor={colors.textMuted}
                value={team2Name}
                onChangeText={setTeam2Name}
              />
            </View>
          </View>
        </View>

        {/* Durée du tour */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée par tour</Text>
          <View style={styles.optionsRow}>
            {[30, 45, 60, 90].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.optionButton,
                  turnDuration === duration && styles.optionButtonSelected,
                ]}
                onPress={() => setTurnDuration(duration)}
              >
                <Text
                  style={[
                    styles.optionText,
                    turnDuration === duration && styles.optionTextSelected,
                  ]}
                >
                  {duration}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nombre de cartes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cartes par partie</Text>
          <View style={styles.optionsRow}>
            {[20, 30, 50, 100].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.optionButton,
                  cardsPerGame === count && styles.optionButtonSelected,
                ]}
                onPress={() => setCardsPerGame(count)}
              >
                <Text
                  style={[
                    styles.optionText,
                    cardsPerGame === count && styles.optionTextSelected,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Règles du jeu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règles</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>🎯 Faites deviner le mot en VERT à votre équipe</Text>
            <Text style={styles.ruleText}>🚫 Sans utiliser les mots interdits en ROUGE</Text>
            <Text style={styles.ruleText}>✅ +1 point par mot trouvé</Text>
            <Text style={styles.ruleText}>❌ -1 point si vous dites un mot interdit</Text>
            <Text style={styles.ruleText}>⏭️ Passez si vous êtes bloqué (pas de pénalité)</Text>
          </View>
        </View>

        {/* Bouton Jouer */}
        <TouchableOpacity style={styles.playButton} onPress={handleStart}>
          <Text style={styles.playButtonText}>Jouer</Text>
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
    marginBottom: spacing.md,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
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
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modeIconText: {
    fontSize: 24,
  },
  modeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modeDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  teamsContainer: {
    gap: spacing.md,
  },
  teamInput: {
    gap: spacing.xs,
  },
  teamLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  optionTextSelected: {
    color: '#fff',
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
    backgroundColor: colors.primary,
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
