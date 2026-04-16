import React, { useState, useEffect, useRef } from 'react';
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
import { Audio } from 'expo-av';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../config/theme';
import { getRandomTheme } from '../data/bombeData';

const MODE_COLORS = {
  classic: '#f59e0b',
  spicy: '#ef4444',
  chaos: '#8b5cf6',
};

const MODE_NAMES = {
  classic: 'Classique',
  spicy: 'Spicy',
  chaos: 'Chaos',
};

export default function BombeGameScreen({ navigation, route }) {
  const { mode, timerMode } = route.params;

  const [gamePhase, setGamePhase] = useState('ready'); // ready, showTheme, playing, exploded
  const [currentTheme, setCurrentTheme] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [round, setRound] = useState(1);
  const [explosions, setExplosions] = useState(0);
  const [usedThemes, setUsedThemes] = useState([]);
  const [passCount, setPassCount] = useState(0);

  const timerRef = useRef(null);
  const tickSoundRef = useRef(null);
  const explosionSoundRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bombScaleAnim = useRef(new Animated.Value(1)).current;

  const modeColor = MODE_COLORS[mode];

  // Calculer le temps en fonction du mode (CACHÉ au joueur)
  const getRandomTime = () => {
    switch (timerMode) {
      case 'short':
        return Math.floor(Math.random() * 11) + 5; // 5-15 sec
      case 'medium':
        return Math.floor(Math.random() * 26) + 5; // 5-30 sec
      case 'long':
        return Math.floor(Math.random() * 31) + 30; // 30-60 sec
      default: // random
        return Math.floor(Math.random() * 41) + 5; // 5-45 sec
    }
  };

  // Charger les sons
  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
          interruptionModeIOS: 1,
          interruptionModeAndroid: 1,
        });

        // Son de tic-tac (URL externe)
        const { sound: tickSound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.freesound.org/previews/263/263133_2064400-lq.mp3' },
          { shouldPlay: false, volume: 0.6, isLooping: true }
        );
        tickSoundRef.current = tickSound;
        console.log('Tick sound loaded');

      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };
    loadSounds();

    return () => {
      if (tickSoundRef.current) tickSoundRef.current.unloadAsync();
      if (explosionSoundRef.current) explosionSoundRef.current.unloadAsync();
    };
  }, []);

  const startTickSound = async () => {
    try {
      if (tickSoundRef.current) {
        await tickSoundRef.current.setPositionAsync(0);
        await tickSoundRef.current.playAsync();
        console.log('Tick sound started!');
      }
    } catch (error) {
      console.log('Tick sound error:', error);
    }
  };

  const stopTickSound = async () => {
    try {
      if (tickSoundRef.current) {
        await tickSoundRef.current.stopAsync();
      }
    } catch (error) {
      console.log('Stop tick sound error:', error);
    }
  };

  const playExplosionSound = async () => {
    try {
      await stopTickSound();
      // Pas de son d'explosion pour l'instant
    } catch (error) {
      console.log('Explosion sound error:', error);
    }
  };

  // Animation de pulsation de la bombe
  const startBombPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bombScaleAnim, {
          toValue: 1.15,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bombScaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Timer (CACHÉ) - pas de vibrations pour ne pas donner d'indices
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gamePhase === 'playing' && timeLeft === 0) {
      // EXPLOSION !
      handleExplosion();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gamePhase, timeLeft]);

  const handleExplosion = async () => {
    setGamePhase('exploded');
    await playExplosionSound();
    Vibration.vibrate([0, 300, 100, 300, 100, 300]);
    setExplosions(prev => prev + 1);

    // Animation d'explosion
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const prepareRound = () => {
    setPassCount(0);

    // Obtenir un nouveau thème non utilisé
    let theme;
    let attempts = 0;
    do {
      theme = getRandomTheme(mode);
      attempts++;
    } while (usedThemes.includes(theme) && attempts < 50);

    setCurrentTheme(theme);
    setUsedThemes(prev => [...prev, theme]);
    setGamePhase('showTheme');
  };

  const startGame = async () => {
    const time = getRandomTime();
    setTimeLeft(time);
    setGamePhase('playing');

    // Démarrer les animations et sons
    startBombPulse();
    await startTickSound();
  };

  const handlePass = () => {
    Vibration.vibrate(50);
    setPassCount(prev => prev + 1);

    // Animation de passage
    Animated.sequence([
      Animated.timing(bombScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bombScaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bombScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNextRound = async () => {
    await stopTickSound();
    setRound(prev => prev + 1);
    setGamePhase('ready');
    shakeAnim.setValue(0);
    scaleAnim.setValue(1);
    pulseAnim.setValue(1);
    bombScaleAnim.setValue(1);
  };

  const handleQuit = async () => {
    await stopTickSound();
    Alert.alert(
      'Quitter la partie',
      'Êtes-vous sûr de vouloir quitter ?',
      [
        { text: 'Non', style: 'cancel', onPress: () => {
          if (gamePhase === 'playing') startTickSound();
        }},
        { text: 'Oui', onPress: () => navigation.goBack() },
      ]
    );
  };

  // Écran de démarrage
  if (gamePhase === 'ready') {
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
            <Text style={styles.statsText}>💥 {explosions}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.roundText}>Manche {round}</Text>
          <Text style={styles.bombEmoji}>💣</Text>
          <Text style={styles.readyTitle}>Prêts ?</Text>
          <Text style={styles.readySubtitle}>
            Un thème va apparaître.{'\n'}
            Chacun donne un mot et passe la bombe !{'\n'}
            Celui qui l'a quand elle explose PERD !
          </Text>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: modeColor }]}
            onPress={prepareRound}
          >
            <Text style={styles.startButtonText}>🎲 Voir le thème</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Écran de lecture du thème (avant le chrono)
  if (gamePhase === 'showTheme') {
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
            <Text style={styles.statsText}>💥 {explosions}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.roundText}>Manche {round}</Text>

          <Text style={styles.readThemeTitle}>📖 Lisez le thème !</Text>

          <View style={[styles.themeContainerBig, { borderColor: modeColor }]}>
            <Text style={styles.themeLabelBig}>THÈME</Text>
            <Text style={styles.themeTextBig}>{currentTheme}</Text>
          </View>

          <Text style={styles.readThemeHint}>
            Assurez-vous que tout le monde a bien compris le thème avant de lancer la bombe !
          </Text>

          <TouchableOpacity
            style={[styles.startBombButton, { backgroundColor: modeColor }]}
            onPress={startGame}
          >
            <Text style={styles.startBombButtonText}>💣 Allumer la mèche !</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Écran d'explosion
  if (gamePhase === 'exploded') {
    return (
      <SafeAreaView style={[styles.container, styles.explodedContainer]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.modeBadge, { backgroundColor: modeColor }]}>
            <Text style={styles.modeBadgeText}>{MODE_NAMES[mode]}</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>💥 {explosions}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.Text
            style={[
              styles.explosionEmoji,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            💥
          </Animated.Text>
          <Text style={styles.explosionTitle}>BOOM !</Text>
          <Text style={styles.explosionSubtitle}>
            La bombe a explosé après {passCount} passages !{'\n'}
            Le perdant subit son gage ! 😈
          </Text>

          <View style={styles.themeReminder}>
            <Text style={styles.themeReminderLabel}>Le thème était :</Text>
            <Text style={styles.themeReminderText}>{currentTheme}</Text>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: modeColor }]}
            onPress={handleNextRound}
          >
            <Text style={styles.nextButtonText}>Manche suivante</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Écran de jeu - TIMER CACHÉ
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
          <Text style={styles.statsText}>🔄 {passCount}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Bombe animée - PAS DE TIMER VISIBLE */}
        <Animated.View
          style={[
            styles.bombContainer,
            { transform: [{ scale: bombScaleAnim }] },
          ]}
        >
          <Text style={styles.bombEmojiPlaying}>💣</Text>
          <Text style={styles.bombWarning}>⚠️ PASSE VITE ! ⚠️</Text>
        </Animated.View>

        {/* Thème */}
        <View style={[styles.themeContainer, { borderColor: modeColor }]}>
          <Text style={styles.themeLabel}>THÈME</Text>
          <Text style={styles.themeText}>{currentTheme}</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          Cite un mot sur ce thème puis passe le téléphone !
        </Text>

        {/* Bouton Passer */}
        <TouchableOpacity
          style={[styles.passButton, { backgroundColor: modeColor }]}
          onPress={handlePass}
        >
          <Text style={styles.passButtonText}>✅ PASSÉ ! →</Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>
          Tu ne sais pas quand ça va exploser... 💀
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
  explodedContainer: {
    backgroundColor: '#1a0000',
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
  roundText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  bombEmoji: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  readyTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  readySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  startButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  startButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  readThemeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  themeContainerBig: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 3,
    alignItems: 'center',
  },
  themeLabelBig: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  themeTextBig: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  readThemeHint: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  startBombButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  startBombButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  bombContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bombEmojiPlaying: {
    fontSize: 80,
  },
  bombWarning: {
    fontSize: fontSize.md,
    color: '#ef4444',
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  themeContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 3,
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  themeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  instructionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  passButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  passButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  hintText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  explosionEmoji: {
    fontSize: 120,
    marginBottom: spacing.lg,
  },
  explosionTitle: {
    fontSize: 64,
    fontWeight: fontWeight.bold,
    color: '#ef4444',
    marginBottom: spacing.md,
  },
  explosionSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  themeReminder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  themeReminderLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  themeReminderText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  nextButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
});
