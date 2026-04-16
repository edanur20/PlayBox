import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { ROLES, NARRATIONS, getRoleById } from '../data/werewolfRoles';

const PHASES = {
  NIGHT_START: 'night_start',
  CUPID: 'cupid',
  WEREWOLVES: 'werewolves',
  SEER: 'seer',
  WITCH: 'witch',
  NIGHT_END: 'night_end',
  DAY_ANNOUNCEMENT: 'day_announcement',
  DAY_DEBATE: 'day_debate',
  DAY_VOTE: 'day_vote',
  HUNTER_REVENGE: 'hunter_revenge',
  GAME_OVER: 'game_over',
};

// URLs pour la musique d'ambiance (musique libre de droits)
// Utilisation de sons atmosphériques de freesound.org (Creative Commons)
const AMBIENT_MUSIC = {
  // Son de vent mystérieux et effrayant
  night: 'https://cdn.freesound.org/previews/531/531947_7037-lq.mp3',
  day: null, // Silence le jour pour le débat
};

export default function WerewolfGameScreen({ navigation, route }) {
  const [players, setPlayers] = useState(route.params.players);
  const [phase, setPhase] = useState(null); // Start null to trigger initial effect
  const [nightNumber, setNightNumber] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [nightVictim, setNightVictim] = useState(null);
  const [witchSaveUsed, setWitchSaveUsed] = useState(false);
  const [witchKillUsed, setWitchKillUsed] = useState(false);
  const [witchKillTarget, setWitchKillTarget] = useState(null);
  const [lovers, setLovers] = useState([]);
  const [seerResult, setSeerResult] = useState(null);
  const [showSeerModal, setShowSeerModal] = useState(false);
  const [votes, setVotes] = useState({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [dayVictim, setDayVictim] = useState(null);
  const [hunterTarget, setHunterTarget] = useState(null);
  const [winner, setWinner] = useState(null);
  const [narrationText, setNarrationText] = useState('Préparation de la partie...');
  const [showActionModal, setShowActionModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const playersRef = useRef(players);
  const backgroundMusicRef = useRef(null);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const alivePlayers = players.filter(p => p.isAlive);
  const aliveWolves = alivePlayers.filter(p => p.role.team === 'wolves');
  const aliveVillagers = alivePlayers.filter(p => p.role.team === 'village');

  // Fonction pour démarrer/arrêter la musique d'ambiance
  const playBackgroundMusic = useCallback(async (isNight) => {
    try {
      // Arrêter la musique précédente si elle existe
      if (backgroundMusicRef.current) {
        await backgroundMusicRef.current.stopAsync();
        await backgroundMusicRef.current.unloadAsync();
        backgroundMusicRef.current = null;
      }

      // Ne pas jouer de musique si pas de source définie
      if (!isNight || !AMBIENT_MUSIC.night) return;

      // Créer et jouer la nouvelle musique
      const { sound } = await Audio.Sound.createAsync(
        { uri: AMBIENT_MUSIC.night },
        {
          isLooping: true,
          volume: 0.3,
          shouldPlay: true,
        }
      );
      backgroundMusicRef.current = sound;
    } catch (error) {
      console.log('Background music error:', error);
    }
  }, []);

  const stopBackgroundMusic = useCallback(async () => {
    try {
      if (backgroundMusicRef.current) {
        await backgroundMusicRef.current.stopAsync();
        await backgroundMusicRef.current.unloadAsync();
        backgroundMusicRef.current = null;
      }
    } catch (error) {
      console.log('Stop music error:', error);
    }
  }, []);

  // Initialize audio and test speech
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Test if speech is available
        const isSpeaking = await Speech.isSpeakingAsync();
        console.log('Speech available, currently speaking:', isSpeaking);

        // Get available voices
        const voices = await Speech.getAvailableVoicesAsync();
        console.log('Available voices:', voices.length);
        const frVoices = voices.filter(v => v.language && v.language.startsWith('fr'));
        console.log('French voices:', frVoices.map(v => v.identifier));

        setIsReady(true);
      } catch (error) {
        console.log('Audio init error:', error);
        setIsReady(true);
      }
    };
    initAudio();

    return () => {
      Speech.stop();
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  // Start game when ready
  useEffect(() => {
    if (isReady && phase === null) {
      setPhase(PHASES.NIGHT_START);
    }
  }, [isReady]);

  // Text-to-speech function with deep scary voice
  const speak = useCallback(async (text, onDone) => {
    setIsSpeaking(true);
    setNarrationText(text);

    try {
      // Stop any ongoing speech
      await Speech.stop();

      // Small delay to ensure stop completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get available voices - prefer a male French voice for scarier effect
      const voices = await Speech.getAvailableVoicesAsync();
      // Try to find a male French voice (usually contains 'male' or has specific identifiers)
      let frenchVoice = voices.find(v =>
        v.language.startsWith('fr') &&
        (v.identifier?.toLowerCase().includes('male') ||
         v.name?.toLowerCase().includes('male') ||
         v.identifier?.toLowerCase().includes('thomas') ||
         v.identifier?.toLowerCase().includes('nicolas'))
      );
      // Fallback to any French voice
      if (!frenchVoice) {
        frenchVoice = voices.find(v => v.language.startsWith('fr'));
      }

      await Speech.speak(text, {
        language: 'fr-FR',
        voice: frenchVoice?.identifier,
        rate: 0.75,      // Plus lent pour plus de suspense
        pitch: 0.6,      // Voix beaucoup plus grave (0.5-0.7 = très grave)
        onStart: () => {
          console.log('Speech started:', text.substring(0, 30));
        },
        onDone: () => {
          console.log('Speech done');
          setIsSpeaking(false);
          if (onDone) {
            setTimeout(onDone, 800); // Pause plus longue pour l'ambiance
          }
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setIsSpeaking(false);
          if (onDone) {
            setTimeout(onDone, 500);
          }
        },
      });
    } catch (error) {
      console.log('Speak error:', error);
      setIsSpeaking(false);
      if (onDone) {
        setTimeout(onDone, 1000);
      }
    }
  }, []);

  // Check win conditions
  const checkWinCondition = useCallback(() => {
    const currentPlayers = playersRef.current;
    const alive = currentPlayers.filter(p => p.isAlive);
    const wolves = alive.filter(p => p.role.team === 'wolves');
    const villagers = alive.filter(p => p.role.team === 'village');

    if (wolves.length === 0) {
      return 'village';
    }
    if (wolves.length >= villagers.length) {
      return 'wolves';
    }
    if (lovers.length === 2) {
      const lover1 = currentPlayers.find(p => p.id === lovers[0]);
      const lover2 = currentPlayers.find(p => p.id === lovers[1]);
      if (lover1?.isAlive && lover2?.isAlive && alive.length === 2) {
        return 'lovers';
      }
    }
    return null;
  }, [lovers]);

  // Kill a player
  const killPlayer = useCallback((playerId, checkLoversFlag = true) => {
    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.id === playerId) {
          return { ...p, isAlive: false };
        }
        return p;
      });

      // Check if killed player has a lover
      if (checkLoversFlag && lovers.includes(playerId)) {
        const loverId = lovers.find(id => id !== playerId);
        if (loverId !== undefined) {
          setTimeout(() => {
            setPlayers(prev2 => prev2.map(p => {
              if (p.id === loverId) {
                return { ...p, isAlive: false };
              }
              return p;
            }));
          }, 1500);
        }
      }

      return updated;
    });
  }, [lovers]);

  // Navigation back to home
  const goToHome = useCallback(() => {
    Speech.stop();
    stopBackgroundMusic();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation, stopBackgroundMusic]);

  // Phase handlers
  const handleNightStart = useCallback(() => {
    // Démarrer la musique d'ambiance nocturne
    playBackgroundMusic(true);

    speak(NARRATIONS.nightStart, () => {
      const cupid = alivePlayers.find(p => p.roleId === 'cupid');
      if (nightNumber === 1 && cupid) {
        setPhase(PHASES.CUPID);
      } else {
        setPhase(PHASES.WEREWOLVES);
      }
    });
  }, [speak, alivePlayers, nightNumber, playBackgroundMusic]);

  const handleCupidPhase = useCallback(() => {
    speak(NARRATIONS.cupidWakes, () => {
      setShowActionModal(true);
    });
  }, [speak]);

  const handleCupidSelection = useCallback(() => {
    if (selectedPlayers.length === 2) {
      setLovers(selectedPlayers);
      setPlayers(prev => prev.map(p => {
        if (selectedPlayers.includes(p.id)) {
          return { ...p, isInLove: true, loverId: selectedPlayers.find(id => id !== p.id) };
        }
        return p;
      }));
      setSelectedPlayers([]);
      setShowActionModal(false);
      speak(NARRATIONS.cupidSleeps, () => {
        setPhase(PHASES.WEREWOLVES);
      });
    }
  }, [selectedPlayers, speak]);

  const handleWerewolvesPhase = useCallback(() => {
    speak(NARRATIONS.werewolvesWake, () => {
      setShowActionModal(true);
    });
  }, [speak]);

  const handleWerewolvesSelection = useCallback(() => {
    if (selectedPlayers.length === 1) {
      setNightVictim(selectedPlayers[0]);
      setSelectedPlayers([]);
      setShowActionModal(false);
      speak(NARRATIONS.werewolvesSleep, () => {
        const seer = alivePlayers.find(p => p.roleId === 'seer');
        if (seer) {
          setPhase(PHASES.SEER);
        } else {
          const witch = alivePlayers.find(p => p.roleId === 'witch');
          if (witch && (!witchSaveUsed || !witchKillUsed)) {
            setPhase(PHASES.WITCH);
          } else {
            setPhase(PHASES.NIGHT_END);
          }
        }
      });
    }
  }, [selectedPlayers, speak, alivePlayers, witchSaveUsed, witchKillUsed]);

  const handleSeerPhase = useCallback(() => {
    speak(NARRATIONS.seerWakes, () => {
      setShowActionModal(true);
    });
  }, [speak]);

  const handleSeerSelection = useCallback(() => {
    if (selectedPlayers.length === 1) {
      const targetPlayer = players.find(p => p.id === selectedPlayers[0]);
      setSeerResult({
        player: targetPlayer,
        isWolf: targetPlayer.role.team === 'wolves',
      });
      setShowSeerModal(true);
      setSelectedPlayers([]);
      setShowActionModal(false);
    }
  }, [selectedPlayers, players]);

  const closeSeerModal = useCallback(() => {
    setShowSeerModal(false);
    setSeerResult(null);
    speak(NARRATIONS.seerSleeps, () => {
      const witch = alivePlayers.find(p => p.roleId === 'witch');
      if (witch && (!witchSaveUsed || !witchKillUsed)) {
        setPhase(PHASES.WITCH);
      } else {
        setPhase(PHASES.NIGHT_END);
      }
    });
  }, [speak, alivePlayers, witchSaveUsed, witchKillUsed]);

  const handleWitchPhase = useCallback(() => {
    speak(NARRATIONS.witchWakes, () => {
      setTimeout(() => {
        setNarrationText(NARRATIONS.witchVictim);
        setShowActionModal(true);
      }, 1000);
    });
  }, [speak]);

  const handleWitchSave = useCallback(() => {
    setWitchSaveUsed(true);
    setNightVictim(null);
  }, []);

  const handleWitchKill = useCallback((playerId) => {
    if (!witchKillUsed) {
      setWitchKillUsed(true);
      setWitchKillTarget(playerId);
    }
  }, [witchKillUsed]);

  const handleWitchDone = useCallback(() => {
    setShowActionModal(false);
    speak(NARRATIONS.witchSleeps, () => {
      setPhase(PHASES.NIGHT_END);
    });
  }, [speak]);

  const handleNightEnd = useCallback(() => {
    // Process night deaths
    if (nightVictim) {
      killPlayer(nightVictim);
    }
    if (witchKillTarget) {
      killPlayer(witchKillTarget);
    }

    setTimeout(() => {
      setPhase(PHASES.DAY_ANNOUNCEMENT);
    }, 1500);
  }, [nightVictim, witchKillTarget, killPlayer]);

  const handleDayAnnouncement = useCallback(() => {
    // Arrêter la musique de nuit quand le jour se lève
    stopBackgroundMusic();

    speak(NARRATIONS.dayStart, () => {
      setTimeout(() => {
        if (nightVictim) {
          const victim = playersRef.current.find(p => p.id === nightVictim);
          if (victim) {
            const text = `${victim.name} ${NARRATIONS.oneVictim}`;
            speak(text, () => {
              if (victim.roleId === 'hunter') {
                setPhase(PHASES.HUNTER_REVENGE);
                return;
              }

              const winResult = checkWinCondition();
              if (winResult) {
                setWinner(winResult);
                setPhase(PHASES.GAME_OVER);
              } else {
                setPhase(PHASES.DAY_DEBATE);
              }
            });
          }
        } else {
          speak(NARRATIONS.noVictim, () => {
            const winResult = checkWinCondition();
            if (winResult) {
              setWinner(winResult);
              setPhase(PHASES.GAME_OVER);
            } else {
              setPhase(PHASES.DAY_DEBATE);
            }
          });
        }
      }, 1000);
    });
  }, [speak, nightVictim, checkWinCondition, stopBackgroundMusic]);

  const handleDayDebate = useCallback(() => {
    setNarrationText("Débattez entre vous pour trouver les Loups-Garous !");
  }, []);

  const startVote = useCallback(() => {
    setPhase(PHASES.DAY_VOTE);
    setVotes({});
    setCurrentVoterIndex(0);
    speak(NARRATIONS.voteTime);
  }, [speak]);

  const handleVote = useCallback((votedPlayerId) => {
    const currentAlivePlayers = playersRef.current.filter(p => p.isAlive);
    const voter = currentAlivePlayers[currentVoterIndex];
    const newVotes = { ...votes, [voter.id]: votedPlayerId };
    setVotes(newVotes);

    if (currentVoterIndex < currentAlivePlayers.length - 1) {
      setCurrentVoterIndex(currentVoterIndex + 1);
    } else {
      // Count votes
      const voteCounts = {};
      Object.values(newVotes).forEach(votedId => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
      });

      let maxVotes = 0;
      let eliminated = null;
      Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          eliminated = parseInt(playerId);
        }
      });

      if (eliminated !== null) {
        setDayVictim(eliminated);
        const eliminatedPlayer = playersRef.current.find(p => p.id === eliminated);
        const text = `${eliminatedPlayer.name} ${NARRATIONS.execution}`;

        killPlayer(eliminated);

        speak(text, () => {
          if (eliminatedPlayer.roleId === 'hunter') {
            setPhase(PHASES.HUNTER_REVENGE);
            return;
          }

          setTimeout(() => {
            const winResult = checkWinCondition();
            if (winResult) {
              setWinner(winResult);
              setPhase(PHASES.GAME_OVER);
            } else {
              setNightNumber(prev => prev + 1);
              setNightVictim(null);
              setDayVictim(null);
              setWitchKillTarget(null);
              setPhase(PHASES.NIGHT_START);
            }
          }, 1500);
        });
      }
    }
  }, [currentVoterIndex, votes, killPlayer, speak, checkWinCondition]);

  const handleHunterRevenge = useCallback(() => {
    speak(NARRATIONS.hunterDeath, () => {
      setShowActionModal(true);
    });
  }, [speak]);

  const handleHunterSelection = useCallback(() => {
    if (selectedPlayers.length === 1) {
      setHunterTarget(selectedPlayers[0]);
      killPlayer(selectedPlayers[0]);
      setSelectedPlayers([]);
      setShowActionModal(false);

      setTimeout(() => {
        const winResult = checkWinCondition();
        if (winResult) {
          setWinner(winResult);
          setPhase(PHASES.GAME_OVER);
        } else {
          setNightNumber(prev => prev + 1);
          setNightVictim(null);
          setDayVictim(null);
          setWitchKillTarget(null);
          setPhase(PHASES.NIGHT_START);
        }
      }, 2000);
    }
  }, [selectedPlayers, killPlayer, checkWinCondition]);

  // Phase effect handler
  useEffect(() => {
    if (!phase) return;

    switch (phase) {
      case PHASES.NIGHT_START:
        handleNightStart();
        break;
      case PHASES.CUPID:
        handleCupidPhase();
        break;
      case PHASES.WEREWOLVES:
        handleWerewolvesPhase();
        break;
      case PHASES.SEER:
        handleSeerPhase();
        break;
      case PHASES.WITCH:
        handleWitchPhase();
        break;
      case PHASES.NIGHT_END:
        handleNightEnd();
        break;
      case PHASES.DAY_ANNOUNCEMENT:
        handleDayAnnouncement();
        break;
      case PHASES.DAY_DEBATE:
        handleDayDebate();
        break;
      case PHASES.HUNTER_REVENGE:
        handleHunterRevenge();
        break;
    }
  }, [phase]);

  const togglePlayerSelection = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      const maxSelection = phase === PHASES.CUPID ? 2 : 1;
      if (selectedPlayers.length < maxSelection) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        setSelectedPlayers([playerId]);
      }
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case PHASES.NIGHT_START:
      case PHASES.CUPID:
      case PHASES.WEREWOLVES:
      case PHASES.SEER:
      case PHASES.WITCH:
      case PHASES.NIGHT_END:
        return `Nuit ${nightNumber}`;
      case PHASES.DAY_ANNOUNCEMENT:
      case PHASES.DAY_DEBATE:
      case PHASES.DAY_VOTE:
        return `Jour ${nightNumber}`;
      case PHASES.HUNTER_REVENGE:
        return 'Chasseur';
      case PHASES.GAME_OVER:
        return 'Fin de partie';
      default:
        return 'Chargement...';
    }
  };

  const isNightPhase = [
    PHASES.NIGHT_START,
    PHASES.CUPID,
    PHASES.WEREWOLVES,
    PHASES.SEER,
    PHASES.WITCH,
    PHASES.NIGHT_END,
  ].includes(phase);

  const getActionTitle = () => {
    switch (phase) {
      case PHASES.CUPID:
        return 'Cupidon, choisissez 2 amoureux';
      case PHASES.WEREWOLVES:
        return 'Loups-Garous, choisissez une victime';
      case PHASES.SEER:
        return 'Voyante, choisissez un joueur';
      case PHASES.WITCH:
        return 'Sorcière, utilisez vos potions';
      case PHASES.HUNTER_REVENGE:
        return 'Chasseur, qui emportez-vous ?';
      default:
        return '';
    }
  };

  const getConfirmButtonText = () => {
    switch (phase) {
      case PHASES.CUPID:
        return selectedPlayers.length === 2 ? 'Valider les amoureux' : 'Choisissez 2 joueurs';
      case PHASES.WEREWOLVES:
        return selectedPlayers.length === 1 ? 'Dévorer' : 'Choisissez une victime';
      case PHASES.SEER:
        return selectedPlayers.length === 1 ? 'Découvrir' : 'Choisissez un joueur';
      case PHASES.HUNTER_REVENGE:
        return selectedPlayers.length === 1 ? 'Tirer' : 'Choisissez une cible';
      default:
        return 'Valider';
    }
  };

  const handleConfirmAction = () => {
    switch (phase) {
      case PHASES.CUPID:
        handleCupidSelection();
        break;
      case PHASES.WEREWOLVES:
        handleWerewolvesSelection();
        break;
      case PHASES.SEER:
        handleSeerSelection();
        break;
      case PHASES.HUNTER_REVENGE:
        handleHunterSelection();
        break;
    }
  };

  const getSelectablePlayers = () => {
    const currentAlivePlayers = players.filter(p => p.isAlive);
    switch (phase) {
      case PHASES.CUPID:
        return currentAlivePlayers;
      case PHASES.WEREWOLVES:
        return currentAlivePlayers.filter(p => p.role.team !== 'wolves');
      case PHASES.SEER:
        const seer = currentAlivePlayers.find(p => p.roleId === 'seer');
        return currentAlivePlayers.filter(p => p.id !== seer?.id);
      case PHASES.WITCH:
        return currentAlivePlayers;
      case PHASES.HUNTER_REVENGE:
        const hunter = players.find(p => p.roleId === 'hunter');
        return currentAlivePlayers.filter(p => p.id !== hunter?.id);
      default:
        return currentAlivePlayers;
    }
  };

  const currentAlivePlayers = players.filter(p => p.isAlive);

  return (
    <SafeAreaView style={[styles.container, isNightPhase && styles.nightContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.phaseTitle}>{getPhaseTitle()}</Text>
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🔊</Text>
          </View>
        )}
        <View style={styles.counters}>
          <View style={[styles.counter, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.counterText, { color: colors.success }]}>
              {aliveVillagers.length} Villageois
            </Text>
          </View>
          <View style={[styles.counter, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.counterText, { color: colors.error }]}>
              {aliveWolves.length} Loups
            </Text>
          </View>
        </View>
      </View>

      {/* Narration */}
      <View style={styles.narrationContainer}>
        <Text style={styles.narrationText}>{narrationText}</Text>
      </View>

      {/* Day Phase Content */}
      {phase === PHASES.DAY_DEBATE && (
        <View style={styles.debateContainer}>
          <ScrollView style={styles.playersList}>
            {currentAlivePlayers.map(player => (
              <View key={player.id} style={styles.playerCard}>
                <Text style={styles.playerCardName}>{player.name}</Text>
                {player.isInLove && <Text style={styles.loveIcon}>💕</Text>}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.voteButton} onPress={startVote}>
            <Text style={styles.voteButtonText}>Passer au vote</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vote Phase */}
      {phase === PHASES.DAY_VOTE && (
        <View style={styles.voteContainer}>
          <Text style={styles.voterName}>
            {currentAlivePlayers[currentVoterIndex]?.name} vote :
          </Text>
          <ScrollView style={styles.voteList}>
            {currentAlivePlayers
              .filter(p => p.id !== currentAlivePlayers[currentVoterIndex]?.id)
              .map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.voteOption}
                  onPress={() => handleVote(player.id)}
                >
                  <Text style={styles.voteOptionText}>{player.name}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {/* Dead Players */}
      {!isNightPhase && (
        <View style={styles.deadSection}>
          <Text style={styles.deadTitle}>Morts ({players.filter(p => !p.isAlive).length})</Text>
          <View style={styles.deadList}>
            {players.filter(p => !p.isAlive).map(player => (
              <View key={player.id} style={styles.deadPlayer}>
                <Text style={styles.deadPlayerEmoji}>{player.role.emoji}</Text>
                <Text style={styles.deadPlayerName}>{player.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Modal for Night Phases */}
      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <Text style={styles.actionTitle}>{getActionTitle()}</Text>

            {phase === PHASES.WITCH ? (
              <View style={styles.witchContainer}>
                {nightVictim && !witchSaveUsed && (
                  <View style={styles.witchSection}>
                    <Text style={styles.witchVictimName}>
                      Victime : {players.find(p => p.id === nightVictim)?.name}
                    </Text>
                    <TouchableOpacity
                      style={[styles.witchButton, { backgroundColor: colors.success }]}
                      onPress={handleWitchSave}
                    >
                      <Text style={styles.witchButtonText}>💚 Sauver</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {nightVictim && witchSaveUsed && (
                  <Text style={styles.witchUsedText}>Potion de vie déjà utilisée</Text>
                )}
                {!nightVictim && (
                  <Text style={styles.witchNoVictim}>Personne n'a été attaqué (ou sauvé)</Text>
                )}

                {!witchKillUsed && (
                  <View style={styles.witchSection}>
                    <Text style={styles.witchLabel}>Potion de mort :</Text>
                    <ScrollView style={styles.witchTargets} horizontal showsHorizontalScrollIndicator={false}>
                      {currentAlivePlayers.map(player => (
                        <TouchableOpacity
                          key={player.id}
                          style={[
                            styles.witchTarget,
                            witchKillTarget === player.id && styles.witchTargetSelected
                          ]}
                          onPress={() => handleWitchKill(player.id)}
                        >
                          <Text style={styles.witchTargetText}>{player.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {witchKillUsed && !witchKillTarget && (
                  <Text style={styles.witchUsedText}>Potion de mort déjà utilisée</Text>
                )}

                <TouchableOpacity
                  style={styles.witchDoneButton}
                  onPress={handleWitchDone}
                >
                  <Text style={styles.witchDoneButtonText}>Terminer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView style={styles.actionPlayersList}>
                  {getSelectablePlayers().map(player => (
                    <TouchableOpacity
                      key={player.id}
                      style={[
                        styles.actionPlayerCard,
                        selectedPlayers.includes(player.id) && styles.actionPlayerCardSelected
                      ]}
                      onPress={() => togglePlayerSelection(player.id)}
                    >
                      <Text style={styles.actionPlayerName}>{player.name}</Text>
                      {selectedPlayers.includes(player.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (phase === PHASES.CUPID ? selectedPlayers.length !== 2 : selectedPlayers.length !== 1) && styles.confirmButtonDisabled
                  ]}
                  onPress={handleConfirmAction}
                  disabled={phase === PHASES.CUPID ? selectedPlayers.length !== 2 : selectedPlayers.length !== 1}
                >
                  <Text style={styles.confirmButtonText}>{getConfirmButtonText()}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Seer Result Modal */}
      <Modal visible={showSeerModal} transparent animationType="fade">
        <View style={styles.seerModalOverlay}>
          <View style={styles.seerModalContent}>
            <Text style={styles.seerModalTitle}>Résultat de la Voyante</Text>
            {seerResult && (
              <>
                <Text style={styles.seerPlayerName}>{seerResult.player.name}</Text>
                <View style={[
                  styles.seerResult,
                  { backgroundColor: seerResult.isWolf ? colors.error + '20' : colors.success + '20' }
                ]}>
                  <Text style={styles.seerResultEmoji}>
                    {seerResult.isWolf ? '🐺' : '👤'}
                  </Text>
                  <Text style={[
                    styles.seerResultText,
                    { color: seerResult.isWolf ? colors.error : colors.success }
                  ]}>
                    {seerResult.isWolf ? 'Loup-Garou !' : 'Innocent'}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity style={styles.seerCloseButton} onPress={closeSeerModal}>
              <Text style={styles.seerCloseButtonText}>Compris</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal visible={phase === PHASES.GAME_OVER} transparent animationType="fade">
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverEmoji}>
              {winner === 'wolves' ? '🐺' : winner === 'lovers' ? '💕' : '🏘️'}
            </Text>
            <Text style={styles.gameOverTitle}>
              {winner === 'wolves' && 'Les Loups-Garous gagnent !'}
              {winner === 'village' && 'Le Village gagne !'}
              {winner === 'lovers' && 'Les Amoureux gagnent !'}
            </Text>
            <Text style={styles.gameOverSubtitle}>
              {winner === 'wolves' && NARRATIONS.wolvesWin}
              {winner === 'village' && NARRATIONS.villageWins}
              {winner === 'lovers' && NARRATIONS.loversWin}
            </Text>

            <ScrollView style={styles.gameOverRolesScroll}>
              <View style={styles.gameOverRoles}>
                <Text style={styles.gameOverRolesTitle}>Rôles révélés :</Text>
                {players.map(player => (
                  <View key={player.id} style={styles.gameOverPlayer}>
                    <Text style={styles.gameOverPlayerEmoji}>{player.role.emoji}</Text>
                    <Text style={[
                      styles.gameOverPlayerName,
                      !player.isAlive && styles.gameOverPlayerDead
                    ]}>
                      {player.name}
                    </Text>
                    <Text style={[
                      styles.gameOverPlayerRole,
                      { color: player.role.color }
                    ]}>
                      {player.role.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

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
    backgroundColor: '#fef3c7',
  },
  nightContainer: {
    backgroundColor: '#1e1b4b',
  },
  header: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  phaseTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  speakingIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  speakingText: {
    fontSize: 24,
  },
  counters: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  counter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  counterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  narrationContainer: {
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  narrationText: {
    fontSize: fontSize.lg,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  debateContainer: {
    flex: 1,
    padding: spacing.md,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  playerCardName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  loveIcon: {
    fontSize: 20,
  },
  voteButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  voteButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  voteContainer: {
    flex: 1,
    padding: spacing.md,
  },
  voterName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  voteList: {
    flex: 1,
  },
  voteOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  voteOptionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  deadSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: borderRadius.md,
  },
  deadTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  deadList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  deadPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  deadPlayerEmoji: {
    fontSize: 16,
  },
  deadPlayerName: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  actionModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  actionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionPlayersList: {
    maxHeight: 400,
  },
  actionPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actionPlayerCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  actionPlayerName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  checkmark: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  witchContainer: {
    gap: spacing.lg,
  },
  witchSection: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  witchVictimName: {
    fontSize: fontSize.lg,
    color: colors.error,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  witchButton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  witchButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  witchUsedText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  witchNoVictim: {
    fontSize: fontSize.md,
    color: colors.success,
    textAlign: 'center',
    backgroundColor: colors.success + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  witchLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  witchTargets: {
    flexDirection: 'row',
  },
  witchTarget: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  witchTargetSelected: {
    backgroundColor: colors.error + '30',
    borderColor: colors.error,
  },
  witchTargetText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  witchDoneButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  witchDoneButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  seerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  seerModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  seerModalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  seerPlayerName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  seerResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  seerResultEmoji: {
    fontSize: 32,
  },
  seerResultText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  seerCloseButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  seerCloseButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  gameOverOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  gameOverContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxHeight: '90%',
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  gameOverTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gameOverSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  gameOverRolesScroll: {
    maxHeight: 250,
    width: '100%',
  },
  gameOverRoles: {
    width: '100%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  gameOverRolesTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  gameOverPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  gameOverPlayerEmoji: {
    fontSize: 20,
  },
  gameOverPlayerName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  gameOverPlayerDead: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  gameOverPlayerRole: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  gameOverButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  gameOverButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
