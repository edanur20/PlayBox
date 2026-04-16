import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import {
  wordPairs,
  getRandomChaosWord,
  getRandomEvent,
  getRandomRole,
  getRandomBlindPoints,
  shuffleArray,
  DEFAULT_ROUND_POINTS,
} from '../data/undercoverWords';

// Phases du jeu
const PHASES = {
  ROUND_START: 'ROUND_START',
  DISTRIBUTION: 'DISTRIBUTION',
  SHOW_WORD: 'SHOW_WORD',
  SPECIAL_ROLE: 'SPECIAL_ROLE',
  FALAFEL_ACTION: 'FALAFEL_ACTION',
  DISCUSSION: 'DISCUSSION',
  VOTING: 'VOTING',
  VOTE_RESULT: 'VOTE_RESULT',
  WHITE_GUESS: 'WHITE_GUESS',
  KAMIKAZE: 'KAMIKAZE',
  ROUND_END: 'ROUND_END',
  GAME_OVER: 'GAME_OVER',
};

export default function UndercoverGameScreen({ route, navigation }) {
  const { players: initialPlayers, undercoverCount, whiteCount, pointsToWin, chaosMode } = route.params;

  const [phase, setPhase] = useState(PHASES.ROUND_START);
  const [players, setPlayers] = useState(initialPlayers);
  const [round, setRound] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [civilWord, setCivilWord] = useState('');
  const [undercoverWord, setUndercoverWord] = useState('');
  const [votes, setVotes] = useState({});
  const [eliminatedPlayer, setEliminatedPlayer] = useState(null);
  const [roundPoints, setRoundPoints] = useState(DEFAULT_ROUND_POINTS);
  const [falafelPlayer, setFalafelPlayer] = useState(null);
  const [falafelTarget, setFalafelTarget] = useState(null);
  const [silencedPlayer, setSilencedPlayer] = useState(null);
  const [kamikazeVictim, setKamikazeVictim] = useState(null);
  const [showSpecialRoleModal, setShowSpecialRoleModal] = useState(false);
  const [currentSpecialRole, setCurrentSpecialRole] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordModalPlayer, setWordModalPlayer] = useState(null);
  const [whiteGuess, setWhiteGuess] = useState('');
  const [whiteGuessCorrect, setWhiteGuessCorrect] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null); // 'civils' ou 'badguys'
  const [usedWordPairs, setUsedWordPairs] = useState([]); // Mots déjà utilisés
  const [roundPointsGained, setRoundPointsGained] = useState({}); // Points gagnés par joueur cette manche
  const [pendingFalafelAction, setPendingFalafelAction] = useState(null); // Action Falafel en attente

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Joueurs en vie
  const alivePlayers = players.filter(p => p.isAlive);

  // Fonction pour obtenir une paire de mots non utilisée
  const getUnusedWordPair = () => {
    // Filtrer les paires non utilisées
    const availablePairs = wordPairs.filter((pair, index) => !usedWordPairs.includes(index));

    // Si toutes les paires ont été utilisées, reset la liste
    if (availablePairs.length === 0) {
      setUsedWordPairs([]);
      const randomIndex = Math.floor(Math.random() * wordPairs.length);
      setUsedWordPairs([randomIndex]);
      return wordPairs[randomIndex];
    }

    // Choisir une paire aléatoire parmi les disponibles
    const randomAvailableIndex = Math.floor(Math.random() * availablePairs.length);
    const chosenPair = availablePairs[randomAvailableIndex];
    const originalIndex = wordPairs.indexOf(chosenPair);
    setUsedWordPairs([...usedWordPairs, originalIndex]);

    return chosenPair;
  };

  // Initialiser une nouvelle manche
  const initRound = () => {
    // Reset votes
    setVotes({});
    setEliminatedPlayer(null);
    setSilencedPlayer(null);
    setFalafelPlayer(null);
    setFalafelTarget(null);
    setKamikazeVictim(null);
    setRoundWinner(null);
    setWhiteGuess('');
    setWhiteGuessCorrect(null);
    setRoundPointsGained({});
    setPendingFalafelAction(null);

    // Déterminer l'événement de la manche
    let event = { id: 'normal', name: 'Manche Normale', description: 'Trouvez l\'Undercover !' };
    if (chaosMode) {
      event = getRandomEvent();
    }
    setCurrentEvent(event);

    // Déterminer les points de la manche
    if (event.id === 'blind') {
      setRoundPoints(getRandomBlindPoints());
    } else {
      setRoundPoints(DEFAULT_ROUND_POINTS);
    }

    // Tous les joueurs participent à chaque manche (reset isAlive)
    let updatedPlayers = players.map(p => ({
      ...p,
      isAlive: true,
      role: 'civil',
      word: null,
      specialRole: null,
    }));

    // Choisir les mots (éviter les répétitions)
    let [civil, undercover] = getUnusedWordPair();

    // Mode chaos : même mot pour tout le monde
    if (event.noUndercover) {
      const chaosWord = getRandomChaosWord();
      civil = chaosWord;
      undercover = chaosWord;
    }

    // Mode fantôme : personne n'a de mot
    if (event.allWhite) {
      civil = null;
      undercover = null;
    }

    setCivilWord(civil);
    setUndercoverWord(undercover);

    // Distribuer les rôles
    const allPlayerIds = updatedPlayers.map(p => p.id);
    const shuffledIndices = shuffleArray([...allPlayerIds]);

    // Assigner le mot civil à tous par défaut
    updatedPlayers = updatedPlayers.map(p => ({
      ...p,
      word: civil,
    }));

    // Assigner les Undercover (sauf si mode chaos sans undercover)
    if (!event.noUndercover && !event.allWhite) {
      const actualUndercoverCount = Math.min(undercoverCount, Math.floor(updatedPlayers.length / 3));
      for (let i = 0; i < actualUndercoverCount; i++) {
        const playerId = shuffledIndices[i];
        const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          updatedPlayers[playerIndex].role = 'undercover';
          updatedPlayers[playerIndex].word = undercover;
        }
      }

      // Assigner les White
      const actualWhiteCount = Math.min(whiteCount, Math.floor(updatedPlayers.length / 4));
      for (let i = 0; i < actualWhiteCount; i++) {
        const playerId = shuffledIndices[actualUndercoverCount + i];
        const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          updatedPlayers[playerIndex].role = 'white';
          updatedPlayers[playerIndex].word = null;
        }
      }
    }

    // Mode fantôme : tout le monde est white
    if (event.allWhite) {
      updatedPlayers = updatedPlayers.map(p => ({
        ...p,
        role: 'white',
        word: null,
      }));
    }

    // Assigner les rôles spéciaux en mode chaos
    if (chaosMode && !event.allWhite) {
      updatedPlayers.forEach((p, idx) => {
        const role = getRandomRole();
        if (role.id !== 'none') {
          updatedPlayers[idx].specialRole = role;
          if (role.id === 'falafel_gift' || role.id === 'falafel_punish') {
            setFalafelPlayer(updatedPlayers[idx]);
          }
        }
      });
    }

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(0);
    setPhase(PHASES.ROUND_START);
  };

  // Démarrer la distribution
  const startDistribution = () => {
    setPhase(PHASES.DISTRIBUTION);
    setCurrentPlayerIndex(0);
    setShowWord(false);
  };

  // Montrer le mot au joueur actuel
  const revealWord = () => {
    setShowWord(true);
    Vibration.vibrate(100);

    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Vérifier si le joueur actuel a un pouvoir Falafel à utiliser
  const currentPlayerHasFalafelPower = () => {
    const currentPlayer = getCurrentDistributionPlayer();
    return currentPlayer?.specialRole?.action === 'gift_curse' ||
           currentPlayer?.specialRole?.action === 'silence';
  };

  // Passer au joueur suivant pour la distribution
  const nextPlayer = () => {
    const currentPlayer = getCurrentDistributionPlayer();

    // Si le joueur actuel a un pouvoir Falafel et ne l'a pas encore utilisé
    if (currentPlayerHasFalafelPower() && !pendingFalafelAction) {
      // Marquer qu'on attend l'action Falafel
      setPendingFalafelAction(currentPlayer);
      setShowWord(false);
      setPhase(PHASES.FALAFEL_ACTION);
      return;
    }

    setShowWord(false);
    setPendingFalafelAction(null);

    const nextAlivePlayers = players.filter(p => p.isAlive);

    if (currentPlayerIndex < nextAlivePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setPhase(PHASES.DISTRIBUTION);
    } else {
      // Tous les joueurs ont vu leur mot
      setPhase(PHASES.DISCUSSION);
    }
  };

  // Action du Falafel - maintenant appelé pendant la distribution
  const executeFalafelAction = (targetPlayer) => {
    const falafelUser = pendingFalafelAction;
    if (!falafelUser) return;

    if (falafelUser.specialRole.action === 'gift_curse') {
      // "Offrir" des points mais en fait en retirer (secret!)
      const updatedPlayers = players.map(p => {
        if (p.id === targetPlayer.id) {
          return { ...p, score: Math.max(0, p.score - 2) };
        }
        return p;
      });
      setPlayers(updatedPlayers);
      setFalafelTarget(targetPlayer);
    } else if (falafelUser.specialRole.action === 'silence') {
      setSilencedPlayer(targetPlayer);
    }

    // Continuer la distribution
    setPendingFalafelAction(null);
    const nextAlivePlayers = players.filter(p => p.isAlive);

    if (currentPlayerIndex < nextAlivePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setPhase(PHASES.DISTRIBUTION);
    } else {
      // Tous les joueurs ont vu leur mot
      setPhase(PHASES.DISCUSSION);
    }
  };

  // Voter pour un joueur
  const voteFor = (targetId) => {
    const currentVoter = alivePlayers[currentPlayerIndex];

    // Vérifier si le votant a un rôle spécial de vote
    let actualTargetId = targetId;
    if (currentVoter.specialRole?.voteModifier === 'opposite') {
      // Vote inversé : trouver le joueur opposé
      const targetIndex = alivePlayers.findIndex(p => p.id === targetId);
      const oppositeIndex = (targetIndex + Math.floor(alivePlayers.length / 2)) % alivePlayers.length;
      actualTargetId = alivePlayers[oppositeIndex].id;
    }

    // Compter le vote
    const voteValue = currentEvent?.id === 'double_vote' ? 2 : 1;
    const newVotes = { ...votes };
    newVotes[actualTargetId] = (newVotes[actualTargetId] || 0) + voteValue;
    setVotes(newVotes);

    // Passer au votant suivant
    if (currentPlayerIndex < alivePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // Tous ont voté, déterminer l'éliminé
      determineEliminated(newVotes);
    }
  };

  // Déterminer qui est éliminé
  const determineEliminated = (finalVotes) => {
    let maxVotes = 0;
    let eliminatedId = null;
    let tiedPlayers = [];

    Object.entries(finalVotes).forEach(([playerId, voteCount]) => {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        eliminatedId = parseInt(playerId);
        tiedPlayers = [parseInt(playerId)];
      } else if (voteCount === maxVotes) {
        tiedPlayers.push(parseInt(playerId));
      }
    });

    // En cas d'égalité, choisir au hasard
    if (tiedPlayers.length > 1) {
      eliminatedId = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
    }

    // Mode vote inversé : le moins de votes est éliminé
    if (currentEvent?.id === 'reverse_vote') {
      let minVotes = Infinity;
      Object.entries(finalVotes).forEach(([playerId, voteCount]) => {
        if (voteCount < minVotes) {
          minVotes = voteCount;
          eliminatedId = parseInt(playerId);
        }
      });
    }

    // Vérifier l'immunité
    const eliminatedPlayer = players.find(p => p.id === eliminatedId);
    if (eliminatedPlayer?.specialRole?.protection) {
      Alert.alert(
        '🛡️',
        `${eliminatedPlayer.name} n'est pas éliminé !`,
        [{ text: 'OK', onPress: () => endRoundWithoutElimination() }]
      );
      return;
    }

    setEliminatedPlayer(eliminatedPlayer);
    setWhiteGuess('');
    setWhiteGuessCorrect(null);

    // Vérifier le Kamikaze
    if (eliminatedPlayer?.specialRole?.onEliminated === 'eliminate_other') {
      setPhase(PHASES.KAMIKAZE);
    } else if (eliminatedPlayer?.role === 'white') {
      // Le White peut tenter de deviner le mot
      setPhase(PHASES.WHITE_GUESS);
    } else {
      setPhase(PHASES.VOTE_RESULT);
    }
  };

  // Le White tente de deviner le mot
  const submitWhiteGuess = () => {
    const guess = whiteGuess.trim().toLowerCase();
    const correct = civilWord && guess === civilWord.toLowerCase();
    setWhiteGuessCorrect(correct);

    if (correct) {
      // Le White gagne 3 points s'il devine
      const updatedPlayers = players.map(p => {
        if (p.id === eliminatedPlayer.id) {
          return { ...p, score: p.score + 3 };
        }
        return p;
      });
      setPlayers(updatedPlayers);
    }

    setPhase(PHASES.VOTE_RESULT);
  };

  // Passer la tentative du White
  const skipWhiteGuess = () => {
    setWhiteGuessCorrect(false);
    setPhase(PHASES.VOTE_RESULT);
  };

  // Kamikaze choisit sa victime
  const kamikazeChoice = (victimId) => {
    const victim = players.find(p => p.id === victimId);
    setKamikazeVictim(victim);

    // Éliminer les deux
    const updatedPlayers = players.map(p => {
      if (p.id === eliminatedPlayer.id || p.id === victimId) {
        return { ...p, isAlive: false };
      }
      return p;
    });
    setPlayers(updatedPlayers);

    // Pas d'explication, juste passer à la suite
    setPhase(PHASES.VOTE_RESULT);
  };

  // Fin de manche sans élimination
  const endRoundWithoutElimination = () => {
    setRound(round + 1);
    initRound();
  };

  // Vérifier si la manche doit se terminer
  const checkRoundEnd = (updatedPlayers) => {
    const remainingAlive = updatedPlayers.filter(p => p.isAlive);
    const remainingUndercovers = remainingAlive.filter(p => p.role === 'undercover');
    const remainingWhites = remainingAlive.filter(p => p.role === 'white');
    const remainingCivils = remainingAlive.filter(p => p.role === 'civil');
    const remainingBadGuys = remainingUndercovers.length + remainingWhites.length;

    // Civils gagnent SEULEMENT si TOUS les méchants sont éliminés
    if (remainingBadGuys === 0) {
      return { ended: true, civilsWin: true };
    }

    // Méchants gagnent si ils sont en STRICTE supériorité numérique (pas égalité)
    // Égalité = la manche continue car les civils peuvent encore gagner
    if (remainingBadGuys > remainingCivils.length) {
      return { ended: true, civilsWin: false };
    }

    // La manche continue
    return { ended: false };
  };

  // Helper pour ajouter des points et tracker
  const addPointsToTeam = (updatedPlayers, role, points, pointsTracker) => {
    return updatedPlayers.map(p => {
      if (p.role === role) {
        const newPoints = p.score + points;
        pointsTracker[p.id] = (pointsTracker[p.id] || 0) + points;
        return { ...p, score: newPoints };
      }
      return p;
    });
  };

  // Confirmer l'élimination et calculer les points
  const confirmElimination = () => {
    // Copier le tracker de points
    let pointsTracker = { ...roundPointsGained };

    // Mettre à jour le statut du joueur
    let updatedPlayers = players.map(p => {
      if (p.id === eliminatedPlayer.id) {
        return { ...p, isAlive: false };
      }
      return p;
    });

    // Vérifier le Voleur (pouvoir spécial)
    const thief = alivePlayers.find(p => p.specialRole?.onSurvive === 'steal_point' && p.id !== eliminatedPlayer.id);
    if (thief && eliminatedPlayer.score > 0) {
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === thief.id) {
          pointsTracker[p.id] = (pointsTracker[p.id] || 0) + 1;
          return { ...p, score: p.score + 1 };
        }
        if (p.id === eliminatedPlayer.id) {
          return { ...p, score: Math.max(0, p.score - 1) };
        }
        return p;
      });
    }

    const eliminatedRole = eliminatedPlayer.role;

    // Vérifier si la manche se termine avec cette élimination
    const roundResult = checkRoundEnd(updatedPlayers);

    if (roundResult.ended) {
      // FIN DE MANCHE - distribuer les points à l'équipe gagnante
      const VICTORY_POINTS = 3;

      if (roundResult.civilsWin) {
        // TOUS les civils gagnent les mêmes points
        updatedPlayers = addPointsToTeam(updatedPlayers, 'civil', VICTORY_POINTS, pointsTracker);
        setRoundWinner('civils');
      } else {
        // TOUS les Undercover gagnent les mêmes points
        updatedPlayers = addPointsToTeam(updatedPlayers, 'undercover', VICTORY_POINTS, pointsTracker);
        // TOUS les White gagnent aussi (même équipe)
        updatedPlayers = addPointsToTeam(updatedPlayers, 'white', VICTORY_POINTS, pointsTracker);
        setRoundWinner('badguys');
      }

      // Si un White a deviné correctement, il gagne des points bonus
      if (whiteGuessCorrect && eliminatedRole === 'white') {
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === eliminatedPlayer.id) {
            pointsTracker[p.id] = (pointsTracker[p.id] || 0) + 2;
            return { ...p, score: p.score + 2 };
          }
          return p;
        });
      }

      setPlayers(updatedPlayers);
      setRoundPointsGained(pointsTracker);

      // Ajouter à l'historique
      setRoundHistory([...roundHistory, {
        round,
        civilsWin: roundResult.civilsWin,
      }]);

      setPhase(PHASES.ROUND_END);
    } else {
      // LA MANCHE CONTINUE - retour à la discussion
      setPlayers(updatedPlayers);
      setRoundPointsGained(pointsTracker);
      setVotes({});
      setEliminatedPlayer(null);
      setWhiteGuess('');
      setWhiteGuessCorrect(null);
      setPhase(PHASES.DISCUSSION);
    }
  };

  // Vérifier la fin de partie - ne se termine que si les joueurs le décident
  const checkGameEnd = () => {
    // Vérifier si quelqu'un a atteint les points pour gagner
    const winner = players.find(p => p.score >= pointsToWin);
    if (winner) {
      setPhase(PHASES.GAME_OVER);
      return true;
    }
    return false;
  };

  // Passer à la manche suivante
  const nextRound = () => {
    if (!checkGameEnd()) {
      setRound(round + 1);
      initRound();
    }
  };

  // Nouvelle partie
  const newGame = () => {
    navigation.replace('UndercoverSetup');
  };

  // Retour à l'accueil
  const goHome = () => {
    navigation.navigate('Home');
  };

  // Initialisation
  useEffect(() => {
    initRound();
  }, []);

  // Obtenir le joueur actuel pour la distribution
  const getCurrentDistributionPlayer = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    return alivePlayers[currentPlayerIndex];
  };

  // Obtenir le votant actuel
  const getCurrentVoter = () => {
    return alivePlayers[currentPlayerIndex];
  };

  // Rendu de la phase de démarrage de manche
  const renderRoundStart = () => (
    <View style={styles.centerContent}>
      <Text style={styles.roundTitle}>Manche {round}</Text>

      <View style={styles.eventCard}>
        <Text style={styles.eventEmoji}>🎮</Text>
        <Text style={styles.eventDesc}>Prêts à jouer ?</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={startDistribution}>
        <Text style={styles.primaryButtonText}>Distribuer les mots</Text>
      </TouchableOpacity>
    </View>
  );

  // Rendu de la distribution des mots
  const renderDistribution = () => {
    const currentPlayer = getCurrentDistributionPlayer();

    return (
      <View style={styles.centerContent}>
        <Text style={styles.distributionTitle}>Distribution</Text>
        <Text style={styles.distributionSubtitle}>
          Joueur {currentPlayerIndex + 1} / {alivePlayers.length}
        </Text>

        <View style={styles.playerCard}>
          <Text style={styles.playerCardName}>{currentPlayer?.name}</Text>

          {!showWord ? (
            <TouchableOpacity style={styles.revealButton} onPress={revealWord}>
              <Text style={styles.revealButtonText}>👆 Appuie pour voir ton mot</Text>
            </TouchableOpacity>
          ) : (
            <Animated.View style={[styles.wordReveal, { transform: [{ scale: scaleAnim }] }]}>
              {currentPlayer?.word ? (
                <>
                  <Text style={styles.wordLabel}>Ton mot :</Text>
                  <Text style={styles.wordText}>{currentPlayer?.word}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.whiteEmoji}>👻</Text>
                  <Text style={styles.whiteText}>Tu es WHITE !</Text>
                  <Text style={styles.whiteSubtext}>Tu n'as pas de mot, bluff !</Text>
                </>
              )}

              {currentPlayer?.specialRole && currentPlayer.specialRole.id !== 'none' && currentPlayer.specialRole.id !== 'spy' && (
                <View style={styles.specialRoleBadge}>
                  <Text style={styles.specialRoleTitle}>
                    {currentPlayer.specialRole.name}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.nextButton} onPress={nextPlayer}>
                <Text style={styles.nextButtonText}>
                  {currentPlayerIndex < alivePlayers.length - 1 ? 'Joueur suivant' : 'Commencer'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    );
  };

  // Rendu de l'action Falafel
  const renderFalafelAction = () => (
    <View style={styles.centerContent}>
      <Text style={styles.falafelEmoji}>🧆</Text>
      <Text style={styles.falafelTitle}>{pendingFalafelAction?.specialRole?.name}</Text>
      <Text style={styles.falafelDesc}>
        {pendingFalafelAction?.name}, choisis un joueur !
      </Text>

      <View style={styles.targetList}>
        {alivePlayers
          .filter(p => p.id !== pendingFalafelAction?.id)
          .map(player => (
            <TouchableOpacity
              key={player.id}
              style={styles.targetButton}
              onPress={() => executeFalafelAction(player)}
            >
              <Text style={styles.targetButtonText}>{player.name}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  // Ouvrir le modal pour revoir son mot
  const openWordModal = (player) => {
    setWordModalPlayer(player);
    setShowWordModal(true);
  };

  // Rendu de la phase de discussion
  const renderDiscussion = () => (
    <View style={styles.centerContent}>
      <Text style={styles.discussionEmoji}>💬</Text>
      <Text style={styles.discussionTitle}>Discussion</Text>
      <Text style={styles.discussionSubtitle}>
        Chaque joueur donne un indice sur son mot
      </Text>

      {silencedPlayer && (
        <View style={styles.silencedWarning}>
          <Text style={styles.silencedEmoji}>🔇</Text>
          <Text style={styles.silencedText}>
            {silencedPlayer.name} ne peut pas parler !
          </Text>
        </View>
      )}

      <View style={styles.alivePlayersList}>
        {alivePlayers.map((player, index) => (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.alivePlayerItem,
              silencedPlayer?.id === player.id && styles.silencedPlayer,
            ]}
            onPress={() => openWordModal(player)}
          >
            <Text style={styles.alivePlayerNumber}>{index + 1}</Text>
            <Text style={styles.alivePlayerName}>{player.name}</Text>
            <Text style={styles.seeWordIcon}>👁️</Text>
            {silencedPlayer?.id === player.id && (
              <Text style={styles.silencedIcon}>🔇</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          setCurrentPlayerIndex(0);
          setPhase(PHASES.VOTING);
        }}
      >
        <Text style={styles.primaryButtonText}>Passer au vote</Text>
      </TouchableOpacity>

      {/* Modal pour revoir son mot */}
      <Modal
        visible={showWordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{wordModalPlayer?.name}</Text>
            {wordModalPlayer?.word ? (
              <>
                <Text style={styles.modalWordLabel}>Ton mot :</Text>
                <Text style={styles.modalWord}>{wordModalPlayer?.word}</Text>
              </>
            ) : (
              <>
                <Text style={styles.modalWhiteEmoji}>👻</Text>
                <Text style={styles.modalWhiteText}>WHITE</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowWordModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Rendu de la phase de vote
  const renderVoting = () => {
    const currentVoter = getCurrentVoter();

    return (
      <View style={styles.centerContent}>
        <Text style={styles.voteTitle}>Vote</Text>
        <Text style={styles.voteSubtitle}>
          {currentVoter?.name}, vote pour éliminer quelqu'un
        </Text>

        <View style={styles.voteList}>
          {alivePlayers
            .filter(p => p.id !== currentVoter?.id)
            .map(player => (
              <TouchableOpacity
                key={player.id}
                style={styles.voteButton}
                onPress={() => voteFor(player.id)}
              >
                <Text style={styles.voteButtonText}>{player.name}</Text>
              </TouchableOpacity>
            ))}
        </View>

        <Text style={styles.voteProgress}>
          Vote {currentPlayerIndex + 1} / {alivePlayers.length}
        </Text>
      </View>
    );
  };

  // Rendu de la tentative du White
  const renderWhiteGuess = () => (
    <View style={styles.centerContent}>
      <Text style={styles.whiteGuessEmoji}>👻</Text>
      <Text style={styles.whiteGuessTitle}>{eliminatedPlayer?.name}</Text>
      <Text style={styles.whiteGuessDesc}>
        Tu as une chance de deviner le mot !
      </Text>

      <TextInput
        style={styles.whiteGuessInput}
        placeholder="Tape le mot..."
        placeholderTextColor={colors.textMuted}
        value={whiteGuess}
        onChangeText={setWhiteGuess}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.whiteGuessButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={skipWhiteGuess}>
          <Text style={styles.secondaryButtonText}>Passer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !whiteGuess.trim() && styles.buttonDisabled]}
          onPress={submitWhiteGuess}
          disabled={!whiteGuess.trim()}
        >
          <Text style={styles.primaryButtonText}>Valider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Rendu du Kamikaze
  const renderKamikaze = () => (
    <View style={styles.centerContent}>
      <Text style={styles.kamikazeEmoji}>💣</Text>
      <Text style={styles.kamikazeTitle}>{eliminatedPlayer?.name}</Text>
      <Text style={styles.kamikazeDesc}>
        Choisis un joueur !
      </Text>

      <View style={styles.targetList}>
        {alivePlayers
          .filter(p => p.id !== eliminatedPlayer?.id)
          .map(player => (
            <TouchableOpacity
              key={player.id}
              style={[styles.targetButton, styles.kamikazeButton]}
              onPress={() => kamikazeChoice(player.id)}
            >
              <Text style={styles.targetButtonText}>{player.name}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  // Rendu du résultat du vote
  const renderVoteResult = () => (
    <View style={styles.centerContent}>
      <Text style={styles.eliminatedEmoji}>
        {eliminatedPlayer?.role === 'undercover' ? '🕵️' :
         eliminatedPlayer?.role === 'white' ? '👻' : '😵'}
      </Text>
      <Text style={styles.eliminatedName}>{eliminatedPlayer?.name}</Text>
      <Text style={styles.eliminatedText}>a été éliminé !</Text>

      <View style={[
        styles.roleReveal,
        eliminatedPlayer?.role === 'undercover' && styles.roleUndercover,
        eliminatedPlayer?.role === 'white' && styles.roleWhite,
      ]}>
        <Text style={styles.roleRevealTitle}>
          {eliminatedPlayer?.role === 'undercover' ? 'UNDERCOVER !' :
           eliminatedPlayer?.role === 'white' ? 'WHITE !' : 'Civil...'}
        </Text>
        {eliminatedPlayer?.word && (
          <Text style={styles.roleRevealWord}>Mot : {eliminatedPlayer?.word}</Text>
        )}
      </View>

      {kamikazeVictim && (
        <View style={styles.kamikazeVictimBox}>
          <Text style={styles.kamikazeVictimText}>
            💥 {kamikazeVictim.name} a aussi été éliminé !
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={confirmElimination}>
        <Text style={styles.primaryButtonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );

  // Rendu de fin de manche
  const renderRoundEnd = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    // Grouper les joueurs par rôle pour le récap
    const civils = players.filter(p => p.role === 'civil');
    const undercovers = players.filter(p => p.role === 'undercover');
    const whites = players.filter(p => p.role === 'white');

    return (
      <View style={styles.centerContent}>
        <Text style={styles.roundEndEmoji}>
          {roundWinner === 'civils' ? '🎉' : '😈'}
        </Text>
        <Text style={styles.roundEndTitle}>Fin de la manche {round}</Text>
        <Text style={styles.roundEndWinner}>
          {roundWinner === 'civils' ? 'Les Civils ont gagné !' : 'Les Imposteurs ont gagné !'}
        </Text>

        {civilWord && (
          <View style={styles.wordsReveal}>
            <View style={styles.wordBox}>
              <Text style={styles.wordBoxLabel}>Mot Civil</Text>
              <Text style={styles.wordBoxWord}>{civilWord}</Text>
            </View>
            {civilWord !== undercoverWord && (
              <View style={[styles.wordBox, styles.wordBoxUndercover]}>
                <Text style={styles.wordBoxLabel}>Mot Undercover</Text>
                <Text style={styles.wordBoxWord}>{undercoverWord}</Text>
              </View>
            )}
          </View>
        )}

        {/* Récap des points gagnés cette manche */}
        <Text style={styles.scoreboardTitle}>Points gagnés cette manche</Text>
        <View style={styles.pointsRecap}>
          {/* Civils */}
          <View style={[styles.teamRecap, roundWinner === 'civils' && styles.teamRecapWinner]}>
            <Text style={styles.teamRecapTitle}>Civils</Text>
            {civils.map(p => (
              <View key={p.id} style={styles.playerRecapRow}>
                <Text style={styles.playerRecapName}>{p.name}</Text>
                <Text style={[styles.playerRecapPoints, roundPointsGained[p.id] > 0 && styles.pointsPositive]}>
                  {roundPointsGained[p.id] > 0 ? `+${roundPointsGained[p.id]}` : '0'}
                </Text>
              </View>
            ))}
          </View>

          {/* Imposteurs */}
          <View style={[styles.teamRecap, roundWinner === 'badguys' && styles.teamRecapWinner]}>
            <Text style={styles.teamRecapTitle}>Imposteurs</Text>
            {undercovers.map(p => (
              <View key={p.id} style={styles.playerRecapRow}>
                <Text style={styles.playerRecapName}>{p.name} 🕵️</Text>
                <Text style={[styles.playerRecapPoints, roundPointsGained[p.id] > 0 && styles.pointsPositive]}>
                  {roundPointsGained[p.id] > 0 ? `+${roundPointsGained[p.id]}` : '0'}
                </Text>
              </View>
            ))}
            {whites.map(p => (
              <View key={p.id} style={styles.playerRecapRow}>
                <Text style={styles.playerRecapName}>{p.name} 👻</Text>
                <Text style={[styles.playerRecapPoints, roundPointsGained[p.id] > 0 && styles.pointsPositive]}>
                  {roundPointsGained[p.id] > 0 ? `+${roundPointsGained[p.id]}` : '0'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.scoreboardTitle}>Classement général</Text>
        <View style={styles.scoreboard}>
          {sortedPlayers.map((player, index) => (
            <View key={player.id} style={styles.scoreItem}>
              <Text style={styles.scoreRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </Text>
              <Text style={styles.scoreName}>{player.name}</Text>
              <Text style={styles.scorePoints}>{player.score} pts</Text>
            </View>
          ))}
        </View>

        <View style={styles.roundEndButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setPhase(PHASES.GAME_OVER)}>
            <Text style={styles.secondaryButtonText}>Terminer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={nextRound}>
            <Text style={styles.primaryButtonText}>Manche suivante</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Rendu de fin de partie
  const renderGameOver = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <View style={styles.centerContent}>
        <Text style={styles.gameOverEmoji}>🏆</Text>
        <Text style={styles.gameOverTitle}>Partie terminée !</Text>
        <Text style={styles.winnerName}>{winner.name}</Text>
        <Text style={styles.winnerScore}>{winner.score} points</Text>

        <View style={styles.finalScoreboard}>
          {sortedPlayers.map((player, index) => (
            <View key={player.id} style={styles.finalScoreItem}>
              <Text style={styles.finalScoreRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </Text>
              <Text style={styles.finalScoreName}>{player.name}</Text>
              <Text style={styles.finalScorePoints}>{player.score} pts</Text>
            </View>
          ))}
        </View>

        <View style={styles.gameOverButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={newGame}>
            <Text style={styles.secondaryButtonText}>Nouvelle partie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>Accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Rendu principal selon la phase
  const renderContent = () => {
    switch (phase) {
      case PHASES.ROUND_START:
        return renderRoundStart();
      case PHASES.DISTRIBUTION:
      case PHASES.SHOW_WORD:
        return renderDistribution();
      case PHASES.FALAFEL_ACTION:
        return renderFalafelAction();
      case PHASES.DISCUSSION:
        return renderDiscussion();
      case PHASES.VOTING:
        return renderVoting();
      case PHASES.WHITE_GUESS:
        return renderWhiteGuess();
      case PHASES.KAMIKAZE:
        return renderKamikaze();
      case PHASES.VOTE_RESULT:
        return renderVoteResult();
      case PHASES.ROUND_END:
        return renderRoundEnd();
      case PHASES.GAME_OVER:
        return renderGameOver();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {phase !== PHASES.GAME_OVER && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.quitButton}
            onPress={() => {
              Alert.alert(
                'Quitter la partie ?',
                'La progression sera perdue.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Quitter', onPress: goHome, style: 'destructive' },
                ]
              );
            }}
          >
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerRound}>Manche {round}</Text>
            <Text style={styles.headerPlayers}>
              {alivePlayers.length} joueurs en vie
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quitButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quitButtonText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerRound: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerPlayers: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },

  // Round Start
  roundTitle: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  eventEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  eventDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Distribution
  distributionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  distributionSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  playerCardName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  revealButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  revealButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  wordReveal: {
    alignItems: 'center',
    width: '100%',
  },
  wordLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  wordText: {
    fontSize: 40,
    fontWeight: fontWeight.bold,
    color: '#6366f1',
    marginBottom: spacing.lg,
  },
  whiteEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  whiteText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  whiteSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  specialRoleBadge: {
    backgroundColor: '#f59e0b20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  specialRoleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  specialRoleDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },

  // Falafel
  falafelEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  falafelTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
    marginBottom: spacing.sm,
  },
  falafelDesc: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  falafelSubdesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  targetList: {
    width: '100%',
    gap: spacing.sm,
  },
  targetButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  targetButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  // Discussion
  discussionEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  discussionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  discussionSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  silencedWarning: {
    backgroundColor: '#6366f120',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  silencedEmoji: {
    fontSize: 24,
  },
  silencedText: {
    fontSize: fontSize.md,
    color: '#6366f1',
  },
  alivePlayersList: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  alivePlayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  silencedPlayer: {
    opacity: 0.5,
  },
  alivePlayerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    textAlign: 'center',
    lineHeight: 28,
    color: '#ffffff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  alivePlayerName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  silencedIcon: {
    fontSize: 18,
  },

  // Voting
  voteTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  voteSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  voteList: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  voteButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  voteButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  voteProgress: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },

  // Kamikaze
  kamikazeEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  kamikazeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#ef4444',
    marginBottom: spacing.sm,
  },
  kamikazeDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  kamikazeButton: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444420',
  },

  // Vote Result
  eliminatedEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  eliminatedName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  eliminatedText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  roleReveal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleUndercover: {
    backgroundColor: '#6366f120',
    borderColor: '#6366f1',
  },
  roleWhite: {
    backgroundColor: '#ffffff20',
    borderColor: '#ffffff',
  },
  roleRevealTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleRevealWord: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  kamikazeVictimBox: {
    backgroundColor: '#ef444420',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  kamikazeVictimText: {
    fontSize: fontSize.md,
    color: '#ef4444',
    textAlign: 'center',
  },

  // Round End
  roundEndEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  roundEndTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roundEndWinner: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  wordsReveal: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  wordBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  wordBoxUndercover: {
    backgroundColor: '#6366f120',
  },
  wordBoxLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  wordBoxWord: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  pointsRecap: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  teamRecap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  teamRecapWinner: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e10',
  },
  teamRecapTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  playerRecapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  playerRecapName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  playerRecapPoints: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  pointsPositive: {
    color: '#22c55e',
  },
  scoreboardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  scoreboard: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  scoreRank: {
    fontSize: fontSize.lg,
    width: 32,
  },
  scoreName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  scorePoints: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#6366f1',
  },
  roundEndButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },

  // Game Over
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
  winnerName: {
    fontSize: 40,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
  },
  winnerScore: {
    fontSize: fontSize.xl,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  finalScoreboard: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  finalScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  finalScoreRank: {
    fontSize: fontSize.lg,
    width: 32,
  },
  finalScoreName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  finalScorePoints: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#6366f1',
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },

  // Buttons
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // White Guess
  whiteGuessEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  whiteGuessTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  whiteGuessDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  whiteGuessInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  whiteGuessButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },

  // Modal for viewing word
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalWordLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  modalWord: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: '#6366f1',
    marginBottom: spacing.xl,
  },
  modalWhiteEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  modalWhiteText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  modalCloseButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalCloseButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  seeWordIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
});
