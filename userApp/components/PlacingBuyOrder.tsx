import type {Node} from 'react';
import {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
} from 'react-native';
import GLOBALS from '../Globals';
import BROKER_FACTORY_ARTIFACT from '../abis/BrokerFactory.json';
import EthCrypto from 'eth-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import {
  useContract,
  useContractWrite,
  useContractRead,
} from '../contexts/ContractHooks';
import Info from './../assets/images/Info.svg';

function PlacingBuyOrder({route, navigation}): Node {
  console.log('PlaceBuyOrder rendered');
  const {orderArgs, orderETA, routeOrder, inrAmount} = route.params;
  const contract = useContract(
    GLOBALS.BROKER_FACTORY_CONTRACT,
    BROKER_FACTORY_ARTIFACT.abi,
  );
  const {mutateAsync, isLoading, error} = useContractWrite(
    contract,
    'placeOrder',
  );

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const {
    data: contractOrder,
    isLoading: isOrderLoading,
    error: orderError,
  } = useContractRead(contract, 'orders', [orderId], true);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    console.log('check orderArgs');
    console.log(orderArgs);
    if (!routeOrder) {
      (async () => {
        try {
          console.log('placing buy order');
          let tx = await mutateAsync(orderArgs);
          console.log(tx);
          console.log(tx.events[0].args);
          if (tx) {
            console.log(
              'setting order id as - ',
              tx.events[0].args[2].toString(),
            );
            setOrderId(parseInt(tx.events[0].args[2].toString()));
            setOrderPlaced(true);
            // setOrderId(17);
          }
        } catch (err) {
          // TODO - go back here and show error in toast
        }
      })();
    } else {
      setOrderId(parseInt(routeOrder.id));
      setOrderPlaced(true);
    }
  }, []);

  useEffect(() => {
    if (contractOrder && contractOrder.status == 1) {
      (async () => {
        let userKeys = await AsyncStorage.getItem(GLOBALS.PUBKEY_KEY);
        userKeys = JSON.parse(userKeys);

        console.log('user keys: ', userKeys);

        const encryptedObject = EthCrypto.cipher.parse(contractOrder.encUpi);
        console.log('enc object: ', encryptedObject);
        const decrypted = await EthCrypto.decryptWithPrivateKey(
          userKeys.privateKey,
          encryptedObject,
        );
        console.log('decrypted object: ', decrypted);
        const decryptedPayload = JSON.parse(decrypted);
        console.log('decrypted upi', decryptedPayload);

        console.log('passing params to paybuyorder', {
          upiId: decryptedPayload.message,
          orderId: orderId.toString(),
        });
        BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        navigation.navigate('PayBuyOrder', {
          orderArgs,
          upiId: decryptedPayload.message,
          orderId: orderId.toString(),
          orderETA,
          inrAmount,
        });
      })();
    }
  }, [JSON.stringify(contractOrder)]);

  const handleBackButton = () => {
    // ToastAndroid.show('Back button is pressed', ToastAndroid.SHORT);
    return true;
  };

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.row1}>
        <Image source={require('./../assets/images/placing.png')} />
        {/*<PlacingSvg />        */}

        {!orderPlaced && (
          <Text style={styles.row1Text1}>Sending your Order</Text>
        )}
        {orderPlaced && (
          <Text style={styles.row1Text1}>
            Waiting for merchant to accept order
          </Text>
        )}
        {/*{orderPlaced && (
          <Text style={styles.row1Text2}>
            Transactions might take more time to settle occassionaly .If the
            payment is made from your side it will be surely settled to your
            wallet address on polygon network.
          </Text>
        )}*/}
      </View>
      <View style={styles.row2}>
        <Info />
        <Text style={styles.row2Text}>
          Do not go back or close the app while the order is being sent to the
          merchant.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
    height: '100%',
    padding: 30,
  },
  row1: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row1Text1: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#ffffff',
    paddingTop: 30,
    paddingBottom: 10,
    textAlign: 'center',
  },
  row1Text2: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#989898',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
  },
  row2Text: {
    color: '#989898',
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    lineHeight: 19.2,
    paddingLeft: 15,
    paddingRight: 12,
  },
});

export default PlacingBuyOrder;
