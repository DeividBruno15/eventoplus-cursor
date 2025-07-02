import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import EventsScreen from './src/screens/events/EventsScreen';
import CreateEventScreen from './src/screens/events/CreateEventScreen';
import VenuesScreen from './src/screens/venues/VenuesScreen';
import CreateVenueScreen from './src/screens/venues/CreateVenueScreen';
import ServicesScreen from './src/screens/services/ServicesScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';

// New screens - Phase 1 implementation
import SubscriptionScreen from './src/screens/subscription/SubscriptionScreen';
import PIXPaymentScreen from './src/screens/pix/PIXPaymentScreen';
import CartScreen from './src/screens/cart/CartScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

const theme = {
  colors: {
    primary: '#3C5BFA',
    secondary: '#FFA94D',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#000000',
    error: '#DC3545',
  },
};

function TabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Events') {
            iconName = 'event';
          } else if (route.name === 'Venues') {
            iconName = 'location-on';
          } else if (route.name === 'Services') {
            iconName = 'build';
          } else if (route.name === 'Chat') {
            iconName = 'chat';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Cart') {
            iconName = 'shopping-cart';
          } else if (route.name === 'Subscription') {
            iconName = 'payment';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      
      {user?.userType === 'contratante' && (
        <>
          <Tab.Screen name="Events" component={EventsScreen} />
          <Tab.Screen name="Cart" component={CartScreen} />
        </>
      )}
      
      {user?.userType === 'anunciante' && (
        <Tab.Screen name="Venues" component={VenuesScreen} />
      )}
      
      {user?.userType === 'prestador' && (
        <Tab.Screen name="Services" component={ServicesScreen} />
      )}
      
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Tabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      {/* Event & Venue Creation */}
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ title: 'Criar Evento' }}
      />
      <Stack.Screen 
        name="CreateVenue" 
        component={CreateVenueScreen}
        options={{ title: 'Criar Espaço' }}
      />
      
      {/* Payment Screens */}
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ title: 'Planos de Assinatura' }}
      />
      <Stack.Screen 
        name="PIXPayment" 
        component={PIXPaymentScreen}
        options={{ title: 'Pagamento PIX' }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Loading screen
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent />
            <StatusBar style="auto" />
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}