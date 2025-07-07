// AWS Services Configuration for Cat Central AI

export interface AWSLambdaFunction {
  name: string;
  endpoint: string;
  description: string;
}

export const AWS_SERVICES = {
  // Amazon Bedrock for AI/ML capabilities
  BEDROCK: {
    region: 'us-east-1',
    models: {
      CLAUDE: 'anthropic.claude-3-sonnet-20240229-v1:0',
      TITAN_TEXT: 'amazon.titan-text-express-v1',
      TITAN_EMBEDDINGS: 'amazon.titan-embed-text-v1',
    },
  },

  // Amazon Rekognition for image analysis
  REKOGNITION: {
    region: 'us-east-1',
    features: ['DETECT_TEXT', 'DETECT_LABELS', 'CUSTOM_LABELS'],
  },

  // Amazon Transcribe for voice-to-text
  TRANSCRIBE: {
    region: 'us-east-1',
    languageCode: 'en-US',
  },

  // Amazon Polly for text-to-speech
  POLLY: {
    region: 'us-east-1',
    voiceId: 'Joanna',
    outputFormat: 'mp3',
  },

  // Amazon OpenSearch for parts search
  OPENSEARCH: {
    region: 'us-east-1',
    domain: 'cat-parts-search',
  },

  // Lambda Functions for AI processing
  LAMBDA_FUNCTIONS: {
    CHAT_PROCESSOR: {
      name: 'cat-central-chat-processor',
      endpoint: '/chat',
      description: 'Process chat messages and generate AI responses',
    },
    PARTS_FINDER: {
      name: 'cat-central-parts-finder',
      endpoint: '/parts/find',
      description: 'Find compatible parts using AI and equipment data',
    },
    FAULT_CODE_ANALYZER: {
      name: 'cat-central-fault-analyzer',
      endpoint: '/fault-codes/analyze',
      description: 'Analyze fault codes and provide troubleshooting guidance',
    },
    IMAGE_PROCESSOR: {
      name: 'cat-central-image-processor',
      endpoint: '/parts/identify',
      description: 'Identify parts from images using computer vision',
    },
    VOICE_PROCESSOR: {
      name: 'cat-central-voice-processor',
      endpoint: '/voice/process',
      description: 'Process voice commands and convert to actionable requests',
    },
    RECOMMENDATION_ENGINE: {
      name: 'cat-central-recommendations',
      endpoint: '/recommendations',
      description: 'Generate personalized part recommendations',
    },
  },
};

export const AI_CAPABILITIES = {
  // Core AI features that should be implemented
  NATURAL_LANGUAGE_PROCESSING: {
    description: 'Understand user queries in natural language',
    awsServices: ['Bedrock Claude', 'Comprehend'],
    accuracy: '95%+',
  },
  
  PARTS_IDENTIFICATION: {
    description: 'Identify parts from images and descriptions',
    awsServices: ['Rekognition', 'Bedrock', 'OpenSearch'],
    accuracy: '90%+',
  },
  
  FAULT_CODE_DIAGNOSIS: {
    description: 'Analyze fault codes and provide troubleshooting steps',
    awsServices: ['Bedrock', 'DynamoDB'],
    accuracy: '95%+',
  },
  
  VOICE_INTERACTION: {
    description: 'Voice commands and audio responses',
    awsServices: ['Transcribe', 'Polly'],
    accuracy: '90%+',
  },
  
  PERSONALIZED_RECOMMENDATIONS: {
    description: 'AI-powered part suggestions based on user history',
    awsServices: ['Personalize', 'Bedrock'],
    accuracy: '85%+',
  },
  
  PREDICTIVE_MAINTENANCE: {
    description: 'Predict maintenance needs based on equipment data',
    awsServices: ['SageMaker', 'IoT Analytics'],
    accuracy: '80%+',
  },
};

export const IMPLEMENTATION_PHASES = {
  PHASE_1: {
    name: 'Basic AI Chat',
    features: ['Natural language processing', 'Basic parts search', 'Fault code lookup'],
    timeline: '4-6 weeks',
    awsServices: ['Bedrock', 'Lambda', 'API Gateway'],
  },
  
  PHASE_2: {
    name: 'Advanced Features',
    features: ['Image recognition', 'Voice commands', 'Smart recommendations'],
    timeline: '6-8 weeks',
    awsServices: ['Rekognition', 'Transcribe', 'Polly', 'Personalize'],
  },
  
  PHASE_3: {
    name: 'Predictive Intelligence',
    features: ['Predictive maintenance', 'Advanced analytics', 'Learning algorithms'],
    timeline: '8-12 weeks',
    awsServices: ['SageMaker', 'IoT Analytics', 'QuickSight'],
  },
};