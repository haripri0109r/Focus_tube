/**
 * Topic Synonym Clusters
 *
 * Maps each learning topic to a set of semantically equivalent terms.
 * Used by the Intent Scorer to determine how well a video aligns with
 * the user's current focus session — beyond simple keyword matching.
 *
 * Maintenance: Add new clusters as new topics become common.
 * Each cluster should have 10–40 synonyms for good coverage.
 */

export const TopicSynonyms: Record<string, string[]> = {

  // ── Data Structures & Algorithms ──────────────────────────────────────
  'data structures': [
    'dsa', 'algorithm', 'algorithms', 'algorithmic', 'algorithm design',
    'tree', 'trees', 'binary tree', 'bst', 'avl', 'red black tree',
    'graph', 'graphs', 'graph theory', 'dag',
    'linked list', 'linkedlist', 'doubly linked', 'circular linked',
    'hash map', 'hashmap', 'hash table', 'hashtable', 'dictionary',
    'array', 'arrays', 'dynamic array', 'arraylist',
    'stack', 'queue', 'deque', 'priority queue',
    'heap', 'min heap', 'max heap', 'binary heap',
    'trie', 'prefix tree', 'radix tree',
    'segment tree', 'fenwick tree', 'binary indexed tree',
    'dynamic programming', 'dp', 'memoization', 'tabulation',
    'backtracking', 'recursion', 'divide and conquer',
    'greedy', 'greedy algorithm',
    'sorting', 'quicksort', 'mergesort', 'heapsort',
    'binary search', 'two pointer', 'sliding window',
    'leetcode', 'neetcode', 'competitive programming',
    'time complexity', 'space complexity', 'big o', 'big-o',
  ],

  // ── Machine Learning ────────────────────────────────────────────────────
  'machine learning': [
    'ml', 'machine learning', 'supervised learning', 'unsupervised learning',
    'neural network', 'neural networks', 'deep learning', 'dl',
    'gradient descent', 'backpropagation', 'loss function', 'optimizer',
    'regression', 'classification', 'clustering', 'dimensionality reduction',
    'random forest', 'decision tree', 'svm', 'support vector machine',
    'k means', 'kmeans', 'knn', 'k nearest neighbors',
    'cnn', 'rnn', 'lstm', 'gru', 'transformer', 'attention mechanism',
    'transfer learning', 'fine-tuning', 'finetuning',
    'dataset', 'training', 'inference', 'epoch', 'batch', 'overfitting',
    'underfitting', 'regularization', 'dropout', 'batch normalization',
    'pytorch', 'tensorflow', 'keras', 'sklearn', 'scikit-learn',
    'model training', 'model evaluation', 'cross validation',
  ],

  // ── Artificial Intelligence / LLMs ──────────────────────────────────────
  'artificial intelligence': [
    'ai', 'artificial intelligence', 'agi', 'generative ai',
    'llm', 'large language model', 'gpt', 'gpt-4', 'chatgpt',
    'bert', 'rag', 'retrieval augmented', 'embeddings', 'vector database',
    'langchain', 'agents', 'agentic ai', 'prompt engineering',
    'multimodal', 'vision model', 'diffusion model', 'stable diffusion',
    'openai', 'anthropic', 'google deepmind', 'mistral',
  ],

  // ── Programming ─────────────────────────────────────────────────────────
  'programming': [
    'coding', 'code', 'software development', 'software engineering',
    'programming language', 'syntax', 'debugging', 'refactoring',
    'clean code', 'design pattern', 'solid principles', 'oop',
    'functional programming', 'async', 'concurrency', 'multithreading',
  ],

  // ── Python ──────────────────────────────────────────────────────────────
  'python': [
    'python', 'python3', 'py', 'flask', 'django', 'fastapi',
    'pandas', 'numpy', 'matplotlib', 'scipy', 'jupyter',
    'pip', 'virtualenv', 'conda', 'pydantic',
  ],

  // ── JavaScript / TypeScript ─────────────────────────────────────────────
  'javascript': [
    'javascript', 'js', 'typescript', 'ts', 'es6', 'es2015', 'ecmascript',
    'nodejs', 'node.js', 'npm', 'yarn', 'pnpm',
    'react', 'reactjs', 'vue', 'vuejs', 'angular', 'svelte',
    'nextjs', 'next.js', 'nuxt', 'remix', 'vite', 'webpack',
    'express', 'nestjs', 'deno', 'bun',
    'dom', 'async await', 'promise', 'closure', 'prototype',
  ],

  // ── Computer Science ────────────────────────────────────────────────────
  'computer science': [
    'cs', 'computer science', 'computation', 'theory of computation',
    'operating system', 'os', 'process', 'thread', 'deadlock', 'memory management',
    'computer architecture', 'cpu', 'cache', 'pipelining', 'instruction set',
    'compiler', 'interpreter', 'lexer', 'parser', 'ast',
    'networking', 'tcp ip', 'dns', 'http', 'websocket', 'network protocol',
    'database', 'sql', 'nosql', 'transactions', 'acid', 'indexing', 'normalization',
    'distributed systems', 'consensus', 'cap theorem', 'eventual consistency',
  ],

  // ── Web Development ─────────────────────────────────────────────────────
  'web development': [
    'web dev', 'html', 'css', 'javascript', 'frontend', 'backend', 'fullstack',
    'rest api', 'graphql', 'http', 'web server', 'nginx', 'apache',
    'auth', 'oauth', 'jwt', 'cookie', 'session', 'cors',
    'responsive design', 'accessibility', 'a11y', 'seo',
  ],

  // ── DevOps / Cloud ──────────────────────────────────────────────────────
  'devops': [
    'devops', 'ci cd', 'continuous integration', 'continuous deployment',
    'docker', 'kubernetes', 'k8s', 'helm', 'terraform', 'ansible',
    'aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda',
    'monitoring', 'logging', 'prometheus', 'grafana', 'elk',
    'git', 'github actions', 'gitlab ci', 'jenkins',
  ],

  // ── Mathematics ─────────────────────────────────────────────────────────
  'mathematics': [
    'math', 'maths', 'calculus', 'differential calculus', 'integral calculus',
    'linear algebra', 'matrix', 'eigenvalue', 'vector',
    'probability', 'statistics', 'bayesian', 'distribution',
    'discrete mathematics', 'combinatorics', 'graph theory',
    'number theory', 'abstract algebra', 'topology',
    'proof', 'theorem', 'lemma', 'corollary',
  ],

  // ── Physics ─────────────────────────────────────────────────────────────
  'physics': [
    'physics', 'mechanics', 'classical mechanics', 'quantum mechanics',
    'thermodynamics', 'statistical mechanics', 'electromagnetism',
    'optics', 'relativity', 'special relativity', 'general relativity',
    'particle physics', 'nuclear physics', 'astrophysics', 'cosmology',
    'wave', 'oscillation', 'fluid dynamics',
  ],

  // ── Finance ─────────────────────────────────────────────────────────────
  'finance': [
    'investing', 'investment', 'stock market', 'stocks', 'equities',
    'mutual fund', 'etf', 'index fund', 'portfolio', 'diversification',
    'bonds', 'fixed income', 'derivatives', 'options', 'futures',
    'fundamental analysis', 'technical analysis', 'valuation',
    'personal finance', 'budgeting', 'saving', 'retirement',
    'cryptocurrency', 'blockchain', 'defi',
  ],

  // ── Cybersecurity ─────────────────────────────────────────────────────
  'cybersecurity': [
    'security', 'cybersecurity', 'infosec', 'ctf', 'capture the flag',
    'pentesting', 'penetration testing', 'ethical hacking',
    'vulnerability', 'exploit', 'payload', 'reverse engineering',
    'cryptography', 'encryption', 'hashing', 'ssl', 'tls',
    'firewall', 'ids', 'soc', 'incident response',
    'oscp', 'ceh', 'sans', 'owasp',
  ],

  // ── Exam Prep ──────────────────────────────────────────────────────────
  'upsc': [
    'upsc', 'ias', 'ips', 'civil services', 'prelims', 'mains',
    'gs1', 'gs2', 'gs3', 'gs4', 'essay', 'optional',
    'ncert', 'polity', 'history', 'economy', 'geography',
    'current affairs', 'the hindu', 'yojana', 'kurukshetra',
  ],

  'jee': [
    'jee', 'jee mains', 'jee advanced', 'iit', 'nit', 'bitsat',
    'physics jee', 'chemistry jee', 'maths jee', 'mathematics jee',
    'organic chemistry', 'mechanics', 'calculus', 'coordinate geometry',
    'allen', 'fiitjee', 'resonance', 'aakash', 'pw phyiscs wallah',
  ],

  'neet': [
    'neet', 'neet ug', 'mbbs', 'bds', 'medical entrance',
    'biology neet', 'physics neet', 'chemistry neet',
    'ncert biology', 'anatomy', 'physiology', 'biochemistry',
    'aakash neet', 'allen neet',
  ],
};

/**
 * Returns the synonym cluster for a given topic string.
 * Falls back to [topic] if no cluster is found.
 */
export function getTopicSynonyms(topic: string): string[] {
  const key = topic.toLowerCase().trim();
  return TopicSynonyms[key] ?? [key];
}
