import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Search, Filter, ShoppingCart, Star, Heart, Zap, Truck, Shield, CircleHelp as HelpCircle, SlidersHorizontal } from 'lucide-react-native';

interface Product {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  rating: number;
  image: string;
  inStock: boolean;
  aiRecommended: boolean;
  description: string;
  compatibility: string[];
}

export default function StoreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All Parts', icon: '🔧' },
    { id: 'filters', name: 'Filters', icon: '🔍' },
    { id: 'engine', name: 'Engine', icon: '⚙️' },
    { id: 'hydraulics', name: 'Hydraulics', icon: '🔩' },
    { id: 'drivetrain', name: 'Drivetrain', icon: '⚡' },
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Advanced Efficiency Fuel Filter',
      partNumber: '1R-0750',
      price: 89.99,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      aiRecommended: true,
      description: 'High-efficiency fuel filter for Cat engines',
      compatibility: ['320D', '330D', '340D'],
    },
    {
      id: '2',
      name: 'Engine Oil Filter',
      partNumber: '1R-0739',
      price: 34.99,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      aiRecommended: false,
      description: 'Premium engine oil filter',
      compatibility: ['320D', '330D'],
    },
    {
      id: '3',
      name: 'Hydraulic Filter',
      partNumber: '126-1813',
      price: 125.50,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: false,
      aiRecommended: true,
      description: 'High-performance hydraulic filter',
      compatibility: ['320D', '330D', '340D', '350D'],
    },
    {
      id: '4',
      name: 'Air Filter Element',
      partNumber: '142-1339',
      price: 67.80,
      rating: 4.6,
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      aiRecommended: false,
      description: 'Heavy-duty air filter element',
      compatibility: ['320D', '330D'],
    },
  ];

  const handleAddToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
    Alert.alert('Added to Cart', 'Item added to your cart successfully');
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const aiRecommendedProducts = products.filter(product => product.aiRecommended);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Parts Store</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <ShoppingCart size={24} color="#333333" />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <HelpCircle size={24} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search parts by name or number..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={20} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* AI Recommendations */}
        {aiRecommendedProducts.length > 0 && (
          <View style={styles.aiRecommendationsSection}>
            <View style={styles.aiRecommendationsHeader}>
              <Zap size={24} color="#FFD100" />
              <Text style={styles.aiRecommendationsTitle}>AI Recommendations</Text>
            </View>
            <Text style={styles.aiRecommendationsSubtitle}>
              Based on your equipment and browsing history
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.aiRecommendationsGrid}>
                {aiRecommendedProducts.map((product) => (
                  <TouchableOpacity key={product.id} style={styles.aiRecommendationCard}>
                    <View style={styles.aiRecommendationBadge}>
                      <Zap size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.productImageContainer}>
                      <View style={styles.productImagePlaceholder}>
                        <Filter size={24} color="#FFD100" />
                      </View>
                    </View>
                    <Text style={styles.aiRecommendationName}>{product.name}</Text>
                    <Text style={styles.aiRecommendationPrice}>${product.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Text style={styles.productsTitle}>
              {selectedCategory === 'all' ? 'All Parts' : categories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.productsCount}>
              {filteredProducts.length} items
            </Text>
          </View>

          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                {product.aiRecommended && (
                  <View style={styles.productBadge}>
                    <Zap size={12} color="#FFFFFF" />
                    <Text style={styles.productBadgeText}>AI Pick</Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleToggleFavorite(product.id)}
                >
                  <Heart
                    size={20}
                    color={favorites.includes(product.id) ? "#FF4444" : "#CCCCCC"}
                    fill={favorites.includes(product.id) ? "#FF4444" : "none"}
                  />
                </TouchableOpacity>

                <View style={styles.productImageContainer}>
                  <View style={styles.productImagePlaceholder}>
                    <Filter size={32} color="#FFD100" />
                  </View>
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPartNumber}>Part #: {product.partNumber}</Text>
                  
                  <View style={styles.productRating}>
                    <Star size={16} color="#FFD100" fill="#FFD100" />
                    <Text style={styles.productRatingText}>{product.rating}</Text>
                  </View>

                  <View style={styles.productCompatibility}>
                    <Text style={styles.productCompatibilityText}>
                      Fits: {product.compatibility.join(', ')}
                    </Text>
                  </View>

                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>${product.price}</Text>
                    <View style={styles.productStock}>
                      {product.inStock ? (
                        <>
                          <Shield size={16} color="#10B981" />
                          <Text style={styles.productStockText}>In Stock</Text>
                        </>
                      ) : (
                        <>
                          <Truck size={16} color="#F59E0B" />
                          <Text style={styles.productStockTextOut}>2-3 days</Text>
                        </>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addToCartButton,
                      !product.inStock && styles.addToCartButtonDisabled,
                    ]}
                    onPress={() => handleAddToCart(product.id)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart size={20} color={product.inStock ? "#000000" : "#CCCCCC"} />
                    <Text
                      style={[
                        styles.addToCartButtonText,
                        !product.inStock && styles.addToCartButtonTextDisabled,
                      ]}
                    >
                      {product.inStock ? "Add to Cart" : "Notify Me"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  filterButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiRecommendationsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 20,
  },
  aiRecommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  aiRecommendationsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  aiRecommendationsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiRecommendationsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  aiRecommendationCard: {
    width: 160,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  aiRecommendationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD100',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiRecommendationName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 12,
    marginBottom: 4,
  },
  aiRecommendationPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FFD100',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  categoryTextActive: {
    color: '#000000',
  },
  productsSection: {
    padding: 20,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  productsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  productBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFD100',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  productBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  productImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  productPartNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productRatingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  productCompatibility: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productCompatibilityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  productStock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productStockText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  productStockTextOut: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD100',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#F8F9FA',
  },
  addToCartButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000000',
  },
  addToCartButtonTextDisabled: {
    color: '#CCCCCC',
  },
});