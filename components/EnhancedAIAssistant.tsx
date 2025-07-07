import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Mic, MicOff, Send, Sparkles, Camera, Search, Volume2, VolumeX, CircleHelp as HelpCircle, MessageCircle, Wrench, TriangleAlert as AlertTriangle, ShoppingCart, CircleCheck as CheckCircle, Clock, Zap, Wifi, WifiOff } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { freeLLMService, LLMResponse, PartSuggestion, FaultCodeInfo } from '@/services/freeLLMService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: PartSuggestion[];
  faultCodeInfo?: FaultCodeInfo;
  troubleshootingSteps?: string[];
  provider?: string;
  confidence?: number;
}

interface EnhancedAIAssistantProps {
  userEquipment?: string[];
  userId?: string;
}

export default function EnhancedAIAssistant({ userEquipment = [], userId }: EnhancedAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant for Cat equipment, powered by advanced language models. I can help you find parts, troubleshoot issues, analyze fault codes, and provide maintenance guidance. What can I help you with today?',
      isUser: false,
      timestamp: new Date(),
      provider: 'System',
      confidence: 1.0,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'limited'>('online');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActions = [
    { 
      icon: Search, 
      text: 'Find Parts', 
      action: 'find_parts',
      description: 'Search for compatible parts',
      prompt: 'I need help finding parts for my Cat equipment. Can you help me identify the right parts?'
    },
    { 
      icon: AlertTriangle, 
      text: 'Fault Codes', 
      action: 'fault_codes',
      description: 'Diagnose error codes',
      prompt: 'I have a fault code on my Cat equipment that needs diagnosis. Can you help me understand what it means?'
    },
    { 
      icon: Wrench, 
      text: 'Maintenance', 
      action: 'maintenance',
      description: 'Get maintenance guidance',
      prompt: 'I need maintenance guidance for my Cat equipment. What should I check and when?'
    },
    { 
      icon: Camera, 
      text: 'Identify Part', 
      action: 'identify_part',
      description: 'Identify parts with camera',
      prompt: 'I have a part that I need to identify. Can you help me figure out what it is and where to get a replacement?'
    },
  ];

  useEffect(() => {
    // Scroll to bottom when new messages are added
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    // Check connection status periodically
    const checkConnection = () => {
      // In a real app, you'd check actual network connectivity
      setConnectionStatus('online');
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (messageText === '' || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsProcessing(true);

    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: messageText }];
    setConversationHistory(newHistory);

    try {
      // Call the free LLM service
      const aiResponse = await freeLLMService.processMessage({
        message: messageText,
        context: {
          userId,
          equipmentSerialNumbers: userEquipment,
          conversationHistory: newHistory.slice(-6), // Keep last 6 messages for context
        },
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        faultCodeInfo: aiResponse.faultCodeInfo,
        troubleshootingSteps: aiResponse.troubleshootingSteps,
        provider: aiResponse.provider,
        confidence: aiResponse.confidence,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse.message }]);
      
      // Speak the response if audio is enabled
      if (isSpeaking && Platform.OS !== 'web') {
        Speech.speak(aiResponse.message);
      }

      // Update connection status based on response
      setConnectionStatus('online');
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setConnectionStatus('limited');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m experiencing some technical difficulties. I\'m working with limited capabilities right now. Please try again in a moment, or ask a simpler question.',
        isUser: false,
        timestamp: new Date(),
        provider: 'Error Handler',
        confidence: 0.5,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      Alert.alert('Voice Input', 'Voice input stopped');
    } else {
      setIsListening(true);
      Alert.alert('Voice Input', 'Listening... (Voice processing available with API integration)');
      // Simulate voice input for demo
      setTimeout(() => {
        setIsListening(false);
        setInputText('Help me find oil filters for my CAT320D excavator');
      }, 3000);
    }
  };

  const handleSpeechToggle = () => {
    setIsSpeaking(!isSpeaking);
    if (!isSpeaking && Platform.OS !== 'web') {
      Speech.speak('Audio responses enabled');
    } else {
      Speech.stop();
    }
  };

  const handleQuickAction = (action: any) => {
    handleSendMessage(action.prompt);
  };

  const handlePartSuggestionPress = (part: PartSuggestion) => {
    Alert.alert(
      part.name,
      `Part #: ${part.partNumber}\nPrice: $${part.price}\nCompatibility: ${part.compatibility.join(', ')}\n\nReason: ${part.reasonForSuggestion}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', onPress: () => Alert.alert('Added to Cart', `${part.name} added to cart`) },
        { text: 'More Info', onPress: () => handleSendMessage(`Tell me more about part ${part.partNumber}`) },
      ]
    );
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi size={20} color="#10B981" />;
      case 'limited': return <WifiOff size={20} color="#F59E0B" />;
      case 'offline': return <WifiOff size={20} color="#EF4444" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'online': return 'AI Online';
      case 'limited': return 'Limited AI';
      case 'offline': return 'Offline Mode';
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {message.text}
        </Text>
        
        {/* Render part suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Recommended Parts:</Text>
            {message.suggestions.map((part, index) => (
              <TouchableOpacity
                key={index}
                style={styles.partSuggestion}
                onPress={() => handlePartSuggestionPress(part)}
              >
                <View style={styles.partSuggestionHeader}>
                  <Text style={styles.partName}>{part.name}</Text>
                  {part.aiRecommended && (
                    <View style={styles.aiRecommendedBadge}>
                      <Zap size={12} color="#FFFFFF" />
                      <Text style={styles.aiRecommendedText}>AI Pick</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.partNumber}>Part #: {part.partNumber}</Text>
                <View style={styles.partFooter}>
                  <Text style={styles.partPrice}>${part.price}</Text>
                  <View style={styles.partStock}>
                    {part.inStock ? (
                      <>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.inStockText}>In Stock</Text>
                      </>
                    ) : (
                      <>
                        <Clock size={16} color="#F59E0B" />
                        <Text style={styles.outOfStockText}>2-3 days</Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Render fault code information */}
        {message.faultCodeInfo && (
          <View style={styles.faultCodeContainer}>
            <Text style={styles.faultCodeTitle}>Fault Code: {message.faultCodeInfo.code}</Text>
            <Text style={styles.faultCodeDescription}>{message.faultCodeInfo.description}</Text>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(message.faultCodeInfo.severity) }]}>
              <Text style={styles.severityText}>{message.faultCodeInfo.severity.toUpperCase()}</Text>
            </View>
            {message.faultCodeInfo.possibleCauses.length > 0 && (
              <View style={styles.causesContainer}>
                <Text style={styles.causesTitle}>Possible Causes:</Text>
                {message.faultCodeInfo.possibleCauses.map((cause, index) => (
                  <Text key={index} style={styles.causeText}>• {cause}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Render troubleshooting steps */}
        {message.troubleshootingSteps && message.troubleshootingSteps.length > 0 && (
          <View style={styles.troubleshootingContainer}>
            <Text style={styles.troubleshootingTitle}>Troubleshooting Steps:</Text>
            {message.troubleshootingSteps.map((step, index) => (
              <Text key={index} style={styles.troubleshootingStep}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              message.isUser ? styles.userTime : styles.aiTime,
            ]}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {!message.isUser && message.provider && (
            <Text style={styles.providerText}>
              via {message.provider}
              {message.confidence && ` (${Math.round(message.confidence * 100)}%)`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Sparkles size={28} color="#FFD100" />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <View style={styles.connectionStatus}>
                {getConnectionIcon()}
                <Text style={styles.connectionText}>{getConnectionText()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSpeechToggle}
            >
              {isSpeaking ? (
                <Volume2 size={24} color="#FFD100" />
              ) : (
                <VolumeX size={24} color="#666666" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <HelpCircle size={24} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer} 
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingContainer}>
                  <ActivityIndicator size="small" color="#FFD100" />
                  <Text style={styles.typingText}>AI is analyzing your request...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(action)}
                >
                  <action.icon size={20} color="#333333" />
                  <Text style={styles.quickActionText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleVoiceToggle}
            disabled={isProcessing}
          >
            {isListening ? (
              <MicOff size={24} color="#FFFFFF" />
            ) : (
              <Mic size={24} color="#666666" />
            )}
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything about your Cat equipment..."
            placeholderTextColor="#666666"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isProcessing}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton, 
              (inputText.trim() && !isProcessing) && styles.sendButtonActive
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#666666" />
            ) : (
              <Send size={24} color={(inputText.trim() && !isProcessing) ? "#000000" : "#CCCCCC"} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleContainer: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#FFD100',
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderBottomLeftRadius: 8,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 8,
  },
  userText: {
    color: '#000000',
  },
  aiText: {
    color: '#333333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  userTime: {
    color: '#666666',
  },
  aiTime: {
    color: '#999999',
  },
  providerText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    fontStyle: 'italic',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 8,
  },
  partSuggestion: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  partSuggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    flex: 1,
  },
  aiRecommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD100',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  aiRecommendedText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  partNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  partFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  partStock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inStockText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  outOfStockText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  faultCodeContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  faultCodeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  faultCodeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  severityText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  causesContainer: {
    marginTop: 8,
  },
  causesTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  causeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 2,
  },
  troubleshootingContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  troubleshootingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 8,
  },
  troubleshootingStep: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  quickActionsContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  voiceButtonActive: {
    backgroundColor: '#FF4444',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sendButtonActive: {
    backgroundColor: '#FFD100',
  },
});