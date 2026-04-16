import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import {
  getShuffledQuestions,
  getShuffledResponses,
  CARDS_IN_HAND,
  countBlanks,
} from '../data/bmcCards';

const { width } = Dimensions.get('window');

const PHASES = {
  PATRON_PICKS_QUESTION: 'patron_picks_question', // Le Patron choisit une question
  SHOW_QUESTION: 'show_question',      // Le Patron voit la question choisie
  PLAYERS_CHOOSE: 'players_choose',     // Les joueurs choisissent leurs cartes
  REVEAL_ANSWERS: 'reveal_answers',     // Le Patron révèle les réponses
  PATRON_CHOOSES: 'patron_chooses',     // Le Patron choisit le gagnant
  ROUND_RESULT: 'round_result',         // Affichage du gagnant
  GAME_OVER: 'game_over',               // Fin de partie
};

const NUM_QUESTION_CHOICES = 3;

export default function BMCGameScreen({ navigation, route }) {
  const { players, pointsToWin } = route.params;

  // Game state
  const [phase, setPhase] = useState(PHASES.PATRON_PICKS_QUESTION);
  const [patronIndex, setPatronIndex] = useState(0);
  const [scores, setScores] = useState(() =>
    Object.fromEntries(players.map((_, i) => [i, 0]))
  );
  const [questionDeck, setQuestionDeck] = useState([]);
  const [responseDeck, setResponseDeck] = useState([]);
  const [questionChoices, setQuestionChoices] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [requiredAnswers, setRequiredAnswers] = useState(1);
  const [playerHands, setPlayerHands] = useState({});
  const [submittedCards, setSubmittedCards] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(1);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0); // Pour les questions à plusieurs trous
  const [playerCurrentAnswers, setPlayerCurrentAnswers] = useState([]); // Réponses en cours de sélection
  const [revealedCards, setRevealedCards] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [roundWinner, setRoundWinner] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showPassModal, setShowPassModal] = useState(true);
  const [customResponse, setCustomResponse] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showCustomQuestionInput, setShowCustomQuestionInput] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const questions = getShuffledQuestions();
    const responses = getShuffledResponses();

    // Distribute cards to players
    const hands = {};
    let responseIndex = 0;
    players.forEach((_, playerIndex) => {
      hands[playerIndex] = responses.slice(responseIndex, responseIndex + CARDS_IN_HAND);
      responseIndex += CARDS_IN_HAND;
    });

    // Pick first 3 questions as choices
    setQuestionChoices(questions.slice(0, NUM_QUESTION_CHOICES));
    setQuestionDeck(questions.slice(NUM_QUESTION_CHOICES));
    setResponseDeck(responses.slice(responseIndex));
    setPlayerHands(hands);
  };

  // Get current patron
  const patron = players[patronIndex];

  // Handle patron selecting a question
  const handleQuestionSelect = (question) => {
    const blanks = countBlanks(question);
    setCurrentQuestion(question);
    setRequiredAnswers(blanks);
    setShowCustomQuestionInput(false);
    setPhase(PHASES.SHOW_QUESTION);
  };

  // Handle custom question submission
  const handleCustomQuestionSubmit = () => {
    if (customQuestion.trim()) {
      // Add ____ if not present
      let question = customQuestion.trim();
      if (!question.includes('____')) {
        question = question + ' ____';
      }
      const blanks = countBlanks(question);
      setCurrentQuestion(question);
      setRequiredAnswers(blanks);
      setCustomQuestion('');
      setShowCustomQuestionInput(false);
      setPhase(PHASES.SHOW_QUESTION);
    }
  };

  // Handle card selection by a player
  const handleCardSelect = (cardIndex) => {
    const currentPlayer = currentPlayerIndex;
    const selectedCard = playerHands[currentPlayer][cardIndex];

    const newAnswers = [...playerCurrentAnswers, selectedCard];

    // Remove the card from hand
    setPlayerHands(prev => {
      const newHand = [...prev[currentPlayer]];
      newHand.splice(cardIndex, 1);

      // Draw new card if available
      if (responseDeck.length > 0) {
        newHand.push(responseDeck[0]);
        setResponseDeck(deck => deck.slice(1));
      }

      return { ...prev, [currentPlayer]: newHand };
    });

    // Check if player needs more answers
    if (newAnswers.length < requiredAnswers) {
      setPlayerCurrentAnswers(newAnswers);
      setCurrentAnswerIndex(newAnswers.length);
    } else {
      // Player has selected all answers
      submitPlayerAnswers(currentPlayer, newAnswers);
    }
  };

  // Handle custom response submission
  const handleCustomResponseSubmit = () => {
    if (customResponse.trim()) {
      const currentPlayer = currentPlayerIndex;
      const newAnswers = [...playerCurrentAnswers, customResponse.trim()];

      setCustomResponse('');
      setShowCustomInput(false);

      // Check if player needs more answers
      if (newAnswers.length < requiredAnswers) {
        setPlayerCurrentAnswers(newAnswers);
        setCurrentAnswerIndex(newAnswers.length);
      } else {
        // Player has selected all answers
        submitPlayerAnswers(currentPlayer, newAnswers);
      }
    }
  };

  // Submit all answers for a player
  const submitPlayerAnswers = (playerId, answers) => {
    // Save submitted cards
    const newSubmittedCards = {
      ...submittedCards,
      [playerId]: answers, // Now an array of answers
    };
    setSubmittedCards(newSubmittedCards);

    // Reset current answers
    setPlayerCurrentAnswers([]);
    setCurrentAnswerIndex(0);

    // Move to next player or reveal phase
    const nextPlayer = findNextPlayer(playerId, newSubmittedCards);
    if (nextPlayer !== null) {
      setCurrentPlayerIndex(nextPlayer);
      setShowPassModal(true);
      setShowCustomInput(false);
    } else {
      // All players have submitted, shuffle and reveal
      prepareRevealWithCards(newSubmittedCards);
    }
  };

  // Find next player who needs to submit
  const findNextPlayer = (currentPlayer, currentSubmittedCards) => {
    // Check all players except patron
    for (let i = currentPlayer + 1; i < players.length; i++) {
      if (i !== patronIndex && !currentSubmittedCards[i]) {
        return i;
      }
    }
    for (let i = 0; i < currentPlayer; i++) {
      if (i !== patronIndex && !currentSubmittedCards[i]) {
        return i;
      }
    }
    return null;
  };

  // Prepare cards for reveal with current submitted cards
  const prepareRevealWithCards = (currentSubmittedCards) => {
    const cards = Object.entries(currentSubmittedCards).map(([playerId, answers]) => ({
      playerId: parseInt(playerId),
      answers: answers, // Now an array
    }));

    // Shuffle the cards so patron doesn't know who played what
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setRevealedCards(shuffled);
    setCurrentRevealIndex(0);
    setPhase(PHASES.REVEAL_ANSWERS);
    setShowPassModal(true);
    setShowCustomInput(false);
  };

  // Reveal next card
  const revealNextCard = () => {
    if (currentRevealIndex < revealedCards.length - 1) {
      setCurrentRevealIndex(prev => prev + 1);
    } else {
      setPhase(PHASES.PATRON_CHOOSES);
    }
  };

  // Patron chooses winning card
  const handlePatronChoice = (cardIndex) => {
    const winningCard = revealedCards[cardIndex];
    const winnerId = winningCard.playerId;

    // Update scores
    const newScores = { ...scores, [winnerId]: scores[winnerId] + 1 };
    setScores(newScores);
    setRoundWinner(winnerId);

    // Check for game winner
    if (newScores[winnerId] >= pointsToWin) {
      setWinner(winnerId);
      setPhase(PHASES.GAME_OVER);
    } else {
      setPhase(PHASES.ROUND_RESULT);
    }
  };

  // Start next round
  const startNextRound = () => {
    // Winner becomes new patron
    const newPatronIndex = roundWinner;
    setPatronIndex(newPatronIndex);

    // Get first active player (not the patron)
    let firstPlayer = (newPatronIndex + 1) % players.length;
    setCurrentPlayerIndex(firstPlayer);

    // Draw new question choices
    if (questionDeck.length >= NUM_QUESTION_CHOICES) {
      setQuestionChoices(questionDeck.slice(0, NUM_QUESTION_CHOICES));
      setQuestionDeck(prev => prev.slice(NUM_QUESTION_CHOICES));
    } else {
      // Reshuffle questions if not enough
      const newQuestions = getShuffledQuestions();
      setQuestionChoices(newQuestions.slice(0, NUM_QUESTION_CHOICES));
      setQuestionDeck(newQuestions.slice(NUM_QUESTION_CHOICES));
    }

    // Reset round state
    setSubmittedCards({});
    setRevealedCards([]);
    setCurrentRevealIndex(0);
    setRoundWinner(null);
    setCurrentQuestion('');
    setRequiredAnswers(1);
    setPlayerCurrentAnswers([]);
    setCurrentAnswerIndex(0);
    setPhase(PHASES.PATRON_PICKS_QUESTION);
    setShowPassModal(true);
    setShowCustomInput(false);
    setShowCustomQuestionInput(false);
  };

  // Render question with placeholder highlighted
  const renderQuestion = (question) => {
    if (!question) return null;
    const parts = question.split('____');

    if (parts.length === 1) {
      return <Text style={styles.questionText}>{question}</Text>;
    }

    return (
      <Text style={styles.questionText}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <Text style={styles.questionBlank}>________</Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  // Render question with answers filled in
  const renderQuestionWithAnswers = (question, answers) => {
    if (!question || !answers) return null;
    const parts = question.split('____');

    if (parts.length === 1) {
      return (
        <Text style={styles.questionText}>
          {question} <Text style={styles.answerInQuestion}>{answers[0]}</Text>
        </Text>
      );
    }

    return (
      <Text style={styles.questionText}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && answers[index] && (
              <Text style={styles.answerInQuestion}>{answers[index]}</Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
          <Text style={styles.homeButtonText}>×</Text>
        </TouchableOpacity>
        <View style={styles.patronBadge}>
          <Text style={styles.patronLabel}>Patron</Text>
          <Text style={styles.patronName}>{patron}</Text>
        </View>
        <View style={styles.pointsTarget}>
          <Text style={styles.pointsTargetText}>{pointsToWin} pts</Text>
        </View>
      </View>

      {/* Scores */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scoresContainer}
        contentContainerStyle={styles.scoresContent}
      >
        {players.map((player, index) => (
          <View
            key={index}
            style={[
              styles.scoreCard,
              index === patronIndex && styles.scoreCardPatron,
            ]}
          >
            <Text style={styles.scorePlayerName} numberOfLines={1}>
              {player}
            </Text>
            <Text style={styles.scoreValue}>{scores[index]}</Text>
            {index === patronIndex && (
              <Text style={styles.patronIndicator}>Patron</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Main Game Area */}
      <KeyboardAvoidingView
        style={styles.gameArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Phase: Patron Picks Question */}
        {phase === PHASES.PATRON_PICKS_QUESTION && !showPassModal && (
          <View style={styles.pickQuestionArea}>
            <Text style={styles.pickQuestionTitle}>
              Choisissez votre question :
            </Text>
            <ScrollView
              style={styles.questionChoicesScroll}
              contentContainerStyle={styles.questionChoicesContent}
              showsVerticalScrollIndicator={false}
            >
              {questionChoices.map((question, index) => {
                const blanks = countBlanks(question);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.questionChoiceCard}
                    onPress={() => handleQuestionSelect(question)}
                  >
                    <View style={styles.questionChoiceHeader}>
                      <Text style={styles.questionChoiceNumber}>{index + 1}</Text>
                      {blanks > 1 && (
                        <View style={styles.blanksIndicator}>
                          <Text style={styles.blanksIndicatorText}>{blanks} réponses</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.questionChoiceText}>{question}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Custom question option */}
              {!showCustomQuestionInput ? (
                <TouchableOpacity
                  style={styles.customQuestionButton}
                  onPress={() => setShowCustomQuestionInput(true)}
                >
                  <Text style={styles.customQuestionButtonText}>
                    ✏️ Écrire ma propre question
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Écrivez votre question (utilisez ____ pour chaque trou)"
                    placeholderTextColor={colors.textMuted}
                    value={customQuestion}
                    onChangeText={setCustomQuestion}
                    multiline
                    autoFocus
                  />
                  <Text style={styles.customHint}>
                    Astuce : Utilisez ____ plusieurs fois pour demander plusieurs réponses !
                  </Text>
                  <View style={styles.customInputButtons}>
                    <TouchableOpacity
                      style={styles.customCancelButton}
                      onPress={() => {
                        setShowCustomQuestionInput(false);
                        setCustomQuestion('');
                      }}
                    >
                      <Text style={styles.customCancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.customSubmitButton,
                        !customQuestion.trim() && styles.customSubmitButtonDisabled
                      ]}
                      onPress={handleCustomQuestionSubmit}
                      disabled={!customQuestion.trim()}
                    >
                      <Text style={styles.customSubmitButtonText}>Valider</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Question Card (shown in most phases) */}
        {currentQuestion && phase !== PHASES.PATRON_PICKS_QUESTION && (
          <View style={styles.questionCard}>
            {renderQuestion(currentQuestion)}
            {requiredAnswers > 1 && (
              <View style={styles.requiredAnswersBadge}>
                <Text style={styles.requiredAnswersText}>
                  {requiredAnswers} réponses requises
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Phase: Show Question (Patron sees question) */}
        {phase === PHASES.SHOW_QUESTION && !showPassModal && (
          <View style={styles.actionArea}>
            <Text style={styles.instructionText}>
              Lisez la question à voix haute !
            </Text>
            {requiredAnswers > 1 && (
              <Text style={styles.multiAnswerHint}>
                ⚠️ Cette question nécessite {requiredAnswers} réponses par joueur
              </Text>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                let firstPlayer = (patronIndex + 1) % players.length;
                setCurrentPlayerIndex(firstPlayer);
                setPlayerCurrentAnswers([]);
                setCurrentAnswerIndex(0);
                setPhase(PHASES.PLAYERS_CHOOSE);
                setShowPassModal(true);
              }}
            >
              <Text style={styles.actionButtonText}>
                C'est parti !
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phase: Players Choose */}
        {phase === PHASES.PLAYERS_CHOOSE && !showPassModal && (
          <View style={styles.cardsArea}>
            {/* Progress indicator for multiple answers */}
            {requiredAnswers > 1 && (
              <View style={styles.answerProgress}>
                <Text style={styles.answerProgressText}>
                  Réponse {currentAnswerIndex + 1} / {requiredAnswers}
                </Text>
                <View style={styles.progressDots}>
                  {Array.from({ length: requiredAnswers }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.progressDot,
                        i < currentAnswerIndex && styles.progressDotCompleted,
                        i === currentAnswerIndex && styles.progressDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Show already selected answers */}
            {playerCurrentAnswers.length > 0 && (
              <View style={styles.selectedAnswersContainer}>
                <Text style={styles.selectedAnswersTitle}>Vos réponses :</Text>
                {playerCurrentAnswers.map((answer, idx) => (
                  <View key={idx} style={styles.selectedAnswerChip}>
                    <Text style={styles.selectedAnswerNumber}>{idx + 1}</Text>
                    <Text style={styles.selectedAnswerText}>{answer}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.chooseText}>
              {requiredAnswers > 1
                ? `Choisissez votre réponse n°${currentAnswerIndex + 1} :`
                : 'Choisissez votre meilleure réponse :'}
            </Text>

            {!showCustomInput ? (
              <>
                <ScrollView
                  style={styles.handScroll}
                  contentContainerStyle={styles.handContent}
                  showsVerticalScrollIndicator={false}
                >
                  {playerHands[currentPlayerIndex]?.map((card, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.responseCard}
                      onPress={() => handleCardSelect(index)}
                    >
                      <Text style={styles.responseCardText}>{card}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Custom response button */}
                <TouchableOpacity
                  style={styles.customResponseButton}
                  onPress={() => setShowCustomInput(true)}
                >
                  <Text style={styles.customResponseButtonText}>
                    ✏️ Écrire ma propre réponse
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Écrivez votre réponse..."
                  placeholderTextColor={colors.textMuted}
                  value={customResponse}
                  onChangeText={setCustomResponse}
                  autoFocus
                />
                <View style={styles.customInputButtons}>
                  <TouchableOpacity
                    style={styles.customCancelButton}
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomResponse('');
                    }}
                  >
                    <Text style={styles.customCancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.customSubmitButton,
                      !customResponse.trim() && styles.customSubmitButtonDisabled
                    ]}
                    onPress={handleCustomResponseSubmit}
                    disabled={!customResponse.trim()}
                  >
                    <Text style={styles.customSubmitButtonText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Phase: Reveal Answers */}
        {phase === PHASES.REVEAL_ANSWERS && !showPassModal && (
          <View style={styles.revealArea}>
            <Text style={styles.revealTitle}>
              Proposition {currentRevealIndex + 1} / {revealedCards.length}
            </Text>
            <View style={styles.revealCard}>
              {renderQuestionWithAnswers(
                currentQuestion,
                revealedCards[currentRevealIndex]?.answers
              )}
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={revealNextCard}
            >
              <Text style={styles.actionButtonText}>
                {currentRevealIndex < revealedCards.length - 1
                  ? 'Proposition suivante'
                  : 'Choisir le gagnant'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phase: Patron Chooses */}
        {phase === PHASES.PATRON_CHOOSES && (
          <View style={styles.chooseWinnerArea}>
            <Text style={styles.chooseWinnerTitle}>
              Quelle proposition était la meilleure ?
            </Text>
            <ScrollView
              style={styles.answersScroll}
              contentContainerStyle={styles.answersContent}
              showsVerticalScrollIndicator={false}
            >
              {revealedCards.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.answerOption}
                  onPress={() => handlePatronChoice(index)}
                >
                  <Text style={styles.answerOptionNumber}>{index + 1}</Text>
                  <View style={styles.answerOptionContent}>
                    {item.answers.map((answer, ansIdx) => (
                      <Text key={ansIdx} style={styles.answerOptionText}>
                        {requiredAnswers > 1 ? `${ansIdx + 1}. ` : ''}{answer}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Phase: Round Result */}
        {phase === PHASES.ROUND_RESULT && (
          <View style={styles.resultArea}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>
              {players[roundWinner]} gagne ce tour !
            </Text>
            <Text style={styles.resultSubtitle}>
              Score : {scores[roundWinner]} / {pointsToWin}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={startNextRound}
            >
              <Text style={styles.actionButtonText}>Tour suivant</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Pass Phone Modal */}
      <Modal visible={showPassModal && phase !== PHASES.GAME_OVER} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.passModalContent}>
            {phase === PHASES.PATRON_PICKS_QUESTION && (
              <>
                <Text style={styles.passEmoji}>👑</Text>
                <Text style={styles.passTitle}>Passez le téléphone au Patron</Text>
                <Text style={styles.passName}>{patron}</Text>
                <Text style={styles.passSubtitle}>
                  Choisissez une question parmi les propositions
                </Text>
                <TouchableOpacity
                  style={styles.passButton}
                  onPress={() => setShowPassModal(false)}
                >
                  <Text style={styles.passButtonText}>
                    Je suis {patron}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {phase === PHASES.SHOW_QUESTION && (
              <>
                <Text style={styles.passEmoji}>📣</Text>
                <Text style={styles.passTitle}>Question choisie !</Text>
                <Text style={styles.passSubtitle}>
                  Lisez-la à voix haute pour tous les joueurs
                </Text>
                <TouchableOpacity
                  style={styles.passButton}
                  onPress={() => setShowPassModal(false)}
                >
                  <Text style={styles.passButtonText}>
                    Lire la question
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {phase === PHASES.PLAYERS_CHOOSE && (
              <>
                <Text style={styles.passEmoji}>🃏</Text>
                <Text style={styles.passTitle}>Passez le téléphone à</Text>
                <Text style={styles.passName}>{players[currentPlayerIndex]}</Text>
                <Text style={styles.passSubtitle}>
                  {requiredAnswers > 1
                    ? `Choisissez ${requiredAnswers} réponses dans l'ordre !`
                    : 'Choisissez une carte ou écrivez votre réponse !'}
                </Text>
                <TouchableOpacity
                  style={styles.passButton}
                  onPress={() => setShowPassModal(false)}
                >
                  <Text style={styles.passButtonText}>
                    Je suis {players[currentPlayerIndex]}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {phase === PHASES.REVEAL_ANSWERS && (
              <>
                <Text style={styles.passEmoji}>📢</Text>
                <Text style={styles.passTitle}>Passez le téléphone au Patron</Text>
                <Text style={styles.passName}>{patron}</Text>
                <Text style={styles.passSubtitle}>
                  Lisez les propositions à voix haute !
                </Text>
                <TouchableOpacity
                  style={styles.passButton}
                  onPress={() => setShowPassModal(false)}
                >
                  <Text style={styles.passButtonText}>
                    Révéler les propositions
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal visible={phase === PHASES.GAME_OVER} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverEmoji}>🏆</Text>
            <Text style={styles.gameOverTitle}>
              {players[winner]} gagne !
            </Text>
            <Text style={styles.gameOverSubtitle}>
              Avec {scores[winner]} points
            </Text>

            <View style={styles.finalScores}>
              <Text style={styles.finalScoresTitle}>Scores finaux</Text>
              {players
                .map((player, index) => ({ player, score: scores[index], index }))
                .sort((a, b) => b.score - a.score)
                .map((item, rank) => (
                  <View key={item.index} style={styles.finalScoreRow}>
                    <Text style={styles.finalScoreRank}>
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`}
                    </Text>
                    <Text style={styles.finalScoreName}>{item.player}</Text>
                    <Text style={styles.finalScoreValue}>{item.score}</Text>
                  </View>
                ))}
            </View>

            <TouchableOpacity
              style={styles.gameOverButton}
              onPress={goToHome}
            >
              <Text style={styles.gameOverButtonText}>Retour au menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  patronBadge: {
    backgroundColor: '#854d0e20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#854d0e',
    alignItems: 'center',
  },
  patronLabel: {
    fontSize: fontSize.xs,
    color: '#854d0e',
  },
  patronName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#854d0e',
  },
  pointsTarget: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  pointsTargetText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  scoresContainer: {
    maxHeight: 80,
    marginBottom: spacing.sm,
  },
  scoresContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    marginRight: spacing.sm,
  },
  scoreCardPatron: {
    backgroundColor: '#854d0e20',
    borderWidth: 1,
    borderColor: '#854d0e',
  },
  scorePlayerName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    maxWidth: 60,
  },
  scoreValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  patronIndicator: {
    fontSize: 10,
    color: '#854d0e',
  },
  gameArea: {
    flex: 1,
    padding: spacing.md,
  },
  // Pick Question Phase
  pickQuestionArea: {
    flex: 1,
  },
  pickQuestionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  questionChoicesScroll: {
    flex: 1,
  },
  questionChoicesContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  questionChoiceCard: {
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  questionChoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  questionChoiceNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  blanksIndicator: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  blanksIndicatorText: {
    fontSize: fontSize.xs,
    color: '#ffffff',
    fontWeight: fontWeight.semibold,
  },
  questionChoiceText: {
    fontSize: fontSize.md,
    color: '#ffffff',
    lineHeight: 22,
  },
  customQuestionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#854d0e',
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  customQuestionButtonText: {
    fontSize: fontSize.md,
    color: '#854d0e',
    fontWeight: fontWeight.medium,
  },
  customHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  // Question Card
  questionCard: {
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
  questionBlank: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: '#ffffff',
  },
  answerInQuestion: {
    backgroundColor: colors.success,
    color: '#ffffff',
    fontWeight: fontWeight.bold,
  },
  requiredAnswersBadge: {
    alignSelf: 'center',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  requiredAnswersText: {
    fontSize: fontSize.sm,
    color: '#ffffff',
    fontWeight: fontWeight.medium,
  },
  actionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  instructionText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  multiAnswerHint: {
    fontSize: fontSize.md,
    color: '#854d0e',
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  actionButton: {
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  actionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  cardsArea: {
    flex: 1,
  },
  answerProgress: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  answerProgressText: {
    fontSize: fontSize.md,
    color: '#854d0e',
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressDotActive: {
    backgroundColor: '#854d0e',
    borderColor: '#854d0e',
  },
  selectedAnswersContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedAnswersTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  selectedAnswerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  selectedAnswerNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  selectedAnswerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  chooseText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  handScroll: {
    flex: 1,
  },
  handContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  responseCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  responseCardText: {
    fontSize: fontSize.md,
    color: '#1a1a1a',
    fontWeight: fontWeight.medium,
  },
  customResponseButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#854d0e',
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  customResponseButtonText: {
    fontSize: fontSize.md,
    color: '#854d0e',
    fontWeight: fontWeight.medium,
  },
  customInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  customInput: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: '#1a1a1a',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  customCancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  customCancelButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  customSubmitButton: {
    flex: 1,
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  customSubmitButtonDisabled: {
    opacity: 0.5,
  },
  customSubmitButtonText: {
    fontSize: fontSize.md,
    color: '#ffffff',
    fontWeight: fontWeight.bold,
  },
  revealArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  revealTitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  revealCard: {
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
  },
  chooseWinnerArea: {
    flex: 1,
  },
  chooseWinnerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  answersScroll: {
    flex: 1,
  },
  answersContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: '#854d0e',
  },
  answerOptionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#854d0e',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  answerOptionContent: {
    flex: 1,
  },
  answerOptionText: {
    fontSize: fontSize.md,
    color: '#1a1a1a',
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  resultArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  resultEmoji: {
    fontSize: 80,
  },
  resultTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  resultSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  passModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  passEmoji: {
    fontSize: 64,
  },
  passTitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  passName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  passSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  passButton: {
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  passButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  gameOverContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxHeight: '80%',
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  gameOverTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  gameOverSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  finalScores: {
    width: '100%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  finalScoresTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  finalScoreRank: {
    width: 30,
    fontSize: fontSize.lg,
  },
  finalScoreName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  finalScoreValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#854d0e',
  },
  gameOverButton: {
    backgroundColor: '#854d0e',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  gameOverButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
});
