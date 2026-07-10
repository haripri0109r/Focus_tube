import { TaxonomyCategoryModule } from '../../types';

const module: TaxonomyCategoryModule = {
  category: 'AI_ML',
  type: 'EDU',
  version: '1.0.0',
  subtopics: {
    machine_learning: {
      weight: 48,
      keywords: [
        'machine learning', 'ml tutorial', 'supervised learning', 'unsupervised learning',
        'reinforcement learning', 'semi-supervised',
        'linear regression', 'logistic regression', 'polynomial regression',
        'decision tree', 'random forest', 'gradient boosting', 'xgboost', 'lightgbm',
        'svm', 'support vector machine', 'naive bayes', 'k nearest neighbors', 'knn',
        'k-means', 'kmeans', 'clustering', 'dbscan', 'hierarchical clustering',
        'pca', 'dimensionality reduction', 'feature engineering', 'feature selection',
        'cross validation', 'hyperparameter tuning', 'grid search', 'random search',
        'overfitting', 'underfitting', 'bias variance', 'regularization',
        'sklearn', 'scikit learn',
      ],
    },
    deep_learning: {
      weight: 50,
      keywords: [
        'deep learning', 'neural network', 'neural networks', 'dl tutorial',
        'cnn', 'convolutional neural network', 'image classification', 'object detection',
        'rnn', 'recurrent neural network', 'lstm', 'gru', 'sequence model',
        'transformer', 'attention mechanism', 'self attention', 'multi-head attention',
        'bert', 'gpt', 'gpt-4', 'llm', 'large language model',
        'transfer learning', 'fine-tuning', 'finetuning', 'pretrained model',
        'pytorch', 'tensorflow', 'keras', 'jax', 'hugging face',
        'backpropagation', 'gradient descent', 'adam optimizer', 'sgd',
        'batch normalization', 'dropout', 'activation function', 'relu', 'softmax',
        'generative model', 'gan', 'vae', 'diffusion model', 'stable diffusion',
      ],
    },
    llms_rag: {
      weight: 50,
      keywords: [
        'llm tutorial', 'large language model', 'chatgpt', 'openai api',
        'anthropic claude', 'gemini api', 'mistral', 'llama', 'ollama',
        'rag', 'retrieval augmented generation', 'vector database', 'embeddings',
        'langchain', 'llamaindex', 'semantic search', 'chroma', 'pinecone', 'weaviate',
        'prompt engineering', 'system prompt', 'few shot', 'chain of thought',
        'agentic ai', 'ai agents', 'tool use', 'function calling',
        'multimodal', 'vision language model', 'audio model', 'whisper',
        'fine-tuning llm', 'lora', 'qlora', 'peft',
      ],
    },
    data_science: {
      weight: 45,
      keywords: [
        'data science', 'data analysis', 'data analytics', 'data engineering',
        'exploratory data analysis', 'eda', 'data visualization', 'dashboard',
        'pandas tutorial', 'numpy tutorial', 'matplotlib', 'seaborn', 'plotly',
        'sql for data science', 'big data', 'spark', 'hadoop', 'kafka',
        'data pipeline', 'etl', 'data warehouse', 'snowflake', 'bigquery',
        'statistics for data science', 'hypothesis testing', 'a/b testing',
      ],
    },
  },
};

export default module;
