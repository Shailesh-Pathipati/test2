import { Platform } from 'react-native';

// Free LLM API providers configuration
interface LLMProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  model: string;
  maxTokens: number;
  rateLimit: number; // requests per minute
}

const FREE_LLM_PROVIDERS: Record<string, LLMProvider> = {
  HUGGING_FACE: {
    name: 'Hugging Face',
    endpoint: 'https://api-inference.huggingface.co/models',
    model: 'microsoft/DialoGPT-large',
    maxTokens: 1024,
    rateLimit: 30,
  },
  COHERE: {
    name: 'Cohere',
    endpoint: 'https://api.cohere.ai/v1/generate',
    model: 'command-light',
    maxTokens: 2048,
    rateLimit: 100,
  },
  GROQ: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
    maxTokens: 8192,
    rateLimit: 30,
  },
  TOGETHER: {
    name: 'Together AI',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-2-7b-chat-hf',
    maxTokens: 4096,
    rateLimit: 60,
  },
};

interface LLMRequest {
  message: string;
  context?: {
    userId?: string;
    equipmentSerialNumbers?: string[];
    previousParts?: string[];
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  provider?: keyof typeof FREE_LLM_PROVIDERS;
}

interface LLMResponse {
  message: string;
  suggestions?: PartSuggestion[];
  faultCodeInfo?: FaultCodeInfo;
  troubleshootingSteps?: string[];
  confidence: number;
  provider: string;
}

interface PartSuggestion {
  partNumber: string;
  name: string;
  compatibility: string[];
  price: number;
  inStock: boolean;
  aiRecommended: boolean;
  reasonForSuggestion: string;
}

interface FaultCodeInfo {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  possibleCauses: string[];
  recommendedActions: string[];
  relatedParts: string[];
}

class FreeLLMService {
  private currentProvider: keyof typeof FREE_LLM_PROVIDERS;
  private requestCounts: Record<string, { count: number; resetTime: number }> = {};
  private fallbackOrder: Array<keyof typeof FREE_LLM_PROVIDERS> = ['GROQ', 'TOGETHER', 'COHERE', 'HUGGING_FACE'];

  constructor() {
    this.currentProvider = 'GROQ'; // Start with Groq as it's fast and reliable
  }

  /**
   * Check if any API keys are configured
   */
  private hasConfiguredProviders(): boolean {
    return !!(
      this.getValidApiKey('GROQ') ||
      this.getValidApiKey('TOGETHER') ||
      this.getValidApiKey('COHERE') ||
      this.getValidApiKey('HUGGING_FACE')
    );
  }

  /**
   * Get valid API key for a provider (not placeholder)
   */
  private getValidApiKey(provider: keyof typeof FREE_LLM_PROVIDERS): string | null {
    let apiKey: string | undefined;
    
    switch (provider) {
      case 'GROQ':
        apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
        break;
      case 'TOGETHER':
        apiKey = process.env.EXPO_PUBLIC_TOGETHER_API_KEY;
        break;
      case 'COHERE':
        apiKey = process.env.EXPO_PUBLIC_COHERE_API_KEY;
        break;
      case 'HUGGING_FACE':
        apiKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
        break;
    }

    // Check if API key exists and is not a placeholder
    if (!apiKey || 
        apiKey.includes('your_') || 
        apiKey.includes('_api_key_here') || 
        apiKey.trim() === '') {
      return null;
    }

    return apiKey;
  }

  /**
   * Get available providers with configured API keys
   */
  private getAvailableProviders(): Array<keyof typeof FREE_LLM_PROVIDERS> {
    const available: Array<keyof typeof FREE_LLM_PROVIDERS> = [];
    
    if (this.getValidApiKey('GROQ')) available.push('GROQ');
    if (this.getValidApiKey('TOGETHER')) available.push('TOGETHER');
    if (this.getValidApiKey('COHERE')) available.push('COHERE');
    if (this.getValidApiKey('HUGGING_FACE')) available.push('HUGGING_FACE');
    
    return available;
  }

  /**
   * Main LLM processing function with automatic fallback
   */
  async processMessage(request: LLMRequest): Promise<LLMResponse> {
    // Check if any providers are configured
    if (!this.hasConfiguredProviders()) {
      return this.getConfigurationRequiredResponse(request.message);
    }

    const availableProviders = this.getAvailableProviders();
    if (availableProviders.length === 0) {
      return this.getConfigurationRequiredResponse(request.message);
    }

    const provider = request.provider || this.currentProvider;
    
    // If requested provider is not available, use first available
    const actualProvider = availableProviders.includes(provider) ? provider : availableProviders[0];
    
    try {
      // Check rate limits
      if (this.isRateLimited(actualProvider)) {
        return await this.tryFallbackProviders(request, availableProviders);
      }

      const response = await this.callLLMProvider(actualProvider, request);
      this.updateRequestCount(actualProvider);
      
      return {
        ...response,
        provider: FREE_LLM_PROVIDERS[actualProvider].name,
      };
    } catch (error) {
      console.error(`Error with ${actualProvider}:`, error);
      return await this.tryFallbackProviders(request, availableProviders);
    }
  }

  /**
   * Call specific LLM provider
   */
  private async callLLMProvider(provider: keyof typeof FREE_LLM_PROVIDERS, request: LLMRequest): Promise<LLMResponse> {
    const config = FREE_LLM_PROVIDERS[provider];
    const prompt = this.buildCatCentralPrompt(request);

    switch (provider) {
      case 'GROQ':
        return await this.callGroq(config, prompt, request);
      case 'TOGETHER':
        return await this.callTogether(config, prompt, request);
      case 'COHERE':
        return await this.callCohere(config, prompt, request);
      case 'HUGGING_FACE':
        return await this.callHuggingFace(config, prompt, request);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Groq API implementation (Fast inference)
   */
  private async callGroq(config: LLMProvider, prompt: string, request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getValidApiKey('GROQ');
    if (!apiKey) {
      throw new Error('Groq API key not configured or invalid');
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config.maxTokens,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request.';
    
    return this.parseAIResponse(aiMessage, request);
  }

  /**
   * Together AI implementation
   */
  private async callTogether(config: LLMProvider, prompt: string, request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getValidApiKey('TOGETHER');
    if (!apiKey) {
      throw new Error('Together AI API key not configured or invalid');
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config.maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Together AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request.';
    
    return this.parseAIResponse(aiMessage, request);
  }

  /**
   * Cohere API implementation
   */
  private async callCohere(config: LLMProvider, prompt: string, request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getValidApiKey('COHERE');
    if (!apiKey) {
      throw new Error('Cohere API key not configured or invalid');
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt: `${this.getSystemPrompt()}\n\nUser: ${prompt}\nAssistant:`,
        max_tokens: config.maxTokens,
        temperature: 0.7,
        stop_sequences: ['User:', 'Human:'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.generations[0]?.text || 'I apologize, but I couldn\'t process your request.';
    
    return this.parseAIResponse(aiMessage, request);
  }

  /**
   * Hugging Face API implementation
   */
  private async callHuggingFace(config: LLMProvider, prompt: string, request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getValidApiKey('HUGGING_FACE');
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured or invalid');
    }

    const response = await fetch(`${config.endpoint}/${config.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: config.maxTokens,
          temperature: 0.7,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data[0]?.generated_text || 'I apologize, but I couldn\'t process your request.';
    
    return this.parseAIResponse(aiMessage, request);
  }

  /**
   * Build Cat Central specific prompt
   */
  private buildCatCentralPrompt(request: LLMRequest): string {
    const { message, context } = request;
    
    let prompt = `User Query: ${message}\n\n`;
    
    if (context?.equipmentSerialNumbers?.length) {
      prompt += `User Equipment: ${context.equipmentSerialNumbers.join(', ')}\n`;
    }
    
    if (context?.conversationHistory?.length) {
      prompt += `Previous Conversation:\n`;
      context.conversationHistory.slice(-3).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
    }
    
    prompt += `\nPlease provide a helpful response about Caterpillar equipment, parts, or maintenance.`;
    
    return prompt;
  }

  /**
   * System prompt for Cat Central context
   */
  private getSystemPrompt(): string {
    return `You are an AI assistant for Cat Central, specializing in Caterpillar heavy equipment, parts, and maintenance. Your expertise includes:

1. PARTS IDENTIFICATION & COMPATIBILITY
- Help users find the right parts for their equipment
- Suggest compatible alternatives and upgrades
- Provide part numbers, pricing estimates, and availability

2. FAULT CODE DIAGNOSIS
- Analyze fault codes and error messages
- Provide step-by-step troubleshooting guidance
- Recommend related parts that might need replacement

3. MAINTENANCE GUIDANCE
- Provide maintenance schedules and procedures
- Suggest preventive maintenance actions
- Help with service intervals and requirements

4. EQUIPMENT SUPPORT
- Answer questions about Cat equipment operation
- Provide technical specifications and capabilities
- Help with equipment selection and applications

RESPONSE GUIDELINES:
- Be concise but thorough
- Use clear, non-technical language when possible
- Always prioritize safety in your recommendations
- If you suggest parts, include part numbers when possible
- For fault codes, provide severity level and urgency
- When uncertain, recommend consulting a Cat dealer

RESPONSE FORMAT:
Provide responses in a conversational tone. If suggesting parts, format them as:
"Part: [Name] (Part #: [Number]) - [Brief description]"

For fault codes, include:
"Fault Code: [Code] - [Description]
Severity: [Low/Medium/High/Critical]
Possible Causes: [List]
Recommended Actions: [Steps]"

Remember: You're helping equipment operators and technicians who rely on their machines for their livelihood. Accuracy and safety are paramount.`;
  }

  /**
   * Parse AI response and extract structured information
   */
  private parseAIResponse(aiMessage: string, request: LLMRequest): LLMResponse {
    const response: LLMResponse = {
      message: aiMessage,
      confidence: 0.8,
      provider: '',
    };

    // Extract part suggestions
    const partMatches = aiMessage.match(/Part:\s*([^(]+)\s*\(Part #:\s*([^)]+)\)\s*-\s*([^\n]+)/gi);
    if (partMatches) {
      response.suggestions = partMatches.map(match => {
        const [, name, partNumber, description] = match.match(/Part:\s*([^(]+)\s*\(Part #:\s*([^)]+)\)\s*-\s*([^\n]+)/i) || [];
        return {
          partNumber: partNumber?.trim() || '',
          name: name?.trim() || '',
          compatibility: request.context?.equipmentSerialNumbers || [],
          price: Math.floor(Math.random() * 500) + 50, // Placeholder pricing
          inStock: Math.random() > 0.3,
          aiRecommended: true,
          reasonForSuggestion: description?.trim() || 'AI recommended based on your query',
        };
      });
    }

    // Extract fault code information
    const faultCodeMatch = aiMessage.match(/Fault Code:\s*([^\s]+)\s*-\s*([^\n]+)[\s\S]*?Severity:\s*([^\n]+)[\s\S]*?Possible Causes:\s*([^\n]+)[\s\S]*?Recommended Actions:\s*([^\n]+)/i);
    if (faultCodeMatch) {
      const [, code, description, severity, causes, actions] = faultCodeMatch;
      response.faultCodeInfo = {
        code: code?.trim() || '',
        description: description?.trim() || '',
        severity: (severity?.trim().toLowerCase() as any) || 'medium',
        possibleCauses: causes?.split(',').map(c => c.trim()) || [],
        recommendedActions: actions?.split(',').map(a => a.trim()) || [],
        relatedParts: [],
      };
    }

    // Extract troubleshooting steps
    const stepsMatch = aiMessage.match(/(?:Steps?|Actions?):\s*\n((?:\d+\..*\n?)+)/i);
    if (stepsMatch) {
      response.troubleshootingSteps = stepsMatch[1]
        .split('\n')
        .filter(step => step.trim())
        .map(step => step.replace(/^\d+\.\s*/, '').trim());
    }

    return response;
  }

  /**
   * Try fallback providers when primary fails
   */
  private async tryFallbackProviders(request: LLMRequest, availableProviders?: Array<keyof typeof FREE_LLM_PROVIDERS>): Promise<LLMResponse> {
    const providers = availableProviders || this.getAvailableProviders();
    
    for (const provider of providers) {
      if (!this.isRateLimited(provider)) {
        try {
          const response = await this.callLLMProvider(provider, request);
          this.currentProvider = provider; // Switch to working provider
          return {
            ...response,
            provider: FREE_LLM_PROVIDERS[provider].name,
          };
        } catch (error) {
          console.error(`Fallback provider ${provider} failed:`, error);
          continue;
        }
      }
    }

    // All providers failed, return fallback response
    return this.getOfflineFallbackResponse(request.message);
  }

  /**
   * Check if provider is rate limited
   */
  private isRateLimited(provider: keyof typeof FREE_LLM_PROVIDERS): boolean {
    const now = Date.now();
    const providerConfig = FREE_LLM_PROVIDERS[provider];
    const requestData = this.requestCounts[provider];

    if (!requestData) {
      return false;
    }

    // Reset count if minute has passed
    if (now > requestData.resetTime) {
      delete this.requestCounts[provider];
      return false;
    }

    return requestData.count >= providerConfig.rateLimit;
  }

  /**
   * Update request count for rate limiting
   */
  private updateRequestCount(provider: keyof typeof FREE_LLM_PROVIDERS): void {
    const now = Date.now();
    const resetTime = now + 60000; // 1 minute from now

    if (!this.requestCounts[provider] || now > this.requestCounts[provider].resetTime) {
      this.requestCounts[provider] = { count: 1, resetTime };
    } else {
      this.requestCounts[provider].count++;
    }
  }

  /**
   * Configuration required response
   */
  private getConfigurationRequiredResponse(message: string): LLMResponse {
    return {
      message: `🔧 **AI Assistant Setup Required**

To use the AI assistant, you need to configure at least one API key in your environment variables. Here are your free options:

**Quick Setup (Recommended):**
1. **Groq** (Fastest) - Get free API key at https://console.groq.com/
2. **Together AI** - Get $25 free credits at https://api.together.xyz/
3. **Cohere** - Get 1000 free requests at https://dashboard.cohere.ai/
4. **Hugging Face** - Get unlimited free tier at https://huggingface.co/settings/tokens

**Setup Steps:**
1. Get an API key from any provider above
2. Replace the placeholder values in your .env file:
   - Replace 'your_groq_api_key_here' with your actual Groq API key
   - Replace 'your_together_api_key_here' with your actual Together AI API key
   - Replace 'your_cohere_api_key_here' with your actual Cohere API key
   - Replace 'your_huggingface_api_key_here' with your actual Hugging Face API key
3. Restart the application

Once configured, I'll be able to help you with:
- Parts identification and compatibility
- Fault code diagnosis
- Maintenance guidance
- Equipment troubleshooting

For detailed setup instructions, check the README_FREE_LLM_SETUP.md file.`,
      confidence: 1.0,
      provider: 'Configuration Helper',
    };
  }

  /**
   * Offline fallback response
   */
  private getOfflineFallbackResponse(message: string): LLMResponse {
    const lowerMessage = message.toLowerCase();
    
    let fallbackMessage = '';
    
    if (lowerMessage.includes('part') || lowerMessage.includes('component')) {
      fallbackMessage = 'I can help you find parts for your Cat equipment. Please provide your equipment serial number or describe the specific part you need. You can also use the camera feature to identify parts visually.';
    } else if (lowerMessage.includes('fault') || lowerMessage.includes('error') || lowerMessage.includes('code')) {
      fallbackMessage = 'I can help diagnose fault codes. Please provide the specific fault code you\'re seeing, along with your equipment model. Common fault codes include engine, hydraulic, and electrical system errors.';
    } else if (lowerMessage.includes('maintenance') || lowerMessage.includes('service')) {
      fallbackMessage = 'I can provide maintenance guidance for your Cat equipment. Please specify your equipment model and the type of maintenance you need help with - routine service, preventive maintenance, or specific repairs.';
    } else {
      fallbackMessage = 'I\'m here to help with your Cat equipment needs. I can assist with parts identification, fault code diagnosis, maintenance schedules, and general equipment support. How can I help you today?';
    }

    return {
      message: fallbackMessage,
      confidence: 0.6,
      provider: 'Offline Fallback',
    };
  }

  /**
   * Get provider status for debugging
   */
  getProviderStatus(): Record<string, any> {
    return {
      currentProvider: this.currentProvider,
      requestCounts: this.requestCounts,
      availableProviders: this.getAvailableProviders(),
      configuredProviders: {
        groq: !!this.getValidApiKey('GROQ'),
        together: !!this.getValidApiKey('TOGETHER'),
        cohere: !!this.getValidApiKey('COHERE'),
        huggingFace: !!this.getValidApiKey('HUGGING_FACE'),
      },
    };
  }
}

export const freeLLMService = new FreeLLMService();
export type { LLMRequest, LLMResponse, PartSuggestion, FaultCodeInfo };