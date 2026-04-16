import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

const teamColors = [
  { id: 'red', name: 'Rouge', color: colors.teamRed },
  { id: 'blue', name: 'Bleu', color: colors.teamBlue },
  { id: 'green', name: 'Vert', color: colors.teamGreen },
  { id: 'yellow', name: 'Jaune', color: colors.teamYellow },
];

const languages = [
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
];

const gameModes = [
  { id: 'classic', name: 'Classique', emoji: '📚', description: 'Mots standards pour tous' },
  // { id: 'spicy', name: 'Spicy 🔞', emoji: '🌶️', description: 'Mots vulgaires et adultes' },
];

export default function CodeNamesSetupScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [selectedMode, setSelectedMode] = useState('classic');
  const [teams, setTeams] = useState([
    { id: 'red', name: 'Équipe Rouge', color: colors.teamRed, players: [''] },
    { id: 'blue', name: 'Équipe Bleue', color: colors.teamBlue, players: [''] },
  ]);

  const addTeam = () => {
    if (teams.length >= 4) {
      Alert.alert('Maximum atteint', 'Vous ne pouvez pas avoir plus de 4 équipes.');
      return;
    }
    const availableColors = teamColors.filter(
      (tc) => !teams.find((t) => t.id === tc.id)
    );
    if (availableColors.length > 0) {
      const newColor = availableColors[0];
      setTeams([
        ...teams,
        {
          id: newColor.id,
          name: `Équipe ${newColor.name}`,
          color: newColor.color,
          players: [''],
        },
      ]);
    }
  };

  const removeTeam = (teamId) => {
    if (teams.length <= 2) {
      Alert.alert('Minimum requis', 'Vous devez avoir au moins 2 équipes.');
      return;
    }
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  const addPlayer = (teamId) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, players: [...team.players, ''] };
        }
        return team;
      })
    );
  };

  const updatePlayerName = (teamId, playerIndex, name) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          const newPlayers = [...team.players];
          newPlayers[playerIndex] = name;
          return { ...team, players: newPlayers };
        }
        return team;
      })
    );
  };

  const removePlayer = (teamId, playerIndex) => {
    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          if (team.players.length <= 1) return team;
          const newPlayers = team.players.filter((_, i) => i !== playerIndex);
          return { ...team, players: newPlayers };
        }
        return team;
      })
    );
  };

  const startGame = () => {
    // Validate that each team has at least one player with a name
    const validTeams = teams.map((team) => ({
      ...team,
      players: team.players.filter((p) => p.trim() !== ''),
    }));

    const teamsWithPlayers = validTeams.filter((t) => t.players.length > 0);

    if (teamsWithPlayers.length < 2) {
      Alert.alert(
        'Joueurs manquants',
        'Chaque équipe doit avoir au moins un joueur.'
      );
      return;
    }

    navigation.navigate('CodeNamesGame', {
      teams: teamsWithPlayers,
      language: selectedLanguage,
      mode: selectedMode,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Code Names</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de jeu</Text>
          <View style={styles.modeContainer}>
            {gameModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeButton,
                  selectedMode === mode.id && styles.modeButtonActive,
                  mode.id === 'spicy' && styles.modeButtonSpicy,
                  selectedMode === 'spicy' && mode.id === 'spicy' && styles.modeButtonSpicyActive,
                ]}
                onPress={() => setSelectedMode(mode.id)}
              >
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                <Text
                  style={[
                    styles.modeText,
                    selectedMode === mode.id && styles.modeTextActive,
                  ]}
                >
                  {mode.name}
                </Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langue {selectedMode === 'spicy' && '(Spicy = Français uniquement)'}</Text>
          <View style={styles.languageContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang.id && styles.languageButtonActive,
                  selectedMode === 'spicy' && lang.id === 'en' && styles.languageButtonDisabled,
                ]}
                onPress={() => {
                  if (selectedMode === 'spicy' && lang.id === 'en') return;
                  setSelectedLanguage(lang.id);
                }}
                disabled={selectedMode === 'spicy' && lang.id === 'en'}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === lang.id && styles.languageTextActive,
                    selectedMode === 'spicy' && lang.id === 'en' && styles.languageTextDisabled,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Teams Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Équipes ({teams.length}/4)</Text>
            <TouchableOpacity style={styles.addTeamButton} onPress={addTeam}>
              <Text style={styles.addTeamButtonText}>+ Équipe</Text>
            </TouchableOpacity>
          </View>

          {teams.map((team) => (
            <View
              key={team.id}
              style={[styles.teamCard, { borderLeftColor: team.color }]}
            >
              <View style={styles.teamHeader}>
                <View style={styles.teamInfo}>
                  <View
                    style={[styles.teamColorDot, { backgroundColor: team.color }]}
                  />
                  <Text style={styles.teamName}>{team.name}</Text>
                </View>
                {teams.length > 2 && (
                  <TouchableOpacity onPress={() => removeTeam(team.id)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {team.players.map((player, index) => (
                <View key={index} style={styles.playerRow}>
                  <TextInput
                    style={styles.playerInput}
                    placeholder={
                      index === 0 ? 'Maître-Espion' : `Joueur ${index + 1}`
                    }
                    placeholderTextColor={colors.textMuted}
                    value={player}
                    onChangeText={(text) =>
                      updatePlayerName(team.id, index, text)
                    }
                  />
                  {team.players.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removePlayer(team.id, index)}
                    >
                      <Text style={styles.removePlayerButton}>−</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addPlayerButton}
                onPress={() => addPlayer(team.id)}
              >
                <Text style={styles.addPlayerButtonText}>+ Ajouter joueur</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Commencer la partie</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
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
  modeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  modeButtonSpicy: {
    borderColor: '#ff6b6b40',
  },
  modeButtonSpicyActive: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ff6b6b20',
  },
  modeEmoji: {
    fontSize: 32,
  },
  modeText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  modeTextActive: {
    color: colors.textPrimary,
  },
  modeDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  languageButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  languageTextActive: {
    color: colors.textPrimary,
  },
  languageButtonDisabled: {
    opacity: 0.4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  languageTextDisabled: {
    color: colors.textMuted,
  },
  addTeamButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  addTeamButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  teamCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  teamName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  removeButton: {
    fontSize: 18,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  playerInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  removePlayerButton: {
    fontSize: 24,
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
  },
  addPlayerButton: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  addPlayerButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
