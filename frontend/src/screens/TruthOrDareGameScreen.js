import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getRandomTruth, getRandomDare } from '../data/truthOrDareData';

const MODE_COLORS = {
  soft: '#22c55e',
  classic: '#3b82f6',
  chaos: '#ef4444',
};

const MODE_NAMES = {
  soft: 'Soft',
  classic: 'Classique',
  chaos: 'Chaos',
};

export default function TruthOrDareGameScreen({ navigation, route }) {
  const { mode, players } = route.params;

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState('choose'); // choose, reveal
  const [choice, setChoice] = useState(null); // 'truth' or 'dare'
  const [currentContent, setCurrentContent] = useState('');
  const [stats, setStats] = useState({
    truths: 0,
    dares: 0,
    refused: 0,
  });
  const [usedTruths, setUsedTruths] = useState([]);
  const [usedDares, setUsedDares] = useState([]);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentPlayer = players[currentPlayerIndex];
  const modeColor = MODE_COLORS[mode];

  const handleChoice = (type) => {
    Vibration.vibrate(50);
    setChoice(type);

    // Obtenir une question/action non utilisée
    let content;
    let attempts = 0;
    const maxAttempts = 50;

    if (type === 'truth') {
      do {
        content = getRandomTruth(mode);
        attempts++;
      } while (usedTruths.includes(content) && attempts < maxAttempts);

      if (!usedTruths.includes(content)) {
        setUsedTruths([...usedTruths, content]);
      }
      setStats(prev => ({ ...prev, truths: prev.truths + 1 }));
    } else {
      do {
        content = getRandomDare(mode);
        attempts++;
      } while (usedDares.includes(content) && attempts < maxAttempts);

      if (!usedDares.includes(content)) {
        setUsedDares([...usedDares, content]);
      }
      setStats(prev => ({ ...prev, dares: prev.dares + 1 }));
    }

    setCurrentContent(content);

    // Animation de flip
    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setGamePhase('reveal');
    });
  };

  const handleComplete = () => {
    Vibration.vibrate(50);
    animateNext();
  };

  const handleRefuse = () => {
    Alert.alert(
      '😱 Refus !',
      'Le joueur refuse ! Les autres joueurs décident de sa punition...',
      [
        {
          text: 'Punition donnée !',
          onPress: () => {
            setStats(prev => ({ ...prev, refused: prev.refused + 1 }));
            animateNext();
          },
        },
      ]
    );
  };

  const handleNewChallenge = () => {
    Vibration.vibrate(50);
    // Obtenir une nouvelle question/action
    let content;
    let attempts = 0;
    const maxAttempts = 50;

    if (choice === 'truth') {
      do {
        content = getRandomTruth(mode);
        attempts++;
      } while (usedTruths.includes(content) && attempts < maxAttempts);

      if (!usedTruths.includes(content)) {
        setUsedTruths([...usedTruths, content]);
      }
    } else {
      do {
        content = getRandomDare(mode);
        attempts++;
      } while (usedDares.includes(content) && attempts < maxAttempts);

      if (!usedDares.includes(content)) {
        setUsedDares([...usedDares, content]);
      }
    }

    setCurrentContent(content);

    // Animation de scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateNext = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      nextPlayer();
    });
  };

  const nextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setGamePhase('choose');
    setChoice(null);
    setCurrentContent('');
  };

  const handleQuit = () => {
    Alert.alert(
      'Quitter la partie',
      'Êtes-vous sûr de vouloir quitter ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', onPress: () => navigation.goBack() },
      ]
    );
  };

  const flipInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Écran de choix
  if (gamePhase === 'choose') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.modeBadge, { backgroundColor: modeColor }]}>
            <Text style={styles.modeBadgeText}>{MODE_NAMES[mode]}</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              ❓{stats.truths} 🎬{stats.dares}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.turnLabel}>C'est au tour de</Text>
          <Text style={[styles.playerName, { color: modeColor }]}>{currentPlayer}</Text>

          <Text style={styles.questionText}>Action ou Vérité ?</Text>

          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[styles.choiceButton, styles.truthButton]}
              onPress={() => handleChoice('truth')}
            >
              <Text style={styles.choiceEmoji}>❓</Text>
              <Text style={styles.choiceTitle}>Vérité</Text>
              <Text style={styles.choiceSubtitle}>Réponds honnêtement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceButton, styles.dareButton]}
              onPress={() => handleChoice('dare')}
            >
              <Text style={styles.choiceEmoji}>🎬</Text>
              <Text style={styles.choiceTitle}>Action</Text>
              <Text style={styles.choiceSubtitle}>Relève le défi</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tour {Math.floor((stats.truths + stats.dares) / players.length) + 1} • Joueur {currentPlayerIndex + 1}/{players.length}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Écran de révélation
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={[styles.modeBadge, { backgroundColor: modeColor }]}>
          <Text style={styles.modeBadgeText}>{MODE_NAMES[mode]}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            ❓{stats.truths} 🎬{stats.dares}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.playerNameSmall}>{currentPlayer}</Text>

        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { rotateY: flipInterpolate },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.card,
              choice === 'truth' ? styles.truthCard : styles.dareCard,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>
                {choice === 'truth' ? '❓' : '🎬'}
              </Text>
              <Text style={styles.cardType}>
                {choice === 'truth' ? 'VÉRITÉ' : 'ACTION'}
              </Text>
            </View>
            <Text style={styles.cardContent}>{currentContent}</Text>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.newChallengeButton} onPress={handleNewChallenge}>
          <Text style={styles.newChallengeText}>🔄 Autre {choice === 'truth' ? 'question' : 'défi'}</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.refuseButton} onPress={handleRefuse}>
            <Text style={styles.refuseButtonText}>😰 Je refuse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: modeColor }]}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>✅ C'est fait !</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {stats.refused > 0 && `😱 ${stats.refused} refus`}
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quitButtonText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  modeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  modeBadgeText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statsText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  turnLabel: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  playerName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xl,
  },
  playerNameSmall: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    fontWeight: fontWeight.semibold,
  },
  choiceContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  choiceButton: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  truthButton: {
    backgroundColor: '#8b5cf6',
  },
  dareButton: {
    backgroundColor: '#f59e0b',
  },
  choiceEmoji: {
    fontSize: 48,
  },
  choiceTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  choiceSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  cardContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 250,
    justifyContent: 'center',
  },
  truthCard: {
    backgroundColor: '#8b5cf6',
  },
  dareCard: {
    backgroundColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardType: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
    letterSpacing: 2,
  },
  cardContent: {
    fontSize: fontSize.xl,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: fontWeight.medium,
  },
  newChallengeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  newChallengeText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  refuseButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  refuseButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  completeButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  footer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
