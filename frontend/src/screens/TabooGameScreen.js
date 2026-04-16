import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getTabooCards } from '../data/tabooWords';
import { getTabooCardsSpicy } from '../data/tabooWordsSpicy';

const { width } = Dimensions.get('window');

export default function TabooGameScreen({ navigation, route }) {
  const { mode, team1, team2, turnDuration, cardsPerGame } = route.params;

  // États du jeu
  const [gamePhase, setGamePhase] = useState('ready'); // ready, playing, turnEnd, gameOver
  const [currentTeam, setCurrentTeam] = useState(1);
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(turnDuration);
  const [turnScore, setTurnScore] = useState(0);
  const [turnTaboos, setTurnTaboos] = useState(0);
  const [cardsPlayed, setCardsPlayed] = useState(0);

  const timerRef = useRef(null);
  const tickSoundRef = useRef(null);
  const buzzerSoundRef = useRef(null);

  // Charger les cartes au démarrage
  useEffect(() => {
    const loadedCards = mode === 'spicy'
      ? getTabooCardsSpicy(cardsPerGame)
      : getTabooCards(cardsPerGame);
    setCards(loadedCards);
  }, [mode, cardsPerGame]);

  // Charger les sons
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Son de tick (horloge)
        const { sound: tickSound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.freesound.org/previews/254/254316_4062622-lq.mp3' },
          { shouldPlay: false, volume: 0.8 }
        );
        tickSoundRef.current = tickSound;

        // Son de buzzer pour la fin
        const { sound: buzzerSound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.freesound.org/previews/352/352661_4019029-lq.mp3' },
          { shouldPlay: false, volume: 1.0 }
        );
        buzzerSoundRef.current = buzzerSound;
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };
    loadSounds();

    return () => {
      if (tickSoundRef.current) {
        tickSoundRef.current.unloadAsync();
      }
      if (buzzerSoundRef.current) {
        buzzerSoundRef.current.unloadAsync();
      }
    };
  }, []);

  // Jouer le tick pour les 10 dernières secondes
  const playTickSound = async () => {
    try {
      if (tickSoundRef.current) {
        await tickSoundRef.current.setPositionAsync(0);
        await tickSoundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Tick sound error:', error);
    }
  };

  // Jouer le buzzer de fin
  const playBuzzerSound = async () => {
    try {
      if (buzzerSoundRef.current) {
        await buzzerSoundRef.current.setPositionAsync(0);
        await buzzerSoundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Buzzer sound error:', error);
    }
  };

  // Timer
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      // Jouer le tick pour les 10 dernières secondes
      if (timeLeft <= 10) {
        playTickSound();
      }

      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gamePhase === 'playing' && timeLeft === 0) {
      // Jouer le buzzer de fin
      playBuzzerSound();
      endTurn();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gamePhase, timeLeft]);

  const startTurn = () => {
    setGamePhase('playing');
    setTimeLeft(turnDuration);
    setTurnScore(0);
    setTurnTaboos(0);
  };

  const endTurn = useCallback(() => {
    Vibration.vibrate(200);
    setGamePhase('turnEnd');

    // Ajouter le score du tour
    if (currentTeam === 1) {
      setScores(prev => ({ ...prev, team1: prev.team1 + turnScore }));
    } else {
      setScores(prev => ({ ...prev, team2: prev.team2 + turnScore }));
    }
  }, [currentTeam, turnScore]);

  const nextTurn = () => {
    // Vérifier si toutes les cartes ont été jouées
    if (currentCardIndex >= cards.length) {
      setGamePhase('gameOver');
      return;
    }

    // Alterner les équipes
    setCurrentTeam(prev => prev === 1 ? 2 : 1);
    setGamePhase('ready');
  };

  const handleCorrect = () => {
    Vibration.vibrate(50);
    setTurnScore(prev => prev + 1);
    setCardsPlayed(prev => prev + 1);
    nextCard();
  };

  const handleTaboo = () => {
    Vibration.vibrate([0, 100, 100, 100]);
    setTurnScore(prev => prev - 1);
    setTurnTaboos(prev => prev + 1);
    setCardsPlayed(prev => prev + 1);
    nextCard();
  };

  const handlePass = () => {
    // Passer sans pénalité, la carte retourne dans le deck
    nextCard();
  };

  const nextCard = () => {
    if (currentCardIndex + 1 >= cards.length) {
      endTurn();
      return;
    }
    setCurrentCardIndex(prev => prev + 1);
  };

  const getCurrentTeamName = () => currentTeam === 1 ? team1 : team2;
  const getCurrentTeamColor = () => currentTeam === 1 ? '#3b82f6' : '#ef4444';

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

  const restartGame = () => {
    const loadedCards = mode === 'spicy'
      ? getTabooCardsSpicy(cardsPerGame)
      : getTabooCards(cardsPerGame);
    setCards(loadedCards);
    setCurrentCardIndex(0);
    setScores({ team1: 0, team2: 0 });
    setCurrentTeam(1);
    setCardsPlayed(0);
    setGamePhase('ready');
  };

  // Écran prêt pour le tour
  if (gamePhase === 'ready') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.readyContainer}>
          <Text style={styles.readyTitle}>Tour de</Text>
          <View style={[styles.teamBadge, { backgroundColor: getCurrentTeamColor() }]}>
            <Text style={styles.teamBadgeText}>{getCurrentTeamName()}</Text>
          </View>

          <View style={styles.scoreBoard}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreName, { color: '#3b82f6' }]}>{team1}</Text>
              <Text style={styles.scoreValue}>{scores.team1}</Text>
            </View>
            <Text style={styles.scoreSeparator}>-</Text>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreName, { color: '#ef4444' }]}>{team2}</Text>
              <Text style={styles.scoreValue}>{scores.team2}</Text>
            </View>
          </View>

          <Text style={styles.cardsRemaining}>
            {cards.length - currentCardIndex} cartes restantes
          </Text>

          <Text style={styles.instructions}>
            Un joueur de l'équipe fait deviner,{'\n'}les autres devinent !
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={startTurn}>
            <Text style={styles.startButtonText}>Commencer ({turnDuration}s)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Écran de jeu
  if (gamePhase === 'playing' && cards.length > 0 && currentCardIndex < cards.length) {
    const currentCard = cards[currentCardIndex];

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameContainer}>
          {/* Header avec timer et score */}
          <View style={styles.gameHeader}>
            <View style={[styles.teamIndicator, { backgroundColor: getCurrentTeamColor() }]}>
              <Text style={styles.teamIndicatorText}>{getCurrentTeamName()}</Text>
            </View>
            <View style={[styles.timerContainer, timeLeft <= 10 && styles.timerWarning]}>
              <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextWarning]}>
                {timeLeft}
              </Text>
            </View>
            <View style={styles.turnScoreContainer}>
              <Text style={styles.turnScoreLabel}>Tour</Text>
              <Text style={[styles.turnScoreValue, turnScore < 0 && styles.negativeScore]}>
                {turnScore > 0 ? '+' : ''}{turnScore}
              </Text>
            </View>
          </View>

          {/* Carte Taboo */}
          <View style={styles.cardContainer}>
            <View style={styles.tabooCard}>
              <View style={styles.wordToGuess}>
                <Text style={styles.wordToGuessText}>{currentCard.word}</Text>
              </View>
              <View style={styles.forbiddenWords}>
                <Text style={styles.forbiddenTitle}>MOTS INTERDITS</Text>
                {currentCard.forbidden.map((word, index) => (
                  <View key={index} style={styles.forbiddenItem}>
                    <Text style={styles.forbiddenText}>🚫 {word}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.tabooButton} onPress={handleTaboo}>
              <Text style={styles.actionButtonText}>❌ TABOO</Text>
              <Text style={styles.actionSubtext}>-1 point</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.passButton} onPress={handlePass}>
              <Text style={styles.actionButtonText}>⏭️ PASSER</Text>
              <Text style={styles.actionSubtext}>0 point</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.correctButton} onPress={handleCorrect}>
              <Text style={styles.actionButtonText}>✅ CORRECT</Text>
              <Text style={styles.actionSubtext}>+1 point</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Écran fin de tour
  if (gamePhase === 'turnEnd') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.turnEndContainer}>
          <Text style={styles.turnEndTitle}>Temps écoulé !</Text>

          <View style={[styles.teamBadge, { backgroundColor: getCurrentTeamColor() }]}>
            <Text style={styles.teamBadgeText}>{getCurrentTeamName()}</Text>
          </View>

          <View style={styles.turnSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Points du tour</Text>
              <Text style={[styles.summaryValue, turnScore < 0 && styles.negativeScore]}>
                {turnScore > 0 ? '+' : ''}{turnScore}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mots interdits dits</Text>
              <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{turnTaboos}</Text>
            </View>
          </View>

          <View style={styles.scoreBoard}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreName, { color: '#3b82f6' }]}>{team1}</Text>
              <Text style={styles.scoreValue}>{scores.team1}</Text>
            </View>
            <Text style={styles.scoreSeparator}>-</Text>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreName, { color: '#ef4444' }]}>{team2}</Text>
              <Text style={styles.scoreValue}>{scores.team2}</Text>
            </View>
          </View>

          {currentCardIndex >= cards.length ? (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: '#f59e0b' }]}
              onPress={() => setGamePhase('gameOver')}
            >
              <Text style={styles.startButtonText}>Voir les résultats</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={nextTurn}>
              <Text style={styles.startButtonText}>Tour suivant</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Écran fin de partie
  if (gamePhase === 'gameOver') {
    const winner = scores.team1 > scores.team2 ? team1
      : scores.team2 > scores.team1 ? team2
      : null;
    const winnerColor = scores.team1 > scores.team2 ? '#3b82f6' : '#ef4444';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Partie terminée !</Text>

          {winner ? (
            <>
              <Text style={styles.winnerLabel}>Vainqueur</Text>
              <View style={[styles.winnerBadge, { backgroundColor: winnerColor }]}>
                <Text style={styles.winnerText}>🏆 {winner} 🏆</Text>
              </View>
            </>
          ) : (
            <View style={styles.winnerBadge}>
              <Text style={styles.winnerText}>Égalité !</Text>
            </View>
          )}

          <View style={styles.finalScores}>
            <View style={styles.finalScoreItem}>
              <Text style={[styles.finalTeamName, { color: '#3b82f6' }]}>{team1}</Text>
              <Text style={styles.finalScoreValue}>{scores.team1}</Text>
              <Text style={styles.finalScoreLabel}>points</Text>
            </View>
            <View style={styles.finalScoreItem}>
              <Text style={[styles.finalTeamName, { color: '#ef4444' }]}>{team2}</Text>
              <Text style={styles.finalScoreValue}>{scores.team2}</Text>
              <Text style={styles.finalScoreLabel}>points</Text>
            </View>
          </View>

          <Text style={styles.statsText}>
            {cardsPlayed} cartes jouées
          </Text>

          <View style={styles.gameOverButtons}>
            <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
              <Text style={styles.restartButtonText}>Rejouer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.homeButtonText}>Accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Ready screen
  readyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  readyTitle: {
    fontSize: fontSize.xxl,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  teamBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  teamBadgeText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  scoreValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  scoreSeparator: {
    fontSize: fontSize.xxxl,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
  },
  cardsRemaining: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  instructions: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  startButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  quitButton: {
    padding: spacing.md,
  },
  quitButtonText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  // Game screen
  gameContainer: {
    flex: 1,
    padding: spacing.md,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  teamIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  teamIndicatorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  timerContainer: {
    backgroundColor: colors.surface,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  timerWarning: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  timerText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  timerTextWarning: {
    color: '#ef4444',
  },
  turnScoreContainer: {
    alignItems: 'center',
  },
  turnScoreLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  turnScoreValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#22c55e',
  },
  negativeScore: {
    color: '#ef4444',
  },
  // Taboo card
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabooCard: {
    width: width - spacing.lg * 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  wordToGuess: {
    backgroundColor: '#22c55e',
    padding: spacing.xl,
    alignItems: 'center',
  },
  wordToGuessText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: '#fff',
    textAlign: 'center',
  },
  forbiddenWords: {
    padding: spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  forbiddenTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  forbiddenItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },
  forbiddenText: {
    fontSize: fontSize.lg,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  // Action buttons
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tabooButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  passButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  correctButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  actionSubtext: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Turn end screen
  turnEndContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  turnEndTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  turnSummary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.xl,
    width: '100%',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#22c55e',
  },
  // Game over screen
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  gameOverTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  winnerLabel: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  winnerBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  winnerText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  finalScores: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  finalScoreItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 120,
  },
  finalTeamName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  finalScoreValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  finalScoreLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statsText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  restartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  restartButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  homeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
});
