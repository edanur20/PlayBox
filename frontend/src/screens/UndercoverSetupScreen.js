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
import { MIN_PLAYERS, MAX_PLAYERS } from '../data/undercoverWords';

export default function UndercoverSetupScreen({ navigation }) {
  const [players, setPlayers] = useState(['', '', '', '']);
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [whiteCount, setWhiteCount] = useState(1);
  const [pointsToWin, setPointsToWin] = useState(10);
  const [chaosMode, setChaosMode] = useState(false);

  const getValidPlayers = () => players.filter(p => p.trim() !== '');

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index) => {
    if (players.length > MIN_PLAYERS) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const getMaxUndercover = () => {
    const validCount = getValidPlayers().length;
    return Math.max(1, Math.floor(validCount / 3));
  };

  const getMaxWhite = () => {
    const validCount = getValidPlayers().length;
    return Math.max(0, Math.floor(validCount / 4));
  };

  const canStart = () => {
    const validPlayers = getValidPlayers();
    return validPlayers.length >= MIN_PLAYERS;
  };

  const startGame = () => {
    const validPlayers = getValidPlayers();

    if (validPlayers.length < MIN_PLAYERS) {
      Alert.alert('Pas assez de joueurs', `Il faut au moins ${MIN_PLAYERS} joueurs pour jouer.`);
      return;
    }

    // Ajuster les comptes si nécessaire
    const maxUndercover = getMaxUndercover();
    const maxWhite = getMaxWhite();
    const adjustedUndercover = Math.min(undercoverCount, maxUndercover);
    const adjustedWhite = Math.min(whiteCount, maxWhite);

    navigation.navigate('UndercoverGame', {
      players: validPlayers.map((name, index) => ({
        id: index,
        name,
        score: 0,
        isAlive: true,
        role: null,
        word: null,
        specialRole: null,
      })),
      undercoverCount: adjustedUndercover,
      whiteCount: adjustedWhite,
      pointsToWin,
      chaosMode,
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
          <Text style={styles.title}>Undercover</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionEmoji}>🕵️‍♂️</Text>
          <Text style={styles.descriptionText}>
            Trouvez l'imposteur parmi vous !{'\n'}
            Les civils ont le même mot,{'\n'}
            l'Undercover a un mot similaire,{'\n'}
            et le White n'a aucun mot !
          </Text>
        </View>

        {/* Chaos Mode Toggle (Hidden)
        <TouchableOpacity
          style={[styles.chaosModeButton, chaosMode && styles.chaosModeButtonActive]}
          onPress={() => setChaosMode(!chaosMode)}
        >
          <Text style={styles.chaosModeEmoji}>🎲</Text>
          <View style={styles.chaosModeContent}>
            <Text style={[styles.chaosModeTitle, chaosMode && styles.chaosModeTextActive]}>
              Mode Chaos
            </Text>
          </View>
          <View style={[styles.toggle, chaosMode && styles.toggleActive]}>
            <View style={[styles.toggleDot, chaosMode && styles.toggleDotActive]} />
          </View>
        </TouchableOpacity>
        */}

        {/* Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Joueurs ({getValidPlayers().length}/{MAX_PLAYERS})</Text>

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
              {players.length > MIN_PLAYERS && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {players.length < MAX_PLAYERS && (
            <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
              <Text style={styles.addButtonText}>+ Ajouter un joueur</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Points to Win */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points pour gagner</Text>
          <View style={styles.optionSelector}>
            {[5, 10, 15, 20].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.optionButton,
                  pointsToWin === num && styles.optionButtonActive,
                ]}
                onPress={() => setPointsToWin(num)}
              >
                <Text style={styles.optionEmoji}>🏆</Text>
                <Text
                  style={[
                    styles.optionButtonText,
                    pointsToWin === num && styles.optionButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règles</Text>
          <View style={styles.rulesBox}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>1️⃣</Text>
              <Text style={styles.ruleText}>
                Chaque joueur reçoit un mot secret (ou pas)
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>2️⃣</Text>
              <Text style={styles.ruleText}>
                À tour de rôle, donnez un indice sur votre mot
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>3️⃣</Text>
              <Text style={styles.ruleText}>
                Débattez et votez pour éliminer un suspect
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>4️⃣</Text>
              <Text style={styles.ruleText}>
                Civils: trouvez l'Undercover avant d'être minoritaires !
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, !canStart() && styles.startButtonDisabled]}
          onPress={startGame}
          disabled={!canStart()}
        >
          <Text style={styles.startButtonText}>
            {canStart() ? 'Commencer la partie' : `Ajoutez ${MIN_PLAYERS - getValidPlayers().length} joueur(s)`}
          </Text>
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
    backgroundColor: '#6366f120',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#6366f1',
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
  chaosModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  chaosModeButtonActive: {
    backgroundColor: '#f59e0b20',
    borderColor: '#f59e0b',
  },
  chaosModeEmoji: {
    fontSize: 32,
  },
  chaosModeContent: {
    flex: 1,
  },
  chaosModeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  chaosModeTextActive: {
    color: '#f59e0b',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#f59e0b',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleDotActive: {
    marginLeft: 22,
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
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  playerNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: colors.error,
    fontWeight: fontWeight.bold,
  },
  addButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontSize.md,
    color: '#6366f1',
    fontWeight: fontWeight.medium,
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
    backgroundColor: '#6366f120',
    borderColor: '#6366f1',
  },
  optionButtonDisabled: {
    opacity: 0.4,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  optionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  optionButtonTextActive: {
    color: '#6366f1',
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
    gap: spacing.sm,
  },
  ruleEmoji: {
    fontSize: 20,
    width: 30,
  },
  ruleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: spacing.md,
    backgroundColor: '#6366f1',
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
