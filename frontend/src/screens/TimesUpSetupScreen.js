import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { TURN_DURATION } from '../data/timesUpWords';

const gameModes = [
  { id: 'classic', name: 'Classique', emoji: '📚', description: 'Mots standards' },
  // { id: 'spicy', name: 'Spicy 🔞', emoji: '🌶️', description: 'Mots vulgaires et adultes' },
];

export default function TimesUpSetupScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState('classic');
  const [teams, setTeams] = useState([
    { name: 'Équipe 1', players: ['', ''] },
    { name: 'Équipe 2', players: ['', ''] },
  ]);
  const [wordsPerPlayer, setWordsPerPlayer] = useState(5);
  const [turnDuration, setTurnDuration] = useState(TURN_DURATION);

  const getTotalPlayers = () => {
    return teams.reduce((acc, team) => {
      return acc + team.players.filter(p => p.trim() !== '').length;
    }, 0);
  };

  const getValidTeams = () => {
    return teams.filter(team =>
      team.players.filter(p => p.trim() !== '').length >= 1
    );
  };

  const addTeam = () => {
    if (teams.length < 4) {
      setTeams([...teams, {
        name: `Équipe ${teams.length + 1}`,
        players: ['', '']
      }]);
    }
  };

  const removeTeam = (teamIndex) => {
    if (teams.length > 2) {
      setTeams(teams.filter((_, i) => i !== teamIndex));
    }
  };

  const updateTeamName = (teamIndex, name) => {
    const newTeams = [...teams];
    newTeams[teamIndex].name = name;
    setTeams(newTeams);
  };

  const addPlayerToTeam = (teamIndex) => {
    if (teams[teamIndex].players.length < 5) {
      const newTeams = [...teams];
      newTeams[teamIndex].players.push('');
      setTeams(newTeams);
    }
  };

  const removePlayerFromTeam = (teamIndex, playerIndex) => {
    if (teams[teamIndex].players.length > 1) {
      const newTeams = [...teams];
      newTeams[teamIndex].players = newTeams[teamIndex].players.filter((_, i) => i !== playerIndex);
      setTeams(newTeams);
    }
  };

  const updatePlayer = (teamIndex, playerIndex, name) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex] = name;
    setTeams(newTeams);
  };

  const canStart = () => {
    const validTeams = getValidTeams();
    return validTeams.length >= 2 && getTotalPlayers() >= 4;
  };

  const startGame = () => {
    if (!canStart()) {
      Alert.alert(
        'Configuration invalide',
        'Il faut au moins 2 équipes avec au minimum 1 joueur chacune, et 4 joueurs au total.'
      );
      return;
    }

    // Nettoyer les équipes (retirer les joueurs vides)
    const cleanedTeams = teams.map(team => ({
      ...team,
      players: team.players.filter(p => p.trim() !== ''),
      score: 0,
    })).filter(team => team.players.length > 0);

    navigation.navigate('TimesUpGame', {
      teams: cleanedTeams,
      wordsPerPlayer,
      turnDuration,
      totalWords: getTotalPlayers() * wordsPerPlayer,
      mode: selectedMode,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Time's Up!</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionEmoji}>⏱️</Text>
          <Text style={styles.descriptionText}>
            3 manches pour faire deviner des mots !{'\n'}
            Manche 1: Tout dire sauf le mot{'\n'}
            Manche 2: Un seul mot{'\n'}
            Manche 3: Mime uniquement
          </Text>
        </View>

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

        {/* Teams Section */}
        {teams.map((team, teamIndex) => (
          <View key={teamIndex} style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <TextInput
                style={styles.teamNameInput}
                value={team.name}
                onChangeText={(text) => updateTeamName(teamIndex, text)}
                placeholder="Nom de l'équipe"
                placeholderTextColor={colors.textMuted}
              />
              {teams.length > 2 && (
                <TouchableOpacity
                  style={styles.removeTeamButton}
                  onPress={() => removeTeam(teamIndex)}
                >
                  <Text style={styles.removeTeamButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            {team.players.map((player, playerIndex) => (
              <View key={playerIndex} style={styles.playerRow}>
                <View style={[styles.playerNumber, { backgroundColor: teamIndex === 0 ? '#3b82f6' : teamIndex === 1 ? '#ef4444' : teamIndex === 2 ? '#22c55e' : '#f59e0b' }]}>
                  <Text style={styles.playerNumberText}>{playerIndex + 1}</Text>
                </View>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Joueur ${playerIndex + 1}`}
                  placeholderTextColor={colors.textMuted}
                  value={player}
                  onChangeText={(text) => updatePlayer(teamIndex, playerIndex, text)}
                />
                {team.players.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePlayerFromTeam(teamIndex, playerIndex)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {team.players.length < 5 && (
              <TouchableOpacity
                style={styles.addPlayerButton}
                onPress={() => addPlayerToTeam(teamIndex)}
              >
                <Text style={styles.addPlayerButtonText}>+ Ajouter un joueur</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {teams.length < 4 && (
          <TouchableOpacity style={styles.addTeamButton} onPress={addTeam}>
            <Text style={styles.addTeamButtonText}>+ Ajouter une équipe</Text>
          </TouchableOpacity>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mots par joueur</Text>
          <View style={styles.optionSelector}>
            {[3, 5, 7, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.optionButton,
                  wordsPerPlayer === num && styles.optionButtonActive,
                ]}
                onPress={() => setWordsPerPlayer(num)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    wordsPerPlayer === num && styles.optionButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.infoText}>
            Total: {getTotalPlayers() * wordsPerPlayer} mots à deviner par manche
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée d'un tour (secondes)</Text>
          <View style={styles.optionSelector}>
            {[20, 30, 45, 60].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.optionButton,
                  turnDuration === num && styles.optionButtonActive,
                ]}
                onPress={() => setTurnDuration(num)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    turnDuration === num && styles.optionButtonTextActive,
                  ]}
                >
                  {num}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règles du jeu</Text>
          <View style={styles.rulesBox}>
            <View style={styles.ruleItem}>
              <View style={[styles.roundBadge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.roundBadgeText}>1</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Manche 1: Description</Text>
                <Text style={styles.ruleText}>
                  Dire tout ce que tu veux SAUF le mot ou les mots de la même famille
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.roundBadge, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.roundBadgeText}>2</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Manche 2: Un seul mot</Text>
                <Text style={styles.ruleText}>
                  Un seul mot pour faire deviner ! Pas le droit de passer
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.roundBadge, { backgroundColor: '#22c55e' }]}>
                <Text style={styles.roundBadgeText}>3</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Manche 3: Mime</Text>
                <Text style={styles.ruleText}>
                  Mime uniquement ! Aucun son ni mot autorisé
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, !canStart() && styles.startButtonDisabled]}
          onPress={startGame}
          disabled={!canStart()}
        >
          <Text style={styles.startButtonText}>Commencer la partie</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  descriptionBox: {
    backgroundColor: '#f59e0b20',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#f59e0b',
    alignItems: 'center',
    gap: spacing.md,
  },
  descriptionEmoji: {
    fontSize: 48,
  },
  descriptionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  teamSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  teamNameInput: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  removeTeamButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTeamButtonText: {
    fontSize: 20,
    color: colors.error,
    fontWeight: fontWeight.bold,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  playerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  playerInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: colors.error,
    fontWeight: fontWeight.bold,
  },
  addPlayerButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addPlayerButtonText: {
    fontSize: fontSize.sm,
    color: '#f59e0b',
    fontWeight: fontWeight.medium,
  },
  addTeamButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addTeamButtonText: {
    fontSize: fontSize.md,
    color: '#f59e0b',
    fontWeight: fontWeight.medium,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b20',
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
  optionSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonActive: {
    backgroundColor: '#f59e0b20',
    borderColor: '#f59e0b',
  },
  optionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  optionButtonTextActive: {
    color: '#f59e0b',
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  rulesBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  roundBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundBadgeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ruleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: spacing.md,
    backgroundColor: '#f59e0b',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
