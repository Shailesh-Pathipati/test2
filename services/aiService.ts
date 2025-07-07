import { Platform } from 'react-native';

// AWS SDK configuration for React Native
interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface AIRequest {
  message: string;
  context?: {
    userId?: string;
    equipmentSerialNumbers?: string[];
    previousParts?: string[];
    currentLocation?: string;
  };
}

interface AIResponse {
  message: string;
  suggestions?: PartSuggestion[];
  faultCodeInfo?: FaultCodeInfo;
  troubleshootingSteps?: string[];
  confidence: number;
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

class AIService {
  private apiEndpoint: string;
  private apiKey: string;

  constructor() {
    this.apiEndpoint = process.env.EXPO_PUBLIC_AI_API_ENDPOINT || '';
    this.apiKey = process.env.EXPO_PUBLIC_AI_API_KEY || '';
  }

  /**
   * Main AI chat function - processes user messages and returns intelligent responses
   */
  async processMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          message: request.message,
          context: request.context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.status}`);
      }

      const data = await response.json();
      return this.processAIResponse(data);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(request.message);
    }
  }

  /**
   * Find compatible parts based on equipment and user input
   */
  async findCompatibleParts(
    equipmentSerial: string,
    searchQuery?: string,
    partType?: string
  ): Promise<PartSuggestion[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/parts/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          equipmentSerial,
          searchQuery,
          partType,
          includeAlternatives: true,
          includeUpgrades: true,
        }),
      });

      const data = await response.json();
      return data.parts || [];
    } catch (error) {
      console.error('Parts Finding Error:', error);
      return [];
    }
  }

  /**
   * Analyze fault codes and provide troubleshooting guidance
   */
  async analyzeFaultCode(faultCode: string, equipmentSerial?: string): Promise<FaultCodeInfo | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/fault-codes/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          faultCode,
          equipmentSerial,
          includeRelatedParts: true,
          includeTroubleshootingSteps: true,
        }),
      });

      const data = await response.json();
      return data.faultCodeInfo || null;
    } catch (error) {
      console.error('Fault Code Analysis Error:', error);
      return null;
    }
  }

  /**
   * Get personalized recommendations based on user history and equipment
   */
  async getPersonalizedRecommendations(userId: string): Promise<PartSuggestion[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/recommendations/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Recommendations Error:', error);
      return [];
    }
  }

  /**
   * Process image for part identification
   */
  async identifyPartFromImage(imageUri: string, equipmentContext?: string): Promise<PartSuggestion[]> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'part-image.jpg',
      } as any);
      
      if (equipmentContext) {
        formData.append('equipmentContext', equipmentContext);
      }

      const response = await fetch(`${this.apiEndpoint}/parts/identify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return data.identifiedParts || [];
    } catch (error) {
      console.error('Part Identification Error:', error);
      return [];
    }
  }

  /**
   * Voice-to-text processing for voice commands
   */
  async processVoiceCommand(audioUri: string, context?: any): Promise<AIResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'voice-command.wav',
      } as any);

      if (context) {
        formData.append('context', JSON.stringify(context));
      }

      const response = await fetch(`${this.apiEndpoint}/voice/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return this.processAIResponse(data);
    } catch (error) {
      console.error('Voice Processing Error:', error);
      return this.getFallbackResponse('Sorry, I couldn\'t understand that voice command.');
    }
  }

  /**
   * Track user interactions for improving AI recommendations
   */
  async trackUserInteraction(interaction: {
    userId: string;
    action: string;
    context: any;
    timestamp: string;
  }): Promise<void> {
    try {
      await fetch(`${this.apiEndpoint}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(interaction),
      });
    } catch (error) {
      console.error('Analytics Tracking Error:', error);
    }
  }

  private processAIResponse(data: any): AIResponse {
    return {
      message: data.message || 'I\'m here to help with your equipment needs.',
      suggestions: data.suggestions || [],
      faultCodeInfo: data.faultCodeInfo,
      troubleshootingSteps: data.troubleshootingSteps || [],
      confidence: data.confidence || 0.8,
    };
  }

  private getFallbackResponse(originalMessage: string): AIResponse {
    const message = originalMessage.toLowerCase();
    
    if (message.includes('part') || message.includes('component')) {
      return {
        message: 'I can help you find the right parts for your equipment. Could you provide the equipment serial number or describe the specific part you need?',
        suggestions: [],
        troubleshootingSteps: [],
        confidence: 0.6,
      };
    }
    
    if (message.includes('fault') || message.includes('error') || message.includes('code')) {
      return {
        message: 'I can help diagnose fault codes and troubleshoot issues. What fault code are you seeing, or can you describe the problem with your equipment?',
        suggestions: [],
        troubleshootingSteps: [],
        confidence: 0.6,
      };
    }
    
    return {
      message: 'I understand you need assistance with your Cat equipment. Could you be more specific about what you\'re looking for? I can help with parts identification, troubleshooting, maintenance schedules, or general equipment support.',
      suggestions: [],
      troubleshootingSteps: [],
      confidence: 0.5,
    };
  }
}

export const aiService = new AIService();
export type { AIRequest, AIResponse, PartSuggestion, FaultCodeInfo };