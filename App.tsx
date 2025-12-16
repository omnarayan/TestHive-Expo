import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// --- Constants ---
const COLORS = {
  primary: '#007AFF',
  primaryDark: '#0051D0',
  secondary: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  placeholder: '#999999',
};

const FONTS = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
};

// --- User Data ---
const USERS = [
  {
    username: 'devicelab',
    password: 'robustest',
    email: 'devicelab@robustest.com',
  },
  { username: 'a', password: 'a', email: 'test@example.com' },
];

// --- Product Data ---
const PRODUCTS = [
  {
    id: 'Appium',
    name: 'Appium',
    price: 7.5,
    description:
      'An open-source tool for automating native, mobile web, and hybrid applications on iOS, Android, and Windows platforms.',
    category: 'Mobile Testing',
    rating: 4.5,
    inStock: true,
  },
  {
    id: 'Maestro',
    name: 'Maestro',
    price: 5.99,
    description:
      'The simplest and most effective mobile UI testing framework. Built for developers and testers.',
    category: 'Mobile Testing',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 'Espresso',
    name: 'Espresso',
    price: 1.5,
    description:
      'A testing framework for Android to write concise, beautiful, and reliable Android UI tests.',
    category: 'Android Testing',
    rating: 4.3,
    inStock: true,
  },
  {
    id: 'Selenium',
    name: 'Selenium',
    price: 2.3,
    description:
      'A portable framework for testing web applications. It provides a playback tool for authoring functional tests.',
    category: 'Web Testing',
    rating: 4.1,
    inStock: true,
  },
  {
    id: 'Cypress',
    name: 'Cypress',
    price: 8.1,
    description:
      'A next-generation front-end testing tool built for the modern web. It addresses the key pain points developers and QA engineers face.',
    category: 'Web Testing',
    rating: 4.7,
    inStock: true,
  },
  {
    id: 'Playwright',
    name: 'Playwright',
    price: 9.0,
    description:
      'A Node.js library to automate Chromium, Firefox and WebKit with a single API. Developed by Microsoft.',
    category: 'Web Testing',
    rating: 4.6,
    inStock: false,
  },
  {
    id: 'XCUITest',
    name: 'XCUITest',
    price: 1.5,
    description:
      "Apple's UI testing framework for iOS. It's integrated into Xcode and allows for testing of the user interface.",
    category: 'iOS Testing',
    rating: 4.2,
    inStock: true,
  },
  {
    id: 'Jest',
    name: 'Jest',
    price: 4.75,
    description:
      'A delightful JavaScript Testing Framework with a focus on simplicity. It works with projects using: Babel, TypeScript, Node, React, Angular, Vue and more.',
    category: 'Unit Testing',
    rating: 4.4,
    inStock: true,
  },
  {
    id: 'Mocha',
    name: 'Mocha',
    price: 3.25,
    description:
      'A feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.',
    category: 'Unit Testing',
    rating: 4.0,
    inStock: true,
  },
  {
    id: 'Pytest',
    name: 'Pytest',
    price: 6.8,
    description:
      'A framework that makes it easy to write small, readable tests, and can scale to support complex functional testing.',
    category: 'Python Testing',
    rating: 4.5,
    inStock: true,
  },
  {
    id: 'TestNG',
    name: 'TestNG',
    price: 4.2,
    description:
      'A testing framework inspired from JUnit and NUnit but introducing some new functionalities that make it more powerful and easier to use.',
    category: 'Java Testing',
    rating: 4.1,
    inStock: true,
  },
];

// --- Utility Functions ---
const formatPrice = (price: number) => `$${price.toFixed(2)}`;

const validateInput = (value: string, type: string) => {
  switch (type) {
    case 'username':
    case 'password':
    case 'address':
    case 'city':
    case 'zip':
    case 'card':
      return value.trim().length >= 1;
    case 'search':
      return true;
    default:
      return false;
  }
};

// --- Custom Hooks ---
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- Types ---
interface User {
  username: string;
  password: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  rating: number;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

// --- Splash Screen Component ---
const SplashScreen = React.memo(() => {
  return (
    <View style={styles.splashContainer} testID="splash-screen" accessibilityLabel="splash-screen">
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/RobusTest.png')}
          style={styles.splashLogo}
        />
        <Text style={styles.appTitle}>TestHive</Text>
        <Text style={styles.appSubtitle}>Testing Framework Store</Text>
      </View>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.spinner}
      />
    </View>
  );
});

// --- Login Screen Component ---
const LoginPage = React.memo(({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!validateInput(username, 'username')) {
      setError('Username is required');
      return;
    }

    if (!validateInput(password, 'password')) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const foundUser = USERS.find(
        user => user.username === username.trim() && user.password === password,
      );

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  }, [username, password, onLoginSuccess]);

  return (
    <View style={styles.loginContainer} testID="login-screen" accessibilityLabel="login-screen">
      <View style={styles.loginLogoContainer}>
        <Image
          source={require('./assets/RobusTest.png')}
          style={styles.loginLogo}
        />
        <Text style={styles.loginTitle}>Welcome Back</Text>
        <Text style={styles.loginSubtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.loginForm}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Username"
          value={username}
          onChangeText={text => {
            setUsername(text);
            setError('');
          }}
          testID="username-input" accessibilityLabel="username-input"
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Password"
          value={password}
          onChangeText={text => {
            setPassword(text);
            setError('');
          }}
          secureTextEntry
          testID="password-input" accessibilityLabel="password-input"
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        {error ? (
          <Text style={styles.errorText} testID="error-message" accessibilityLabel="error-message">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          testID="login-button" accessibilityLabel="login-button"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// --- Header Component ---
const AppHeader = React.memo(
  ({ user, cartItemCount, onGoToCart, onLogout }: {
    user: User | null;
    cartItemCount: number;
    onGoToCart: () => void;
    onLogout: () => void;
  }) => {
    const handleMenuPress = () => {
      Alert.alert('Menu', 'Choose an option', [
        { text: 'Profile', onPress: () => console.log('Profile pressed') },
        { text: 'Settings', onPress: () => console.log('Settings pressed') },
        { text: 'Logout', onPress: onLogout, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]);
    };

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Image
            source={require('./assets/RobusTest.png')}
            style={styles.headerLogo}
          />
          <View>
            <Text style={styles.headerTitle}>TestHive</Text>
            <Text style={styles.headerSubtitle}>
              Hello, {user ? user.username : ''}!
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.cartContainer}
            onPress={onGoToCart}
            testID="cart-button" accessibilityLabel="cart-button"
          >
            <Text style={styles.headerIcon}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.cartBadge} testID="cart-badge" accessibilityLabel="cart-badge">
                <Text style={styles.cartBadgeText} testID={`cart-badge-text-${cartItemCount}`} accessibilityLabel={`cart-badge-text-${cartItemCount}`}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMenuPress}
            testID="menu-button" accessibilityLabel="menu-button"
          >
            <Text style={styles.headerIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

// --- Product Item Component ---
const ProductItem = React.memo(
  ({ product, cartItem, onAddToCart, onRemoveFromCart, onSelectProduct }: {
    product: Product;
    cartItem: CartItem | undefined;
    onAddToCart: (product: Product) => void;
    onRemoveFromCart: (product: Product) => void;
    onSelectProduct: (product: Product) => void;
  }) => {
    const handleAddPress = useCallback(() => {
      onAddToCart(product);
    }, [product, onAddToCart]);

    const handleRemovePress = useCallback(() => {
      onRemoveFromCart(product);
    }, [product, onRemoveFromCart]);

    const handleProductPress = useCallback(() => {
      onSelectProduct(product);
    }, [product, onSelectProduct]);

    return (
      <TouchableOpacity
        onPress={handleProductPress}
        testID={`product-item-${product.id}`} accessibilityLabel={`product-item-${product.id}`}
        style={styles.productItemContainer}
        activeOpacity={0.7}
      >
        <View style={styles.productItem}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.productPriceRow}>
              <Text style={styles.productPrice}>
                {formatPrice(product.price)}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {product.rating}</Text>
              </View>
            </View>
            {!product.inStock && (
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            )}
          </View>

          <View style={styles.productActions}>
            {cartItem ? (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleRemovePress}
                  testID={`remove-from-cart-button-${product.id}`} accessibilityLabel={`remove-from-cart-button-${product.id}`}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text
                  style={styles.quantityText}
                  testID={`quantity-text-${product.id}`} accessibilityLabel={`quantity-text-${product.id}`}
                >
                  {cartItem.quantity}
                </Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleAddPress}
                  testID={`add-to-cart-button-${product.id}`} accessibilityLabel={`add-to-cart-button-${product.id}`}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !product.inStock && styles.addButtonDisabled,
                ]}
                onPress={handleAddPress}
                testID={`add-to-cart-button-${product.id}`} accessibilityLabel={`add-to-cart-button-${product.id}`}
                disabled={!product.inStock}
              >
                <Text style={styles.addButtonText}>
                  {product.inStock ? 'Add' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

// --- Products Screen Component ---
const ProductPage = React.memo(
  ({
    user,
    cart,
    onAddToCart,
    onRemoveFromCart,
    onSelectProduct,
    onGoToCart,
    onLogout,
  }: {
    user: User | null;
    cart: CartItem[];
    onAddToCart: (product: Product) => void;
    onRemoveFromCart: (product: Product) => void;
    onSelectProduct: (product: Product) => void;
    onGoToCart: () => void;
    onLogout: () => void;
  }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const categories = useMemo(() => {
      const cats = ['All', ...new Set(PRODUCTS.map(p => p.category))];
      return cats;
    }, []);

    const filteredProducts = useMemo(() => {
      return PRODUCTS.filter(product => {
        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    }, [debouncedSearchQuery, selectedCategory]);

    const cartItemCount = useMemo(() => {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    return (
      <View
        style={styles.productPageContainer}
        testID="products-screen" accessibilityLabel="products-screen"
      >
        <AppHeader
          user={user}
          cartItemCount={cartItemCount}
          onGoToCart={onGoToCart}
          onLogout={onLogout}
        />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search frameworks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.placeholder}
            testID="search-input" accessibilityLabel="search-input"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No products found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            filteredProducts.map(product => {
              const cartItem = cart.find(item => item.id === product.id);
              return (
                <ProductItem
                  key={product.id}
                  product={product}
                  cartItem={cartItem}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  onSelectProduct={onSelectProduct}
                />
              );
            })
          )}
        </ScrollView>
      </View>
    );
  },
);

// --- Product Detail Screen Component ---
const ProductDetailPage = React.memo(
  ({ product, onGoBack, onAddToCart, cart }: {
    product: Product;
    onGoBack: () => void;
    onAddToCart: (product: Product) => void;
    cart: CartItem[];
  }) => {
    const cartItem = cart.find(item => item.id === product.id);

    return (
      <View
        style={styles.productPageContainer}
        testID="product-detail-screen" accessibilityLabel="product-detail-screen"
      >
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={onGoBack}
            style={styles.backButton}
            testID="back-button" accessibilityLabel="back-button"
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle} numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={styles.detailMainInfo}>
            <Text style={styles.detailProductName}>{product.name}</Text>
            <Text style={styles.detailCategory}>{product.category}</Text>

            <View style={styles.detailPriceRow}>
              <Text style={styles.detailPrice}>
                {formatPrice(product.price)}
              </Text>
              <View style={styles.detailRating}>
                <Text style={styles.detailRatingText}>⭐ {product.rating}</Text>
              </View>
            </View>

            <View style={styles.stockContainer}>
              <Text
                style={[
                  styles.stockText,
                  product.inStock ? styles.inStock : styles.outOfStock,
                ]}
              >
                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </Text>
            </View>
          </View>

          <View style={styles.detailDescriptionContainer}>
            <Text style={styles.detailSectionTitle}>Description</Text>
            <Text style={styles.detailDescription}>{product.description}</Text>
          </View>

          <View style={styles.detailActions}>
            {cartItem ? (
              <View style={styles.detailQuantityControl}>
                <TouchableOpacity
                  style={styles.detailQuantityButton}
                  onPress={() => onAddToCart(product)}
                >
                  <Text style={styles.detailQuantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.detailQuantityText}>
                  {cartItem.quantity}
                </Text>
                <TouchableOpacity
                  style={styles.detailQuantityButton}
                  onPress={() => onAddToCart(product)}
                >
                  <Text style={styles.detailQuantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.detailAddButton,
                  !product.inStock && styles.detailAddButtonDisabled,
                ]}
                onPress={() => onAddToCart(product)}
                disabled={!product.inStock}
              >
                <Text style={styles.detailAddButtonText}>
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  },
);

// --- Cart Screen Component ---
const CartPage = React.memo(
  ({ cart, onGoBack, onAddToCart, onRemoveFromCart, onCheckout }: {
    cart: CartItem[];
    onGoBack: () => void;
    onAddToCart: (product: Product) => void;
    onRemoveFromCart: (product: Product) => void;
    onCheckout: () => void;
  }) => {
    const total = useMemo(() => {
      return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const itemCount = useMemo(() => {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    return (
      <View
        style={styles.productPageContainer}
        testID="cart-screen" accessibilityLabel="cart-screen"
      >
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={onGoBack}
            style={styles.backButton}
            testID="back-button" accessibilityLabel="back-button"
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>My Cart ({itemCount} items)</Text>
        </View>

        <ScrollView contentContainerStyle={styles.cartContent}>
          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartIcon}>🛒</Text>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>
                Add some testing frameworks to get started
              </Text>
            </View>
          ) : (
            cart.map(item => (
              <View
                key={item.id}
                style={styles.cartItem}
                testID={`cart-item-${item.id}`} accessibilityLabel={`cart-item-${item.id}`}
              >
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemCategory}>{item.category}</Text>
                  <Text style={styles.cartItemPrice}>
                    {formatPrice(item.price)} × {item.quantity} ={' '}
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
                <View style={styles.cartItemActions}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => onRemoveFromCart(item)}
                      testID={`remove-from-cart-button-${item.id}`} accessibilityLabel={`remove-from-cart-button-${item.id}`}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text
                      style={styles.quantityText}
                      testID={`quantity-text-${item.id}`} accessibilityLabel={`quantity-text-${item.id}`}
                    >
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => onAddToCart(item)}
                      testID={`add-to-cart-button-${item.id}`} accessibilityLabel={`add-to-cart-button-${item.id}`}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {cart.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.cartTotalContainer}>
              <Text style={styles.cartTotalLabel}>Total:</Text>
              <Text
                style={styles.cartTotalText}
                testID="cart-total-text" accessibilityLabel="cart-total-text"
              >
                {formatPrice(total)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={onCheckout}
              testID="checkout-button" accessibilityLabel="checkout-button"
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  },
);

// --- Address Screen Component ---
const AddressPage = React.memo(({ onGoBack, onAddressSubmit }: {
  onGoBack: () => void;
  onAddressSubmit: (data: { address: string; city: string; zip: string }) => void;
}) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const canSubmit = useMemo(() => {
    return (
      validateInput(address, 'address') &&
      validateInput(city, 'city') &&
      validateInput(zip, 'zip')
    );
  }, [address, city, zip]);

  return (
    <View
      style={styles.productPageContainer}
      testID="address-screen" accessibilityLabel="address-screen"
    >
      <View style={styles.detailHeader}>
        <TouchableOpacity
          onPress={onGoBack}
          style={styles.backButton}
          testID="back-button-cart" accessibilityLabel="back-button-cart"
        >
          <Text style={styles.backButtonText}>← Back to Cart</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Shipping Address</Text>
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formLabel}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Main St"
          value={address}
          onChangeText={setAddress}
          testID="address-input" accessibilityLabel="address-input"
        />

        <Text style={styles.formLabel}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="San Francisco"
          value={city}
          onChangeText={setCity}
          testID="city-input" accessibilityLabel="city-input"
        />

        <Text style={styles.formLabel}>Zip Code</Text>
        <TextInput
          style={styles.input}
          placeholder="94105"
          value={zip}
          onChangeText={setZip}
          keyboardType="number-pad"
          testID="zip-input" accessibilityLabel="zip-input"
        />

        <TouchableOpacity
          style={[styles.loginButton, !canSubmit && styles.buttonDisabled]}
          onPress={() => onAddressSubmit({ address, city, zip })}
          testID="next-button" accessibilityLabel="next-button"
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>Next: Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

// --- Payment Screen Component ---
const PaymentPage = React.memo(({ onGoBack, onPaymentSubmit }: {
  onGoBack: () => void;
  onPaymentSubmit: (data: { cardNumber: string }) => void;
}) => {
  const [cardNumber, setCardNumber] = useState('');

  const canSubmit = useMemo(
    () => validateInput(cardNumber, 'card'),
    [cardNumber],
  );

  return (
    <View
      style={styles.productPageContainer}
      testID="payment-screen" accessibilityLabel="payment-screen"
    >
      <View style={styles.detailHeader}>
        <TouchableOpacity
          onPress={onGoBack}
          style={styles.backButton}
          testID="back-button-address" accessibilityLabel="back-button-address"
        >
          <Text style={styles.backButtonText}>← Back to Address</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Payment</Text>
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formLabel}>Credit Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="•••• •••• •••• ••••"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="number-pad"
          testID="card-number-input" accessibilityLabel="card-number-input"
        />

        <TouchableOpacity
          style={[styles.loginButton, !canSubmit && styles.buttonDisabled]}
          onPress={() => onPaymentSubmit({ cardNumber })}
          testID="pay-now-button" accessibilityLabel="pay-now-button"
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>Pay Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

// --- Checkout Success Screen Component ---
const CheckoutSuccessPage = React.memo(
  ({ onGoToHome, orderTotal, itemCount }: {
    onGoToHome: () => void;
    orderTotal: number;
    itemCount: number;
  }) => {
    const [orderNumber] = useState(() => Math.floor(Math.random() * 1000000));

    return (
      <View
        style={styles.checkoutContainer}
        testID="checkout-success-screen" accessibilityLabel="checkout-success-screen"
      >
        <View style={styles.checkoutContent}>
          <Text style={styles.checkoutIcon}>🎉</Text>
          <Text style={styles.checkoutTitle}>Order Successful!</Text>
          <Text style={styles.checkoutMessage}>
            Thank you for your purchase. Your order has been placed
            successfully.
          </Text>

          <View style={styles.orderSummary}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Order Number:</Text>
              <Text style={styles.orderSummaryValue}>#{orderNumber}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Items:</Text>
              <Text style={styles.orderSummaryValue}>{itemCount}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Total:</Text>
              <Text style={styles.orderSummaryValue}>
                {formatPrice(orderTotal)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={onGoToHome}
          testID="back-to-home-button" accessibilityLabel="back-to-home-button"
        >
          <Text style={styles.backToHomeButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

// --- Main App Component ---
const App = () => {
  const [currentPage, setCurrentPage] = useState('splash');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderData, setOrderData] = useState<{ total: number; itemCount: number } | null>(null);
  const [shippingAddress, setShippingAddress] = useState<{ address: string; city: string; zip: string } | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ cardNumber: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage('login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setLoggedInUser(user);
    setCurrentPage('products');
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setLoggedInUser(null);
          setCart([]);
          setSelectedProduct(null);
          setOrderData(null);
          setCurrentPage('login');
        },
      },
    ]);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const handleRemoveFromCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== product.id);
      }
      return prevCart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );
    });
  }, []);

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('detail');
  }, []);

  const handleGoToCart = useCallback(() => {
    setCurrentPage('cart');
  }, []);

  const handleCheckout = useCallback(() => {
    setCurrentPage('address');
  }, []);

  const handleAddressSubmit = useCallback((addressData: { address: string; city: string; zip: string }) => {
    setShippingAddress(addressData);
    setCurrentPage('payment');
  }, []);

  const handlePaymentSubmit = useCallback(
    (paymentData: { cardNumber: string }) => {
      setPaymentInfo(paymentData);
      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      setOrderData({ total, itemCount });
      setCurrentPage('checkoutSuccess');
    },
    [cart],
  );

  const handleGoToHome = useCallback(() => {
    setCart([]);
    setSelectedProduct(null);
    setOrderData(null);
    setCurrentPage('products');
  }, []);

  const handleGoBack = useCallback(() => {
    switch (currentPage) {
      case 'detail':
      case 'cart':
        setSelectedProduct(null);
        setCurrentPage('products');
        break;
      case 'address':
        setCurrentPage('cart');
        break;
      case 'payment':
        setCurrentPage('address');
        break;
      default:
        setCurrentPage('products');
    }
  }, [currentPage]);

  const renderContent = () => {
    switch (currentPage) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'products':
        return (
          <ProductPage
            user={loggedInUser}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onSelectProduct={handleSelectProduct}
            onGoToCart={handleGoToCart}
            onLogout={handleLogout}
          />
        );
      case 'detail':
        return (
          <ProductDetailPage
            product={selectedProduct!}
            onGoBack={handleGoBack}
            onAddToCart={handleAddToCart}
            cart={cart}
          />
        );
      case 'cart':
        return (
          <CartPage
            cart={cart}
            onGoBack={handleGoBack}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        );
      case 'address':
        return (
          <AddressPage
            onGoBack={handleGoBack}
            onAddressSubmit={handleAddressSubmit}
          />
        );
      case 'payment':
        return (
          <PaymentPage
            onGoBack={handleGoBack}
            onPaymentSubmit={handlePaymentSubmit}
          />
        );
      case 'checkoutSuccess':
        return (
          <CheckoutSuccessPage
            onGoToHome={handleGoToHome}
            orderTotal={orderData?.total || 0}
            itemCount={orderData?.itemCount || 0}
          />
        );
      default:
        return <SplashScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      {renderContent()}
    </SafeAreaView>
  );
};

// --- Enhanced Styles ---
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  splashLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  spinner: {
    marginTop: 30,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
  },
  loginLogoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  loginLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  loginSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  loginForm: {
    width: '100%',
  },
  input: {
    height: 56,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginBottom: 16,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  loginButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginHorizontal: 12,
    color: COLORS.text,
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: 5,
    top: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  productPageContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  categoriesContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productItemContainer: {
    marginVertical: 4,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  outOfStockText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  productActions: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  addButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  quantityButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    fontFamily: FONTS.bold,
  },
  detailContent: {
    padding: 20,
  },
  detailMainInfo: {
    marginBottom: 24,
  },
  detailProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  detailCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },
  detailPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRatingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  stockContainer: {
    marginBottom: 16,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  inStock: {
    color: COLORS.success,
  },
  outOfStock: {
    color: COLORS.error,
  },
  detailDescriptionContainer: {
    marginBottom: 32,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  detailDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  detailActions: {
    alignItems: 'center',
  },
  detailQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: 4,
  },
  detailQuantityButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  detailQuantityButtonText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  detailQuantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  detailAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  detailAddButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  detailAddButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  cartContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  cartItemCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  cartItemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  cartItemActions: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  cartFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  cartTotalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  checkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
  },
  checkoutContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkoutIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  checkoutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  checkoutMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  orderSummary: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  orderSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  backToHomeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backToHomeButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
});

export default App;
