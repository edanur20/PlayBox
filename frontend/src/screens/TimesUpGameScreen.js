import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getGameWords } from '../data/timesUpWords';
import { getSpicyGameWords } from '../data/timesUpWordsSpicy';

// Phases du jeu
const PHASES = {
  ROUND_INTRO: 'round_intro',     // Introduction de la manche
  TEAM_READY: 'team_ready',       // Équipe prête à jouer
  PLAYING: 'playing',             // Tour en cours
  TURN_END: 'turn_end',           // Fin du tour
  ROUND_END: 'round_end',         // Fin de la manche
  GAME_OVER: 'game_over',         // Fin de partie
};

const ROUND_NAMES = ['Description', 'Un seul mot', 'Mime'];
const ROUND_RULES = [
  "Dis tout ce que tu veux SAUF le mot ou les mots de la même famille !",
  "UN SEUL MOT pour faire deviner ! Tu ne peux pas passer.",
  "MIME uniquement ! Aucun son ni mot autorisé.",
];
const ROUND_COLORS = ['#3b82f6', '#f59e0b', '#22c55e'];

export default function TimesUpGameScreen({ route, navigation }) {
  const { teams: initialTeams, wordsPerPlayer, turnDuration, totalWords, mode = 'classic' } = route.params;

  // État du jeu
  const [phase, setPhase] = useState(PHASES.ROUND_INTRO);
  const [currentRound, setCurrentRound] = useState(1);
  const [teams, setTeams] = useState(initialTeams);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentPlayerIndices, setCurrentPlayerIndices] = useState(
    initialTeams.map(() => 0)
  );

  // Mots - utiliser les mots spicy si mode spicy
  const [gameWords] = useState(() =>
    mode === 'spicy' ? getSpicyGameWords(totalWords) : getGameWords(totalWords)
  );
  const [roundWords, setRoundWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsGuessed, setWordsGuessed] = useState(0);
  const [turnWordsGuessed, setTurnWordsGuessed] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(turnDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Animation
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sound
  const tickSoundRef = useRef(null);
  const buzzerSoundRef = useRef(null);

  // Initialiser les mots de la manche
  useEffect(() => {
    if (currentRound === 1) {
      setRoundWords([...gameWords]);
    }
  }, [gameWords]);

  // Charger les sons
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Son de tick (horloge) - utiliser un son en ligne fiable
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
      // Cleanup
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
    if (isTimerRunning && timeLeft > 0) {
      // Jouer le tick pour les 10 dernières secondes
      if (timeLeft <= 10) {
        playTickSound();
      }

      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      // Temps écoulé - jouer le buzzer
      playBuzzerSound();
      Vibration.vibrate(500);
      endTurn();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // Animation de secousse pour le mot passé
  const shakeWord = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Animation de scale pour mot trouvé
  const popWord = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Joueur actuel
  const getCurrentPlayer = () => {
    const team = teams[currentTeamIndex];
    const playerIndex = currentPlayerIndices[currentTeamIndex];
    return team.players[playerIndex];
  };

  // Équipe actuelle
  const getCurrentTeam = () => teams[currentTeamIndex];

  // Mot actuel
  const getCurrentWord = () => roundWords[currentWordIndex];

  // Commencer le tour
  const startTurn = () => {
    setTimeLeft(turnDuration);
    setTurnWordsGuessed(0);
    setIsTimerRunning(true);
    setPhase(PHASES.PLAYING);
  };

  // Mot trouvé
  const wordGuessed = () => {
    if (roundWords.length === 0) return;

    popWord();
    Vibration.vibrate(50);

    // Ajouter le point à l'équipe
    const newTeams = [...teams];
    newTeams[currentTeamIndex].score += 1;
    setTeams(newTeams);

    // Retirer le mot de la liste
    const newRoundWords = [...roundWords];
    newRoundWords.splice(currentWordIndex, 1);
    setRoundWords(newRoundWords);

    setWordsGuessed(prev => prev + 1);
    setTurnWordsGuessed(prev => prev + 1);

    // Si plus de mots, fin de la manche
    if (newRoundWords.length === 0) {
      setIsTimerRunning(false);
      endRound();
    } else {
      // Passer au mot suivant (ou revenir au début si on était au dernier)
      if (currentWordIndex >= newRoundWords.length) {
        setCurrentWordIndex(0);
      }
    }
  };

  // Passer le mot (sauf manche 2)
  const passWord = () => {
    if (currentRound === 2) {
      Alert.alert('Interdit !', 'Tu ne peux pas passer en manche 2 !');
      return;
    }

    shakeWord();
    Vibration.vibrate(100);

    // Passer au mot suivant
    if (roundWords.length > 1) {
      setCurrentWordIndex(prev => (prev + 1) % roundWords.length);
    }
  };

  // Fin du tour
  const endTurn = () => {
    setIsTimerRunning(false);
    setPhase(PHASES.TURN_END);
  };

  // Passer au tour suivant
  const nextTurn = () => {
    // Passer à l'équipe suivante
    const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
    setCurrentTeamIndex(nextTeamIndex);

    // Passer au joueur suivant de cette équipe
    const newPlayerIndices = [...currentPlayerIndices];
    newPlayerIndices[nextTeamIndex] = (newPlayerIndices[nextTeamIndex] + 1) % teams[nextTeamIndex].players.length;
    setCurrentPlayerIndices(newPlayerIndices);

    // Mélanger les mots restants
    const shuffled = [...roundWords].sort(() => Math.random() - 0.5);
    setRoundWords(shuffled);
    setCurrentWordIndex(0);

    setPhase(PHASES.TEAM_READY);
  };

  // Fin de la manche
  const endRound = () => {
    setPhase(PHASES.ROUND_END);
  };

  // Passer à la manche suivante
  const nextRound = () => {
    if (currentRound >= 3) {
      setPhase(PHASES.GAME_OVER);
    } else {
      setCurrentRound(prev => prev + 1);
      // Remettre tous les mots pour la nouvelle manche
      const shuffled = [...gameWords].sort(() => Math.random() - 0.5);
      setRoundWords(shuffled);
      setCurrentWordIndex(0);
      setWordsGuessed(0);
      setPhase(PHASES.ROUND_INTRO);
    }
  };

  // Rendu selon la phase
  const renderContent = () => {
    switch (phase) {
      case PHASES.ROUND_INTRO:
        return renderRoundIntro();
      case PHASES.TEAM_READY:
        return renderTeamReady();
      case PHASES.PLAYING:
        return renderPlaying();
      case PHASES.TURN_END:
        return renderTurnEnd();
      case PHASES.ROUND_END:
        return renderRoundEnd();
      case PHASES.GAME_OVER:
        return renderGameOver();
      default:
        return null;
    }
  };

  // Introduction de la manche
  const renderRoundIntro = () => (
    <View style={styles.centerContent}>
      <View style={[styles.roundBadgeLarge, { backgroundColor: ROUND_COLORS[currentRound - 1] }]}>
        <Text style={styles.roundBadgeLargeText}>{currentRound}</Text>
      </View>
      <Text style={styles.roundTitle}>Manche {currentRound}</Text>
      <Text style={[styles.roundName, { color: ROUND_COLORS[currentRound - 1] }]}>
        {ROUND_NAMES[currentRound - 1]}
      </Text>
      <View style={styles.ruleBox}>
        <Text style={styles.ruleText}>{ROUND_RULES[currentRound - 1]}</Text>
      </View>
      <Text style={styles.wordsInfo}>
        {roundWords.length} mots à faire deviner
      </Text>
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: ROUND_COLORS[currentRound - 1] }]}
        onPress={() => setPhase(PHASES.TEAM_READY)}
      >
        <Text style={styles.mainButtonText}>C'est parti !</Text>
      </TouchableOpacity>
    </View>
  );

  // Équipe prête
  const renderTeamReady = () => (
    <View style={styles.centerContent}>
      <Text style={styles.teamReadyLabel}>C'est au tour de</Text>
      <Text style={[styles.teamName, { color: currentTeamIndex === 0 ? '#3b82f6' : currentTeamIndex === 1 ? '#ef4444' : currentTeamIndex === 2 ? '#22c55e' : '#f59e0b' }]}>
        {getCurrentTeam().name}
      </Text>
      <View style={styles.playerCard}>
        <Text style={styles.playerLabel}>Joueur qui fait deviner :</Text>
        <Text style={styles.playerName}>{getCurrentPlayer()}</Text>
      </View>
      <View style={styles.roundReminder}>
        <Text style={styles.roundReminderLabel}>Manche {currentRound}:</Text>
        <Text style={[styles.roundReminderText, { color: ROUND_COLORS[currentRound - 1] }]}>
          {ROUND_NAMES[currentRound - 1]}
        </Text>
      </View>
      <Text style={styles.wordsRemaining}>
        {roundWords.length} mots restants
      </Text>
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: ROUND_COLORS[currentRound - 1] }]}
        onPress={startTurn}
      >
        <Text style={styles.mainButtonText}>Prêt ? GO !</Text>
      </TouchableOpacity>
    </View>
  );

  // Jeu en cours
  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      {/* Timer */}
      <View style={[styles.timerContainer, timeLeft <= 5 && styles.timerDanger]}>
        <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextDanger]}>
          {timeLeft}
        </Text>
      </View>

      {/* Mots restants */}
      <Text style={styles.wordsCounter}>
        {roundWords.length} mots restants
      </Text>

      {/* Mot actuel */}
      <Animated.View
        style={[
          styles.wordCard,
          {
            transform: [
              { translateX: shakeAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <Text style={styles.wordText}>{getCurrentWord()}</Text>
      </Animated.View>

      {/* Boutons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton, currentRound === 2 && styles.passButtonDisabled]}
          onPress={passWord}
          disabled={currentRound === 2}
        >
          <Text style={styles.actionButtonEmoji}>⏭️</Text>
          <Text style={[styles.actionButtonText, currentRound === 2 && styles.actionButtonTextDisabled]}>
            {currentRound === 2 ? 'Interdit' : 'Passer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.guessedButton]}
          onPress={wordGuessed}
        >
          <Text style={styles.actionButtonEmoji}>✅</Text>
          <Text style={styles.actionButtonText}>Trouvé !</Text>
        </TouchableOpacity>
      </View>

      {/* Score du tour */}
      <Text style={styles.turnScore}>
        Ce tour : {turnWordsGuessed} mot{turnWordsGuessed > 1 ? 's' : ''}
      </Text>
    </View>
  );

  // Fin du tour
  const renderTurnEnd = () => (
    <View style={styles.centerContent}>
      <Text style={styles.turnEndEmoji}>⏱️</Text>
      <Text style={styles.turnEndTitle}>Temps écoulé !</Text>
      <View style={styles.turnResultBox}>
        <Text style={styles.turnResultLabel}>{getCurrentPlayer()} a fait deviner</Text>
        <Text style={styles.turnResultScore}>{turnWordsGuessed}</Text>
        <Text style={styles.turnResultLabel}>mot{turnWordsGuessed > 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.scoresBox}>
        {teams.map((team, index) => (
          <View key={index} style={styles.scoreRow}>
            <Text style={[styles.scoreTeamName, { color: index === 0 ? '#3b82f6' : index === 1 ? '#ef4444' : index === 2 ? '#22c55e' : '#f59e0b' }]}>
              {team.name}
            </Text>
            <Text style={styles.scoreValue}>{team.score} pts</Text>
          </View>
        ))}
      </View>
      <Text style={styles.wordsRemaining}>
        {roundWords.length} mots restants dans la manche
      </Text>
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: ROUND_COLORS[currentRound - 1] }]}
        onPress={nextTurn}
      >
        <Text style={styles.mainButtonText}>Équipe suivante</Text>
      </TouchableOpacity>
    </View>
  );

  // Fin de la manche
  const renderRoundEnd = () => (
    <View style={styles.centerContent}>
      <Text style={styles.roundEndEmoji}>🎉</Text>
      <Text style={styles.roundEndTitle}>Manche {currentRound} terminée !</Text>
      <View style={styles.scoresBoxLarge}>
        {teams
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((team, index) => (
            <View key={team.name} style={[styles.scoreRowLarge, index === 0 && styles.scoreRowWinner]}>
              <Text style={styles.scoreRank}>{index === 0 ? '👑' : `${index + 1}.`}</Text>
              <Text style={styles.scoreTeamNameLarge}>{team.name}</Text>
              <Text style={styles.scoreValueLarge}>{team.score} pts</Text>
            </View>
          ))}
      </View>
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: currentRound >= 3 ? colors.success : ROUND_COLORS[currentRound] }]}
        onPress={nextRound}
      >
        <Text style={styles.mainButtonText}>
          {currentRound >= 3 ? 'Voir les résultats' : `Manche ${currentRound + 1}`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Fin de partie
  const renderGameOver = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const winner = sortedTeams[0];

    return (
      <View style={styles.centerContent}>
        <Text style={styles.gameOverEmoji}>🏆</Text>
        <Text style={styles.gameOverTitle}>Partie terminée !</Text>
        <Text style={styles.winnerAnnounce}>Victoire de</Text>
        <Text style={styles.winnerName}>{winner.name}</Text>
        <Text style={styles.winnerScore}>{winner.score} points</Text>

        <View style={styles.finalScores}>
          {sortedTeams.map((team, index) => (
            <View
              key={team.name}
              style={[
                styles.finalScoreRow,
                index === 0 && styles.finalScoreRowWinner
              ]}
            >
              <Text style={styles.finalScoreRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </Text>
              <Text style={styles.finalScoreTeam}>{team.name}</Text>
              <Text style={styles.finalScorePoints}>{team.score} pts</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {phase !== PHASES.PLAYING && (
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
          <View style={styles.headerInfo}>
            <Text style={styles.headerRound}>Manche {currentRound}/3</Text>
            <Text style={[styles.headerRoundName, { color: ROUND_COLORS[currentRound - 1] }]}>
              {ROUND_NAMES[currentRound - 1]}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      )}

      {/* Contenu */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
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
  headerInfo: {
    alignItems: 'center',
  },
  headerRound: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  headerRoundName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  roundBadgeLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roundBadgeLargeText: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  roundTitle: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  roundName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  ruleBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  ruleText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  wordsInfo: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  mainButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  mainButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  teamReadyLabel: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  teamName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  playerLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  playerName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  roundReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roundReminderLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  roundReminderText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  wordsRemaining: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  playingContainer: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  timerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: colors.border,
  },
  timerDanger: {
    borderColor: colors.error,
    backgroundColor: colors.error + '20',
  },
  timerText: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  timerTextDanger: {
    color: colors.error,
  },
  wordsCounter: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  wordCard: {
    backgroundColor: '#f59e0b',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
    minWidth: 280,
    alignItems: 'center',
  },
  wordText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  passButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  passButtonDisabled: {
    opacity: 0.4,
  },
  guessedButton: {
    backgroundColor: colors.success,
  },
  actionButtonEmoji: {
    fontSize: 32,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  actionButtonTextDisabled: {
    color: colors.textMuted,
  },
  turnScore: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  turnEndEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  turnEndTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  turnResultBox: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  turnResultLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  turnResultScore: {
    fontSize: 64,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
  },
  scoresBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minWidth: 250,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  scoreTeamName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  scoreValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  roundEndEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  roundEndTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  scoresBoxLarge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    minWidth: 280,
  },
  scoreRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  scoreRowWinner: {
    backgroundColor: '#f59e0b20',
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  scoreRank: {
    fontSize: fontSize.lg,
    width: 30,
  },
  scoreTeamNameLarge: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  scoreValueLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  gameOverTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  winnerAnnounce: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  winnerName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
    marginBottom: spacing.xs,
  },
  winnerScore: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  finalScores: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    minWidth: 300,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  finalScoreRowWinner: {
    backgroundColor: '#f59e0b20',
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  finalScoreRank: {
    fontSize: fontSize.xl,
    width: 40,
    textAlign: 'center',
  },
  finalScoreTeam: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  finalScorePoints: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
  },
  homeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  homeButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
