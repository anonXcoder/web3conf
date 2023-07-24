import type {Node} from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import moment from 'moment';
import {ethers} from 'ethers';
import Buying_Order_green from '../assets/images/Buying_Order_green.svg';
import Selling_Order_red from '../assets/images/Selling_Order_red.svg';
import USDT from '../assets/images/usdt.svg';
import INR from '../assets/images/inr.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../Globals';

function OrderList(props): Node {
  const navigateToOrder = async order => {
    if (order.orderType == 0) {
      props.navigation.navigate('CompleteBuyOrder', {order});
    } else {
      const userUpi = await AsyncStorage.getItem(GLOBALS.SAVED_UPI_KEY);
      props.navigation.navigate('CompleteSellOrder', {order, userUpi});
    }
  };

  const renderCard = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateToOrder(item)}
        activeOpacity={0.7}>
        <View style={styles.listCol1}>
          {item.orderType == 0 ? <Buying_Order_green /> : <Selling_Order_red />}
        </View>
        <View style={styles.listCol2}>
          <Text style={styles.listCol2Text1}>
            {item.orderType == 0 ? 'Bought USDT' : 'Sold USDT'}
          </Text>
          <Text style={styles.listCol2Text2}>
            {moment(parseInt(item.completedTimestamp) * 1000).fromNow()}
          </Text>
        </View>
        <View style={styles.listCol3}>
          <View style={styles.listCol3inside}>
            <View style={styles.listCol3in}>
              <Text style={styles.listCol3Plus}>+</Text>
              <Text style={styles.listCol3Text}>
                {item.orderType == 0
                  ? ethers.utils
                      .formatUnits(item.amount, 6)
                      .toLocaleString('en-US')
                  : ethers.utils
                      .formatUnits(item.inrAmount, 6)
                      .toLocaleString('en-IN')}
              </Text>
              {item.orderType === 0 ? (
                <View style={styles.currency}>
                  <USDT />
                </View>
              ) : (
                <View style={styles.currency}>
                  <INR />
                </View>
              )}
            </View>

            <Text style={styles.orderId}>ID : {item.id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Completed</Text>
      <FlatList
        data={props.data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCard}
        ItemSeparatorComponent={() => {
          return <View style={{height: 15}} />;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 20,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingBottom: 15,
    alignItems: 'center',
  },
  listCol1: {
    display: 'flex',
    flexDirection: 'column',
  },
  listCol2: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 10,
    gap: 4,
    flex: 1,
  },
  listCol2Text1: {
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  listCol2Text2: {
    fontFamily: 'Satoshi-Regular',
    color: '#666666',
    fontSize: 12,
  },
  listCol3in: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCol3inside: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 4,
  },
  listCol3: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    // flex: 1,
    alignItems: 'center',
    paddingRight: 5,
  },
  listCol3Plus: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#01C38E',
  },
  listCol3Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginLeft: 5,
    marginRight: 5,
  },
  orderId: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#666666',
  },
});

export default OrderList;
