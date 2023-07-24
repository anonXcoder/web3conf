/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import '@ethersproject/shims';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './components/HomeScreen';
import ConfirmBuyOrder from './components/ConfirmBuyOrder';
import PlaceBuyOrder from './components/PlaceBuyOrder';
import PlacingBuyOrder from './components/PlacingBuyOrder';
import PayBuyOrder from './components/PayBuyOrder';
import PaidBuyOrder from './components/PaidBuyOrder';
import CompleteBuyOrder from './components/CompleteBuyOrder';
import {ethers} from 'ethers';
import {EthereumProvider} from './contexts/EthereumContext';
import GLOBALS from './Globals';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  console.log('App rendered');
  return (
    <EthereumProvider>
      <View style={{flex: 1, backgroundColor: '#121212'}}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{headerShown: false}}
            initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Welcome',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="ConfirmBuyOrder"
              component={ConfirmBuyOrder}
              options={{
                title: 'Buy USDT',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="PlaceBuyOrder"
              component={PlaceBuyOrder}
              options={{
                title: 'Buy USDT',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="PlacingBuyOrder"
              component={PlacingBuyOrder}
              options={{
                title: 'Buy USDT',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="PayBuyOrder"
              component={PayBuyOrder}
              options={{
                title: 'Buy USDT',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="PaidBuyOrder"
              component={PaidBuyOrder}
              options={{
                title: 'Buy USDT',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="CompleteBuyOrder"
              component={CompleteBuyOrder}
              options={{
                title: 'Buy USDT',
                animationDuration: 0,
                animation: 'fade',
                presentation: 'modal',
              }}
            />
            {/*TODO - add sell order screens*/}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </EthereumProvider>
  );
}

export default App;
