import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tab Navigator
import { TabsNavigator } from '../screens/tabs/TabsNavigator';

// Modal Screens
// Modal Screens
import { AddSubscriptionScreen } from '../screens/modals/AddSubscriptionScreen';
import { EditProfileScreen } from '../screens/modals/EditProfileScreen';

// Feature Screens
import { BudgetPlannerScreen } from '../screens/features/BudgetPlannerScreen';
import { SavingsGoalsScreen } from '../screens/features/SavingsGoalsScreen';
import { YearInReviewScreen } from '../screens/features/YearInReviewScreen';
import { SubscriptionDetailsScreen } from '../screens/features/SubscriptionDetailsScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tab Navigator */}
      <Stack.Screen name="MainTabs" component={TabsNavigator} />
      
      {/* Feature Screens - Full Screen with back navigation */}
      <Stack.Screen 
        name="BudgetPlanner" 
        component={BudgetPlannerScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="SavingsGoals" 
        component={SavingsGoalsScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="YearInReview" 
        component={YearInReviewScreen}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen 
        name="SubscriptionDetails" 
        component={SubscriptionDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Modal Screens */}
      <Stack.Group 
        screenOptions={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
