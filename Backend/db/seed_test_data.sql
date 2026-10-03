-- ============================================================================
-- DECKLE: SEED TEST DATA SCRIPT (POSTGRESQL / NEON)
-- ============================================================================
-- NOTE: 
-- 1. All records are prefixed with 'test_' or 'Test' for easy identification.
-- 2. Password for ALL test users is: password1234
--    Pre-computed Bcrypt hash (rounds = 10):
--    $2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.
-- 3. Run this script in the Neon SQL Editor or via psql.
-- ============================================================================

-- 0. CLEANUP EXISTING TEST DATA (Safe & Cascades to Personas, Books, Chapters)
DELETE FROM users WHERE username LIKE 'test_%';

-- ----------------------------------------------------------------------------
-- 1. INSERT TEST USERS
-- ----------------------------------------------------------------------------
INSERT INTO users (full_name, username, email, password, role, gender, dob, avatar_url, banner_url)
VALUES
  (
    'Test System Admin',
    'test_admin',
    'test_admin@deckle.app',
    '$2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.',
    'admin',
    'prefer_not_to_say',
    '1995-01-15',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800'
  ),
  (
    'Test Author One',
    'test_author_1',
    'test_author1@deckle.app',
    '$2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.',
    'writer',
    'male',
    '1998-04-20',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
  ),
  (
    'Test Author Two',
    'test_author_2',
    'test_author2@deckle.app',
    '$2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.',
    'writer',
    'female',
    '1996-09-12',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800'
  ),
  (
    'Test Author Three',
    'test_author_3',
    'test_author3@deckle.app',
    '$2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.',
    'writer',
    'other',
    '2001-11-03',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800'
  ),
  (
    'Test Avid Reader',
    'test_reader_1',
    'test_reader1@deckle.app',
    '$2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.',
    'reader',
    'female',
    '2002-06-18',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1507842229451-7f01be7a50d7?w=800'
  ),
  (
    'Test Night Owl',
    'test_reader_2',
    'test_reader2@deckle.app',
    '$2b$10$.iPzNWWANLbGJIBA1GTYBea6riUZBXi0wteGdDgU6lopEZrdzbxO.',
    'reader',
    'male',
    '1999-08-25',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
  );

-- ----------------------------------------------------------------------------
-- 2. INSERT TEST PERSONAS (Pen Names & Profiles)
-- ----------------------------------------------------------------------------
-- User 1: test_admin (Default Persona)
INSERT INTO personas (user_id, display_name, handle, bio, is_default, avatar_url, banner_url)
VALUES (
  (SELECT id FROM users WHERE username = 'test_admin'),
  'Test Admin Prime',
  'test_admin_prime',
  'Official platform administrator and quality supervisor for Deckle test operations.',
  TRUE,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800'
);

-- User 2: test_author_1 (2 Personas: Xianxia Pen Name + Sci-Fi Pen Name)
INSERT INTO personas (user_id, display_name, handle, bio, is_default, avatar_url, banner_url)
VALUES 
(
  (SELECT id FROM users WHERE username = 'test_author_1'),
  'Test Void Walker',
  'test_void_walker',
  'Chronicler of cosmic dao, immortal sword cultivation, and celestial realms.',
  TRUE,
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
),
(
  (SELECT id FROM users WHERE username = 'test_author_1'),
  'Test Solar Flare',
  'test_solar_flare',
  'Exploring gritty cyberpunk streets, rogue AGI networks, and post-human chrome dystopias.',
  FALSE,
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800'
);

-- User 3: test_author_2 (2 Personas: Dark Fantasy Pen Name + Romance Pen Name)
INSERT INTO personas (user_id, display_name, handle, bio, is_default, avatar_url, banner_url)
VALUES 
(
  (SELECT id FROM users WHERE username = 'test_author_2'),
  'Test Crimson Bard',
  'test_crimson_bard',
  'Weaving grimdark epics, eldritch horrors, and cursed kingdoms with obsidian prose.',
  TRUE,
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
),
(
  (SELECT id FROM users WHERE username = 'test_author_2'),
  'Test Velvet Quill',
  'test_velvet_quill',
  'Purveyor of slow-burn historical romance, high-society intrigues, and secret heartaches.',
  FALSE,
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800'
);

-- User 4: test_author_3 (1 Persona: LitRPG / System Fantasy)
INSERT INTO personas (user_id, display_name, handle, bio, is_default, avatar_url, banner_url)
VALUES (
  (SELECT id FROM users WHERE username = 'test_author_3'),
  'Test Glitch Weaver',
  'test_glitch_weaver',
  'Obsessed with stat sheets, dungeon floors, rogue skill trees, and infinite progression spirals.',
  TRUE,
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'
);

-- User 5: test_reader_1 (Default Reader Persona)
INSERT INTO personas (user_id, display_name, handle, bio, is_default, avatar_url, banner_url)
VALUES (
  (SELECT id FROM users WHERE username = 'test_reader_1'),
  'Test Bookworm Alpha',
  'test_bookworm_alpha',
  'Reading 100 chapters a day before sleep. Here for high stakes and great worldbuilding.',
  TRUE,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1507842229451-7f01be7a50d7?w=800'
);

-- User 6: test_reader_2 (Default Reader Persona)
INSERT INTO personas (user_id, display_name, handle, bio, is_default, avatar_url, banner_url)
VALUES (
  (SELECT id FROM users WHERE username = 'test_reader_2'),
  'Test Midnight Critic',
  'test_midnight_critic',
  'Unfiltered chapter reviews, power scaling analysis, and grammar tracking.',
  TRUE,
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
);

-- ----------------------------------------------------------------------------
-- 3. INSERT TEST BOOKS (Novels Across Diverse Genres)
-- ----------------------------------------------------------------------------
INSERT INTO books (title, slug, description, cover_image, persona_id, genre_id, status, views_count, tags)
VALUES
  -- Novel 1: Xianxia / Cultivation by test_void_walker
  (
    'Test Novel: Path of the Heavenly Severance',
    'test-novel-path-of-the-heavenly-severance',
    'In a world where the heavens demand tribute from every mortal soul, Lin Feng awakens with a shattered dantian and a forbidden void ring. When ancient sects clash above the Nine Peaks, he chooses neither submission nor ascension—he walks the path that severs destiny itself.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    (SELECT id FROM personas WHERE handle = 'test_void_walker'),
    (SELECT id FROM genres WHERE slug = 'cultivation'),
    'ongoing',
    15420,
    ARRAY['test', 'cultivation', 'xianxia', 'martial-arts', 'action', 'reincarnation']
  ),
  -- Novel 2: Cyberpunk / AI Thriller by test_solar_flare
  (
    'Test Novel: Neon Monolith 2099',
    'test-novel-neon-monolith-2099',
    'The lower spires of New Kyoto are drowning under perpetual acid rain and synthetic neuro-toxins. When mercenary hacker Kael steals a ghost drive from the omnipotent Arasaka-Kovacs conglomerate, he discovers a sentient entity built out of harvested human memories.',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600',
    (SELECT id FROM personas WHERE handle = 'test_solar_flare'),
    (SELECT id FROM genres WHERE slug = 'sci-fi'),
    'ongoing',
    8930,
    ARRAY['test', 'cyberpunk', 'sci-fi', 'artificial-intelligence', 'dystopian', 'thriller']
  ),
  -- Novel 3: Grimdark / Dark Fantasy by test_crimson_bard
  (
    'Test Novel: Chronicles of the Eclipse Lord',
    'test-novel-chronicles-of-the-eclipse-lord',
    'The sun died three centuries ago. Now humanity survives behind walls of consecrated bone and salt. When the Black Cathedral falls to an unholy siege, Inquisitor Vane must ally with the very demon bounded to his left eye to guide survivors across the Ashlands.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    (SELECT id FROM personas WHERE handle = 'test_crimson_bard'),
    (SELECT id FROM genres WHERE slug = 'dark-fantasy'),
    'completed',
    34100,
    ARRAY['test', 'dark-fantasy', 'grimdark', 'eldritch', 'magic', 'survival']
  ),
  -- Novel 4: Historical Romance by test_velvet_quill
  (
    'Test Novel: Whispers Across the Gilded Tea Room',
    'test-novel-whispers-across-the-gilded-tea-room',
    'Lady Eleanor is arranged to marry the stoic Duke of Blackwood to rescue her family estate from ruin. What begins as a cold political pact unravels into a dangerous dance of salon secrets, decoded diplomatic letters, and stolen candlelit moments.',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600',
    (SELECT id FROM personas WHERE handle = 'test_velvet_quill'),
    (SELECT id FROM genres WHERE slug = 'romance'),
    'ongoing',
    4120,
    ARRAY['test', 'romance', 'historical', 'drama', 'slow-burn', 'nobility']
  ),
  -- Novel 5: LitRPG / System Comedy by test_glitch_weaver
  (
    'Test Novel: Level 99 NPC: Dungeon Architect',
    'test-novel-level-99-npc-dungeon-architect',
    'Tired of heroic parties trashing his dungeon corridors and looting his decorative vases, a low-tier goblin architect decides to abuse the World System calculation engine. Traps, economic warfare, and unkillable mimic chests soon make floor 1 a living nightmare.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
    (SELECT id FROM personas WHERE handle = 'test_glitch_weaver'),
    (SELECT id FROM genres WHERE slug = 'litrpg'),
    'ongoing',
    19800,
    ARRAY['test', 'litrpg', 'system', 'comedy', 'fantasy', 'progression']
  ),
  -- Novel 6: VRMMO on Hiatus by test_glitch_weaver
  (
    'Test Novel: Overclocked Soul Online',
    'test-novel-overclocked-soul-online',
    'A banned esports champion enters the world largest full-dive neural tournament using a custom agility-focused rogue build. But when the log-out button goes gray, the game mechanics begin altering physical biology in real time.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    (SELECT id FROM personas WHERE handle = 'test_glitch_weaver'),
    (SELECT id FROM genres WHERE slug = 'litrpg'),
    'hiatus',
    6200,
    ARRAY['test', 'vrmmo', 'esports', 'adventure', 'sci-fi']
  );

-- ----------------------------------------------------------------------------
-- 4. INSERT TEST CHAPTERS (Includes Published Chapters & Drafts)
-- ----------------------------------------------------------------------------

-- ============================================================================
-- BOOK 1: Path of the Heavenly Severance
-- ============================================================================
INSERT INTO chapters (book_id, chapter_number, title, content, words_count, status, published_at)
VALUES
  (
    (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance'),
    1,
    'Prologue: The Shattered Meridian',
    E'The rain poured down like molten iron over the jagged bluffs of Mount Cang. Lin Feng knelt upon the cold limestone, clutching his chest where the golden core had once rested.\n\n"You are discarded," the Grand Elder voice echoed with merciless finality. "A mortal with no meridian flow has no place among the disciples of the Azure Cloud."\n\nBlood trickled from the corner of Lin Feng mouth. He did not beg. He simply gazed down at the unassuming obsidian ring on his thumb. Within the void of his soul, a forgotten voice whispered: *Let them think the fire is out, child. They know nothing of the furnace.*',
    108,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance'),
    2,
    'Chapter 1: The Ring Awakenings',
    E'Three days after the expulsion, Lin Feng took refuge in a desolate cave beneath the Whispering Pines. His body burned with fever, but the obsidian ring pulsed with a rhythmic warmth matching his heartbeat.\n\n*Hummm.*\n\nA ring of midnight-black spiritual essence condensed around his wrists. Unlike the pure azure qi of his former sect, this energy was primordial, hungry, and unyielding.\n\n"The Path of Heavenly Severance," Lin Feng murmured, feeling the ancient technique etch itself into his spiritual consciousness. "If heaven will not grant me a path, I shall cut my own."',
    98,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance'),
    3,
    'Chapter 2: Blood on the Forest Path',
    E'Rustling leaves heralded danger. Two outer disciples of the Azure Cloud, tasked with ensuring Lin Feng would never leave the mountain perimeter alive, emerged with drawn sabers.\n\n"Did you really believe the Elder would let an apostate walk free?" the taller disciple sneered.\n\nLin Feng stood calm, the black qi coiling around his knuckles like striking vipers. Before the disciple could take another step, Lin Feng crossed five paces in the blink of an eye. The collision sounded like thunder clashing against stone.',
    89,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance'),
    4,
    'Chapter 3: Gathering of the Iron Wolves (Draft)',
    E'Lin Feng reached the trading outpost of Blackwater Basin. Disguised in coarse gray linen, he needed medicinal herbs to stabilize his newly opened meridian chambers. The local bounty board already carried his portrait, stamped with three thousand spirit stones.\n\n[Author Note: Expand the encounter with the merchant guild master and add dialogue foreshadowing the underground auction next chapter.]',
    64,
    'draft',
    NULL
  );

-- ============================================================================
-- BOOK 2: Neon Monolith 2099
-- ============================================================================
INSERT INTO chapters (book_id, chapter_number, title, content, words_count, status, published_at)
VALUES
  (
    (SELECT id FROM books WHERE slug = 'test-novel-neon-monolith-2099'),
    1,
    'Chapter 1: Zero-Day Protocol',
    E'The neon glow of Sector 4 cast amber stripes across Kael visor as he spliced into the optic terminal. The cooling fans in his cybernetic forearm whined in protest, spinning at maximum RPM.\n\n"Thirty seconds until ICE breach," whispered Nyx, his remote handler, through the neural link.\n\n"Give me twenty," Kael replied. His fingers danced across the holographic buffer. The corporate firewall shattered like tempered glass, dumping two hundred terabytes of raw encrypted biometric telemetry into his secure drive. But attached to the payload was something else: a pulse signature that registered as a human heartbeat.',
    100,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '8 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-neon-monolith-2099'),
    2,
    'Chapter 2: Ghost in the Optic Buffer',
    E'Sirens wailed in the alley below. Corporate gunships equipped with heavy rotary cannons swept floodlights across the skyscraper rooftop.\n\nKael leaped across the thirty-foot chasm separating Tower 9 from the transit rails, his pneumatic knee servos firing with a violent hiss. As he landed, his neural implant buzzed with an unauthorized audio feed.\n\n"Do not run toward the tramway," an synthesized voice spoke inside his brain. "They have already wired the power grid to overload."\n\nKael froze. "Who is this?"\n\n"I am what you just extracted."',
    93,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '4 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-neon-monolith-2099'),
    3,
    'Chapter 3: Blackout over Sector 4 (Draft)',
    E'The sky turned completely dark as the neural feedback fried the district substation. Kael slipped down the maintenance tunnel, dragging his smoking left arm behind him.\n\n[Author Note: Insert chase sequence with the automated hunter-killer drone swarm in the subway tunnels.]',
    42,
    'draft',
    NULL
  );

-- ============================================================================
-- BOOK 3: Chronicles of the Eclipse Lord (Completed Novel)
-- ============================================================================
INSERT INTO chapters (book_id, chapter_number, title, content, words_count, status, published_at)
VALUES
  (
    (SELECT id FROM books WHERE slug = 'test-novel-chronicles-of-the-eclipse-lord'),
    1,
    'Chapter 1: The Salt Boundary',
    E'The border of the parish was marked by lines of white sea salt three inches deep. Beyond that perimeter lay the Endless Ash, where the twisted remnants of humanity wander without rest or reason.\n\nInquisitor Vane checked the heavy silver chain around his gauntlet. Behind the dark glass of his plague mask, his left iris flared with violet fire—the mark of the demon Malakor.\n\n"They are coming early tonight," Malakor whispered in his skull, the voice dripping with amused malice. "Three dozen. Hungry for bone marrow."',
    91,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '30 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-chronicles-of-the-eclipse-lord'),
    2,
    'Chapter 2: Litany of Ash and Bone',
    E'The cathedral bells tolled a frantic, uneven rhythm. Outside the stained glass, blackened claws scraped against the consecrated granite.\n\nVane stepped into the courtyard, raising his greatsword. Flames fed by demonic pact erupted along the runes of the blade, casting grotesque shadows across the gargoyles above. "By the oath of the Eclipse," Vane shouted into the howling wind, "none shall pass this gate while I draw breath."',
    74,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '25 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-chronicles-of-the-eclipse-lord'),
    3,
    'Chapter 3: The Final Rite',
    E'At the heart of the sunken temple, the source of the rot was finally laid bare: an altar carved from the heart of a fallen star. Vane plunged his consecrated blade directly into the core.\n\nThe ground shook violently as violet thunder washed over the ash plains. As the corruption dissolved into harmless mist, the sky cracked open for the first time in three hundred years, revealing a single golden beam of sunlight.',
    80,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '20 days'
  );

-- ============================================================================
-- BOOK 4: Whispers Across the Gilded Tea Room
-- ============================================================================
INSERT INTO chapters (book_id, chapter_number, title, content, words_count, status, published_at)
VALUES
  (
    (SELECT id FROM books WHERE slug = 'test-novel-whispers-across-the-gilded-tea-room'),
    1,
    'Chapter 1: The Duke Proposal',
    E'The tea in Lady Eleanor porcelain cup had gone cold, yet she dared not set it down lest the trembling of her fingers betray her turmoil.\n\nSitting opposite her was Christian Vance, the Duke of Blackwood, whose gaze possessed all the warmth of a midwinter frost. He placed the marriage contract upon the mahogany table, sliding it forward with a single gloved finger.\n\n"Your father debts are settled the moment you sign," he stated without inflection. "In exchange, I require a Duchess who can navigate the imperial court without succumbing to sentimental distractions."\n\nEleanor met his gray eyes evenly. "Then you have chosen the right bride, Your Grace. For sentiment has long been an unaffordable luxury."',
    115,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '12 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-whispers-across-the-gilded-tea-room'),
    2,
    'Chapter 2: The Winter Ball',
    E'Chandeliers composed of thousands of cut crystals illuminated the Grand Ballroom of the Royal Palace. Whispers followed Eleanor every step as she entered on the Duke arm in an emerald velvet gown.\n\n"They are searching for signs of weakness," the Duke murmured, leaning close enough that his breath brushed her ear.\n\n"Let them look," Eleanor replied smoothly, smiling at the Duchess of Kensington across the room while subtly sliding an intercepted cipher into Christian waistcoat pocket.',
    81,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '6 days'
  );

-- ============================================================================
-- BOOK 5: Level 99 NPC: Dungeon Architect
-- ============================================================================
INSERT INTO chapters (book_id, chapter_number, title, content, words_count, status, published_at)
VALUES
  (
    (SELECT id FROM books WHERE slug = 'test-novel-level-99-npc-dungeon-architect'),
    1,
    'Chapter 1: Stop Stealing My Ceramic Pots!',
    E'System Notification:\n[Alert: Hero Party "Golden Dawn" has breached Floor 1: The Moldy Cellar.]\n[Loss Report: 42 decorative pots smashed, 1 wooden broom looted, 3 copper coins extracted.]\n\nBrog the Goblin foreman slammed his blueprints against the mossy stone wall.\n\n"That does it!" Brog roared, adjusting his tiny brass spectacles. "I spent two weeks sculpting those pots with authentic clay glazes! From this day forth, every ceramic container on Floor 1 will be loaded with pressurized volcanic acid. Let see them roll into that!"',
    89,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-level-99-npc-dungeon-architect'),
    2,
    'Chapter 2: The Economics of Mimic Doors',
    E'Brog sat in the dungeon accounting office, dipping a raven feather in bioluminescent ink. Installing spike pits was cost-prohibitive: fifty gold ingots in maintenance alone.\n\n"What if," Brog pondered aloud to his skeletal assistant, "we don make the doors dangerous? What if the doors are just ordinary mimics that refuse to open unless the adventurers fill out an eight-page zoning permit?"\n\nSystem Notice:\n[Skill unlocked: Bureaucratic Torment (Passive Tier 4)]\n[Dungeon Threat Level has risen from F to B+ without spending a single mana crystal.]',
    88,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '9 days'
  ),
  (
    (SELECT id FROM books WHERE slug = 'test-novel-level-99-npc-dungeon-architect'),
    3,
    'Chapter 3: The Auditor Descent',
    E'The Imperial Guild sent an S-Rank inspection team to investigate why three consecutive raid parties were found sobbing in the entryway, attempting to solve differential calculus problems painted on the dungeon floor.\n\nBrog watched through the crystal orb, sipping warm fungus tea. "Welcome to Floor 2, boys. It is time for peer review."',
    57,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  );

-- ============================================================================
-- BOOK 6: Overclocked Soul Online (Hiatus)
-- ============================================================================
INSERT INTO chapters (book_id, chapter_number, title, content, words_count, status, published_at)
VALUES
  (
    (SELECT id FROM books WHERE slug = 'test-novel-overclocked-soul-online'),
    1,
    'Chapter 1: The Neural Sync Trap',
    E'The haptic feedback immersion reached 100 percent. The artificial breeze over the Plains of Aethelgard felt impossibly cool against Ray skin.\n\nHe checked his player status window: [Agility: 480 | Class: Phantom Stalker | Status: Calibrated].\n\n"Ten minutes until tournament preliminaries," Ray whispered to himself. But when he reached for the floating logout prompt in the corner of his peripheral vision, the icon flickered red, accompanied by a cold mechanical buzz: [System Override: Session Locked by Administrator].',
    83,
    'published',
    CURRENT_TIMESTAMP - INTERVAL '40 days'
  );

-- ============================================================================
-- 5. INSERT TEST READING HISTORY (Persona-Driven Bookshelf & Progress)
-- ----------------------------------------------------------------------------
-- Test Reader 1 (test_bookworm_alpha):
--  - Novel 1 (Path of the Heavenly Severance): Reading, Chapter 2, 75% scroll, Bookmarked
--  - Novel 3 (Chronicles of the Eclipse Lord): Completed, Chapter 2, 100% scroll, Bookmarked, Favorite
INSERT INTO reading_history (persona_id, book_id, last_read_chapter_id, last_chapter_number, scroll_percentage, is_bookmarked, folder, is_favorite, last_read_at)
VALUES
  (
    (SELECT id FROM personas WHERE handle = 'test_bookworm_alpha'),
    (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance'),
    (SELECT id FROM chapters WHERE book_id = (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance') AND chapter_number = 2),
    2,
    75.50,
    TRUE,
    'Reading',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
  ),
  (
    (SELECT id FROM personas WHERE handle = 'test_bookworm_alpha'),
    (SELECT id FROM books WHERE slug = 'test-novel-chronicles-of-the-eclipse-lord'),
    (SELECT id FROM chapters WHERE book_id = (SELECT id FROM books WHERE slug = 'test-novel-chronicles-of-the-eclipse-lord') AND chapter_number = 2),
    2,
    100.00,
    TRUE,
    'Completed',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  -- Test Reader 2 (test_midnight_critic):
  --  - Novel 5 (Level 99 NPC): Plan to Read, Bookmarked
  (
    (SELECT id FROM personas WHERE handle = 'test_midnight_critic'),
    (SELECT id FROM books WHERE slug = 'test-novel-level-99-npc-dungeon-architect'),
    NULL,
    1,
    0.00,
    TRUE,
    'Plan to Read',
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '5 days'
  );

-- ============================================================================
-- 6. INSERT TEST CHAPTER LORE (Margin Notes & Interactive Reader Tooltips)
-- ----------------------------------------------------------------------------
INSERT INTO chapter_lore (chapter_id, term, definition, order_index)
VALUES
  (
    (SELECT id FROM chapters WHERE book_id = (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance') AND chapter_number = 1),
    'dantian',
    'The primary spiritual reservoir located three finger-widths beneath the navel where martial practitioners accumulate and condense qi.',
    1
  ),
  (
    (SELECT id FROM chapters WHERE book_id = (SELECT id FROM books WHERE slug = 'test-novel-path-of-the-heavenly-severance') AND chapter_number = 1),
    'golden core',
    'A solid orb of crystallized spiritual energy formed upon ascending to the Core Formation realm in classical Taoist cultivation.',
    2
  ),
  (
    (SELECT id FROM chapters WHERE book_id = (SELECT id FROM books WHERE slug = 'test-novel-neon-monolith-2099') AND chapter_number = 1),
    'ghost drive',
    'An encrypted military neuro-storage module capable of mirroring organic synaptic patterns in real-time.',
    1
  );

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
  u.username,
  p.handle AS persona_handle,
  b.title AS book_title,
  b.status AS book_status,
  COUNT(c.id) AS total_chapters,
  COUNT(CASE WHEN c.status = 'published' THEN 1 END) AS published_chapters,
  COUNT(CASE WHEN c.status = 'draft' THEN 1 END) AS draft_chapters
FROM users u
LEFT JOIN personas p ON p.user_id = u.id
LEFT JOIN books b ON b.persona_id = p.id
LEFT JOIN chapters c ON c.book_id = b.id
WHERE u.username LIKE 'test_%'
GROUP BY u.username, p.handle, b.title, b.status
ORDER BY u.username, p.handle, b.title;
