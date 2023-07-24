import type {Node} from 'react';
import {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ItemSeparatorComponent,
} from 'react-native';

import moment from 'moment';
import {ethers} from 'ethers';
import USDT from '../assets/images/usdt.svg';
import INR from '../assets/images/inr.svg';
import RightArrow from '../assets/images/right_arrow.svg';
import Buying_Order_green from '../assets/images/Buying_Order_green.svg';
import Selling_Order_red from '../assets/images/Selling_Order_red.svg';
import Order_in_process from '../assets/images/order_in_process.svg';
import EthCrypto from 'eth-crypto';
import GLOBALS from '../Globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

function OrderCards(props): Node {
  const [alreadyPaidStatus, setAlreadyPaidStatus] = useState({});

  useEffect(() => {
    const fetchPaidStatus = async () => {
      let newAlreadyPaidStatus = {};

      for (let order of props.data) {
        const alreadyPaid = await AsyncStorage.getItem(
          `@P2PX:sell_order_${order.id}_paid`,
        );
        newAlreadyPaidStatus[order.id] = alreadyPaid == 'true';
      }
      // Update the state with the new object
      setAlreadyPaidStatus(newAlreadyPaidStatus);
    };
    fetchPaidStatus();
  }, [props.data]);

  const navigateToOrder = async routeOrder => {
    console.log('trying to navigate');
    if (routeOrder.orderType == 0) {
      if (routeOrder.status == 0) {
        props.navigation.navigate('PlacingBuyOrder', {routeOrder});
      } else if (routeOrder.status == 1) {
        let userKeys = await AsyncStorage.getItem(GLOBALS.PUBKEY_KEY);
        userKeys = JSON.parse(userKeys);
        console.log('user keys: ', userKeys);

        const encryptedObject = EthCrypto.cipher.parse(routeOrder.encUpi);
        console.log('enc object: ', encryptedObject);
        const decrypted = await EthCrypto.decryptWithPrivateKey(
          userKeys.privateKey,
          encryptedObject,
        );
        console.log('decrypted object: ', decrypted);
        const decryptedPayload = JSON.parse(decrypted);
        props.navigation.navigate('PayBuyOrder', {
          orderArgs: routeOrder,
          upiId: decryptedPayload.message,
          orderId: routeOrder.id,
          inrAmount: Number(
            ethers.utils.formatUnits(
              ethers.BigNumber.from(routeOrder.inrAmount),
              6,
            ),
          ).toLocaleString('en-IN'),
        });
      } else if (routeOrder.status == 2) {
        props.navigation.navigate('PaidBuyOrder', {
          orderId: routeOrder.id,
          routeOrder,
        });
      }
    } else {
      const alreadyPaid = await AsyncStorage.getItem(
        `@P2PX:sell_order_${routeOrder.id}_paid`,
      );
      if (routeOrder.status == 0 && alreadyPaid == 'true') {
        props.navigation.navigate('PayingSellOrder', {
          order: routeOrder,
          orderId: routeOrder.id,
          alreadyPaid,
        });
      } else if (routeOrder.status == 0) {
        props.navigation.navigate('PaySellOrder', {
          order: routeOrder,
          orderId: routeOrder.id,
        });
      }
    }
  };

  const getStatus = (status, timestamp, itemId, orderType) => {
    // console.log("orderPaid",orderPaid)

    // console.log("itemId orderPaid ", itemId ,orderPaid[itemId])

    const currentTime = moment();
    const timeDiff = currentTime.diff(
      moment(parseInt(timestamp) * 1000),
      'minutes',
    );

    if (timeDiff > 10) {
      return {
        text: 'Escalated',
        style: styles.statusEscalated,
      };
    } else if (status === 0 && alreadyPaidStatus[itemId]) {
      return {
        text: 'Paid',
        style: styles.statusNotCompleted,
      };
    } else if (status === 0) {
      console.log('Entered 3');
      return {
        text: 'Placed',
        style: styles.statusNotCompleted,
      };
    } else if (status === 1) {
      console.log('Entered 4');
      return {
        text: 'Accepted',
        style: styles.statusNotCompleted,
      };
    } else if (status === 2) {
      console.log('Entered 5');
      return {
        text: 'Paid',
        style: styles.statusNotCompleted,
      };
    } else {
      return {
        text: '',
        style: {},
      };
    }
  };

  const renderCard = ({item, index}) => {
    const statusInfo = getStatus(
      item.status,
      item.placedTimestamp,
      item.id,
      item.orderType,
    );
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigateToOrder(item)}
        activeOpacity={0.7}>
        <View style={styles.cardRow1}>
          <View style={styles.cardRow1Col1}>
            {item.orderType == 0 ? (
              <Buying_Order_green style={styles.cardRow1Col1Row1} />
            ) : (
              <Selling_Order_red style={styles.cardRow1Col1Row1} />
            )}
            <View style={styles.cardRow1Col1Row2}>
              <Text style={styles.cardRow1Col1Text1}>
                {item.orderType == 0 ? 'Buying USDT' : 'Selling USDT'}
              </Text>
              <Text style={styles.cardRow1Col1Text2}>
                {moment(parseInt(item.placedTimestamp) * 1000).fromNow()}
              </Text>
              <Text style={statusInfo.style}>{statusInfo.text}</Text>
            </View>
          </View>
          <View>
            <Order_in_process />
          </View>
        </View>
        <View style={styles.cardRow2}>
          <View style={styles.cardRow2Col1}>
            <USDT style={styles.cardRow2Col1Image} />

            <Text style={styles.cardRow2Col1Text}>
              {Number(
                ethers.utils.formatUnits(ethers.BigNumber.from(item.amount), 6),
              ).toLocaleString('en-US') + '  for'}
            </Text>
            <INR style={styles.cardRow2Col1Image} />

            <Text style={styles.cardRow2Col1Text}>
              {Number(
                ethers.utils.formatUnits(
                  ethers.BigNumber.from(item.inrAmount),
                  6,
                ),
              ).toLocaleString('en-IN')}
            </Text>
          </View>
          <View>
            <RightArrow />
          </View>
        </View>
        <View style={styles.orderCol3}>
          <Text style={styles.orderId}>ID : {item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Processing</Text>
      <FlatList
        horizontal={true}
        data={props.data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCard}
        ItemSeparatorComponent={() => {
          return <View style={{width: 15}} />;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  heading: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 20,
    marginLeft: 20,
  },
  card: {
    display: 'flex',
    backgroundColor: '#181818',
    padding: 15,
    gap: 16,
    height: '100%',
    borderRadius: 16,
    paddingBottom: 20,
    MarginLeft: 20,
  },
  cardRow1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardRow1Col1: {
    display: 'flex',
    flexDirection: 'row',
    marginRight: 65,
    alignItems: 'center',
  },
  cardRow1Col1Text1: {
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  cardRow1Col1Text2: {
    fontFamily: 'Satoshi-Medium',
    color: '#666666',
    fontSize: 12,
  },
  cardRow1Col1Row1: {
    marginRight: 10,
  },
  cardRow2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'center',
  },
  cardRow2Col1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cardRow2Col1Text: {
    fontFamily: 'Satoshi-Medium',
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.4,
    marginRight: 5,
  },
  cardRow2Col1Image: {
    marginRight: 10,
  },
  cardRow1Col1Row2: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  //status

  statusNotCompleted: {
    backgroundColor: '#F6851B',
    color: '#000000',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    letterSpacing: 1.5,
    fontSize: 10,
    fontWeight: 700,
    paddingTop: 1,
    paddingRight: 4,
    paddingBottom: 1,
    paddingLeft: 4,
    borderRadius: 1.2,
  },
  statusEscalated: {
    backgroundColor: '#262626',
    color: '#FF4444',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    letterSpacing: 1.5,
    fontSize: 10,
    fontWeight: 700,
    paddingTop: 1,
    paddingRight: 4,
    paddingBottom: 1,
    borderRadius: 1.2,

    paddingLeft: 4,
  },
  orderId: {
    position: 'absolute',
    textAlign: 'center',
    bottom: -20,
    width: '100%',
    // right:-20,
    fontFamily: 'Satoshi-Bold',
    color: '#000000',
    paddingTop: 1,
    paddingBottom: 1,
    paddingRight: 4,
    paddingLeft: 4,
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
    // transform:"rotate(-90deg)",
    backgroundColor: '#01c38e',
  },
  orderCol3: {
    display: 'flex',

    alignItems: 'center',
  },
});

export default OrderCards;
