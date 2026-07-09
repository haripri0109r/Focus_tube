/**
 * FocusTube — Relevance Classification Constants
 *
 * These lists power the scoring engine. They are intentionally comprehensive
 * to maximize catch rate. Maintenance: add terms here when you find content
 * slipping through or being incorrectly blocked.
 */

// ---------------------------------------------------------------------------
// Educational Signals — INCREASE score
// ---------------------------------------------------------------------------

export const EDUCATIONAL_KEYWORDS: readonly string[] = [
  // Generic learning terms
  'tutorial', 'course', 'learn', 'learning', 'introduction', 'intro', 'basics',
  'beginner', 'advanced', 'intermediate', 'guide', 'walkthrough', 'explained',
  'explanation', 'fundamentals', 'concepts', 'deep dive', 'full course',
  'masterclass', 'crash course', 'bootcamp', 'series', 'complete guide',
  'step by step', 'how to', 'lesson', 'lecture', 'seminar', 'workshop',
  'training', 'education', 'academic', 'university', 'college', 'school',
  'class', 'module', 'chapter', 'roadmap', 'syllabus', 'curriculum',

  // Programming & CS
  'coding', 'programming', 'development', 'software', 'engineering',
  'computer science', 'algorithm', 'algorithms', 'data structure', 'data structures',
  'leetcode', 'hackerrank', 'codeforces', 'competitive programming',
  'interview prep', 'interview preparation', 'interview questions',
  'system design', 'object oriented', 'oop', 'design pattern', 'design patterns',
  'debugging', 'refactoring', 'architecture', 'backend', 'frontend', 'fullstack',
  'full stack', 'api', 'rest api', 'graphql', 'microservices', 'devops',
  'docker', 'kubernetes', 'cloud', 'aws', 'azure', 'gcp',
  'git', 'github', 'version control', 'agile', 'scrum',
  'database', 'sql', 'nosql', 'mongodb', 'postgresql',
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'rust', 'golang', 'swift',
  'react', 'vue', 'angular', 'nextjs', 'nodejs', 'express', 'django', 'flask',
  'spring', 'spring boot', 'hibernate',
  'machine learning', 'deep learning', 'neural network', 'ai', 'artificial intelligence',
  'data science', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch',

  // DSA Specific
  'binary tree', 'bst', 'binary search tree', 'graph', 'graphs',
  'bfs', 'dfs', 'breadth first', 'depth first',
  'dynamic programming', 'dp', 'memoization', 'tabulation',
  'greedy', 'backtracking', 'divide and conquer', 'recursion',
  'sorting', 'quicksort', 'mergesort', 'heapsort', 'bubble sort', 'insertion sort',
  'linked list', 'stack', 'queue', 'deque', 'priority queue',
  'heap', 'min heap', 'max heap', 'binary heap',
  'hash map', 'hash table', 'hashing',
  'trie', 'prefix tree', 'segment tree', 'fenwick tree', 'union find', 'disjoint set',
  'sliding window', 'two pointer', 'binary search',
  'complexity', 'time complexity', 'space complexity', 'big o', 'big-o',
  'neetcode', 'striver', 'take u forward', 'love babbar', 'kunal kushwaha',
  'apna college', 'abdul bari',

  // Science & Math
  'science', 'math', 'mathematics', 'physics', 'chemistry', 'biology',
  'calculus', 'linear algebra', 'probability', 'statistics', 'discrete math',
  'theorem', 'proof', 'formula', 'equation',
  'documentary', 'research', 'paper', 'study', 'analysis', 'case study',
  'review', 'best practices', 'tips', 'tricks', 'productivity',

  // Professional / Exam prep
  'exam', 'gate', 'upsc', 'gre', 'cat', 'sat', 'preparation', 'mock test',
  'previous year', 'solved problems', 'practice problems', 'exercises',
  'faang', 'maang', 'amazon interview', 'google interview', 'meta interview',
  'microsoft interview', 'apple interview',
];

// ---------------------------------------------------------------------------
// Entertainment Signals — DECREASE score
// ---------------------------------------------------------------------------

export const ENTERTAINMENT_KEYWORDS: readonly string[] = [
  // Music & Audio
  'song', 'songs', 'music', 'official video', 'official audio', 'lyrics',
  'lyric video', 'remix', 'cover', 'acoustic', 'live performance',
  'album', 'single', 'ep', 'tracklist', 'ost', 'soundtrack',
  'ft.', 'feat.', 'prod.', 'music video',

  // Movies, Web Series, TV
  'movie', 'film', 'cinema', 'trailer', 'teaser', 'promo', 'premiere',
  'web series', 'webseries', 'series', 'episode', 'season', 'part 1', 'part 2',
  'scene', 'deleted scene', 'behind the scenes', 'bloopers',
  'bollywood', 'hollywood', 'tollywood', 'kollywood', 'mollywood',
  'netflix', 'amazon prime', 'hotstar', 'zee5', 'sony liv', 'jio cinema',
  'ott', 'streaming', 'web show', 'tv show', 'serial', 'soap opera',
  'animation movie', 'cartoon movie', 'dubbed',

  // Comedy & Memes
  'funny', 'comedy', 'humor', 'humour', 'joke', 'jokes', 'prank', 'pranks',
  'meme', 'memes', 'troll', 'trolling', 'roast', 'roasting',
  'stand-up', 'standup', 'stand up comedy', 'skit', 'sketch',
  'try not to laugh', 'cringe', 'fail', 'fails', 'blooper',
  'parody', 'satire', 'spoof',

  // Vlogs & Lifestyle
  'vlog', 'vlogs', 'vlogging', 'day in my life', 'day in the life',
  'morning routine', 'night routine', 'daily routine', 'weekly vlog',
  'life update', 'storytime', 'what i eat', 'haul',
  'lifestyle', 'fashion', 'beauty', 'makeup', 'skincare', 'grooming',
  'ootd', 'outfit', 'clothing', 'shopping',

  // Food & Travel
  'food', 'recipe', 'cooking', 'baking', 'chef', 'restaurant', 'mukbang',
  'travel', 'trip', 'vacation', 'holiday', 'adventure', 'explore',
  'tour', 'vaca', 'road trip',

  // Gaming
  'gaming', 'gameplay', "let's play", 'lets play', 'playthrough',
  'walkthrough game', 'game review', 'game trailer',
  'minecraft', 'gta', 'gta 5', 'gta v', 'pubg', 'free fire', 'bgmi',
  'valorant', 'fortnite', 'roblox', 'among us', 'fall guys', 'warzone',
  'cod', 'call of duty', 'league of legends', 'lol', 'dota', 'csgo',
  'apex legends', 'overwatch', 'fifa', 'efootball', 'pes',
  'speedrun', 'no commentary', 'fps', 'battle royale', 'esports',

  // Sports
  'cricket', 'ipl', 'test match', 'odi', 't20', 'highlight', 'highlights',
  'football', 'soccer', 'premier league', 'la liga', 'bundesliga',
  'nfl', 'nba', 'basketball', 'tennis', 'badminton', 'chess game',
  'boxing', 'mma', 'ufc', 'wrestling', 'wwe',
  'sports news', 'match analysis', 'transfer news',

  // Celebrity / Pop Culture
  'celebrity', 'gossip', 'controversy', 'drama', 'exposed', 'exposed!',
  'beef', 'diss track', 'interview celebrity', 'red carpet',
  'award show', 'oscars', 'grammy', 'filmfare',
  'tiktok', 'reels', 'instagram', 'viral',

  // Animals & Kids
  'funny animals', 'cute animals', 'baby animals', 'pet video',
  'kids video', 'kids cartoon', 'nursery rhyme',

  // Reality / Misc Entertainment
  'reality show', 'big boss', 'bigg boss', 'fear factor',
  'unboxing', 'haul video', 'mukbang eating', 'asmr',
  'reaction', 'reacting to', 'watching', 'watch party',
  'clickbait', 'trending', 'viral video', 'challenge',
  'ice bucket', '10 year', 'transformation', 'before and after',

  // Shorts / Social Media Compilations
  'shorts compilation', 'tiktok compilation', 'reel compilation',
  'instagram reels', 'facebook reels',

  // Cars & Bikes
  'car review', 'bike review', 'test drive', 'car vlog', 'bike vlog',
  'superbike', 'modified car', 'racing', 'drifting',

  // Anime / Fan Content
  'anime edit', 'fan edit', 'amv', 'tribute', 'fan made',
  'anime reaction', 'manga',

  // Indian Regional Entertainment
  'vijay tv', 'sun tv', 'star vijay', 'zee tamil', 'colors tamil',
  'tamil serial', 'tamil movie', 'tamil song', 'tamil comedy',
  'kollywood', 'thalapathy', 'rajinikanth', 'vijay', 'ajith',
  'telugu movie', 'telugu song', 'telugu comedy',
  'malayalam movie', 'malayalam song',
  'kannada movie', 'kannada song',
  'hindi movie', 'hindi song', 'hindi comedy',
  'punjabi song', 'punjabi music',

  // Popular Entertainment Formats
  'prank gone wrong', 'social experiment', 'challenge gone wrong',
  'unboxing', 'mukbang eating', 'asmr',
  'roast video', 'diss track',
  'q&a', 'q and a', 'ama',
  'subscribers', 'fans', '1 million', '10 million', '100 million',
  'collab', 'collaboration video',

  // Celebs & Influencers
  'mrbeast', 'pewdiepie', 'markiplier', 'jacksepticeye',
  'dude perfect', 'sidemen', 'vj siddhu', 'ashwin kumar',
  'beyhadh', 'kumkum bhagya', 'kundali bhagya',
  'bigg boss', 'koffee with karan', 'jhalak dikhla ja',
];

// ---------------------------------------------------------------------------
// Strong Entertainment Channel Patterns — HEAVILY penalize score
// ---------------------------------------------------------------------------

export const ENTERTAINMENT_CHANNEL_PATTERNS: readonly string[] = [
  // Music labels
  't-series', 'tseries', 'zee music', 'sony music', 'universal music',
  'warner music', 'eros now', 'tips music', 'saregama',
  'lahari music', 'aditya music', 'speed records', 'bvrecordings',
  'desi music', 'white hill music',

  // Bollywood / Movie
  'yash raj', 'dharma', 'fox star', 'disney india', 'balaji motion',
  'zee studios', 'eros', 'pen movies', 'shemaroo',

  // Gaming
  'total gaming', 'techno gamerz', 'dynamo gaming', 'mortal gaming',
  'jonathan gaming', 'beast boy shub', 'triggered insaan',

  // Meme / Comedy
  'bb ki vines', 'carryminati', 'elvish yadav', 'thugesh',
  'fukra insaan', 'bhuvan bam', 'ashish chanchlani', 'round2hell',

  // Cricket / Sports
  'bcci', 'star sports', 'sony sports', 'espn cricket',

  // Vlog / Lifestyle
  'be younic', 'technical guruji', 'mumbiker nikhil',
  'travel with wife', 'abhi and niyu', 'mumbai meri jaan',

  // Tamil Regional Entertainment
  'vijay tv', 'sun tv', 'star vijay', 'zee tamil', 'colors tamil',
  'rowdy baby', 'super singer', 'cook with comali', 'neeya naana',
  'vj siddhu', 'vj ashwin', 'vj bala',

  // Telugu / Hindi Entertainment Channels
  'aha video', 'zee telugu', 'etv telugu',
  'star plus', 'zee tv', 'colors', 'sony entertainment',
  'eros now', 'shemaroo entertainment',

  // Viral / Trending Creators
  'mrbeast', 'mrbeast gaming', 'dream', 'technoblade',
  't-series', 'tseries', 'set india', 'zee music company',
];

// ---------------------------------------------------------------------------
// Known Educational Channels — STRONGLY increase score
// ---------------------------------------------------------------------------

export const EDUCATIONAL_CHANNELS: readonly string[] = [
  // CS / Programming
  'freecodecamp', 'fireship', 'traversy media', 'web dev simplified',
  'programming with mosh', 'the net ninja', 'academind', 'kevin powell',
  'jack herrington', 'theo', 't3.gg', 'primagen', 'theprimeagen',
  'low level learning', 'computerphile', 'networkchuck', 'techworld with nana',
  'sentdex', 'corey schafer', 'tech with tim', 'cs dojo', 'clever programmer',
  'code with antonio', 'lama dev',

  // DSA / Interview Prep
  'neetcode', 'striver', 'take u forward', 'love babbar', 'kunal kushwaha',
  'apna college', 'jenny lecture', 'jenny\'s lectures', 'gate smashers',
  'abdul bari', 'techdose', 'neso academy', 'codehelp', 'codewithharry',
  'code with harry', 'geeksforgeeks', 'back to back swe', 'william fiset',
  'errichto', 'kartik arora', 'pepcoding',

  // Math / Science / General
  'numberphile', 'kurzgesagt', 'veritasium', '3blue1brown', 'ted-ed',
  'crashcourse', 'crash course', 'khan academy', 'mit opencourseware',
  'stanford online', 'harvard', 'cs50', 'oxford', 'nptel',
  'mark rober', 'vsauce', 'minutephysics', 'smarter every day',
  'simone giertz', 'real engineering', 'practical engineering',

  // ML / AI / Data Science
  'sentdex', 'andrej karpathy', 'yannic kilcher', 'lex fridman',
  'two minute papers', 'ai explained', 'deepmind', 'openai',
  'statquest', 'ritvikmath', 'ken jee', 'tina huang',

  // Finance / Business (educational)
  'ca rahul malodia', 'ca rachana phadke', 'labour law advisor',
];

// ---------------------------------------------------------------------------
// Topic Synonym Map
// Maps user-typed topics to an expanded set of related search terms.
// Used by keyword-expansion.ts for better coverage.
// ---------------------------------------------------------------------------

export const TOPIC_SYNONYM_MAP: Readonly<Record<string, readonly string[]>> = {
  // DSA / Algorithms
  dsa: [
    'data structure', 'data structures', 'algorithm', 'algorithms',
    'leetcode', 'codeforces', 'competitive programming',
    'binary tree', 'bst', 'graph', 'bfs', 'dfs',
    'dynamic programming', 'dp', 'greedy', 'backtracking',
    'linked list', 'stack', 'queue', 'heap', 'trie',
    'hash map', 'hash table', 'segment tree', 'union find',
    'sorting', 'binary search', 'two pointer', 'sliding window',
    'recursion', 'divide and conquer',
    'interview preparation', 'coding interview', 'faang',
    'neetcode', 'striver', 'love babbar', 'apna college',
    'system design', 'big o', 'complexity',
  ],
  'data structures': ['dsa', 'algorithm', 'leetcode', 'binary tree', 'graph'],
  algorithms: ['dsa', 'data structure', 'leetcode', 'complexity', 'sorting'],

  // Web Dev
  react: ['reactjs', 'react js', 'react hooks', 'nextjs', 'next.js', 'jsx', 'tsx', 'redux', 'zustand', 'react query', 'vite react', 'frontend'],
  javascript: ['js', 'es6', 'es2015', 'typescript', 'nodejs', 'dom', 'async await', 'promise', 'closure', 'prototype'],
  typescript: ['ts', 'typed javascript', 'type annotations', 'interfaces', 'generics'],
  python: ['python3', 'py', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'pip'],
  java: ['java 17', 'java 21', 'spring', 'spring boot', 'jvm', 'maven', 'gradle'],
  'spring boot': ['spring', 'java', 'microservices', 'rest api', 'hibernate', 'jpa'],
  nodejs: ['node.js', 'node js', 'express', 'npm', 'backend javascript'],

  // System Design
  'system design': ['distributed systems', 'scalability', 'load balancer', 'caching', 'database design', 'microservices', 'api design', 'cap theorem'],

  // AI / ML
  'machine learning': ['ml', 'ai', 'deep learning', 'neural network', 'scikit-learn', 'tensorflow', 'pytorch', 'regression', 'classification', 'clustering'],
  'deep learning': ['neural network', 'cnn', 'rnn', 'lstm', 'transformer', 'bert', 'gpt', 'pytorch', 'tensorflow'],
  ai: ['artificial intelligence', 'machine learning', 'llm', 'gpt', 'chatgpt', 'gemini', 'openai'],

  // DevOps / Cloud
  devops: ['docker', 'kubernetes', 'k8s', 'jenkins', 'ci cd', 'cicd', 'ansible', 'terraform', 'linux', 'bash'],
  docker: ['container', 'containerization', 'dockerfile', 'docker compose', 'kubernetes'],
  kubernetes: ['k8s', 'docker', 'orchestration', 'helm', 'pod', 'deployment'],
  aws: ['amazon web services', 'ec2', 's3', 'lambda', 'rds', 'cloudfront', 'iam'],

  // Databases
  sql: ['mysql', 'postgresql', 'postgres', 'database', 'query', 'joins', 'indexing', 'normalization'],
  mongodb: ['nosql', 'document database', 'mongoose', 'atlas'],

  // Cyber Security
  'cyber security': ['cybersecurity', 'ethical hacking', 'penetration testing', 'pentest', 'ctf', 'owasp', 'kali linux', 'burp suite'],

  // Linux
  linux: ['ubuntu', 'bash', 'shell scripting', 'command line', 'terminal', 'debian', 'arch linux'],
};
