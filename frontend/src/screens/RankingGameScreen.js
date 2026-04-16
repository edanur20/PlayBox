import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getShuffledQuestions, QUESTIONS_PER_ROUND, POINTS_CORRECT } from '../data/rankingQuestions';

const { width } = Dimensions.get('window');

// Phases du jeu
const PHASES = {
  SHOW_CLASSEUR: 'show_classeur',      // Montrer qui est le classeur
  CLASSEUR_QUESTION: 'classeur_question', // Le classeur voit la question
  CLASSEUR_RANKING: 'classeur_ranking',   // Le classeur fait son classement
  SHOW_RANKING: 'show_ranking',           // Montrer le classement aux autres
  PLAYERS_GUESS: 'players_guess',         // Les joueurs devinent
  SHOW_RESULTS: 'show_results',           // Montrer les résultats
  GAME_OVER: 'game_over',                 // Fin de partie
};

export default function RankingGameScreen({ route, navigation }) {
  const { players, totalRounds } = route.params;

  // États du jeu
  const [phase, setPhase] = useState(PHASES.SHOW_CLASSEUR);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState(() => {
    const initial = {};
    players.forEach(p => initial[p] = 0);
    return initial;
  });

  // Questions
  const [allQuestions] = useState(() => getShuffledQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Classeur
  const [classeurIndex, setClasseurIndex] = useState(() => Math.floor(Math.random() * players.length));
  const classeur = players[classeurIndex];
  const otherPlayers = players.filter((_, i) => i !== classeurIndex);

  // Classement
  const [ranking, setRanking] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);

  // Devinettes
  const [currentGuesser, setCurrentGuesser] = useState(0);
  const [guesses, setGuesses] = useState({});

  // Initialiser les questions du round
  useEffect(() => {
    const startIdx = (currentRound - 1) * QUESTIONS_PER_ROUND;
    const questions = allQuestions.slice(startIdx, startIdx + QUESTIONS_PER_ROUND);
    setRoundQuestions(questions);
  }, [currentRound, allQuestions]);

  // Initialiser les joueurs disponibles pour le classement
  useEffect(() => {
    if (phase === PHASES.CLASSEUR_RANKING) {
      setAvailablePlayers([...otherPlayers]);
      setRanking([]);
    }
  }, [phase]);

  // Ajouter un joueur au classement (nouveau rang)
  const addToRanking = (player) => {
    setAvailablePlayers(prev => prev.filter(p => p !== player));
    setRanking(prev => [...prev, [player]]);
  };

  // Ajouter un joueur à un rang existant (égalité)
  const addToExistingRank = (player, rankIndex) => {
    setAvailablePlayers(prev => prev.filter(p => p !== player));
    setRanking(prev => {
      const newRanking = [...prev];
      newRanking[rankIndex] = [...newRanking[rankIndex], player];
      return newRanking;
    });
  };

  // Retirer un joueur du classement
  const removeFromRanking = (player, rankIndex) => {
    setRanking(prev => {
      const newRanking = [...prev];
      newRanking[rankIndex] = newRanking[rankIndex].filter(p => p !== player);
      if (newRanking[rankIndex].length === 0) {
        newRanking.splice(rankIndex, 1);
      }
      return newRanking;
    });
    setAvailablePlayers(prev => [...prev, player]);
  };

  // Le classeur sélectionne une question
  const selectQuestion = (question) => {
    setSelectedQuestion(question);
    setPhase(PHASES.CLASSEUR_RANKING);
  };

  // Le classeur valide son classement
  const validateRanking = () => {
    if (availablePlayers.length > 0) {
      Alert.alert('Classement incomplet', 'Tu dois classer tous les joueurs !');
      return;
    }
    setPhase(PHASES.SHOW_RANKING);
  };

  // Passer à la phase de devinettes
  const startGuessing = () => {
    setCurrentGuesser(0);
    setGuesses({});
    setPhase(PHASES.PLAYERS_GUESS);
  };

  // Un joueur fait sa devinette
  const makeGuess = (questionGuessed) => {
    const guesserName = otherPlayers[currentGuesser];
    const newGuesses = { ...guesses, [guesserName]: questionGuessed };
    setGuesses(newGuesses);

    if (currentGuesser < otherPlayers.length - 1) {
      setCurrentGuesser(prev => prev + 1);
    } else {
      // Calculer les scores
      const newScores = { ...scores };
      Object.entries(newGuesses).forEach(([player, guess]) => {
        if (guess === selectedQuestion) {
          newScores[player] += POINTS_CORRECT;
        }
      });
      setScores(newScores);
      setPhase(PHASES.SHOW_RESULTS);
    }
  };

  // Passer au round suivant
  const nextRound = () => {
    if (currentRound >= totalRounds) {
      setPhase(PHASES.GAME_OVER);
    } else {
      // Nouveau classeur aléatoire (différent du précédent)
      let newClasseurIndex;
      do {
        newClasseurIndex = Math.floor(Math.random() * players.length);
      } while (newClasseurIndex === classeurIndex && players.length > 1);

      setClasseurIndex(newClasseurIndex);
      setCurrentRound(prev => prev + 1);
      setCurrentQuestionIndex(prev => prev + QUESTIONS_PER_ROUND);
      setSelectedQuestion(null);
      setGuesses({});
      setPhase(PHASES.SHOW_CLASSEUR);
    }
  };

  // Render selon la phase
  const renderPhase = () => {
    switch (phase) {
      case PHASES.SHOW_CLASSEUR:
        return renderShowClasseur();
      case PHASES.CLASSEUR_QUESTION:
        return renderClasseurQuestion();
      case PHASES.CLASSEUR_RANKING:
        return renderClasseurRanking();
      case PHASES.SHOW_RANKING:
        return renderShowRanking();
      case PHASES.PLAYERS_GUESS:
        return renderPlayersGuess();
      case PHASES.SHOW_RESULTS:
        return renderShowResults();
      case PHASES.GAME_OVER:
        return renderGameOver();
      default:
        return null;
    }
  };

  // Phase: Montrer qui est le classeur
  const renderShowClasseur = () => (
    <View style={styles.centerContent}>
      <Text style={styles.phaseEmoji}>👑</Text>
      <Text style={styles.phaseTitle}>Tour {currentRound}/{totalRounds}</Text>
      <Text style={styles.bigText}>{classeur}</Text>
      <Text style={styles.phaseSubtitle}>est le Classeur !</Text>
      <Text style={styles.instruction}>
        Passe le téléphone à {classeur} en secret
      </Text>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setPhase(PHASES.CLASSEUR_QUESTION)}
      >
        <Text style={styles.mainButtonText}>C'est moi {classeur} !</Text>
      </TouchableOpacity>
    </View>
  );

  // Phase: Le classeur choisit sa question
  const renderClasseurQuestion = () => (
    <View style={styles.fullContent}>
      <Text style={styles.privateWarning}>🔒 Écran privé pour {classeur}</Text>
      <Text style={styles.sectionTitle}>Choisis ta question :</Text>
      <Text style={styles.sectionSubtitle}>
        Tu vas classer les joueurs selon cette question
      </Text>
      <ScrollView style={styles.questionsScroll} showsVerticalScrollIndicator={false}>
        {roundQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.questionCard}
            onPress={() => selectQuestion(question)}
          >
            <Text style={styles.questionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Phase: Le classeur fait son classement
  const renderClasseurRanking = () => (
    <View style={styles.fullContent}>
      <Text style={styles.privateWarning}>🔒 Écran privé pour {classeur}</Text>
      <Text style={styles.questionReminder}>"{selectedQuestion}"</Text>

      <Text style={styles.sectionTitle}>Fais ton classement :</Text>
      <Text style={styles.sectionSubtitle}>Du PLUS au MOINS</Text>

      {/* Joueurs disponibles */}
      {availablePlayers.length > 0 && (
        <View style={styles.availableSection}>
          <Text style={styles.availableTitle}>Joueurs à classer :</Text>
          <View style={styles.availableRow}>
            {availablePlayers.map((player) => (
              <TouchableOpacity
                key={player}
                style={styles.availablePlayer}
                onPress={() => addToRanking(player)}
              >
                <Text style={styles.availablePlayerText}>{player}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Classement actuel */}
      <ScrollView style={styles.rankingScroll} showsVerticalScrollIndicator={false}>
        {ranking.map((rankPlayers, rankIndex) => (
          <View key={rankIndex} style={styles.rankRow}>
            <View style={styles.rankNumber}>
              <Text style={styles.rankNumberText}>{rankIndex + 1}</Text>
            </View>
            <View style={styles.rankPlayersContainer}>
              {rankPlayers.map((player) => (
                <TouchableOpacity
                  key={player}
                  style={styles.rankedPlayer}
                  onPress={() => removeFromRanking(player, rankIndex)}
                >
                  <Text style={styles.rankedPlayerText}>{player}</Text>
                  <Text style={styles.removeIcon}>×</Text>
                </TouchableOpacity>
              ))}
              {availablePlayers.length > 0 && (
                <View style={styles.addToRankContainer}>
                  {availablePlayers.map((player) => (
                    <TouchableOpacity
                      key={`add-${player}`}
                      style={styles.addToRankButton}
                      onPress={() => addToExistingRank(player, rankIndex)}
                    >
                      <Text style={styles.addToRankText}>+ {player}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {ranking.length === 0 && (
          <Text style={styles.emptyRankingText}>
            Appuie sur un joueur pour l'ajouter au classement
          </Text>
        )}
      </ScrollView>

      {availablePlayers.length === 0 && (
        <TouchableOpacity style={styles.mainButton} onPress={validateRanking}>
          <Text style={styles.mainButtonText}>Valider le classement</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Phase: Montrer le classement aux autres
  const renderShowRanking = () => (
    <View style={styles.fullContent}>
      <Text style={styles.phaseEmoji}>📊</Text>
      <Text style={styles.phaseTitle}>Le classement de {classeur}</Text>
      <Text style={styles.phaseSubtitle}>Quelle était la question ?</Text>

      <ScrollView style={styles.rankingDisplayScroll} showsVerticalScrollIndicator={false}>
        {ranking.map((rankPlayers, rankIndex) => (
          <View key={rankIndex} style={styles.rankDisplayRow}>
            <View style={styles.rankDisplayNumber}>
              <Text style={styles.rankDisplayNumberText}>{rankIndex + 1}</Text>
            </View>
            <View style={styles.rankDisplayPlayers}>
              {rankPlayers.map((player, idx) => (
                <React.Fragment key={player}>
                  {idx > 0 && <Text style={styles.equalSign}>=</Text>}
                  <Text style={styles.rankDisplayPlayerText}>{player}</Text>
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.mainButton} onPress={startGuessing}>
        <Text style={styles.mainButtonText}>Deviner la question !</Text>
      </TouchableOpacity>
    </View>
  );

  // Phase: Les joueurs devinent
  const renderPlayersGuess = () => {
    const currentGuesserName = otherPlayers[currentGuesser];

    return (
      <View style={styles.fullContent}>
        <Text style={styles.phaseTitle}>À toi de deviner !</Text>
        <Text style={styles.bigText}>{currentGuesserName}</Text>
        <Text style={styles.sectionSubtitle}>
          Joueur {currentGuesser + 1}/{otherPlayers.length}
        </Text>

        {/* Rappel du classement */}
        <View style={styles.miniRankingContainer}>
          {ranking.map((rankPlayers, rankIndex) => (
            <View key={rankIndex} style={styles.miniRankRow}>
              <Text style={styles.miniRankNumber}>{rankIndex + 1}.</Text>
              <Text style={styles.miniRankPlayers}>
                {rankPlayers.join(' = ')}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quelle était la question ?</Text>

        <ScrollView style={styles.guessScroll} showsVerticalScrollIndicator={false}>
          {roundQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.guessCard}
              onPress={() => makeGuess(question)}
            >
              <Text style={styles.guessText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Phase: Montrer les résultats
  const renderShowResults = () => {
    const winners = Object.entries(guesses)
      .filter(([_, guess]) => guess === selectedQuestion)
      .map(([player]) => player);

    return (
      <View style={styles.fullContent}>
        <Text style={styles.phaseEmoji}>🎯</Text>
        <Text style={styles.phaseTitle}>La réponse était :</Text>
        <View style={styles.correctAnswerBox}>
          <Text style={styles.correctAnswerText}>{selectedQuestion}</Text>
        </View>

        <View style={styles.resultsContainer}>
          {winners.length > 0 ? (
            <>
              <Text style={styles.winnersTitle}>Bravo !</Text>
              <View style={styles.winnersList}>
                {winners.map((winner) => (
                  <View key={winner} style={styles.winnerBadge}>
                    <Text style={styles.winnerName}>{winner}</Text>
                    <Text style={styles.winnerPoints}>+{POINTS_CORRECT} pts</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noWinnersText}>Personne n'a trouvé !</Text>
          )}

          <View style={styles.allGuesses}>
            <Text style={styles.guessesTitle}>Réponses :</Text>
            {Object.entries(guesses).map(([player, guess]) => (
              <View key={player} style={styles.guessRow}>
                <Text style={styles.guessPlayer}>{player}</Text>
                <Text style={[
                  styles.guessResult,
                  guess === selectedQuestion ? styles.guessCorrect : styles.guessWrong
                ]}>
                  {guess === selectedQuestion ? '✓' : '✗'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.mainButton} onPress={nextRound}>
          <Text style={styles.mainButtonText}>
            {currentRound >= totalRounds ? 'Voir les scores finaux' : 'Tour suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Phase: Fin de partie
  const renderGameOver = () => {
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);
    const winner = sortedScores[0];

    return (
      <View style={styles.fullContent}>
        <Text style={styles.phaseEmoji}>🏆</Text>
        <Text style={styles.phaseTitle}>Fin de la partie !</Text>

        <View style={styles.finalScores}>
          {sortedScores.map(([player, score], index) => (
            <View
              key={player}
              style={[
                styles.finalScoreRow,
                index === 0 && styles.winnerRow
              ]}
            >
              <Text style={styles.finalScoreRank}>
                {index === 0 ? '👑' : `${index + 1}.`}
              </Text>
              <Text style={[
                styles.finalScoreName,
                index === 0 && styles.winnerName
              ]}>
                {player}
              </Text>
              <Text style={[
                styles.finalScorePoints,
                index === 0 && styles.winnerPoints
              ]}>
                {score} pts
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.mainButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec scores */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Quitter la partie ?',
              'La progression sera perdue.',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Quitter', onPress: () => navigation.navigate('Home') }
              ]
            );
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tour {currentRound}/{totalRounds}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scores mini */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scoresBar}
        contentContainerStyle={styles.scoresBarContent}
      >
        {Object.entries(scores)
          .sort(([, a], [, b]) => b - a)
          .map(([player, score]) => (
            <View
              key={player}
              style={[
                styles.scoreChip,
                player === classeur && styles.scoreChipClasseur
              ]}
            >
              <Text style={styles.scoreChipName}>{player}</Text>
              <Text style={styles.scoreChipValue}>{score}</Text>
            </View>
          ))}
      </ScrollView>

      {/* Contenu de la phase */}
      {renderPhase()}
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
    paddingVertical: spacing.sm,
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
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  scoresBar: {
    maxHeight: 50,
    marginBottom: spacing.sm,
  },
  scoresBarContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  scoreChipClasseur: {
    backgroundColor: '#7c3aed30',
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  scoreChipName: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  scoreChipValue: {
    fontSize: fontSize.sm,
    color: '#7c3aed',
    fontWeight: fontWeight.bold,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  fullContent: {
    flex: 1,
    padding: spacing.md,
  },
  phaseEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  phaseTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  phaseSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bigText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  mainButton: {
    backgroundColor: '#7c3aed',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  mainButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  privateWarning: {
    fontSize: fontSize.sm,
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
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
  questionsScroll: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  questionReminder: {
    fontSize: fontSize.md,
    color: '#7c3aed',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  availableSection: {
    marginBottom: spacing.md,
  },
  availableTitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  availableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  availablePlayer: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  availablePlayerText: {
    fontSize: fontSize.md,
    color: '#ffffff',
    fontWeight: fontWeight.medium,
  },
  rankingScroll: {
    flex: 1,
    marginBottom: spacing.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumberText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  rankPlayersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rankedPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#7c3aed',
    gap: spacing.xs,
  },
  rankedPlayerText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  removeIcon: {
    fontSize: 18,
    color: colors.error,
    fontWeight: fontWeight.bold,
  },
  addToRankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  addToRankButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addToRankText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  emptyRankingText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  rankingDisplayScroll: {
    flex: 1,
    marginBottom: spacing.md,
  },
  rankDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rankDisplayNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankDisplayNumberText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  rankDisplayPlayers: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankDisplayPlayerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  equalSign: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  miniRankingContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  miniRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  miniRankNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#7c3aed',
    width: 24,
  },
  miniRankPlayers: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  guessScroll: {
    flex: 1,
  },
  guessCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  guessText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  correctAnswerBox: {
    backgroundColor: '#7c3aed20',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  correctAnswerText: {
    fontSize: fontSize.lg,
    color: '#7c3aed',
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    lineHeight: 26,
  },
  resultsContainer: {
    flex: 1,
  },
  winnersTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  winnersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  winnerBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
  },
  noWinnersText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  allGuesses: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  guessesTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  guessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  guessPlayer: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  guessResult: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  guessCorrect: {
    color: colors.success,
  },
  guessWrong: {
    color: colors.error,
  },
  finalScores: {
    flex: 1,
    marginVertical: spacing.lg,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  winnerRow: {
    backgroundColor: '#7c3aed20',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  finalScoreRank: {
    fontSize: fontSize.lg,
    width: 32,
    textAlign: 'center',
  },
  finalScoreName: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  finalScorePoints: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#7c3aed',
  },
  winnerName: {
    fontWeight: fontWeight.bold,
  },
  winnerPoints: {
    color: '#7c3aed',
  },
});
