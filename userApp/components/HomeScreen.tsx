import {useEffect, useState, useContext} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Button,
  Modal,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Header from './Header';
import OrderCards from './OrderCards';
import OrderList from './OrderList';
import NoOrders from './NoOrders';
import BROKER_FACTORY_ARTIFACT from '../abis/BrokerFactory.json';
import GLOBALS from '../Globals';
import {EthereumContext} from '../contexts/EthereumContext';
import {useContract, useContractRead} from '../contexts/ContractHooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EthCrypto from 'eth-crypto';
import BuyIcon from './../assets/images/buy_icon.svg';
import SellIcon from './../assets/images/sell_icon.svg';

function HomeScreen({navigation}): Node {
  console.log('HomeScreen rendered');
  const [ordersInProcess, setOrdersInProcess] = useState([]);
  const [ordersCompleted, setOrdersCompleted] = useState([]);
  const [showNoOrders, setShowNoOrders] = useState(true);
  const [ordersNull, setOrdersNull] = useState(false);
  const [settingUp, setSettingUp] = useState(true);

  const {provider, wallet} = useContext(EthereumContext);

  const contract = useContract(
    GLOBALS.BROKER_FACTORY_CONTRACT,
    BROKER_FACTORY_ARTIFACT.abi,
  );
  const {
    data: userOrders,
    isLoading: userOrdersLoading,
    error: error1,
  } = useContractRead(contract, 'userOrdersArr', [wallet?.address], true);

  useEffect(() => {
    SplashScreen.hide();

    console.log('wallet loading', wallet);
    if (wallet?.address) {
      console.log('wallet loaded');
      console.log(wallet.address);

      (async () => {
        try {
          const value = await AsyncStorage.getItem(GLOBALS.PUBKEY_KEY);
          if (value !== null) {
            console.log('got async storage keys', value);
          } else {
            const keys = EthCrypto.createIdentity();
            await AsyncStorage.setItem(
              GLOBALS.PUBKEY_KEY,
              JSON.stringify(keys),
            );
            console.log('set async storage keys', keys);
          }
        } catch (e) {
          // error reading value
          console.log(
            'caught while trying to load saved public encryption key',
            e,
          );
        }
      })();
      setSettingUp(false);
    } else {
      console.log('wallet loading');
    }
  }, [wallet]);

  useEffect(() => {
    if (userOrders && userOrders.length > 0) {
      setShowNoOrders(false);
      userOrdersObj = userOrders.map(ord => {
        // TODO: improve this
        return {
          broker: ord[0],
          placer: ord[1],
          recipientAddr: ord[2],
          pubKey: ord[3],
          encUpi: ord[4],
          amount: ord[5].toString(),
          inrAmount: ord[6].toString(),
          placedTimestamp: ord[7].toString(),
          completedTimestamp: ord[8].toString(),
          status: ord[9],
          orderType: ord[10],
          price: parseFloat(ord[5].toString()) / parseFloat(ord[5].toString()),
          id: ord[11].toString(),
        };
      });
      userOrdersObj.sort((a, b) => b.placedTimestamp - a.placedTimestamp);
      setOrdersInProcess(userOrdersObj.filter(order => order.status != 3));
      setOrdersCompleted(userOrdersObj.filter(order => order.status == 3));
    } else {
      setOrdersNull(true);
    }
  }, [userOrders]);

  useEffect(() => {
    if (!userOrdersLoading && !userOrders) {
      setShowNoOrders(true);
    }
  }, [userOrdersLoading]);

  return (
    <SafeAreaView style={styles.body}>
      <Header />
      <Modal
        transparent={true}
        visible={settingUp}
        animationType="none"
        onRequestClose={() => {}}>
        <View style={styles.backdrop}>
          <ActivityIndicator size="large" color="#01C38E" />
          <Text style={styles.loadingText}>Setting up your account...</Text>
          <View style={{flex: 0.1}} />
        </View>
      </Modal>
      {showNoOrders && (
        <NoOrders isLoading={userOrdersLoading} settingUp={settingUp} />
      )}
      {!showNoOrders && (
        <>
          <View style={styles.ordersInProcess}>
            <OrderCards data={ordersInProcess} navigation={navigation} />
          </View>
          <OrderList data={ordersCompleted} navigation={navigation} />
        </>
      )}
      <View
        style={{
          borderBottomColor: '#252525',
          borderBottomWidth: 2,
          width: '100%',
        }}
      />
      <View style={styles.buttonSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.buyButton}
          onPress={() => navigation.navigate('ConfirmBuyOrder')}>
          <Text style={styles.buyButtonText}>Buy USDT</Text>
          <BuyIcon />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.sellButton}
          onPress={() => navigation.navigate('ConfirmSellOrder')}>
          <Text style={styles.sellButtonText}>Sell USDT</Text>
          <SellIcon />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
    padding: 10,
    height: '100%',
  },
  header: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    fontSize: 24,
  },
  subHeading: {
    fontFamily: 'Satoshi-Regular',
    color: '#ffffff',
    // fontWeight: 400,
    fontSize: 14,
    opacity: 0.5,
    paddingTop: 5,
  },
  buttonSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buyButton: {
    flexDirection: 'row',
    backgroundColor: '#01C38E',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 20,
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#262626',
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    marginRight: 10,
  },
  sellButton: {
    flexDirection: 'row',
    backgroundColor: '#222222',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 20,
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButtonText: {
    color: '#ffffff',
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    marginRight: 10,
  },
  ordersInProcess: {
    marginLeft: -20,
    marginRight: -20,
  },
  backdrop: {
    position: 'absolute',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 1,
    // marginBottom: 30,
    color: '#ffffff',
  },
});

export default HomeScreen;
