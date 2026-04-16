import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getRandomQuestions, categories } from '../data/wouldYouRatherQuestions';

const { height } = Dimensions.get('window');

export default function WouldYouRatherGameScreen({ navigation, route }) {
  const {
    mode = 'classic',
    totalQuestions,
    customQuestions,
    theme,
    roundNumber,
    players,
    totalRounds,
  } = route.params;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialisation des questions
  useEffect(() => {
    if (mode === 'classic') {
      const shuffledQuestions = getRandomQuestions(totalQuestions || 20);
      setQuestions(shuffledQuestions);
    } else if (mode === 'custom' && customQuestions) {
      setQuestions(customQuestions);
    }
  }, [mode, totalQuestions, customQuestions]);

  // Mode résultats finaux
  if (mode === 'finalResults') {
    const sortedPlayers = [...(players || [])].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const hasWinner = winner && (sortedPlayers.length === 1 || winner.score > sortedPlayers[1].score);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.finalResultsContainer}>
          <Text style={styles.finalEmoji}>🏆</Text>
          <Text style={styles.finalTitle}>Fin de la partie !</Text>
          <Text style={styles.finalSubtitle}>
            {totalRounds} manches jouées
          </Text>

          {hasWinner ? (
            <View style={styles.winnerBox}>
              <Text style={styles.winnerLabel}>Grand vainqueur</Text>
              <Text style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerScore}>{winner.score} points</Text>
            </View>
          ) : (
            <View style={styles.winnerBox}>
              <Text style={styles.winnerLabel}>Égalité !</Text>
              <Text style={styles.winnerName}>
                {sortedPlayers.filter(p => p.score === winner?.score).map(p => p.name).join(' & ')}
              </Text>
              <Text style={styles.winnerScore}>{winner?.score} points</Text>
            </View>
          )}

          <View style={styles.finalScoresSection}>
            <Text style={styles.finalScoresTitle}>Classement final</Text>
            {sortedPlayers.map((player, index) => (
              <View
                key={player.id}
                style={[
                  styles.finalScoreRow,
                  index === 0 && styles.firstPlace,
                  index === 1 && styles.secondPlace,
                  index === 2 && styles.thirdPlace,
                ]}
              >
                <Text style={styles.finalRank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </Text>
                <Text style={[
                  styles.finalPlayerName,
                  index < 3 && styles.topPlayerName,
                ]}>
                  {player.name}
                </Text>
                <Text style={[
                  styles.finalPlayerScore,
                  index === 0 && styles.firstPlaceScore,
                ]}>
                  {player.score} pts
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>Statistiques</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Manches jouées</Text>
              <Text style={styles.statsValue}>{totalRounds}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Joueurs</Text>
              <Text style={styles.statsValue}>{players?.length || 0}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Points distribués</Text>
              <Text style={styles.statsValue}>{totalRounds}</Text>
            </View>
          </View>

          <View style={styles.finalButtons}>
            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={() => navigation.navigate('WouldYouRatherInput')}
            >
              <Text style={styles.playAgainButtonText}>🔄 Rejouer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.homeButtonText}>🏠 Menu principal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];

  // Pour le mode classique, obtenir la catégorie
  const category = mode === 'classic' && currentQuestion && currentQuestion.category
    ? categories[currentQuestion.category]
    : null;

  // Question suivante
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Question précédente
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Recommencer (mode classique)
  const restart = () => {
    const shuffledQuestions = getRandomQuestions(totalQuestions || 20);
    setQuestions(shuffledQuestions);
    setCurrentIndex(0);
    setIsFinished(false);
  };

  // Écran de fin (mode classique uniquement maintenant)
  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedEmoji}>🎉</Text>
          <Text style={styles.finishedTitle}>C'est fini !</Text>
          <Text style={styles.finishedSubtitle}>
            {totalQuestions} questions de débats intenses
          </Text>

          <View style={styles.finishedButtons}>
            <TouchableOpacity style={styles.restartButton} onPress={restart}>
              <Text style={styles.restartButtonText}>🔄 Recommencer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.homeButtonText}>🏠 Menu principal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Theme/Category Badge */}
      <View style={styles.categoryContainer}>
        {mode === 'custom' && theme ? (
          <View style={[styles.categoryBadge, { backgroundColor: '#a855f730' }]}>
            <Text style={styles.categoryEmoji}>{theme.emoji}</Text>
            <Text style={[styles.categoryText, { color: '#a855f7' }]}>
              Manche {roundNumber} - {theme.name}
            </Text>
          </View>
        ) : category ? (
          <View style={[styles.categoryBadge, { backgroundColor: category.color + '30' }]}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[styles.categoryText, { color: category.color }]}>
              {category.name}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Question Card */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>Tu préfères...</Text>

        <View style={styles.optionsContainer}>
          <View style={styles.optionCard}>
            <Text style={styles.optionLabel}>A</Text>
            <Text style={styles.optionText}>{currentQuestion.optionA}</Text>
            {mode === 'custom' && currentQuestion.authorA && (
              <Text style={styles.authorText}>— proposé par {currentQuestion.authorA}</Text>
            )}
          </View>

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OU</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.optionCard}>
            <Text style={styles.optionLabel}>B</Text>
            <Text style={styles.optionText}>{currentQuestion.optionB}</Text>
            {mode === 'custom' && currentQuestion.authorB && (
              <Text style={styles.authorText}>— proposé par {currentQuestion.authorB}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={prevQuestion}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>← Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
          <Text style={styles.nextButtonText}>
            {currentIndex === questions.length - 1 ? 'Terminer' : 'Suivant →'}
          </Text>
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
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 2,
  },
  placeholder: {
    width: 44,
  },
  categoryContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  questionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionLabel: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
    marginBottom: spacing.sm,
  },
  optionText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  authorText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#a855f7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  finishedEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  finishedTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  finishedButtons: {
    width: '100%',
    gap: spacing.md,
  },
  restartButton: {
    backgroundColor: '#a855f7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  restartButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  homeButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  homeButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  // Final Results styles
  finalResultsContainer: {
    flexGrow: 1,
    padding: spacing.md,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  finalEmoji: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  finalTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  finalSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  winnerBox: {
    backgroundColor: '#fbbf2420',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  winnerLabel: {
    fontSize: fontSize.md,
    color: '#fbbf24',
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  winnerName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: '#fbbf24',
    textAlign: 'center',
  },
  winnerScore: {
    fontSize: fontSize.xl,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  finalScoresSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  finalScoresTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  firstPlace: {
    backgroundColor: '#fbbf2420',
  },
  secondPlace: {
    backgroundColor: '#94a3b820',
  },
  thirdPlace: {
    backgroundColor: '#cd7f3220',
  },
  finalRank: {
    fontSize: fontSize.xl,
    width: 50,
  },
  finalPlayerName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  topPlayerName: {
    fontWeight: fontWeight.bold,
  },
  finalPlayerScore: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
  },
  firstPlaceScore: {
    color: '#fbbf24',
    fontSize: fontSize.lg,
  },
  statsBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  statsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statsValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  finalButtons: {
    width: '100%',
    gap: spacing.md,
  },
  playAgainButton: {
    backgroundColor: '#a855f7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  playAgainButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
});
