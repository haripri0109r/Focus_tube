import { TaxonomyCategoryModule } from '../../types';

const module: TaxonomyCategoryModule = {
  category: 'COMPUTER_SCIENCE',
  type: 'EDU',
  version: '1.0.0',
  subtopics: {
    dsa: {
      weight: 50,
      keywords: [
        'data structure', 'data structures', 'algorithm', 'algorithms', 'dsa',
        'binary tree', 'bst', 'binary search tree', 'avl tree', 'red black tree',
        'graph', 'graphs', 'graph theory', 'dag', 'directed acyclic graph',
        'bfs', 'dfs', 'breadth first search', 'depth first search',
        'linked list', 'doubly linked list', 'circular linked list',
        'stack', 'queue', 'deque', 'priority queue',
        'heap', 'min heap', 'max heap', 'binary heap',
        'hash map', 'hash table', 'hashing', 'hash set',
        'trie', 'prefix tree', 'segment tree', 'fenwick tree', 'binary indexed tree',
        'union find', 'disjoint set',
        'dynamic programming', 'dp', 'memoization', 'tabulation',
        'greedy algorithm', 'backtracking', 'divide and conquer', 'recursion',
        'sorting', 'quicksort', 'mergesort', 'heapsort', 'counting sort', 'radix sort',
        'binary search', 'two pointer', 'sliding window', 'fast slow pointer',
        'time complexity', 'space complexity', 'big o notation', 'big-o',
        'leetcode', 'neetcode', 'striver', 'take u forward', 'love babbar',
        'competitive programming', 'codeforces', 'hackerrank', 'codechef',
      ],
    },
    operating_systems: {
      weight: 45,
      keywords: [
        'operating system', 'os', 'process', 'thread', 'multithreading', 'concurrency',
        'deadlock', 'mutex', 'semaphore', 'race condition', 'synchronization',
        'memory management', 'virtual memory', 'paging', 'segmentation',
        'file system', 'inode', 'disk scheduling', 'cpu scheduling',
        'context switch', 'process control block', 'pcb',
        'kernel', 'system call', 'interrupt', 'trap',
        'linux kernel', 'unix', 'posix',
      ],
    },
    networking: {
      weight: 45,
      keywords: [
        'networking', 'computer network', 'tcp ip', 'udp', 'dns', 'dhcp',
        'http', 'https', 'http2', 'http3', 'websocket', 'rest', 'grpc',
        'ip address', 'subnet', 'routing', 'nat', 'firewall', 'load balancer',
        'osi model', 'network layer', 'transport layer', 'application layer',
        'ssl', 'tls', 'certificate', 'handshake',
        'cdn', 'proxy', 'reverse proxy', 'nginx', 'apache',
      ],
    },
    architecture: {
      weight: 45,
      keywords: [
        'computer architecture', 'cpu', 'gpu', 'processor', 'cache', 'registers',
        'instruction set', 'isa', 'risc', 'cisc', 'arm', 'x86',
        'pipelining', 'branch prediction', 'out of order execution',
        'memory hierarchy', 'ram', 'cache coherence', 'tlb',
        'von neumann', 'harvard architecture',
        'system design', 'scalability', 'microservices', 'monolith',
        'load balancing', 'caching strategy', 'database sharding',
        'message queue', 'event driven', 'pub sub',
      ],
    },
    compilers: {
      weight: 45,
      keywords: [
        'compiler', 'interpreter', 'lexer', 'tokenizer', 'parser',
        'abstract syntax tree', 'ast', 'semantic analysis', 'code generation',
        'optimization', 'jit compilation', 'ahead of time compilation',
        'garbage collection', 'reference counting', 'mark and sweep',
        'llvm', 'bytecode', 'virtual machine', 'jvm',
      ],
    },
    databases: {
      weight: 45,
      keywords: [
        'database', 'sql', 'nosql', 'relational database', 'rdbms',
        'mysql', 'postgresql', 'sqlite', 'oracle db', 'sql server',
        'mongodb', 'cassandra', 'redis', 'dynamodb', 'elasticsearch',
        'acid', 'transaction', 'isolation level', 'normalization',
        'indexing', 'query optimization', 'explain plan',
        'orm', 'schema design', 'database design',
      ],
    },
  },
};

export default module;
