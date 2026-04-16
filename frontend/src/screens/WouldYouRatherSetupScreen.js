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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

// Thèmes disponibles pour les manches - Loufques et vulgaires
const THEMES = [
  { id: 'caca', name: 'Caca & Prout', emoji: '💩', description: 'Tout ce qui pue' },
  { id: 'ex', name: 'Ton ex', emoji: '💔', description: 'Retour de flamme douteux' },
  { id: 'nude', name: 'À poil', emoji: '🍑', description: 'Situations dénudées' },
  { id: 'bellefamille', name: 'Belle-famille', emoji: '👵', description: 'Horreurs avec beaux-parents' },
  { id: 'onlyfans', name: 'OnlyFans', emoji: '📸', description: 'Contenus compromettants' },
  { id: 'enterrement', name: 'Enterrement', emoji: '⚰️', description: 'Malaises funéraires' },
  { id: 'partouze', name: 'Orgie', emoji: '🔞', description: 'Situations très chaudes' },
  { id: 'tinder', name: 'Date Tinder', emoji: '🔥', description: 'Rencontres catastrophiques' },
  { id: 'vomi', name: 'Gerbe', emoji: '🤮', description: 'Tout ce qui dégueule' },
  { id: 'boss', name: 'Ton patron', emoji: '👔', description: 'Situations pro awkward' },
  { id: 'parents', name: 'Devant tes parents', emoji: '😱', description: 'Shame familial' },
  { id: 'festivaltoilettes', name: 'Toilettes festival', emoji: '🎪', description: 'L\'enfer des WC publics' },
  { id: 'grandmere', name: 'Mamie regarde', emoji: '👀', description: 'Sous les yeux de mamie' },
  { id: 'webcam', name: 'Webcam allumée', emoji: '🎥', description: 'Oups, t\'es en live' },
  { id: 'pegging', name: 'Expériences', emoji: '🍆', description: 'Nouvelles sensations' },
  { id: 'lendemain', name: 'Lendemain de cuite', emoji: '🍺', description: 'Gueule de bois extrême' },
  { id: 'fetish', name: 'Fetish bizarre', emoji: '🦶', description: 'Kinks chelous' },
  { id: 'divorce', name: 'Causes de divorce', emoji: '💍', description: 'Dealbreakers ultimes' },
  { id: 'prison', name: 'En prison', emoji: '🔒', description: 'Survie en taule' },
  { id: 'zombie', name: 'Apocalypse zombie', emoji: '🧟', description: 'Survie extrême' },
  { id: 'desert', name: 'Île déserte', emoji: '🏝️', description: 'Seul au monde' },
  { id: 'amazon', name: 'Jungle Amazon', emoji: '🐍', description: 'Bestioles et dangers' },
  { id: 'chirurgie', name: 'Chirurgie ratée', emoji: '🏥', description: 'Opérations foireuses' },
  { id: 'tattoo', name: 'Tattoo permanent', emoji: '💉', description: 'Encré pour la vie' },
];

export default function WouldYouRatherInputScreen({ navigation, route }) {
  // Récupérer les données de continuation si elles existent
  const continueData = route.params || {};

  // Phase: 'players' -> 'rounds' -> 'theme' -> 'input' -> 'tournament' -> 'roundResults'
  const [phase, setPhase] = useState(continueData.continueGame ? 'theme' : 'players');
  const [players, setPlayers] = useState(
    continueData.existingPlayers || [
      { id: 0, name: '', score: 0 },
      { id: 1, name: '', score: 0 },
      { id: 2, name: '', score: 0 },
    ]
  );
  const [totalRounds, setTotalRounds] = useState(continueData.totalRounds || 5);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showingInput, setShowingInput] = useState(false);
  const [proposals, setProposals] = useState({}); // { playerId: 'text' }
  const [currentProposal, setCurrentProposal] = useState('');
  const [roundNumber, setRoundNumber] = useState(continueData.nextRoundNumber || 1);
  const [usedThemes, setUsedThemes] = useState(continueData.usedThemes || []);
  const [showCustomThemeInput, setShowCustomThemeInput] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');

  // Tournoi
  const [tournamentProposals, setTournamentProposals] = useState([]);
  const [currentMatchup, setCurrentMatchup] = useState(0);
  const [tournamentRound, setTournamentRound] = useState(1); // Round du tournoi (1/2 finale, finale, etc.)
  const [roundWinner, setRoundWinner] = useState(null);

  // Ajouter un joueur
  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { id: players.length, name: '', score: 0 }]);
    }
  };

  // Supprimer un joueur
  const removePlayer = (index) => {
    if (players.length > MIN_PLAYERS) {
      const newPlayers = players.filter((_, i) => i !== index).map((p, i) => ({ ...p, id: i }));
      setPlayers(newPlayers);
    }
  };

  // Mettre à jour le nom d'un joueur
  const updatePlayerName = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  // Vérifier si on peut continuer
  const canContinue = () => {
    return players.every(p => p.name.trim() !== '');
  };

  // Passer au choix du nombre de manches
  const goToRoundsSelection = () => {
    if (!canContinue()) {
      Alert.alert('Noms manquants', 'Tous les joueurs doivent avoir un nom.');
      return;
    }
    setPhase('rounds');
  };

  // Passer à la sélection du thème
  const startThemeSelection = () => {
    setPhase('theme');
  };

  // Obtenir les thèmes disponibles
  const getAvailableThemes = () => {
    return THEMES.filter(t => !usedThemes.includes(t.id));
  };

  // Sélectionner un thème
  const selectTheme = (theme) => {
    setCurrentTheme(theme);
    setUsedThemes([...usedThemes, theme.id]);
    setProposals({});
    setCurrentPlayerIndex(0);
    setShowingInput(false);
    setPhase('input');
  };

  // Sélectionner un thème aléatoire
  const selectRandomTheme = () => {
    const available = getAvailableThemes();
    if (available.length === 0) {
      // Reset les thèmes utilisés
      setUsedThemes([]);
      const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
      selectTheme(randomTheme);
    } else {
      const randomTheme = available[Math.floor(Math.random() * available.length)];
      selectTheme(randomTheme);
    }
  };

  // Créer un thème personnalisé
  const createCustomTheme = () => {
    if (customThemeName.trim() === '') {
      Alert.alert('Thème vide', 'Donne un nom à ton thème !');
      return;
    }
    const customTheme = {
      id: `custom_${Date.now()}`,
      name: customThemeName.trim(),
      emoji: '✨',
      description: 'Thème personnalisé',
      isCustom: true,
    };
    setCustomThemeName('');
    setShowCustomThemeInput(false);
    selectTheme(customTheme);
  };

  // Joueur actuel
  const currentPlayer = players[currentPlayerIndex];

  // Soumettre une proposition
  const submitProposal = () => {
    if (currentProposal.trim() === '') {
      Alert.alert('Proposition vide', 'Tu dois entrer quelque chose !');
      return;
    }

    const newProposals = { ...proposals };
    newProposals[currentPlayer.id] = currentProposal.trim();
    setProposals(newProposals);
    setCurrentProposal('');

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setShowingInput(false);
    } else {
      // Toutes les propositions sont entrées, lancer le tournoi
      startTournament(newProposals);
    }
  };

  // Démarrer le tournoi
  const startTournament = (allProposals) => {
    const proposalsList = Object.entries(allProposals).map(([playerId, text]) => ({
      playerId: parseInt(playerId),
      playerName: players.find(p => p.id === parseInt(playerId))?.name,
      text,
      eliminated: false,
    }));

    // Mélanger les propositions
    proposalsList.sort(() => Math.random() - 0.5);

    setTournamentProposals(proposalsList);
    setCurrentMatchup(0);
    setTournamentRound(1);
    setPhase('tournament');
  };

  // Obtenir les propositions encore en lice
  const getActiveProposals = () => {
    return tournamentProposals.filter(p => !p.eliminated);
  };

  // Obtenir le matchup actuel (2 propositions à comparer)
  const getCurrentMatchup = () => {
    const active = getActiveProposals();
    if (active.length < 2) return null;

    const idx = currentMatchup * 2;
    if (idx + 1 >= active.length) return null;

    return [active[idx], active[idx + 1]];
  };

  // Voter pour une proposition (celle-ci gagne = l'autre est éliminée)
  const voteForProposal = (winnerIndex) => {
    const matchup = getCurrentMatchup();
    if (!matchup) return;

    const loserIndex = winnerIndex === 0 ? 1 : 0;
    const loser = matchup[loserIndex];

    // Éliminer le perdant
    const newProposals = tournamentProposals.map(p => {
      if (p.playerId === loser.playerId) {
        return { ...p, eliminated: true };
      }
      return p;
    });
    setTournamentProposals(newProposals);

    // Passer au matchup suivant
    const activeAfterVote = newProposals.filter(p => !p.eliminated);
    const totalMatchups = Math.floor(activeAfterVote.length / 2);

    if (currentMatchup + 1 < Math.floor(getActiveProposals().length / 2)) {
      // Encore des matchups dans ce round
      setCurrentMatchup(currentMatchup + 1);
    } else {
      // Fin du round de tournoi
      const remainingActive = newProposals.filter(p => !p.eliminated);

      if (remainingActive.length === 1) {
        // On a un gagnant !
        const winner = remainingActive[0];

        // Ajouter le point au joueur gagnant
        const newPlayers = players.map(p => {
          if (p.id === winner.playerId) {
            return { ...p, score: p.score + 1 };
          }
          return p;
        });
        setPlayers(newPlayers);
        setRoundWinner(winner);
        setPhase('roundResults');
      } else if (remainingActive.length === 0) {
        // Cas edge : nombre impair de propositions, le dernier passe automatiquement
        // Ne devrait pas arriver avec notre logique mais au cas où
        setPhase('roundResults');
      } else {
        // Prochain round du tournoi
        setCurrentMatchup(0);
        setTournamentRound(tournamentRound + 1);
      }
    }
  };

  // Calculer le nom du round de tournoi
  const getTournamentRoundName = () => {
    const active = getActiveProposals().length;
    if (active === 2) return '🏆 FINALE';
    if (active <= 4) return '🥈 Demi-finale';
    if (active <= 8) return '🥉 Quart de finale';
    return `Round ${tournamentRound}`;
  };

  // Passer à la manche suivante ou terminer
  const nextRound = () => {
    if (roundNumber >= totalRounds) {
      // Fin de la partie - afficher les résultats finaux
      navigation.navigate('WouldYouRatherGame', {
        mode: 'finalResults',
        players: players,
        totalRounds: totalRounds,
      });
    } else {
      // Manche suivante
      setRoundNumber(roundNumber + 1);
      setCurrentTheme(null);
      setProposals({});
      setCurrentPlayerIndex(0);
      setShowingInput(false);
      setCurrentProposal('');
      setTournamentProposals([]);
      setCurrentMatchup(0);
      setTournamentRound(1);
      setRoundWinner(null);
      setPhase('theme');
    }
  };

  // Rendu de la phase "joueurs"
  const renderPlayersPhase = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.instructionBox}>
        <Text style={styles.instructionEmoji}>👥</Text>
        <Text style={styles.instructionText}>
          Entrez les noms des joueurs{'\n'}
          (minimum 3 joueurs pour le tournoi)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Joueurs ({players.length})</Text>

        {players.map((player, index) => (
          <View key={player.id} style={styles.playerRow}>
            <View style={styles.playerNumber}>
              <Text style={styles.playerNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={styles.playerInput}
              placeholder={`Joueur ${index + 1}`}
              placeholderTextColor={colors.textMuted}
              value={player.name}
              onChangeText={(text) => updatePlayerName(index, text)}
            />
            {players.length > MIN_PLAYERS && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {players.length < MAX_PLAYERS && (
          <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
            <Text style={styles.addButtonText}>+ Ajouter un joueur</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !canContinue() && styles.buttonDisabled]}
        onPress={goToRoundsSelection}
        disabled={!canContinue()}
      >
        <Text style={styles.primaryButtonText}>Continuer</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  // Rendu de la phase "rounds" - choix du nombre de manches
  const renderRoundsPhase = () => {
    const roundOptions = [3, 5, 7, 10];

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionEmoji}>🎯</Text>
          <Text style={styles.instructionTitle}>Nombre de manches</Text>
          <Text style={styles.instructionText}>
            Combien de manches voulez-vous jouer ?{'\n'}
            Le gagnant de chaque manche marque 1 point.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.roundsGrid}>
            {roundOptions.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.roundOption,
                  totalRounds === num && styles.roundOptionSelected,
                ]}
                onPress={() => setTotalRounds(num)}
              >
                <Text style={[
                  styles.roundOptionNumber,
                  totalRounds === num && styles.roundOptionNumberSelected,
                ]}>
                  {num}
                </Text>
                <Text style={[
                  styles.roundOptionLabel,
                  totalRounds === num && styles.roundOptionLabelSelected,
                ]}>
                  manches
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>ℹ️</Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>{players.length} joueurs</Text> vont s'affronter sur{' '}
            <Text style={styles.bold}>{totalRounds} manches</Text>.{'\n\n'}
            À chaque manche, chaque joueur propose quelque chose d'horrible.
            Les propositions s'affrontent en tournoi, et la pire gagne !
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startThemeSelection}
        >
          <Text style={styles.primaryButtonText}>C'est parti !</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  // Rendu de la phase "theme"
  const renderThemePhase = () => {
    const availableThemes = getAvailableThemes();

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.roundHeader}>
          <Text style={styles.roundNumber}>Manche {roundNumber} / {totalRounds}</Text>
          <View style={styles.scoresPreview}>
            {players.slice(0, 4).map((p, i) => (
              <Text key={i} style={styles.scorePreviewItem}>
                {p.name.substring(0, 6)}: {p.score}
              </Text>
            ))}
            {players.length > 4 && <Text style={styles.scorePreviewItem}>...</Text>}
          </View>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionEmoji}>🎯</Text>
          <Text style={styles.instructionTitle}>Choisis un thème</Text>
          <Text style={styles.instructionText}>
            Chaque joueur devra proposer une chose horrible en rapport avec ce thème
          </Text>
        </View>

        {/* Boutons spéciaux */}
        <View style={styles.specialButtonsRow}>
          <TouchableOpacity style={styles.randomButton} onPress={selectRandomTheme}>
            <Text style={styles.randomEmoji}>🎲</Text>
            <Text style={styles.randomText}>Aléatoire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customThemeButton}
            onPress={() => setShowCustomThemeInput(true)}
          >
            <Text style={styles.customThemeEmoji}>✏️</Text>
            <Text style={styles.customThemeText}>Créer</Text>
          </TouchableOpacity>
        </View>

        {/* Input thème personnalisé */}
        {showCustomThemeInput && (
          <View style={styles.customThemeInputBox}>
            <Text style={styles.customThemeInputTitle}>Ton thème perso</Text>
            <TextInput
              style={styles.customThemeInput}
              placeholder="Ex: Avec ton crush, En boîte de nuit..."
              placeholderTextColor={colors.textMuted}
              value={customThemeName}
              onChangeText={setCustomThemeName}
              autoFocus
            />
            <View style={styles.customThemeButtons}>
              <TouchableOpacity
                style={styles.customThemeCancelButton}
                onPress={() => {
                  setShowCustomThemeInput(false);
                  setCustomThemeName('');
                }}
              >
                <Text style={styles.customThemeCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.customThemeConfirmButton,
                  customThemeName.trim() === '' && styles.buttonDisabled
                ]}
                onPress={createCustomTheme}
                disabled={customThemeName.trim() === ''}
              >
                <Text style={styles.customThemeConfirmText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ou choisis un thème :</Text>
          <View style={styles.themesGrid}>
            {availableThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={styles.themeCard}
                onPress={() => selectTheme(theme)}
              >
                <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                <Text style={styles.themeName}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {availableThemes.length === 0 && (
            <Text style={styles.noThemesText}>
              Tous les thèmes ont été utilisés !{'\n'}
              Crée ton propre thème ou utilise "Aléatoire".
            </Text>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  // Rendu de la phase "input" - écran d'attente
  const renderInputWaiting = () => (
    <View style={styles.waitingContainer}>
      <View style={styles.themeIndicator}>
        <Text style={styles.themeIndicatorEmoji}>{currentTheme?.emoji}</Text>
        <Text style={styles.themeIndicatorName}>{currentTheme?.name}</Text>
      </View>

      <Text style={styles.waitingEmoji}>🤫</Text>
      <Text style={styles.waitingTitle}>C'est au tour de</Text>
      <Text style={styles.waitingName}>{currentPlayer?.name}</Text>
      <Text style={styles.waitingSubtitle}>
        Passe le téléphone à {currentPlayer?.name}
      </Text>
      <Text style={styles.waitingProgress}>
        {currentPlayerIndex + 1} / {players.length}
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setShowingInput(true)}
      >
        <Text style={styles.primaryButtonText}>Je suis {currentPlayer?.name}</Text>
      </TouchableOpacity>
    </View>
  );

  // Rendu de la phase "input" - saisie de la proposition
  const renderInputForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.themeIndicator}>
          <Text style={styles.themeIndicatorEmoji}>{currentTheme?.emoji}</Text>
          <Text style={styles.themeIndicatorName}>{currentTheme?.name}</Text>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>{currentPlayer?.name}</Text>
          <Text style={styles.instructionText}>
            Écris la chose que tu veux le MOINS faire{'\n'}
            en rapport avec le thème "{currentTheme?.name}"
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ta pire horreur</Text>
          <TextInput
            style={styles.bigInput}
            placeholder={`Ex: Me faire vomir dessus par un inconnu...`}
            placeholderTextColor={colors.textMuted}
            value={currentProposal}
            onChangeText={setCurrentProposal}
            multiline
            autoFocus
          />
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            Sois créatif et horrible !{'\n'}
            La pire proposition de la manche gagne le tournoi !
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, currentProposal.trim() === '' && styles.buttonDisabled]}
          onPress={submitProposal}
          disabled={currentProposal.trim() === ''}
        >
          <Text style={styles.primaryButtonText}>
            {currentPlayerIndex < players.length - 1 ? 'Valider' : 'Lancer le tournoi !'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Rendu de la phase "tournament"
  const renderTournament = () => {
    const matchup = getCurrentMatchup();
    const active = getActiveProposals();

    // Si nombre impair, le dernier passe automatiquement
    if (matchup === null && active.length > 1) {
      // Prochain round
      setCurrentMatchup(0);
      setTournamentRound(tournamentRound + 1);
      return null;
    }

    if (!matchup) return null;

    return (
      <View style={styles.tournamentContainer}>
        <View style={styles.themeIndicator}>
          <Text style={styles.themeIndicatorEmoji}>{currentTheme?.emoji}</Text>
          <Text style={styles.themeIndicatorName}>{currentTheme?.name}</Text>
        </View>

        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentRoundName}>{getTournamentRoundName()}</Text>
          <Text style={styles.tournamentProgress}>
            {active.length} propositions restantes
          </Text>
        </View>

        <Text style={styles.tournamentQuestion}>
          Quelle proposition est la PIRE ?
        </Text>

        <View style={styles.matchupContainer}>
          <TouchableOpacity
            style={styles.proposalCard}
            onPress={() => voteForProposal(0)}
          >
            <Text style={styles.proposalAuthor}>{matchup[0].playerName}</Text>
            <Text style={styles.proposalText}>{matchup[0].text}</Text>
            <View style={styles.voteButton}>
              <Text style={styles.voteButtonText}>👆 Celle-ci est pire</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <TouchableOpacity
            style={styles.proposalCard}
            onPress={() => voteForProposal(1)}
          >
            <Text style={styles.proposalAuthor}>{matchup[1].playerName}</Text>
            <Text style={styles.proposalText}>{matchup[1].text}</Text>
            <View style={styles.voteButton}>
              <Text style={styles.voteButtonText}>👆 Celle-ci est pire</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.tournamentHint}>
          Débattez et votez ensemble !
        </Text>
      </View>
    );
  };

  // Rendu des résultats de la manche
  const renderRoundResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.themeIndicator}>
        <Text style={styles.themeIndicatorEmoji}>{currentTheme?.emoji}</Text>
        <Text style={styles.themeIndicatorName}>{currentTheme?.name}</Text>
      </View>

      <Text style={styles.resultsEmoji}>🏆</Text>
      <Text style={styles.resultsTitle}>Gagnant de la manche !</Text>

      {roundWinner && (
        <>
          <Text style={styles.winnerName}>{roundWinner.playerName}</Text>
          <View style={styles.winnerProposalBox}>
            <Text style={styles.winnerProposalText}>"{roundWinner.text}"</Text>
          </View>
          <Text style={styles.pointsGained}>+1 point</Text>
        </>
      )}

      <View style={styles.scoresSection}>
        <Text style={styles.scoresSectionTitle}>Classement</Text>
        {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
          <View key={player.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
            </Text>
            <Text style={styles.scoreName}>{player.name}</Text>
            <Text style={styles.scorePoints}>{player.score} pts</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={nextRound}
      >
        <Text style={styles.primaryButtonText}>
          {roundNumber >= totalRounds ? 'Voir les résultats finaux' : 'Manche suivante'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (phase === 'input' && showingInput) {
              setShowingInput(false);
            } else if (phase === 'input') {
              setPhase('theme');
            } else if (phase === 'theme') {
              if (roundNumber > 1) {
                Alert.alert(
                  'Quitter la partie ?',
                  'Tu perdras ta progression.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Quitter', style: 'destructive', onPress: () => navigation.goBack() },
                  ]
                );
              } else {
                setPhase('rounds');
              }
            } else if (phase === 'rounds') {
              setPhase('players');
            } else if (phase === 'tournament' || phase === 'roundResults') {
              // Pas de retour pendant le tournoi
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mode Perso</Text>
        <View style={styles.placeholder} />
      </View>

      {phase === 'players' && renderPlayersPhase()}
      {phase === 'rounds' && renderRoundsPhase()}
      {phase === 'theme' && renderThemePhase()}
      {phase === 'input' && !showingInput && renderInputWaiting()}
      {phase === 'input' && showingInput && renderInputForm()}
      {phase === 'tournament' && renderTournament()}
      {phase === 'roundResults' && renderRoundResults()}
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
  keyboardView: {
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
  roundHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roundNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
    backgroundColor: '#a855f720',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  scoresPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  scorePreviewItem: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  instructionBox: {
    backgroundColor: '#a855f720',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#a855f7',
    alignItems: 'center',
    gap: spacing.sm,
  },
  instructionEmoji: {
    fontSize: 48,
  },
  instructionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
  },
  instructionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
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
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontSize.md,
    color: '#a855f7',
    fontWeight: fontWeight.medium,
  },
  // Rounds selection
  roundsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  roundOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  roundOptionSelected: {
    backgroundColor: '#a855f720',
    borderColor: '#a855f7',
  },
  roundOptionNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  roundOptionNumberSelected: {
    color: '#a855f7',
  },
  roundOptionLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  roundOptionLabelSelected: {
    color: '#a855f7',
  },
  infoBox: {
    backgroundColor: '#3b82f620',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bold: {
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  specialButtonsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  randomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: '#f59e0b',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  randomEmoji: {
    fontSize: 24,
  },
  randomText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  customThemeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: '#10b981',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  customThemeEmoji: {
    fontSize: 24,
  },
  customThemeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  customThemeInputBox: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  customThemeInputTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#10b981',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  customThemeInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  customThemeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  customThemeCancelButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customThemeCancelText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  customThemeConfirmButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#10b981',
  },
  customThemeConfirmText: {
    fontSize: fontSize.sm,
    color: '#ffffff',
    fontWeight: fontWeight.bold,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  themeCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  themeEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  themeName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  noThemesText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  themeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  themeIndicatorEmoji: {
    fontSize: 24,
  },
  themeIndicatorName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
  },
  bigInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tipBox: {
    backgroundColor: '#3b82f620',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    marginHorizontal: spacing.md,
    backgroundColor: '#a855f7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  buttonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  waitingEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  waitingTitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  waitingName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
    marginBottom: spacing.md,
  },
  waitingSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  waitingProgress: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  // Tournament styles
  tournamentContainer: {
    flex: 1,
    padding: spacing.md,
  },
  tournamentHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tournamentRoundName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
    marginBottom: spacing.xs,
  },
  tournamentProgress: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  tournamentQuestion: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  matchupContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  proposalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  proposalAuthor: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
    marginBottom: spacing.sm,
  },
  proposalText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  voteButton: {
    backgroundColor: '#a855f720',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  voteButtonText: {
    fontSize: fontSize.md,
    color: '#a855f7',
    fontWeight: fontWeight.medium,
  },
  vsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  vsText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  tournamentHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  // Results styles
  resultsContainer: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  resultsEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  resultsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  winnerName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
    marginBottom: spacing.md,
  },
  winnerProposalBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  winnerProposalText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  pointsGained: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#22c55e',
    marginBottom: spacing.xl,
  },
  scoresSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  scoresSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreRank: {
    fontSize: fontSize.lg,
    width: 40,
  },
  scoreName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  scorePoints: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
