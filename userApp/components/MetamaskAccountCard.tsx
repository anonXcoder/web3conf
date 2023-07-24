import {useEffect, useState} from 'react';
import type {Node} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ToastAndroid,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import GLOBALS from '../Globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import SVGWallet from './../assets/images/wallet.svg';
import Clipboard from '@react-native-clipboard/clipboard';
import Edit from './../assets/images/edit.svg';
import Copy from './../assets/images/Copy.svg';
import Check from './../assets/images/CheckCircle.svg';

function MetamaskAccountCard(props): Node {
  const [savedAddress, setSavedAddress] = useState('');

  useEffect(() => {
    if (props.prefillAddress) {
      setSavedAddress(props.prefillAddress);
    } else {
      (async () => {
        try {
          const value = await AsyncStorage.getItem(GLOBALS.SAVED_WALLETS_KEY);
          if (value !== null) {
            setSavedAddress(value);
          }
        } catch (e) {
          // error reading value
          console.log('caught while trying to load saved wallet address');
        }
      })();
    }
  }, []);

  const saveAddress = async event => {
    event.persist();
    let address = event.nativeEvent.text;
    if (ethers.utils.isAddress(address)) {
      try {
        await AsyncStorage.setItem(
          GLOBALS.SAVED_WALLETS_KEY,
          event.nativeEvent.text,
        );
        setSavedAddress(event.nativeEvent.text);
        ToastAndroid.show('Address updated!', ToastAndroid.SHORT);
      } catch (error) {
        console.log('Error saving data' + error);
      }
    } else {
      ToastAndroid.show('Please enter valid address!', ToastAndroid.SHORT);
      await AsyncStorage.setItem(GLOBALS.SAVED_WALLETS_KEY, '');
      setSavedAddress('');
    }
  };

  const copyAddress = () => {
    if (savedAddress) {
      Clipboard.setString(savedAddress);
      ToastAndroid.showWithGravity(
        'Address copied',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }
  };

  return (
    <View>
      {savedAddress && (
        <TouchableOpacity
          style={[{backgroundColor: props.background}, styles.card]}
          onPress={copyAddress}
          activeOpacity={0.7}>
          <View style={styles.cardCol1}>
            <SVGWallet />
            <View style={styles.cardCol1Col}>
              <Text style={styles.cardHeader}>Wallet address</Text>
              <Text style={styles.walletAddr}>
                {savedAddress.substring(0, 4)}....
                {savedAddress.substring(savedAddress.length - 4)}
              </Text>
            </View>
          </View>
          {props.connectedSymbol && (
            <View style={styles.cardCol2}>
              <Check />
            </View>
          )}
          {!props.connectedSymbol && (
            <View style={styles.cardCol2}>
              <Copy />
            </View>
          )}
        </TouchableOpacity>
      )}
      {props.addAddress && (
        <View style={styles.card}>
          <View style={styles.cardCol1}>
            <Edit />
            <View style={styles.cardCol1Col}>
              <Text style={styles.cardHeader}>
                {savedAddress ? 'Update wallet address' : 'Add wallet address'}
              </Text>
              <TextInput
                style={{height: 20, padding: 0, color: '#989898'}}
                placeholder={'Tap to enter address'}
                placeholderTextColor={'#989898'}
                onEndEditing={e => saveAddress(e)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 20,
  },
  cardCol1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCol2: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  cardCol1Col: {
    paddingLeft: 10,
    flex: 1,
  },
  cardHeader: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi',
    fontWeight: 700,
    fontSize: 14,
  },
  walletAddr: {
    color: '#989898',
    fontFamily: 'Satoshi',
    fontWeight: 500,
    fontSize: 12,
  },
});

export default MetamaskAccountCard;
