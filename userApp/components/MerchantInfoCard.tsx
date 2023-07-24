import type {Node} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Copy from './../assets/images/Copy.svg';
import Merchant from './../assets/images/merchant.svg';

function MerchantInfoCard(props): Node {
  const copyUPI = () => {
    Clipboard.setString(props.upiId);
    ToastAndroid.showWithGravity(
      'UPI copied',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={copyUPI} activeOpacity={0.7}>
      <View style={styles.cardCol1}>
        <Merchant />
        <View style={styles.cardCol1Col}>
          <Text style={styles.cardHeader}>Merchant</Text>
          <Text style={styles.walletAddr}>{props.upiId}</Text>
        </View>
      </View>
      <View>
        <Copy />
      </View>
    </TouchableOpacity>
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
    backgroundColor: '#181818',
    padding: 15,
    marginTop: 20,
  },
  cardCol1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCol1Col: {
    paddingLeft: 10,
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

export default MerchantInfoCard;
