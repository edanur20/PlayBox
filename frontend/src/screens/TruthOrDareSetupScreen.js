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
import { getStats } from '../data/truthOrDareData';

const MODES = [
  {
    id: 'soft',
    name: 'Soft',
    description: 'Pour jouer en famille ou entre amis sages',
    icon: '😇',
    color: '#22c55e',
  },
  {
    id: 'classic',
    name: 'Classique',
    description: 'Questions gênantes et défis loufoques',
    icon: '🎯',
    color: '#3b82f6',
  },
  /*
  {
    id: 'chaos',
    name: 'Chaos',
    description: 'Vérités intenses et actions extrêmes',
    icon: '🔥',
    color: '#ef4444',
  },
  */
];

export default function TruthOrDareSetupScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState('classic');
  const [players, setPlayers] = useState(['', '']);
  const stats = getStats();

  const addPlayer = () => {
    if (players.length < 20) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 2) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const updatePlayer = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const handleStart = () => {
    // Filtrer les joueurs vides et assigner des noms par défaut
    const validPlayers = players.map((p, i) => p.trim() || `Joueur ${i + 1}`);

    if (validPlayers.length < 2) {
      Alert.alert('Erreur', 'Il faut au moins 2 joueurs');
      return;
    }

    navigation.navigate('TruthOrDareGame', {
      mode: selectedMode,
      players: validPlayers,
    });
  };

  const getModeStats = () => {
    const modeStats = stats[selectedMode];
    return `${modeStats.truths} vérités • ${modeStats.dares} actions`;
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
          <Text style={styles.title}>Action ou Vérité</Text>
          <Text style={styles.subtitle}>Oseras-tu répondre ?</Text>
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

        {/* Liste des joueurs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Joueurs ({players.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <View style={styles.playerNumber}>
                <Text style={styles.playerNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.playerInput}
                placeholder={`Joueur ${index + 1}`}
                placeholderTextColor={colors.textMuted}
                value={player}
                onChangeText={(text) => updatePlayer(index, text)}
              />
              {players.length > 2 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Règles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment jouer</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>🎲 Chaque joueur choisit Action ou Vérité</Text>
            <Text style={styles.ruleText}>❓ Vérité = réponds honnêtement à la question</Text>
            <Text style={styles.ruleText}>🎬 Action = réalise le défi proposé</Text>
            <Text style={styles.ruleText}>😱 Tu refuses ? Les autres décident de ta punition !</Text>
          </View>
        </View>

        {/* Bouton Jouer */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: MODES.find(m => m.id === selectedMode).color }]}
          onPress={handleStart}
        >
          <Text style={styles.playButtonText}>C'est parti !</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  playerNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumberText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  playerInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButtonText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
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
