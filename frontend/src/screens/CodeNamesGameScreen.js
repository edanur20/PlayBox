import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { wordsFr, wordsEn } from '../data/words';
import { generateSpicyGrid } from '../data/wordsSpicy';

const { width } = Dimensions.get('window');
const GRID_SIZE = 5;
const gridPadding = 8;
const cardGap = 5;
const availableWidth = width - gridPadding * 2;
const cardSize = (availableWidth - cardGap * (GRID_SIZE - 1)) / GRID_SIZE;

const getTeamColor = (teamId) => {
  switch (teamId) {
    case 'red': return colors.teamRed;
    case 'blue': return colors.teamBlue;
    case 'green': return colors.teamGreen;
    case 'yellow': return colors.teamYellow;
    default: return colors.neutral;
  }
};

const getTeamLightColor = (teamId) => {
  switch (teamId) {
    case 'red': return colors.teamRedLight;
    case 'blue': return colors.teamBlueLight;
    case 'green': return colors.teamGreenLight;
    case 'yellow': return colors.teamYellowLight;
    default: return colors.neutralLight;
  }
};

const getTeamName = (teamId) => {
  switch (teamId) {
    case 'red': return 'Rouge';
    case 'blue': return 'Bleue';
    case 'green': return 'Verte';
    case 'yellow': return 'Jaune';
    default: return '';
  }
};

export default function CodeNamesGameScreen({ navigation, route }) {
  const { teams, language, mode = 'classic' } = route.params;
  const [cards, setCards] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [isSpymasterView, setIsSpymasterView] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [turnMessage, setTurnMessage] = useState('');
  const [lastRevealedCard, setLastRevealedCard] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const gridRef = useRef();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Use spicy words if mode is 'spicy', otherwise use regular words
    let shuffledWords;
    if (mode === 'spicy') {
      shuffledWords = generateSpicyGrid();
    } else {
      const words = language === 'en' ? wordsEn : wordsFr;
      shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 25);
    }

    const totalCards = 25;
    const assassinCards = 1;
    const neutralCards = Math.floor((totalCards - assassinCards) / (teams.length + 1));
    const teamCards = Math.floor((totalCards - assassinCards - neutralCards) / teams.length);

    const assignments = [];

    teams.forEach((team, index) => {
      const cardsForTeam = index === 0 ? teamCards + 1 : teamCards;
      for (let i = 0; i < cardsForTeam; i++) {
        assignments.push({ type: 'team', teamId: team.id });
      }
    });

    assignments.push({ type: 'assassin' });

    while (assignments.length < 25) {
      assignments.push({ type: 'neutral' });
    }

    const shuffledAssignments = assignments.sort(() => Math.random() - 0.5);

    const newCards = shuffledWords.map((word, index) => ({
      id: index,
      word,
      ...shuffledAssignments[index],
      revealed: false,
    }));

    setCards(newCards);

    const initialScores = {};
    teams.forEach((team) => {
      const teamCardsCount = newCards.filter(
        (c) => c.type === 'team' && c.teamId === team.id
      ).length;
      initialScores[team.id] = { found: 0, total: teamCardsCount };
    });
    setScores(initialScores);
  };

  const handleCardPress = (cardId) => {
    if (gameOver || isSpymasterView) return;

    const card = cards.find((c) => c.id === cardId);
    if (card.revealed) return;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, revealed: true } : c
    );
    setCards(newCards);
    setLastRevealedCard(card);

    const currentTeam = teams[currentTeamIndex];

    if (card.type === 'assassin') {
      setGameOver(true);
      const winnerTeam = teams.find((t) => t.id !== currentTeam.id);
      setWinner(winnerTeam);
      setShowEndModal(true);
      return;
    }

    if (card.type === 'team') {
      const newScores = { ...scores };
      newScores[card.teamId].found += 1;
      setScores(newScores);

      if (newScores[card.teamId].found >= newScores[card.teamId].total) {
        const winningTeam = teams.find((t) => t.id === card.teamId);
        setGameOver(true);
        setWinner(winningTeam);
        setShowEndModal(true);
        return;
      }

      if (card.teamId !== currentTeam.id) {
        // Wrong team's card - show turn change modal
        setTurnMessage(`Carte de l'équipe ${getTeamName(card.teamId)} !`);
        setShowTurnModal(true);
      }
      // Correct team's card - can continue playing
    } else {
      // Neutral card - show turn change modal
      setTurnMessage('Carte neutre !');
      setShowTurnModal(true);
    }
  };

  const confirmTurnChange = () => {
    setShowTurnModal(false);
    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
  };

  const endTurn = () => {
    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
  };

  const toggleSpymasterView = () => {
    if (!isSpymasterView) {
      Alert.alert(
        'Mode Maître-Espion',
        'Attention ! Seul le Maître-Espion doit voir cet écran.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Afficher', onPress: () => setIsSpymasterView(true) },
        ]
      );
    } else {
      setIsSpymasterView(false);
    }
  };

  const getCardStyle = (card) => {
    if (card.revealed) {
      if (card.type === 'assassin') {
        return {
          backgroundColor: '#000000',
          borderColor: colors.assassinBorder,
          borderWidth: 3,
        };
      }
      if (card.type === 'team') {
        return {
          backgroundColor: getTeamColor(card.teamId),
          borderColor: getTeamColor(card.teamId),
        };
      }
      // Neutral revealed - beige/tan color like the real game
      return {
        backgroundColor: '#d4c4a8',
        borderColor: '#b8a888',
      };
    }

    if (isSpymasterView) {
      if (card.type === 'assassin') {
        return {
          backgroundColor: '#1a1a1a',
          borderColor: colors.assassinBorder,
          borderWidth: 2,
        };
      }
      if (card.type === 'team') {
        return {
          backgroundColor: getTeamLightColor(card.teamId),
          borderColor: getTeamColor(card.teamId),
          borderWidth: 2,
        };
      }
      return {
        backgroundColor: '#8b8070',
        borderColor: '#6b6050',
      };
    }

    // Default unrevealed card
    return {
      backgroundColor: '#f5f0e6',
      borderColor: '#d4c4a8',
    };
  };

  const getCardTextStyle = (card) => {
    if (card.revealed) {
      if (card.type === 'neutral') {
        return { color: '#4a4033' };
      }
      return { color: '#ffffff' };
    }
    if (isSpymasterView && card.type === 'assassin') {
      return { color: colors.assassinBorder };
    }
    return { color: '#2d2a26' };
  };

  const restartGame = () => {
    setShowEndModal(false);
    setGameOver(false);
    setWinner(null);
    setCurrentTeamIndex(0);
    setIsSpymasterView(false);
    initializeGame();
  };

  const shareSpymasterGrid = async () => {
    if (!gridRef.current) return;

    try {
      setIsSharing(true);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil');
        setIsSharing(false);
        return;
      }

      // Capture the grid as an image
      const uri = await captureRef(gridRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Partager la grille Maître-Espion',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Erreur', 'Impossible de partager la grille');
    } finally {
      setIsSharing(false);
    }
  };

  const currentTeam = teams[currentTeamIndex];

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
        <View style={[styles.turnIndicator, { backgroundColor: getTeamColor(currentTeam.id) }]}>
          <Text style={styles.turnText}>{currentTeam.name}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.spymasterButton,
            isSpymasterView && styles.spymasterButtonActive,
          ]}
          onPress={toggleSpymasterView}
        >
          <Text style={styles.spymasterButtonText}>🕵️</Text>
        </TouchableOpacity>
      </View>

      {/* Scores */}
      <View style={styles.scoresContainer}>
        {teams.map((team) => (
          <View
            key={team.id}
            style={[
              styles.scoreItem,
              currentTeam.id === team.id && styles.scoreItemActive,
              { borderColor: getTeamColor(team.id) }
            ]}
          >
            <View
              style={[styles.scoreDot, { backgroundColor: getTeamColor(team.id) }]}
            />
            <Text style={styles.scoreText}>
              {scores[team.id]?.found || 0}/{scores[team.id]?.total || 0}
            </Text>
          </View>
        ))}
      </View>

      {/* Teams Players Display */}
      <View style={styles.teamsPlayersContainer}>
        {teams.map((team) => (
          <View
            key={team.id}
            style={[
              styles.teamPlayersCard,
              currentTeam.id === team.id && styles.teamPlayersCardActive,
              { borderLeftColor: getTeamColor(team.id) }
            ]}
          >
            <View style={styles.teamPlayersHeader}>
              <View style={[styles.teamColorIndicator, { backgroundColor: getTeamColor(team.id) }]} />
              <Text style={styles.teamPlayersName}>{team.name}</Text>
            </View>
            <View style={styles.playersList}>
              {team.players && team.players.map((player, index) => (
                player.trim() !== '' && (
                  <View key={index} style={styles.playerItem}>
                    {index === 0 && <Text style={styles.spymasterIcon}>🕵️</Text>}
                    <Text style={[
                      styles.playerName,
                      index === 0 && styles.spymasterName
                    ]}>
                      {player}
                    </Text>
                  </View>
                )
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Game Grid */}
      <View style={styles.gridContainer}>
        <View ref={gridRef} style={styles.grid} collapsable={false}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                getCardStyle(card),
                { marginRight: (index + 1) % 5 === 0 ? 0 : cardGap },
                { marginBottom: index < 20 ? cardGap : 0 },
              ]}
              onPress={() => handleCardPress(card.id)}
              disabled={card.revealed || isSpymasterView}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.cardText, getCardTextStyle(card)]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {card.word}
              </Text>
              {isSpymasterView && card.type === 'assassin' && !card.revealed && (
                <Text style={styles.assassinIcon}>💀</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* End Turn Button */}
      {!gameOver && !isSpymasterView && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.endTurnButton, { borderColor: getTeamColor(currentTeam.id) }]}
            onPress={endTurn}
          >
            <Text style={styles.endTurnButtonText}>Fin du tour</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Spymaster indicator with share button */}
      {isSpymasterView && (
        <View style={styles.spymasterBanner}>
          <View style={styles.spymasterBannerContent}>
            <Text style={styles.spymasterBannerText}>
              🕵️ Mode Maître-Espion
            </Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={shareSpymasterGrid}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? '...' : '📤 Partager'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.spymasterBannerSubtext}>
            Appuyez sur 🕵️ pour masquer
          </Text>
        </View>
      )}

      {/* Turn Change Modal */}
      <Modal visible={showTurnModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.turnModalContent}>
            <Text style={styles.turnModalMessage}>{turnMessage}</Text>
            <Text style={styles.turnModalSubtext}>
              Au tour de l'équipe {teams[(currentTeamIndex + 1) % teams.length]?.name}
            </Text>
            <TouchableOpacity
              style={[styles.turnModalButton, { backgroundColor: getTeamColor(teams[(currentTeamIndex + 1) % teams.length]?.id) }]}
              onPress={confirmTurnChange}
            >
              <Text style={styles.turnModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End Game Modal */}
      <Modal visible={showEndModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Partie terminée !</Text>
            {winner && (
              <>
                <View
                  style={[
                    styles.winnerBadge,
                    { backgroundColor: getTeamColor(winner.id) },
                  ]}
                >
                  <Text style={styles.winnerText}>{winner.name}</Text>
                </View>
                <Text style={styles.winnerSubtext}>a gagné !</Text>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={restartGame}
              >
                <Text style={styles.modalButtonText}>Rejouer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.modalButtonTextSecondary}>Menu</Text>
              </TouchableOpacity>
            </View>
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
  turnIndicator: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  turnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  spymasterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  spymasterButtonActive: {
    backgroundColor: colors.primary,
  },
  spymasterButtonText: {
    fontSize: 22,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  scoreItemActive: {
    backgroundColor: colors.surfaceLight,
  },
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  // Teams players display styles
  teamsPlayersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  teamPlayersCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    borderLeftWidth: 3,
    opacity: 0.7,
  },
  teamPlayersCardActive: {
    opacity: 1,
    backgroundColor: colors.surfaceLight,
  },
  teamPlayersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  teamColorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamPlayersName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  playersList: {
    gap: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  spymasterIcon: {
    fontSize: 10,
  },
  playerName: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  spymasterName: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: gridPadding,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    width: cardSize,
    height: cardSize * 0.75,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderWidth: 2,
  },
  cardText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  assassinIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 12,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  endTurnButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  endTurnButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  spymasterBanner: {
    position: 'absolute',
    bottom: spacing.xl + 60,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  spymasterBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  spymasterBannerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  spymasterBannerSubtext: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shareButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  winnerBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  winnerText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  winnerSubtext: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.surfaceLight,
  },
  modalButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalButtonTextSecondary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  // Turn change modal styles
  turnModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '80%',
    maxWidth: 280,
  },
  turnModalMessage: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  turnModalSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  turnModalButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  turnModalButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
});
