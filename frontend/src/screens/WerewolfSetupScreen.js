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
import { ROLES, getRolePreset, getRoleById } from '../data/werewolfRoles';

export default function WerewolfSetupScreen({ navigation }) {
  const [players, setPlayers] = useState(['', '', '', '']);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [usePreset, setUsePreset] = useState(true);

  const validPlayers = players.filter(p => p.trim() !== '');
  const preset = getRolePreset(validPlayers.length);

  const addPlayer = () => {
    if (players.length < 15) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 4) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const updatePlayer = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const toggleRole = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const getRolesToUse = () => {
    if (usePreset) {
      return preset.roles;
    }
    return selectedRoles;
  };

  const canStart = () => {
    const roles = getRolesToUse();
    return validPlayers.length >= 4 && roles.length === validPlayers.length;
  };

  const startGame = () => {
    if (!canStart()) {
      Alert.alert(
        'Configuration invalide',
        `Il faut exactement ${validPlayers.length} rôles pour ${validPlayers.length} joueurs.`
      );
      return;
    }

    navigation.navigate('WerewolfRoleDistribution', {
      players: validPlayers,
      roles: getRolesToUse(),
    });
  };

  const availableRoles = Object.values(ROLES);

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
          <Text style={styles.title}>Loup-Garou</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Joueurs ({validPlayers.length})</Text>
          <Text style={styles.sectionSubtitle}>Minimum 4 joueurs</Text>

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
              {players.length > 4 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {players.length < 15 && (
            <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
              <Text style={styles.addButtonText}>+ Ajouter un joueur</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Roles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rôles</Text>

          {/* Preset Toggle */}
          <View style={styles.presetToggle}>
            <TouchableOpacity
              style={[styles.presetButton, usePreset && styles.presetButtonActive]}
              onPress={() => setUsePreset(true)}
            >
              <Text style={[styles.presetButtonText, usePreset && styles.presetButtonTextActive]}>
                Automatique
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetButton, !usePreset && styles.presetButtonActive]}
              onPress={() => setUsePreset(false)}
            >
              <Text style={[styles.presetButtonText, !usePreset && styles.presetButtonTextActive]}>
                Personnalisé
              </Text>
            </TouchableOpacity>
          </View>

          {usePreset ? (
            <View style={styles.presetInfo}>
              <Text style={styles.presetDescription}>
                {validPlayers.length >= 4 ? preset.description : 'Ajoutez au moins 4 joueurs'}
              </Text>
              {validPlayers.length >= 4 && (
                <View style={styles.presetRoles}>
                  {preset.roles.map((roleId, index) => {
                    const role = getRoleById(roleId);
                    return (
                      <View
                        key={index}
                        style={[styles.roleChip, { backgroundColor: role.color + '30', borderColor: role.color }]}
                      >
                        <Text style={styles.roleChipEmoji}>{role.emoji}</Text>
                        <Text style={[styles.roleChipText, { color: role.color }]}>{role.name}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.customRoles}>
              <Text style={styles.customRolesCount}>
                {selectedRoles.length} / {validPlayers.length} rôles sélectionnés
              </Text>
              <View style={styles.rolesGrid}>
                {availableRoles.map((role) => {
                  const count = selectedRoles.filter(r => r === role.id).length;
                  const isSelected = count > 0;

                  return (
                    <View key={role.id} style={styles.roleCard}>
                      <TouchableOpacity
                        style={[
                          styles.roleCardInner,
                          isSelected && { backgroundColor: role.color + '30', borderColor: role.color }
                        ]}
                        onPress={() => toggleRole(role.id)}
                      >
                        <Text style={styles.roleEmoji}>{role.emoji}</Text>
                        <Text style={[styles.roleName, isSelected && { color: role.color }]}>
                          {role.name}
                        </Text>
                        {count > 0 && (
                          <View style={[styles.roleCount, { backgroundColor: role.color }]}>
                            <Text style={styles.roleCountText}>{count}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      {isSelected && (
                        <TouchableOpacity
                          style={[styles.addMoreButton, { backgroundColor: role.color }]}
                          onPress={() => setSelectedRoles([...selectedRoles, role.id])}
                        >
                          <Text style={styles.addMoreButtonText}>+</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
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
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
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
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  presetToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
  },
  presetButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  presetButtonTextActive: {
    color: colors.textPrimary,
  },
  presetInfo: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  presetDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  presetRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  roleChipEmoji: {
    fontSize: 14,
  },
  roleChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  customRoles: {},
  customRolesCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleCard: {
    width: '48%',
    position: 'relative',
  },
  roleCardInner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  roleName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  roleCount: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCountText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  addMoreButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  startButton: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.primary,
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
    color: colors.textPrimary,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
