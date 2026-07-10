import { TaxonomyCategoryModule } from '../../types';

const module: TaxonomyCategoryModule = {
  category: 'MATHEMATICS',
  type: 'EDU',
  version: '1.0.0',
  subtopics: {
    general: {
      weight: 45,
      keywords: [
        'mathematics', 'math tutorial', 'maths', 'mathematical proof',
        'theorem', 'lemma', 'corollary', 'axiom', 'conjecture',
        'equation', 'formula', 'inequality', 'problem solving',
      ],
    },
    calculus: {
      weight: 45,
      keywords: [
        'calculus', 'differential calculus', 'integral calculus', 'multivariable calculus',
        'derivative', 'differentiation', 'integration', 'antiderivative',
        'limits', 'continuity', 'chain rule', 'product rule', 'quotient rule',
        'taylor series', 'fourier series', 'laplace transform',
        'differential equation', 'ode', 'pde', 'partial differential',
      ],
    },
    linear_algebra: {
      weight: 45,
      keywords: [
        'linear algebra', 'matrix', 'matrices', 'vector', 'vector space',
        'eigenvalue', 'eigenvector', 'determinant', 'inverse matrix',
        'linear transformation', 'basis', 'span', 'null space', 'rank',
        'singular value decomposition', 'svd', 'lu decomposition', 'qr decomposition',
      ],
    },
    statistics: {
      weight: 45,
      keywords: [
        'statistics', 'probability', 'probability theory', 'bayesian statistics',
        'normal distribution', 'binomial distribution', 'poisson distribution',
        'expected value', 'variance', 'standard deviation', 'correlation',
        'hypothesis testing', 'p value', 'confidence interval',
        'regression analysis', 'anova', 'chi square',
      ],
    },
    discrete: {
      weight: 45,
      keywords: [
        'discrete mathematics', 'combinatorics', 'permutation', 'combination',
        'graph theory', 'number theory', 'modular arithmetic', 'prime numbers',
        'boolean algebra', 'logic gates', 'propositional logic', 'predicate logic',
        'set theory', 'relation', 'function',
      ],
    },
  },
};

export default module;
