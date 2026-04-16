// Werewolf game roles configuration

export const ROLES = {
  WEREWOLF: {
    id: 'werewolf',
    name: 'Loup-Garou',
    emoji: '🐺',
    team: 'wolves',
    description: 'Chaque nuit, dévorez un villageois avec les autres loups.',
    color: '#dc2626',
    priority: 1, // Order in night phase
  },
  VILLAGER: {
    id: 'villager',
    name: 'Villageois',
    emoji: '👤',
    team: 'village',
    description: 'Trouvez et éliminez tous les Loups-Garous.',
    color: '#22c55e',
    priority: null, // No night action
  },
  SEER: {
    id: 'seer',
    name: 'Voyante',
    emoji: '🔮',
    team: 'village',
    description: 'Chaque nuit, découvrez le rôle d\'un joueur.',
    color: '#8b5cf6',
    priority: 2,
  },
  WITCH: {
    id: 'witch',
    name: 'Sorcière',
    emoji: '🧙‍♀️',
    team: 'village',
    description: 'Vous avez une potion de vie et une potion de mort.',
    color: '#ec4899',
    priority: 3,
  },
  HUNTER: {
    id: 'hunter',
    name: 'Chasseur',
    emoji: '🏹',
    team: 'village',
    description: 'Si vous mourez, vous emportez quelqu\'un avec vous.',
    color: '#f59e0b',
    priority: null, // Special: triggers on death
  },
  CUPID: {
    id: 'cupid',
    name: 'Cupidon',
    emoji: '💘',
    team: 'village',
    description: 'La première nuit, désignez deux amoureux.',
    color: '#f472b6',
    priority: 0, // First night only
  },
  LITTLE_GIRL: {
    id: 'little_girl',
    name: 'Petite Fille',
    emoji: '👧',
    team: 'village',
    description: 'Vous pouvez espionner les loups la nuit, mais attention...',
    color: '#fbbf24',
    priority: null,
  },
  THIEF: {
    id: 'thief',
    name: 'Voleur',
    emoji: '🦹',
    team: 'village',
    description: 'La première nuit, choisissez parmi 2 cartes supplémentaires.',
    color: '#6b7280',
    priority: -1, // Before everyone on first night
  },
};

// Role presets based on player count
export const getRolePreset = (playerCount) => {
  const presets = {
    4: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '1 Loup, 1 Voyante, 2 Villageois',
    },
    5: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.WITCH.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '1 Loup, 1 Voyante, 1 Sorcière, 2 Villageois',
    },
    6: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.WITCH.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '2 Loups, 1 Voyante, 1 Sorcière, 2 Villageois',
    },
    7: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.WITCH.id,
        ROLES.HUNTER.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '2 Loups, 1 Voyante, 1 Sorcière, 1 Chasseur, 2 Villageois',
    },
    8: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.WITCH.id,
        ROLES.HUNTER.id,
        ROLES.CUPID.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '2 Loups, Voyante, Sorcière, Chasseur, Cupidon, 2 Villageois',
    },
    9: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.WITCH.id,
        ROLES.HUNTER.id,
        ROLES.CUPID.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '3 Loups, Voyante, Sorcière, Chasseur, Cupidon, 2 Villageois',
    },
    10: {
      roles: [
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.WEREWOLF.id,
        ROLES.SEER.id,
        ROLES.WITCH.id,
        ROLES.HUNTER.id,
        ROLES.CUPID.id,
        ROLES.LITTLE_GIRL.id,
        ROLES.VILLAGER.id,
        ROLES.VILLAGER.id,
      ],
      description: '3 Loups, Voyante, Sorcière, Chasseur, Cupidon, Petite Fille, 2 Villageois',
    },
  };

  // For counts not in presets, generate based on closest lower count
  if (presets[playerCount]) {
    return presets[playerCount];
  }

  // Default fallback for larger games
  if (playerCount > 10) {
    const wolvesCount = Math.floor(playerCount / 3);
    const roles = [];

    for (let i = 0; i < wolvesCount; i++) {
      roles.push(ROLES.WEREWOLF.id);
    }
    roles.push(ROLES.SEER.id);
    roles.push(ROLES.WITCH.id);
    roles.push(ROLES.HUNTER.id);
    roles.push(ROLES.CUPID.id);

    while (roles.length < playerCount) {
      roles.push(ROLES.VILLAGER.id);
    }

    return {
      roles,
      description: `${wolvesCount} Loups, rôles spéciaux, Villageois`,
    };
  }

  return presets[6]; // Default fallback
};

export const getRoleById = (roleId) => {
  return Object.values(ROLES).find(role => role.id === roleId);
};

// Night phase narration texts
export const NARRATIONS = {
  nightStart: "Le village s'endort... Fermez tous les yeux.",
  werewolvesWake: "Les Loups-Garous se réveillent et choisissent une victime.",
  werewolvesSleep: "Les Loups-Garous se rendorment.",
  seerWakes: "La Voyante se réveille et désigne un joueur à découvrir.",
  seerSleeps: "La Voyante se rendort.",
  witchWakes: "La Sorcière se réveille.",
  witchVictim: "Voici la victime des loups cette nuit.",
  witchSleeps: "La Sorcière se rendort.",
  cupidWakes: "Cupidon se réveille et désigne deux amoureux.",
  cupidSleeps: "Cupidon se rendort.",
  dayStart: "Le soleil se lève sur le village...",
  noVictim: "Miracle ! Personne n'est mort cette nuit.",
  oneVictim: "a été dévoré par les Loups-Garous.",
  multipleVictims: "ont été tués cette nuit.",
  voteTime: "Il est temps de voter pour éliminer un suspect.",
  execution: "a été éliminé par le village.",
  hunterDeath: "Le Chasseur tire une dernière flèche ! Qui emporte-t-il ?",
  villageWins: "Victoire ! Tous les Loups-Garous ont été éliminés !",
  wolvesWin: "Les Loups-Garous ont gagné ! Le village est décimé.",
  loversWin: "Les Amoureux ont survécu et remportent la partie !",
};
