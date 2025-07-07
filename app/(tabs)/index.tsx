import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Search, Plus, Building2, ShoppingCart, MessageCircle, TriangleAlert as AlertTriangle, Shield, Camera, Mic, MicOff, CircleHelp as HelpCircle, Sparkles, Wrench, User } from 'lucide-react-native';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      Speech.speak('Voice assistant stopped');
    } else {
      setIsListening(true);
      Speech.speak('Voice assistant ready. How can I help you?');
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  const handleQuickAction = (action: string) => {
    Speech.speak(`Opening ${action}`);
    Alert.alert('Quick Action', `${action} selected`);
  };

  const categories = [
    {
      title: 'Filters & Fluids',
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Essential maintenance items',
    },
    {
      title: 'Engine',
      image: 'https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Engine components and parts',
    },
    {
      title: 'Drivetrain',
      image: 'https://images.pexels.com/photos/3642618/pexels-photo-3642618.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Transmission and drive parts',
    },
    {
      title: 'Hydraulics',
      image: 'https://images.pexels.com/photos/5624270/pexels-photo-5624270.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Hydraulic system components',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>{greeting}</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleVoiceToggle}
                accessible={true}
                accessibilityLabel={isListening ? 'Stop voice assistant' : 'Start voice assistant'}
              >
                {isListening ? (
                  <MicOff size={28} color="#FFD100" />
                ) : (
                  <Mic size={28} color="#333333" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                accessible={true}
                accessibilityLabel="Shopping cart"
              >
                <ShoppingCart size={28} color="#333333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                accessible={true}
                accessibilityLabel="Help"
              >
                <HelpCircle size={28} color="#333333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={24} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Parts & Products"
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessible={true}
              accessibilityLabel="Search parts and products"
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={24} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBannerContent}>
            <Sparkles size={32} color="#FFD100" />
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>AI Assistant Ready</Text>
              <Text style={styles.aiBannerSubtitle}>
                Ask me anything about your equipment or parts
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.aiBannerButton}
            onPress={() => handleQuickAction('AI Assistant')}
          >
            <Text style={styles.aiBannerButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Asset Management */}
        <View style={styles.assetSection}>
          <View style={styles.assetCards}>
            <TouchableOpacity style={styles.assetCard}>
              <Plus size={24} color="#FFD100" />
              <Text style={styles.assetCardTitle}>Add Asset</Text>
              <Text style={styles.assetCardSubtitle}>
                Add equipment to get personalized recommendations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.assetCard}>
              <Building2 size={24} color="#333333" />
              <Text style={styles.assetCardTitle}>My Equipment</Text>
              <Text style={styles.assetCardSubtitle}>
                CATERPILLAR 320 EXCAVATOR
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>What are you looking to do?</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.quickActionPrimary]}
              onPress={() => handleQuickAction('Shop')}
            >
              <ShoppingCart size={28} color="#333333" />
              <Text style={styles.quickActionText}>Shop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('AI Chat')}
            >
              <MessageCircle size={28} color="#333333" />
              <Text style={styles.quickActionText}>AI Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('Fault Codes')}
            >
              <AlertTriangle size={28} color="#333333" />
              <Text style={styles.quickActionText}>Fault Codes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('Maintenance')}
            >
              <Shield size={28} color="#333333" />
              <Text style={styles.quickActionText}>Maintenance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Browse Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => handleQuickAction(category.title)}
              >
                <View style={styles.categoryImageContainer}>
                  <View style={styles.categoryImagePlaceholder}>
                    <Wrench size={32} color="#FFD100" />
                  </View>
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fault Code Lookup */}
        <View style={styles.faultCodeSection}>
          <Text style={styles.sectionTitle}>Fault Code Lookup</Text>
          <View style={styles.faultCodeCard}>
            <View style={styles.faultCodeInput}>
              <Text style={styles.faultCodeLabel}>Enter Code</Text>
              <TextInput
                style={styles.faultCodeTextInput}
                placeholder="E12345"
                placeholderTextColor="#666666"
              />
            </View>
            <TouchableOpacity style={styles.faultCodeButton}>
              <Text style={styles.faultCodeButtonText}>Diagnose</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account CTA */}
        <View style={styles.accountCTA}>
          <View style={styles.accountCTAContent}>
            <View style={styles.accountCTAIcon}>
              <User size={32} color="#FFD100" />
            </View>
            <View style={styles.accountCTAText}>
              <Text style={styles.accountCTATitle}>Sign In or Create Account</Text>
              <Text style={styles.accountCTASubtitle}>
                Get full access to Cat Central features
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.accountCTAButton}
            onPress={() => handleQuickAction('Account')}
          >
            <Text style={styles.accountCTAButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  cameraButton: {
    padding: 4,
  },
  aiBanner: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD100',
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiBannerText: {
    marginLeft: 16,
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiBannerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#CCCCCC',
  },
  aiBannerButton: {
    backgroundColor: '#FFD100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiBannerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  assetSection: {
    padding: 20,
  },
  assetCards: {
    flexDirection: 'row',
    gap: 16,
  },
  assetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  assetCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  assetCardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quickActionPrimary: {
    backgroundColor: '#FFD100',
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 12,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryImageContainer: {
    height: 120,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    margin: 16,
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  faultCodeSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faultCodeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  faultCodeInput: {
    flex: 1,
  },
  faultCodeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  faultCodeTextInput: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  faultCodeButton: {
    backgroundColor: '#FFD100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  faultCodeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  accountCTA: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  accountCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountCTAIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountCTAText: {
    flex: 1,
  },
  accountCTATitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  accountCTASubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  accountCTAButton: {
    backgroundColor: '#FFD100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  accountCTAButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
});