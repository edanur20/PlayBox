import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

const games = [
  {
    id: 'codenames',
    name: 'Code Names',
    description: 'Devinez les mots secrets de votre équipe',
    icon: '🕵️',
    color: colors.primary,
    players: '4-10',
    available: true,
  },
  {
    id: 'werewolf',
    name: 'Loup-Garou',
    description: 'Trouvez les loups avant qu\'ils ne vous dévorent',
    icon: '🐺',
    color: '#dc2626',
    players: '4-15',
    available: true,
  },
  {
    id: 'bmc',
    name: 'Blanc Manger Coco',
    description: 'Le jeu aux réponses hilarantes et déplacées',
    icon: '🥥',
    color: '#854d0e',
    players: '3-10',
    available: true,
  },
  {
    id: 'ranking',
    name: 'Qui est le plus... ?',
    description: 'Classe les joueurs et fais deviner la question !',
    icon: '🏆',
    color: '#7c3aed',
    players: '4-10',
    available: true,
  },
  {
    id: 'timesup',
    name: "Time's Up!",
    description: '3 manches pour faire deviner des mots',
    icon: '⏱️',
    color: '#f59e0b',
    players: '4-20',
    available: true,
  },
  {
    id: 'undercover',
    name: 'Undercover',
    description: 'Trouvez l\'imposteur avec des règles chaotiques !',
    icon: '🕵️‍♂️',
    color: '#6366f1',
    players: '4-12',
    available: true,
  },
  {
    id: 'wouldyourather',
    name: 'Tu préfères',
    description: 'Choix horribles et questions déplacées !',
    icon: '🤔',
    color: '#a855f7',
    players: '3-20',
    available: true,
  },
  {
    id: 'taboo',
    name: 'Taboo',
    description: 'Faites deviner sans mots interdits !',
    icon: '🚫',
    color: '#ec4899',
    players: '4-20',
    available: true,
  },
  {
    id: 'truthordare',
    name: 'Action ou Vérité',
    description: 'Oseras-tu répondre ou relever le défi ?',
    icon: '🎯',
    color: '#14b8a6',
    players: '2-20',
    available: true,
  },
  {
    id: 'bombe',
    name: 'Bombe',
    description: 'Réponds vite avant que ça explose !',
    icon: '💣',
    color: '#f59e0b',
    players: '3-20',
    available: true,
  },
];

export default function HomeScreen({ navigation }) {
  const handleGamePress = (game) => {
    if (!game.available) return;

    switch (game.id) {
      case 'codenames':
        navigation.navigate('CodeNamesSetup');
        break;
      case 'werewolf':
        navigation.navigate('WerewolfSetup');
        break;
      case 'bmc':
        navigation.navigate('BMCSetup');
        break;
      case 'ranking':
        navigation.navigate('RankingSetup');
        break;
      case 'timesup':
        navigation.navigate('TimesUpSetup');
        break;
      case 'undercover':
        navigation.navigate('UndercoverSetup');
        break;
      case 'wouldyourather':
        navigation.navigate('WouldYouRatherSetup');
        break;
      case 'taboo':
        navigation.navigate('TabooSetup');
        break;
      case 'truthordare':
        navigation.navigate('TruthOrDareSetup');
        break;
      case 'bombe':
        navigation.navigate('BombeSetup');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PlayBox</Text>
        <Text style={styles.subtitle}>Choisissez votre jeu</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.gamesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                !game.available && styles.gameCardDisabled,
              ]}
              onPress={() => handleGamePress(game)}
              activeOpacity={game.available ? 0.7 : 1}
            >
              <View
                style={[
                  styles.gameIconContainer,
                  { backgroundColor: game.available ? game.color : colors.neutral },
                ]}
              >
                <Text style={styles.gameIcon}>{game.icon}</Text>
              </View>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              {game.players && (
                <Text style={styles.gamePlayers}>{game.players} joueurs</Text>
              )}
              {!game.available && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Bientôt</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  gamesContainer: {
    padding: spacing.lg,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: cardWidth,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameCardDisabled: {
    opacity: 0.5,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gameIcon: {
    fontSize: 28,
  },
  gameName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  gameDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  gamePlayers: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  comingSoonText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
});
