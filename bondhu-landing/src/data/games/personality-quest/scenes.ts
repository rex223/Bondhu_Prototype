import { GameScene } from '@/types/game'

// Demo Chapter: The Awakening
// Every choice immediately contributes to personality evaluation

export const gameScenes: Record<string, GameScene> = {
  // === INTRO ===
  'intro': {
    id: 'intro',
    title: 'The Awakening',
    background: 'room',
    dialogue: [
      { speaker: 'narrator', text: '...' },
      { speaker: 'narrator', text: 'You slowly open your eyes...' },
      { speaker: 'narrator', text: 'Sunlight streams through an unfamiliar window.' },
      { speaker: 'narrator', text: 'You find yourself in a small cottage. How did you get here?' },
    ],
    choices: [
      {
        id: 'intro_excited',
        text: 'Jump up excitedly!',
        emoji: '⚡',
        personality: { openness: 6, conscientiousness: -2, extraversion: 5, agreeableness: 0, neuroticism: -4 },
        weight: 2,
        nextScene: 'cottage_explore',
        consequence: 'Your enthusiasm fills you with energy!'
      },
      {
        id: 'intro_cautious',
        text: 'Look around carefully first',
        emoji: '👀',
        personality: { openness: 2, conscientiousness: 6, extraversion: -2, agreeableness: 0, neuroticism: 3 },
        weight: 2,
        nextScene: 'cottage_observe',
        consequence: 'You take in every detail of your surroundings.'
      },
      {
        id: 'intro_confused',
        text: 'Call out "Hello? Anyone there?"',
        emoji: '🗣️',
        personality: { openness: 3, conscientiousness: 0, extraversion: 7, agreeableness: 4, neuroticism: 0 },
        weight: 2,
        nextScene: 'cottage_callout',
        consequence: 'Your voice echoes through the cottage...'
      }
    ],
    showPersonalityUpdate: true
  },

  // === COTTAGE BRANCHES ===
  'cottage_explore': {
    id: 'cottage_explore',
    background: 'room',
    dialogue: [
      { speaker: 'narrator', text: 'You spring to your feet, eager to explore!' },
      { speaker: 'narrator', text: 'The cottage is cozy, filled with strange artifacts and glowing crystals.' },
      { speaker: 'narrator', text: 'A peculiar map catches your eye on the table.' },
    ],
    autoAdvance: 'wizard_entrance'
  },

  'cottage_observe': {
    id: 'cottage_observe',
    background: 'room',
    dialogue: [
      { speaker: 'narrator', text: 'You scan the room methodically...' },
      { speaker: 'narrator', text: 'Wooden furniture, dusty bookshelves, a crackling fireplace.' },
      { speaker: 'narrator', text: 'Everything seems safe. A map on the table shows nearby locations.' },
    ],
    autoAdvance: 'wizard_entrance'
  },

  'cottage_callout': {
    id: 'cottage_callout',
    background: 'room',
    dialogue: [
      { speaker: 'narrator', text: 'Your voice fills the small space.' },
      { speaker: 'narrator', text: 'For a moment, silence...' },
      { speaker: 'narrator', text: 'Then you hear footsteps approaching!' },
    ],
    autoAdvance: 'wizard_entrance'
  },

  // === WIZARD INTRODUCTION ===
  'wizard_entrance': {
    id: 'wizard_entrance',
    background: 'room',
    dialogue: [
      { speaker: 'narrator', text: 'The door creaks open...' },
      { speaker: 'npc', speakerName: '???', text: 'Ah! You\'re finally awake, young traveler!' },
      { speaker: 'narrator', text: 'An elderly figure in flowing robes enters. A wizard!' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'I am Aldric. I found you unconscious by the Moonstone River.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'You were muttering something about... a quest?' },
    ],
    choices: [
      {
        id: 'wizard_grateful',
        text: 'Thank you for saving me!',
        emoji: '🙏',
        personality: { openness: 0, conscientiousness: 2, extraversion: 3, agreeableness: 8, neuroticism: -2 },
        weight: 2,
        nextScene: 'wizard_grateful_response',
        consequence: 'The wizard smiles warmly at your gratitude.'
      },
      {
        id: 'wizard_questions',
        text: 'Where am I? What happened?',
        emoji: '❓',
        personality: { openness: 5, conscientiousness: 4, extraversion: 2, agreeableness: 0, neuroticism: 2 },
        weight: 2,
        nextScene: 'wizard_explain',
        consequence: 'Your curiosity is noted by the wizard.'
      },
      {
        id: 'wizard_suspicious',
        text: 'How do I know I can trust you?',
        emoji: '🤨',
        personality: { openness: -2, conscientiousness: 5, extraversion: -2, agreeableness: -4, neuroticism: 5 },
        weight: 2,
        nextScene: 'wizard_trust',
        consequence: 'The wizard\'s expression becomes thoughtful.'
      }
    ],
    showPersonalityUpdate: true
  },

  'wizard_grateful_response': {
    id: 'wizard_grateful_response',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Such kindness! It warms this old heart.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'The world needs more souls like yours.' },
    ],
    autoAdvance: 'wizard_quest'
  },

  'wizard_explain': {
    id: 'wizard_explain',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'You\'re in my cottage, on the edge of Evergreen Village.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'As for what happened... I hoped YOU could tell ME!' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: '*chuckles* All in good time, perhaps.' },
    ],
    autoAdvance: 'wizard_quest'
  },

  'wizard_trust': {
    id: 'wizard_trust',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'A wise question! Too few ask it.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Trust is earned, not given. I respect your caution.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Perhaps my actions will speak louder than words.' },
    ],
    autoAdvance: 'wizard_quest'
  },

  // === THE QUEST ===
  'wizard_quest': {
    id: 'wizard_quest',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Now then... I have a small problem.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'My Crystal of Clarity was stolen by goblins!' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Without it, I cannot perform healing magic for the village.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Would you... perhaps... help an old wizard?' },
    ],
    choices: [
      {
        id: 'quest_accept_eager',
        text: 'Absolutely! I\'ll get it back!',
        emoji: '⚔️',
        personality: { openness: 4, conscientiousness: 0, extraversion: 5, agreeableness: 6, neuroticism: -5 },
        weight: 3,
        nextScene: 'quest_accepted',
        consequence: 'Your bravery is inspiring!'
      },
      {
        id: 'quest_accept_reward',
        text: 'I\'ll help. Is there a reward?',
        emoji: '💰',
        personality: { openness: 0, conscientiousness: 4, extraversion: 2, agreeableness: -2, neuroticism: 0 },
        weight: 2,
        nextScene: 'quest_reward',
        consequence: 'A practical mind, the wizard notes.'
      },
      {
        id: 'quest_accept_careful',
        text: 'Tell me more about these goblins first',
        emoji: '📋',
        personality: { openness: 3, conscientiousness: 7, extraversion: 0, agreeableness: 2, neuroticism: 3 },
        weight: 2,
        nextScene: 'quest_info',
        consequence: 'Your thorough approach impresses the wizard.'
      },
      {
        id: 'quest_decline',
        text: 'I\'m not sure I\'m the right person...',
        emoji: '😟',
        personality: { openness: -3, conscientiousness: 2, extraversion: -4, agreeableness: 0, neuroticism: 6 },
        weight: 2,
        nextScene: 'quest_decline_response',
        consequence: 'Doubt clouds your thoughts.'
      }
    ],
    showPersonalityUpdate: true
  },

  'quest_accepted': {
    id: 'quest_accepted',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Wonderful! Such courage!' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Here, take this map. The goblin cave is to the north.' },
    ],
    autoAdvance: 'path_choice'
  },

  'quest_reward': {
    id: 'quest_reward',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Of course! I\'ll teach you a spell, and give you 100 gold coins.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'A fair exchange for fair work, yes?' },
      { speaker: 'player', text: 'Deal!' },
    ],
    autoAdvance: 'path_choice'
  },

  'quest_info': {
    id: 'quest_info',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Smart! Know your enemy.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'They\'re small, about 10 of them, led by Chief Gruk.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'They\'re more mischievous than dangerous, honestly.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Diplomacy might work... or clever trickery.' },
    ],
    autoAdvance: 'path_choice'
  },

  'quest_decline_response': {
    id: 'quest_decline_response',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'I understand, young one. It\'s a lot to ask of a stranger.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'But sometimes we surprise ourselves with what we can do.' },
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'Will you at least try? For the sick villagers who need healing?' },
    ],
    choices: [
      {
        id: 'decline_reconsider',
        text: 'Alright... I\'ll try.',
        emoji: '💪',
        personality: { openness: 2, conscientiousness: 3, extraversion: 0, agreeableness: 5, neuroticism: -2 },
        weight: 2,
        nextScene: 'path_choice',
        consequence: 'You find courage you didn\'t know you had.'
      },
      {
        id: 'decline_final',
        text: 'I really can\'t...',
        emoji: '😔',
        personality: { openness: -4, conscientiousness: 0, extraversion: -5, agreeableness: -3, neuroticism: 8 },
        weight: 2,
        nextScene: 'alternate_path',
        consequence: 'The wizard nods sadly.'
      }
    ]
  },

  // === THE PATH ===
  'path_choice': {
    id: 'path_choice',
    background: 'road',
    dialogue: [
      { speaker: 'narrator', text: 'You step outside into the bright morning sun.' },
      { speaker: 'narrator', text: 'A dirt road stretches before you. The map shows two routes:' },
      { speaker: 'narrator', text: '🌲 The FOREST PATH - Shorter but darker, possibly dangerous.' },
      { speaker: 'narrator', text: '🏘️ The VILLAGE ROAD - Longer but passes through town.' },
    ],
    choices: [
      {
        id: 'path_forest',
        text: 'Take the Forest Path (adventure!)',
        emoji: '🌲',
        personality: { openness: 7, conscientiousness: -3, extraversion: 0, agreeableness: 0, neuroticism: -5 },
        weight: 3,
        nextScene: 'forest_entrance',
        consequence: 'The thrill of the unknown calls to you!'
      },
      {
        id: 'path_village',
        text: 'Go through the Village (safer)',
        emoji: '🏘️',
        personality: { openness: -2, conscientiousness: 5, extraversion: 4, agreeableness: 2, neuroticism: 3 },
        weight: 3,
        nextScene: 'village_entrance',
        consequence: 'You prefer to be prepared and informed.'
      }
    ],
    showPersonalityUpdate: true,
    isCheckpoint: true
  },

  // === FOREST PATH ===
  'forest_entrance': {
    id: 'forest_entrance',
    background: 'forest',
    dialogue: [
      { speaker: 'narrator', text: 'The forest canopy blocks most of the sunlight.' },
      { speaker: 'narrator', text: 'Strange sounds echo between the ancient trees.' },
      { speaker: 'narrator', text: 'Suddenly, you hear a cry for help!' },
    ],
    choices: [
      {
        id: 'forest_help',
        text: 'Rush toward the sound!',
        emoji: '🏃',
        personality: { openness: 3, conscientiousness: -2, extraversion: 4, agreeableness: 7, neuroticism: -4 },
        weight: 2,
        nextScene: 'forest_rescue',
        consequence: 'Your heart guides your feet!'
      },
      {
        id: 'forest_careful',
        text: 'Approach quietly and observe',
        emoji: '🤫',
        personality: { openness: 4, conscientiousness: 6, extraversion: -2, agreeableness: 2, neuroticism: 2 },
        weight: 2,
        nextScene: 'forest_observe',
        consequence: 'Caution might save your life.'
      },
      {
        id: 'forest_ignore',
        text: 'Could be a trap. Keep moving.',
        emoji: '🚶',
        personality: { openness: -3, conscientiousness: 4, extraversion: -3, agreeableness: -5, neuroticism: 5 },
        weight: 2,
        nextScene: 'forest_ignore_result',
        consequence: 'Self-preservation is logical... right?'
      }
    ],
    showPersonalityUpdate: true
  },

  'forest_rescue': {
    id: 'forest_rescue',
    background: 'forest',
    dialogue: [
      { speaker: 'narrator', text: 'You burst into a clearing!' },
      { speaker: 'narrator', text: 'A small fairy is caught in a spider web!' },
      { speaker: 'npc', speakerName: 'Fairy', text: 'Oh thank goodness! Please help me!' },
      { speaker: 'narrator', text: 'You carefully free the fairy from the web.' },
      { speaker: 'npc', speakerName: 'Fairy', text: 'You have a kind heart, human!' },
      { speaker: 'npc', speakerName: 'Fairy', text: 'Here, take this gift - it will reveal hidden things.' },
      { speaker: 'system', text: '✨ You received: Fairy Sight (reveals hidden paths)' },
    ],
    autoAdvance: 'goblin_cave_entrance'
  },

  'forest_observe': {
    id: 'forest_observe',
    background: 'forest',
    dialogue: [
      { speaker: 'narrator', text: 'You creep closer, staying hidden...' },
      { speaker: 'narrator', text: 'It\'s a fairy caught in a spider web!' },
      { speaker: 'narrator', text: 'The spider is nowhere to be seen... for now.' },
      { speaker: 'narrator', text: 'You free the fairy quickly and quietly.' },
      { speaker: 'npc', speakerName: 'Fairy', text: 'A clever rescuer! Take this gift for your wisdom.' },
      { speaker: 'system', text: '✨ You received: Fairy Dust (one-time invisibility)' },
    ],
    autoAdvance: 'goblin_cave_entrance'
  },

  'forest_ignore_result': {
    id: 'forest_ignore_result',
    background: 'forest',
    dialogue: [
      { speaker: 'narrator', text: 'You press on, ignoring the cries.' },
      { speaker: 'narrator', text: '...The forest feels colder somehow.' },
      { speaker: 'narrator', text: 'You reach the goblin cave faster, but feel uneasy.' },
    ],
    autoAdvance: 'goblin_cave_entrance'
  },

  // === VILLAGE PATH ===
  'village_entrance': {
    id: 'village_entrance',
    background: 'village',
    dialogue: [
      { speaker: 'narrator', text: 'Evergreen Village is bustling with activity!' },
      { speaker: 'narrator', text: 'Merchants call out their wares, children play in the streets.' },
      { speaker: 'narrator', text: 'A notice board catches your eye: "GOBLIN TROUBLES - INFO INSIDE"' },
    ],
    choices: [
      {
        id: 'village_notice',
        text: 'Read the notice board',
        emoji: '📜',
        personality: { openness: 3, conscientiousness: 6, extraversion: 0, agreeableness: 0, neuroticism: 0 },
        weight: 1,
        nextScene: 'village_notice',
        consequence: 'Knowledge is power.'
      },
      {
        id: 'village_talk',
        text: 'Chat with the villagers',
        emoji: '💬',
        personality: { openness: 2, conscientiousness: 0, extraversion: 7, agreeableness: 4, neuroticism: -2 },
        weight: 2,
        nextScene: 'village_social',
        consequence: 'You enjoy meeting new people!'
      },
      {
        id: 'village_shop',
        text: 'Visit the shops first',
        emoji: '🛒',
        personality: { openness: 0, conscientiousness: 7, extraversion: 2, agreeableness: 0, neuroticism: 2 },
        weight: 1,
        nextScene: 'village_shop',
        consequence: 'Preparation is key to success.'
      }
    ]
  },

  'village_notice': {
    id: 'village_notice',
    background: 'village',
    dialogue: [
      { speaker: 'narrator', text: 'The notice reads:' },
      { speaker: 'system', text: '"Goblins spotted near the northern caves. Chief Gruk responds well to shiny objects. They fear loud noises. -Village Elder"' },
      { speaker: 'narrator', text: 'Useful information!' },
    ],
    autoAdvance: 'village_continue'
  },

  'village_social': {
    id: 'village_social',
    background: 'village',
    dialogue: [
      { speaker: 'narrator', text: 'You strike up conversations with the locals.' },
      { speaker: 'npc', speakerName: 'Merchant', text: 'Heading to the goblin caves? Bring something shiny to trade!' },
      { speaker: 'npc', speakerName: 'Child', text: 'My papa says goblins are scared of loud bangs!' },
      { speaker: 'npc', speakerName: 'Elder', text: 'The forest path is quicker but the road is safer, young one.' },
    ],
    autoAdvance: 'village_continue'
  },

  'village_shop': {
    id: 'village_shop',
    background: 'village',
    dialogue: [
      { speaker: 'narrator', text: 'You browse the merchant\'s wares.' },
      { speaker: 'npc', speakerName: 'Merchant', text: 'I have just the thing for goblin caves!' },
      { speaker: 'system', text: '🎁 You bought: Smoke Bomb & Shiny Pendant' },
      { speaker: 'npc', speakerName: 'Merchant', text: 'Goblins love shiny things. And they HATE smoke!' },
    ],
    autoAdvance: 'village_continue'
  },

  'village_continue': {
    id: 'village_continue',
    background: 'village',
    dialogue: [
      { speaker: 'narrator', text: 'Feeling more prepared, you head north toward the goblin caves.' },
    ],
    autoAdvance: 'goblin_cave_entrance'
  },

  // === GOBLIN CAVE ===
  'goblin_cave_entrance': {
    id: 'goblin_cave_entrance',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'The cave entrance looms before you, dark and ominous.' },
      { speaker: 'narrator', text: 'You can hear goblin chatter echoing from within.' },
      { speaker: 'narrator', text: 'This is it. The Crystal of Clarity is somewhere inside.' },
    ],
    choices: [
      {
        id: 'cave_charge',
        text: 'March in confidently!',
        emoji: '⚔️',
        personality: { openness: 3, conscientiousness: -4, extraversion: 6, agreeableness: -2, neuroticism: -6 },
        weight: 3,
        nextScene: 'cave_confrontation',
        consequence: 'Fortune favors the bold!'
      },
      {
        id: 'cave_sneak',
        text: 'Sneak in quietly',
        emoji: '🤫',
        personality: { openness: 4, conscientiousness: 5, extraversion: -3, agreeableness: 0, neuroticism: 2 },
        weight: 3,
        nextScene: 'cave_stealth',
        consequence: 'The shadows are your ally.'
      },
      {
        id: 'cave_call',
        text: 'Call out to negotiate',
        emoji: '🗣️',
        personality: { openness: 6, conscientiousness: 2, extraversion: 5, agreeableness: 7, neuroticism: -3 },
        weight: 3,
        nextScene: 'cave_diplomacy',
        consequence: 'Words can be mightier than swords.'
      }
    ],
    showPersonalityUpdate: true,
    isCheckpoint: true
  },

  // === CAVE CONFRONTATION PATH ===
  'cave_confrontation': {
    id: 'cave_confrontation',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'You stride into the cave with confidence!' },
      { speaker: 'npc', speakerName: 'Goblin Guard', text: 'INTRUDER! INTRUDER!' },
      { speaker: 'narrator', text: 'Goblins surround you, brandishing tiny spears!' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Who dares enter Gruk\'s domain?!' },
    ],
    choices: [
      {
        id: 'confront_fight',
        text: 'Fight your way through!',
        emoji: '⚔️',
        personality: { openness: 0, conscientiousness: -2, extraversion: 3, agreeableness: -6, neuroticism: -4 },
        weight: 2,
        nextScene: 'ending_fight',
        consequence: 'Steel meets steel!'
      },
      {
        id: 'confront_talk',
        text: 'Wait! I come to negotiate!',
        emoji: '✋',
        personality: { openness: 4, conscientiousness: 3, extraversion: 4, agreeableness: 6, neuroticism: 0 },
        weight: 2,
        nextScene: 'cave_diplomacy_late',
        consequence: 'Perhaps violence isn\'t the answer.'
      }
    ]
  },

  // === CAVE STEALTH PATH ===
  'cave_stealth': {
    id: 'cave_stealth',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'You slip into the shadows, moving silently.' },
      { speaker: 'narrator', text: 'The goblins are gathered around a fire, not noticing you.' },
      { speaker: 'narrator', text: 'You spot the Crystal of Clarity on a makeshift throne!' },
    ],
    choices: [
      {
        id: 'stealth_grab',
        text: 'Grab it and run!',
        emoji: '💨',
        personality: { openness: 2, conscientiousness: -2, extraversion: 0, agreeableness: -3, neuroticism: 3 },
        weight: 2,
        nextScene: 'ending_theft',
        consequence: 'Quick hands, quick feet!'
      },
      {
        id: 'stealth_distract',
        text: 'Create a distraction first',
        emoji: '🎭',
        personality: { openness: 6, conscientiousness: 5, extraversion: 0, agreeableness: 0, neuroticism: 0 },
        weight: 2,
        nextScene: 'ending_clever',
        consequence: 'A clever plan forms in your mind.'
      }
    ]
  },

  // === CAVE DIPLOMACY PATH ===
  'cave_diplomacy': {
    id: 'cave_diplomacy',
    background: 'cave',
    dialogue: [
      { speaker: 'player', text: 'Hello! I wish to speak with your leader!' },
      { speaker: 'narrator', text: 'The goblins look confused, then curious.' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Human wants to TALK? Not fight?' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Gruk is listening. Why you here?' },
    ],
    choices: [
      {
        id: 'diplo_honest',
        text: 'Tell the truth about the crystal',
        emoji: '💎',
        personality: { openness: 2, conscientiousness: 6, extraversion: 2, agreeableness: 5, neuroticism: 0 },
        weight: 2,
        nextScene: 'ending_honest',
        consequence: 'Honesty is the best policy.'
      },
      {
        id: 'diplo_trade',
        text: 'Offer to trade something shiny',
        emoji: '✨',
        personality: { openness: 5, conscientiousness: 4, extraversion: 4, agreeableness: 4, neuroticism: -2 },
        weight: 2,
        nextScene: 'ending_trade',
        consequence: 'A mutually beneficial arrangement!'
      }
    ]
  },

  'cave_diplomacy_late': {
    id: 'cave_diplomacy_late',
    background: 'cave',
    dialogue: [
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Negotiate? After barging in? Hmph!' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Gruk respects courage though. Speak, human.' },
    ],
    choices: [
      {
        id: 'late_honest',
        text: 'I need the crystal for the village healer',
        emoji: '💎',
        personality: { openness: 2, conscientiousness: 4, extraversion: 2, agreeableness: 6, neuroticism: 0 },
        weight: 2,
        nextScene: 'ending_honest',
        consequence: 'Honesty even in tense moments.'
      },
      {
        id: 'late_trick',
        text: 'The wizard will curse you if you don\'t return it!',
        emoji: '😈',
        personality: { openness: 3, conscientiousness: -2, extraversion: 3, agreeableness: -4, neuroticism: 2 },
        weight: 2,
        nextScene: 'ending_bluff',
        consequence: 'A risky bluff!'
      }
    ]
  },

  // === ENDINGS ===
  'ending_fight': {
    id: 'ending_fight',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'A fierce battle ensues!' },
      { speaker: 'narrator', text: 'Your courage overwhelms the goblins, and they scatter!' },
      { speaker: 'narrator', text: 'You claim the Crystal of Clarity!' },
      { speaker: 'system', text: '⚔️ QUEST COMPLETE: Victory through Strength!' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  },

  'ending_theft': {
    id: 'ending_theft',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'You grab the crystal and BOLT!' },
      { speaker: 'npc', speakerName: 'Goblins', text: 'THIEF! GET THEM!' },
      { speaker: 'narrator', text: 'But you\'re too fast! You escape into the daylight!' },
      { speaker: 'system', text: '💨 QUEST COMPLETE: The Quick Escape!' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  },

  'ending_clever': {
    id: 'ending_clever',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'You throw a rock to the far side of the cave.' },
      { speaker: 'npc', speakerName: 'Goblins', text: 'What was that?!' },
      { speaker: 'narrator', text: 'While they investigate, you smoothly take the crystal.' },
      { speaker: 'narrator', text: 'By the time they notice, you\'re long gone!' },
      { speaker: 'system', text: '🎭 QUEST COMPLETE: The Clever Heist!' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  },

  'ending_honest': {
    id: 'ending_honest',
    background: 'cave',
    dialogue: [
      { speaker: 'player', text: 'The village healer needs this crystal. People are sick.' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: '...' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Gruk... not know crystal so important.' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Gruk\'s tribe got sick last winter. Village healer helped us.' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Take crystal. Gruk sorry for stealing.' },
      { speaker: 'system', text: '💎 QUEST COMPLETE: The Honest Path!' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  },

  'ending_trade': {
    id: 'ending_trade',
    background: 'cave',
    dialogue: [
      { speaker: 'narrator', text: 'You offer the shiny pendant you acquired.' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Oooooh! So SHINY!' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'Deal! Take boring crystal, give shiny!' },
      { speaker: 'narrator', text: 'A fair trade is made, and everyone leaves happy!' },
      { speaker: 'system', text: '✨ QUEST COMPLETE: The Fair Trade!' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  },

  'ending_bluff': {
    id: 'ending_bluff',
    background: 'cave',
    dialogue: [
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'C-curse?! Wizard can do that?!' },
      { speaker: 'player', text: 'Oh yes. Terrible curses. Warts. Bad luck. No more shiny things.' },
      { speaker: 'npc', speakerName: 'Chief Gruk', text: 'NO SHINY?! Take it! TAKE THE CRYSTAL!' },
      { speaker: 'narrator', text: 'The goblins practically throw the crystal at you!' },
      { speaker: 'system', text: '😈 QUEST COMPLETE: The Bold Bluff!' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  },

  'alternate_path': {
    id: 'alternate_path',
    background: 'room',
    dialogue: [
      { speaker: 'npc', speakerName: 'Wizard Aldric', text: 'I understand. Rest here as long as you need.' },
      { speaker: 'narrator', text: 'You spend the day helping the wizard with small tasks.' },
      { speaker: 'narrator', text: 'Perhaps tomorrow you\'ll feel ready for adventure...' },
      { speaker: 'system', text: '🏠 CHAPTER END: A Day of Rest' },
    ],
    chapterEnd: true,
    showPersonalityUpdate: true
  }
}

// Get starting scene
export const STARTING_SCENE = 'intro'

// Get all scene IDs
export const getAllSceneIds = () => Object.keys(gameScenes)

// Get scene by ID
export const getScene = (id: string): GameScene | undefined => gameScenes[id]
