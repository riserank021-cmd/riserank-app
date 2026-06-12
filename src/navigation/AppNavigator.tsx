/**
 * AppNavigator — bottom-tab navigator for authenticated users.
 * Each tab has its own nested stack so the header/back behaviour stays correct.
 */

import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import type {
  AppTabParamList,
  HomeStackParamList,
  QuizStackParamList,
  CurrentAffairsStackParamList,
  LeaderboardStackParamList,
  LiveTestStackParamList,
  ProfileStackParamList,
  AdminStackParamList,
} from '../types/navigation.types';

// ── Screen imports ────────────────────────────────────────────────────────────
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { QuizListScreen } from '../screens/quiz/QuizListScreen';
import { QuizDetailScreen } from '../screens/quiz/QuizDetailScreen';
import { QuizAttemptScreen } from '../screens/quiz/QuizAttemptScreen';
import { QuizResultScreen } from '../screens/quiz/QuizResultScreen';
import { QuizReviewScreen } from '../screens/quiz/QuizReviewScreen';
import { PracticePickerScreen } from '../screens/quiz/PracticePickerScreen';
import { CurrentAffairsListScreen } from '../screens/currentAffairs/CurrentAffairsListScreen';
import { CurrentAffairsDetailScreen } from '../screens/currentAffairs/CurrentAffairsDetailScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { BookmarksScreen } from '../screens/profile/BookmarksScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { QuizHistoryScreen } from '../screens/profile/QuizHistoryScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { LiveTestsScreen } from '../screens/liveTest/LiveTestsScreen';
import { LiveTestDetailScreen } from '../screens/liveTest/LiveTestDetailScreen';
import { LiveTestAttemptScreen } from '../screens/liveTest/LiveTestAttemptScreen';
import { LiveTestResultScreen } from '../screens/liveTest/LiveTestResultScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AddQuestionScreen } from '../screens/admin/AddQuestionScreen';
import { AddCurrentAffairsScreen } from '../screens/admin/AddCurrentAffairsScreen';
import { BulkImportScreen } from '../screens/admin/BulkImportScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

// ── Tab icon helper (using emoji for now; swap with vector icons in prod) ─────
function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View className="items-center">
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text
        className={`text-[10px] mt-0.5 ${focused ? 'text-primary font-semibold' : 'text-text-muted'}`}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Nested stacks ─────────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
    </HomeStack.Navigator>
  );
}

const QuizStack = createNativeStackNavigator<QuizStackParamList>();
function QuizStackNavigator() {
  return (
    <QuizStack.Navigator screenOptions={{ headerShown: false }}>
      <QuizStack.Screen name="QuizList" component={QuizListScreen} />
      <QuizStack.Screen name="QuizDetail" component={QuizDetailScreen} />
      <QuizStack.Screen name="QuizAttempt" component={QuizAttemptScreen} options={{ gestureEnabled: false }} />
      <QuizStack.Screen name="QuizResult" component={QuizResultScreen} />
      <QuizStack.Screen name="QuizReview" component={QuizReviewScreen} />
      <QuizStack.Screen name="PracticePicker" component={PracticePickerScreen} />
    </QuizStack.Navigator>
  );
}

const CAStack = createNativeStackNavigator<CurrentAffairsStackParamList>();
function CAStackNavigator() {
  return (
    <CAStack.Navigator screenOptions={{ headerShown: false }}>
      <CAStack.Screen name="CurrentAffairsList" component={CurrentAffairsListScreen} />
      <CAStack.Screen name="CurrentAffairsDetail" component={CurrentAffairsDetailScreen} />
    </CAStack.Navigator>
  );
}

const LeaderboardStack = createNativeStackNavigator<LeaderboardStackParamList>();
function LeaderboardStackNavigator() {
  return (
    <LeaderboardStack.Navigator screenOptions={{ headerShown: false }}>
      <LeaderboardStack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </LeaderboardStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="Bookmarks" component={BookmarksScreen} />
      <ProfileStack.Screen name="QuizHistory" component={QuizHistoryScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
    </ProfileStack.Navigator>
  );
}

const LiveTestStack = createNativeStackNavigator<LiveTestStackParamList>();
function LiveTestStackNavigator() {
  return (
    <LiveTestStack.Navigator screenOptions={{ headerShown: false }}>
      <LiveTestStack.Screen name="LiveTestList" component={LiveTestsScreen} />
      <LiveTestStack.Screen name="LiveTestDetail" component={LiveTestDetailScreen} />
      <LiveTestStack.Screen name="LiveTestAttempt" component={LiveTestAttemptScreen} options={{ gestureEnabled: false }} />
      <LiveTestStack.Screen name="LiveTestResult" component={LiveTestResultScreen} />
    </LiveTestStack.Navigator>
  );
}

const AdminStack = createNativeStackNavigator<AdminStackParamList>();
function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AddQuestion" component={AddQuestionScreen} />
      <AdminStack.Screen name="AddCurrentAffairs" component={AddCurrentAffairsScreen} />
      <AdminStack.Screen name="BulkImport" component={BulkImportScreen} />
    </AdminStack.Navigator>
  );
}

// ── Bottom Tab Navigator ──────────────────────────────────────────────────────

export function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'android' ? 60 : 80,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="QuizTab"
        component={QuizStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📝" label="Quiz" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LiveTab"
        component={LiveTestStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🔴" label="Live" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CurrentAffairsTab"
        component={CAStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📰" label="Current Affairs" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏆" label="Ranks" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Admin" focused={focused} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}
