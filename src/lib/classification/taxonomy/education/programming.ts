import { TaxonomyCategoryModule } from '../../types';

const module: TaxonomyCategoryModule = {
  category: 'PROGRAMMING',
  type: 'EDU',
  version: '1.0.0',
  subtopics: {
    general: {
      weight: 40,
      keywords: [
        'programming', 'coding', 'tutorial', 'course', 'learn', 'learning',
        'explained', 'explanation', 'guide', 'walkthrough', 'beginner',
        'intermediate', 'advanced', 'full course', 'crash course', 'masterclass',
        'bootcamp', 'roadmap', 'step by step', 'how to code', 'how to program',
        'software development', 'software engineering', 'clean code',
        'design pattern', 'solid principles', 'refactoring', 'debugging',
        'oop', 'object oriented', 'functional programming',
      ],
    },
    python: {
      weight: 42,
      keywords: [
        'python', 'python3', 'python tutorial', 'python course', 'python basics',
        'flask', 'django', 'fastapi', 'aiohttp', 'tornado',
        'pandas', 'numpy', 'matplotlib', 'seaborn', 'scipy', 'jupyter', 'notebook',
        'pip', 'virtualenv', 'conda', 'poetry', 'pydantic', 'sqlalchemy',
        'pytest', 'unittest', 'mypy', 'black formatter',
        'python asyncio', 'python multiprocessing',
      ],
    },
    javascript: {
      weight: 42,
      keywords: [
        'javascript', 'js tutorial', 'typescript', 'ts tutorial',
        'es6', 'es2015', 'ecmascript', 'javascript basics',
        'promise', 'async await', 'closure', 'prototype chain',
        'event loop', 'call stack', 'dom manipulation',
        'react', 'reactjs', 'react hooks', 'vue', 'vuejs', 'angular', 'svelte',
        'nextjs', 'next.js', 'nuxt', 'remix', 'vite', 'webpack', 'babel',
        'nodejs', 'node.js', 'express', 'nestjs', 'fastify', 'deno', 'bun',
        'npm', 'yarn', 'pnpm',
      ],
    },
    java: {
      weight: 42,
      keywords: [
        'java', 'java tutorial', 'java basics', 'java programming',
        'spring', 'spring boot', 'spring mvc', 'hibernate', 'jpa',
        'maven', 'gradle', 'junit', 'mockito',
        'jvm', 'jit', 'garbage collection java', 'bytecode',
        'java streams', 'java lambda', 'java generics', 'java concurrency',
        'kotlin', 'android development',
      ],
    },
    systems: {
      weight: 44,
      keywords: [
        'c programming', 'c tutorial', 'c language',
        'c++', 'cpp', 'cpp tutorial', 'stl', 'standard template library',
        'rust', 'rust programming', 'ownership', 'borrowing', 'lifetimes',
        'memory management', 'pointers', 'references', 'stack heap',
        'go', 'golang', 'goroutine', 'channel go',
        'systems programming', 'low level programming',
      ],
    },
    mobile: {
      weight: 40,
      keywords: [
        'react native', 'flutter', 'dart', 'swift', 'swiftui', 'ios development',
        'android development', 'kotlin android', 'jetpack compose',
        'mobile app', 'app development', 'cross platform',
      ],
    },
    devtools: {
      weight: 38,
      keywords: [
        'git', 'github', 'gitlab', 'version control', 'branching', 'merging',
        'pull request', 'code review', 'git workflow',
        'linux', 'terminal', 'bash', 'shell scripting', 'vim', 'neovim',
        'vs code', 'ide setup', 'developer tools', 'productivity tools',
      ],
    },
  },
};

export default module;
