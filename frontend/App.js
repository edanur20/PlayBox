import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CodeNamesSetupScreen from './src/screens/CodeNamesSetupScreen';
import CodeNamesGameScreen from './src/screens/CodeNamesGameScreen';
import WerewolfSetupScreen from './src/screens/WerewolfSetupScreen';
import WerewolfRoleDistributionScreen from './src/screens/WerewolfRoleDistributionScreen';
import WerewolfGameScreen from './src/screens/WerewolfGameScreen';
import BMCSetupScreen from './src/screens/BMCSetupScreen';
import BMCGameScreen from './src/screens/BMCGameScreen';
import RankingSetupScreen from './src/screens/RankingSetupScreen';
import RankingGameScreen from './src/screens/RankingGameScreen';
import TimesUpSetupScreen from './src/screens/TimesUpSetupScreen';
import TimesUpGameScreen from './src/screens/TimesUpGameScreen';
import UndercoverSetupScreen from './src/screens/UndercoverSetupScreen';
import UndercoverGameScreen from './src/screens/UndercoverGameScreen';
import WouldYouRatherSetupScreen from './src/screens/WouldYouRatherSetupScreen';
import WouldYouRatherInputScreen from './src/screens/WouldYouRatherInputScreen';
import WouldYouRatherGameScreen from './src/screens/WouldYouRatherGameScreen';
import TabooSetupScreen from './src/screens/TabooSetupScreen';
import TabooGameScreen from './src/screens/TabooGameScreen';
import TruthOrDareSetupScreen from './src/screens/TruthOrDareSetupScreen';
import TruthOrDareGameScreen from './src/screens/TruthOrDareGameScreen';
import BombeSetupScreen from './src/screens/BombeSetupScreen';
import BombeGameScreen from './src/screens/BombeGameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CodeNamesSetup" component={CodeNamesSetupScreen} />
        <Stack.Screen name="CodeNamesGame" component={CodeNamesGameScreen} />
        <Stack.Screen name="WerewolfSetup" component={WerewolfSetupScreen} />
        <Stack.Screen name="WerewolfRoleDistribution" component={WerewolfRoleDistributionScreen} />
        <Stack.Screen name="WerewolfGame" component={WerewolfGameScreen} />
        <Stack.Screen name="BMCSetup" component={BMCSetupScreen} />
        <Stack.Screen name="BMCGame" component={BMCGameScreen} />
        <Stack.Screen name="RankingSetup" component={RankingSetupScreen} />
        <Stack.Screen name="RankingGame" component={RankingGameScreen} />
        <Stack.Screen name="TimesUpSetup" component={TimesUpSetupScreen} />
        <Stack.Screen name="TimesUpGame" component={TimesUpGameScreen} />
        <Stack.Screen name="UndercoverSetup" component={UndercoverSetupScreen} />
        <Stack.Screen name="UndercoverGame" component={UndercoverGameScreen} />
        <Stack.Screen name="WouldYouRatherSetup" component={WouldYouRatherSetupScreen} />
        <Stack.Screen name="WouldYouRatherInput" component={WouldYouRatherInputScreen} />
        <Stack.Screen name="WouldYouRatherGame" component={WouldYouRatherGameScreen} />
        <Stack.Screen name="TabooSetup" component={TabooSetupScreen} />
        <Stack.Screen name="TabooGame" component={TabooGameScreen} />
        <Stack.Screen name="TruthOrDareSetup" component={TruthOrDareSetupScreen} />
        <Stack.Screen name="TruthOrDareGame" component={TruthOrDareGameScreen} />
        <Stack.Screen name="BombeSetup" component={BombeSetupScreen} />
        <Stack.Screen name="BombeGame" component={BombeGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
