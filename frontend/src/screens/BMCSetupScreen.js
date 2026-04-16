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
import { POINTS_TO_WIN } from '../data/bmcCards';

export default function BMCSetupScreen({ navigation }) {
  const [players, setPlayers] = useState(['', '', '']);
  const [pointsToWin, setPointsToWin] = useState(POINTS_TO_WIN);

  const validPlayers = players.filter(p => p.trim() !== '');

  const addPlayer = () => {
    if (players.length < 10) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 3) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const updatePlayer = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const canStart = () => {
    return validPlayers.length >= 3;
  };

  const startGame = () => {
    if (!canStart()) {
      Alert.alert(
        'Pas assez de joueurs',
        'Il faut au moins 3 joueurs pour jouer à Blanc Manger Coco.'
      );
      return;
    }

    navigation.navigate('BMCGame', {
      players: validPlayers,
      pointsToWin,
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
          <Text style={styles.title}>Blanc Manger Coco</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionEmoji}>🥥</Text>
          <Text style={styles.descriptionText}>
            Le jeu où la carte la plus drôle gagne ! Un joueur lit une question,
            les autres proposent des réponses. La meilleure réponse remporte le point.
          </Text>
        </View>

        {/* Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Joueurs ({validPlayers.length})</Text>
          <Text style={styles.sectionSubtitle}>Minimum 3 joueurs</Text>

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
              {players.length > 3 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {players.length < 10 && (
            <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
              <Text style={styles.addButtonText}>+ Ajouter un joueur</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Points to Win */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points pour gagner</Text>
          <View style={styles.pointsSelector}>
            {[3, 5, 7, 10].map((points) => (
              <TouchableOpacity
                key={points}
                style={[
                  styles.pointOption,
                  pointsToWin === points && styles.pointOptionActive,
                ]}
                onPress={() => setPointsToWin(points)}
              >
                <Text
                  style={[
                    styles.pointOptionText,
                    pointsToWin === points && styles.pointOptionTextActive,
                  ]}
                >
                  {points}
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
              <Text style={styles.ruleNumber}>1</Text>
              <Text style={styles.ruleText}>
                Le "Patron" lit une carte question avec un trou à compléter
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>2</Text>
              <Text style={styles.ruleText}>
                Chaque joueur choisit sa meilleure carte réponse (face cachée)
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>3</Text>
              <Text style={styles.ruleText}>
                Le Patron lit les réponses et choisit sa préférée
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleNumber}>4</Text>
              <Text style={styles.ruleText}>
                Le gagnant marque 1 point et devient le nouveau Patron
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
    backgroundColor: '#854d0e20',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#854d0e',
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
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
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
    backgroundColor: '#854d0e',
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontSize.md,
    color: '#854d0e',
    fontWeight: fontWeight.medium,
  },
  pointsSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pointOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  pointOptionActive: {
    backgroundColor: '#854d0e20',
    borderColor: '#854d0e',
  },
  pointOptionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  pointOptionTextActive: {
    color: '#854d0e',
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
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#854d0e',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  ruleText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: spacing.md,
    backgroundColor: '#854d0e',
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
