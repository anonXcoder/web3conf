import {useEffect, useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import MetamaskAccountCard from './MetamaskAccountCard';
import EthCrypto from 'eth-crypto';
import CONFIG_ARTIFACT from '../abis/P2pxConfig.json';
import FACTORY_ARTIFACT from '../abis/BrokerFactory.json';
import GLOBALS from '../Globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import SVGInr from './../assets/images/inr.svg';
import SVGUsdt from './../assets/images/usdt.svg';
import moment from 'moment';
import {useContract, useContractRead} from '../contexts/ContractHooks';
import USDT_Primary from './../assets/images/usdt_primary.svg';
import Rupee_Primary from './../assets/images/rupee_primary.svg';
import USDT_Secondary from './../assets/images/usdt_secondary.svg';
import Inr from './../assets/images/inr.svg';
import Back_Button from './../assets/images/Back_Button.svg';
import Close_Button from './../assets/images/Close_Button.svg';
import CurrencyX from './../assets/images/CurrencyX';
import INR_USDT from './../assets/images/inr_usdt.svg';
import Clock from './../assets/images/Clock.svg';

function PlaceBuyOrder({route, navigation}): Node {
  console.log('PlaceBuyOrder rendered');
  const {inrAmount, usdtAmount} = route.params;
  const [processingTimeText, setProcessingTimeText] = useState('');

  const contract = useContract(GLOBALS.CONFIG_CONTRACT, CONFIG_ARTIFACT.abi);
  const brokerContract = useContract(
    GLOBALS.BROKER_FACTORY_CONTRACT,
    FACTORY_ARTIFACT.abi,
  );
  const {
    data: orderETA,
    isLoading: isOrderETALoading,
    error: error3,
  } = useContractRead(contract, 'processingTime');
  const {
    data: brokerAddress,
    isLoading: isBrokerAddressLoading,
    error: brokerAddressError,
  } = useContractRead(brokerContract, 'fetchBrokerForOrder');

  useEffect(() => {
    if (orderETA) {
      let text =
        moment
          .duration({seconds: Number(orderETA?.buyMin.toString())})
          .humanize() +
        ' -\n ' +
        moment
          .duration({seconds: Number(orderETA?.buyMax.toString())})
          .humanize();
      text = text.replace('minutes', 'mins');
      text = text.replace('minute', 'min');
      text = text.replace('hours', 'hrs');
      text = text.replace('hour', 'hr');
      setProcessingTimeText(text);
    }
  }, [orderETA]);

  const placeOrder = async () => {
    console.log('about to place order');
    if (isOrderETALoading && isBrokerAddressLoading) {
      return;
    }
    const receipientAddr = await AsyncStorage.getItem(
      GLOBALS.SAVED_WALLETS_KEY,
    );
    let userKey = await AsyncStorage.getItem(GLOBALS.PUBKEY_KEY);
    userKey = JSON.parse(userKey);

    if (usdtAmount == 0 || !usdtAmount) {
      console.log('invalid amount');
    }
    if (!userKey) {
      console.log('pub key not generated');
    }
    if (!brokerAddress) {
      console.log('Please wait while we fetch broker address');
    }
    if (!receipientAddr || receipientAddr == '') {
      ToastAndroid.showWithGravity(
        'Please enter wallet address',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    } else if (receipientAddr) {
      navigation.navigate('PlacingBuyOrder', {
        orderArgs: [
          brokerAddress.addr,
          userKey.publicKey,
          ethers.utils.parseUnits(usdtAmount, 6).toString(),
          receipientAddr,
          0,
          '',
        ],
        orderETA,
        inrAmount,
      });
    }
  };

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.row1}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Back_Button />
        </TouchableOpacity>
        <Text style={styles.row1Text}>Buy USDT</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.popToTop()}>
          <Close_Button />
        </TouchableOpacity>
      </View>
      <View style={styles.row2}>
        <INR_USDT style={{marginLeft: -5}} />
      </View>
      <View style={styles.row3}>
        <Text style={styles.row3Text}>Confirm purchase of</Text>
        <Text style={styles.row3Text}>USDT with INR</Text>
      </View>
      <View style={styles.row4}>
        <View style={styles.row4Row}>
          <Text style={styles.row4RowText}>Sending</Text>
          <View style={styles.row4RowCol}>
            <Text style={styles.row4RowColText}>{inrAmount}</Text>
            <SVGInr />
          </View>
        </View>
        <View style={styles.row4Row}>
          <Text style={styles.row4RowText}>Receiving</Text>
          <View style={styles.row4RowCol}>
            <Text style={styles.row4RowColText}>{usdtAmount}</Text>
            <SVGUsdt />
          </View>
        </View>
        <View style={styles.row4Row}>
          <Text style={styles.row4RowText}>Time Estimate</Text>
          <View style={styles.row4RowCol}>
            <Text style={styles.row4RowColText}>{processingTimeText}</Text>
            <Clock />
          </View>
        </View>
      </View>
      <View
        style={{
          borderBottomColor: '#262626',
          borderBottomWidth: 1,
          width: '100%',
          paddingTop: 10,
        }}
      />
      <View style={styles.row5}>
        <Text style={styles.row5Text}>Receiving Wallet</Text>
        <MetamaskAccountCard
          connectedSymbol={true}
          background={'#181818'}
          addAddress={true}
        />
      </View>
      <View style={styles.row6}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.placeOrderBtn}
          onPress={placeOrder}>
          {isOrderETALoading && isBrokerAddressLoading ? (
            <Text style={styles.placeText}>Loading...</Text>
          ) : (
            <Text style={styles.placeText}>Place Order</Text>
          )}
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
    height: '100%',
    padding: 30,
  },
  row1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row1Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  row2: {
    paddingTop: 40,
  },
  row3: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  row3Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  row4: {},
  row4Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  row4RowText: {
    color: '#989898',
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
  },
  row4RowCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '24%',
  },
  row4RowColText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    paddingRight: 10,
  },
  row5: {
    paddingTop: 20,
    flex: 1,
  },
  row5Text: {
    fontFamily: 'Satoshi-Bold',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  row6: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderBtn: {
    borderRadius: 12,
    backgroundColor: '#01C38E',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
  },
  placeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#1E1E1E',
  },
});
export default PlaceBuyOrder;
