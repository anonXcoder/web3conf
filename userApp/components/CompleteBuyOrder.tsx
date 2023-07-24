import type {Node} from 'react';
import {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import MetamaskAccountCard from './MetamaskAccountCard';
import TransactionDetailsCard from './TransactionDetailsCard';
import {ethers} from 'ethers';
import moment from 'moment';
import USDT_Primary from './../assets/images/usdt_primary.svg';
import Close_Button from './../assets/images/Close_Button.svg';
import SVGInr from './../assets/images/inr.svg';

function CompleteBuyOrder({route, navigation}): Node {
  const {order} = route.params;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );

    return () => backHandler.remove();
  }, []);

  const handleBackButton = () => {
    navigation.popToTop();
    return true;
  };

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.row1}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.popToTop()}>
          <Close_Button />
        </TouchableOpacity>
      </View>
      <View style={styles.row2}>
        <View style={styles.row2Row1}>
          <Text style={styles.row2Row1Text1}>Payment completed</Text>
          <View style={styles.row2Row1Row2}>
            <USDT_Primary style={{marginBottom: 10, marginRight: 5}} />
            <Text style={styles.row2Row1Text2}>
              {Number(
                ethers.utils.formatUnits(order.amount.toString(), 6),
              ).toLocaleString('en-US')}
            </Text>
          </View>
          <View style={styles.row2Row1Row3}>
            <SVGInr style={{marginRight: 3}} />
            <Text style={styles.row2Row1Text3}>
              {Number(
                ethers.utils.formatUnits(order.inrAmount.toString(), 6),
              ).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <TransactionDetailsCard
          inrAmount={Number(
            ethers.utils.formatUnits(order.inrAmount.toString(), 6),
          ).toLocaleString('en-IN')}
          usdtAmount={Number(
            ethers.utils.formatUnits(order.amount.toString(), 6),
          ).toLocaleString('en-US')}
        />
        <MetamaskAccountCard
          connectedSymbol={false}
          background={'#10201c'}
          prefillAddress={order.recipientAddr}
        />
        <View
          style={{
            borderBottomColor: '#262626',
            borderBottomWidth: 1,
            width: '100%',
            paddingTop: 30,
          }}
        />
        <View style={styles.merchDetSection}>
          <View style={styles.merchDetRow}>
            <Text style={styles.merchDet}>Date</Text>
            <Text style={styles.merchDet}>
              {moment(
                parseInt(order.completedTimestamp.toString()) * 1000,
              ).format('MMM Do, YYYY')}
            </Text>
          </View>
          <View style={styles.merchDetRow}>
            <Text style={styles.merchDet}>Time</Text>
            <Text style={styles.merchDet}>
              {moment(
                parseInt(order.completedTimestamp.toString()) * 1000,
              ).format('hh:mm')}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.row3}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.goHomeBtn}
          onPress={() => {
            navigation.popToTop();
          }}>
          <Text style={styles.goHomeText}>Go to Home</Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  row2: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
  },
  row2Row1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  row2Row1Text1: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#01C38E',
  },
  row2Row1Text2: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  row2Row1Row2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  row2Row1Row3: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  row2Row1Text3: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 18,
    color: '#6E6E6E',
  },
  merchDetSection: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 20,
  },
  merchDetRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  merchDet: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#989898',
  },
  goHomeBtn: {
    borderRadius: 12,
    backgroundColor: '#01C38E',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
  },
  goHomeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#1E1E1E',
  },
});
export default CompleteBuyOrder;
