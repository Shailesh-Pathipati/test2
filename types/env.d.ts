declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Free LLM API Keys
      EXPO_PUBLIC_GROQ_API_KEY: string;
      EXPO_PUBLIC_TOGETHER_API_KEY: string;
      EXPO_PUBLIC_COHERE_API_KEY: string;
      EXPO_PUBLIC_HUGGINGFACE_API_KEY: string;
      
      // AWS Configuration (optional)
      EXPO_PUBLIC_AWS_REGION: string;
      EXPO_PUBLIC_AWS_ACCESS_KEY_ID: string;
      EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY: string;
      
      // Legacy AI Service (for backward compatibility)
      EXPO_PUBLIC_AI_API_ENDPOINT: string;
      EXPO_PUBLIC_AI_API_KEY: string;
      
      // Development settings
      EXPO_PUBLIC_MOCK_AI_RESPONSES: string;
      EXPO_PUBLIC_DEBUG_MODE: string;
    }
  }
}

export {};