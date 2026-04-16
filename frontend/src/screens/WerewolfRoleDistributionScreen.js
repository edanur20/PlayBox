import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getRoleById } from '../data/werewolfRoles';

export default function WerewolfRoleDistributionScreen({ navigation, route }) {
  const { players, roles } = route.params;
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [shuffledRoles, setShuffledRoles] = useState([]);
  const [distributionComplete, setDistributionComplete] = useState(false);

  useEffect(() => {
    // Shuffle roles at start
    const shuffled = [...roles].sort(() => Math.random() - 0.5);
    setShuffledRoles(shuffled);
  }, []);

  const currentPlayer = players[currentPlayerIndex];
  const currentRole = shuffledRoles[currentPlayerIndex] ? getRoleById(shuffledRoles[currentPlayerIndex]) : null;

  const handleRevealRole = () => {
    setShowRole(true);
  };

  const handleNextPlayer = () => {
    setShowRole(false);
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      setDistributionComplete(true);
    }
  };

  const handleStartGame = () => {
    // Create player data with roles
    const playersWithRoles = players.map((name, index) => ({
      id: index,
      name,
      roleId: shuffledRoles[index],
      role: getRoleById(shuffledRoles[index]),
      isAlive: true,
      isProtected: false,
      isInLove: false,
      loverId: null,
    }));

    navigation.replace('WerewolfGame', {
      players: playersWithRoles,
    });
  };

  if (!currentRole) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Préparation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Distribution Complete Modal */}
      <Modal visible={distributionComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🌙</Text>
            <Text style={styles.modalTitle}>Distribution terminée</Text>
            <Text style={styles.modalSubtitle}>
              Tous les joueurs connaissent leur rôle.
              {'\n'}La nuit va tomber sur le village...
            </Text>
            <TouchableOpacity
              style={styles.startGameButton}
              onPress={handleStartGame}
            >
              <Text style={styles.startGameButtonText}>Commencer la partie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        {!showRole ? (
          // Pass phone screen
          <View style={styles.passScreen}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentPlayerIndex + 1} / {players.length}
              </Text>
            </View>

            <View style={styles.passContent}>
              <Text style={styles.passEmoji}>📱</Text>
              <Text style={styles.passTitle}>Passez le téléphone à</Text>
              <Text style={styles.playerName}>{currentPlayer}</Text>
              <Text style={styles.passSubtitle}>
                Assurez-vous que personne d'autre ne regarde
              </Text>
            </View>

            <TouchableOpacity
              style={styles.revealButton}
              onPress={handleRevealRole}
            >
              <Text style={styles.revealButtonText}>
                Je suis {currentPlayer} - Voir mon rôle
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Role reveal screen
          <View style={styles.roleScreen}>
            <View style={styles.roleCard}>
              <View style={[styles.roleIconContainer, { backgroundColor: currentRole.color + '20' }]}>
                <Text style={styles.roleEmoji}>{currentRole.emoji}</Text>
              </View>
              <Text style={styles.roleName}>{currentRole.name}</Text>
              <View style={[styles.teamBadge, { backgroundColor: currentRole.team === 'wolves' ? colors.error + '20' : colors.success + '20' }]}>
                <Text style={[styles.teamText, { color: currentRole.team === 'wolves' ? colors.error : colors.success }]}>
                  {currentRole.team === 'wolves' ? 'Loup-Garou' : 'Village'}
                </Text>
              </View>
              <Text style={styles.roleDescription}>{currentRole.description}</Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Mémorisez votre rôle et gardez-le secret !
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, { borderColor: currentRole.color }]}
              onPress={handleNextPlayer}
            >
              <Text style={styles.nextButtonText}>
                {currentPlayerIndex < players.length - 1
                  ? 'Passer au joueur suivant'
                  : 'Terminer la distribution'
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  passScreen: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  passContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  passEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  passTitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  playerName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  passSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  revealButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  revealButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  roleScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  roleIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleEmoji: {
    fontSize: 64,
  },
  roleName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  teamBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  teamText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  roleDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  warningBox: {
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  nextButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
  },
  nextButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  modalEmoji: {
    fontSize: 64,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  startGameButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  startGameButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
