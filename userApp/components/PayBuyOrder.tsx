import {useState, useEffect, useRef} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ToastAndroid,
  FlatList,
} from 'react-native';
import MerchantInfoCard from './MerchantInfoCard';
import LinearGradient from 'react-native-linear-gradient';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import moment from 'moment';
import GLOBALS from '../Globals';
import BROKER_FACTORY_ARTIFACT from '../abis/BrokerFactory.json';
import {useIsFocused} from '@react-navigation/native';
import Back_Button from './../assets/images/Back_Button.svg';
import Close_Button from './../assets/images/Close_Button.svg';

function PayBuyOrder({route, navigation}): Node {
  //TODO: prefill remaining time with contract order placed - 10 mins
  console.log('payBuyOrder param - ', route.params);
  const {orderArgs, upiId, orderId, orderETA, inrAmount} = route.params;
  const [fill, setFill] = useState(100);
  const isFocused = useIsFocused();
  let intervalId;

  useEffect(() => {
    intervalId = setInterval(() => {
      setFill(prevFill => {
        if (prevFill - 0.1665 < 0) {
          return 0;
        } else {
          return prevFill - 0.1665;
        }
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isFocused) {
      console.log('clearing interval');
      const res = clearInterval(intervalId);
      console.log(res);
    }
  }, [isFocused]);

  const cancelOrder = () => {
    if (isFocused) {
      ToastAndroid.show(
        "Order will be cancelled in some time if you didn't make the payment yet!",
        ToastAndroid.LONG,
      );
      navigation.popToTop();
    }
  };

  return (
    <SafeAreaView style={styles.body}>
      <LinearGradient
        colors={['#10201c', '#11211c', '#121a18', '#000000', '#000000']}
        start={{x: 0.8, y: 0}}
        end={{x: 0.2, y: 1}}
        style={styles.linearGradient}>
        {/*<View style={styles.row1}>
					<TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
						<Image source={require('./../assets/images/back_button.png')} />
					</TouchableOpacity>
					<TouchableOpacity activeOpacity={0.7} onPress={() => navigation.popToTop()}>
<Close_Button/>
					</TouchableOpacity>
				</View>*/}
        <View style={styles.row2}>
          <View style={styles.row2Row1}>
            <AnimatedCircularProgress
              size={200}
              width={10}
              fill={fill}
              tintColor="#01C38E"
              backgroundColor="#242424"
              lineCap="round"
              rotation={90}>
              {fill => {
                if (fill.toFixed(2) == 0.01) cancelOrder(); // for some reason fill = 0 when the component is rendered
                return (
                  <View>
                    <Text style={styles.timer}>
                      {moment.utc(fill * 6 * 1000).format('mm:ss')}
                    </Text>
                    <Text style={styles.minsRem}>Mins remaining</Text>
                  </View>
                );
              }}
            </AnimatedCircularProgress>
          </View>
          <View style={styles.row2Row2}>
            <MerchantInfoCard connectedSymbol={true} upiId={upiId} />
          </View>
          <View style={styles.row2Row3}>
            <FlatList
              data={[
                {key: '1 - Copy above UPI id using the copy icon'},
                {key: '2 - Paste the UPI id in Paytm, Gpay or Phonepe'},
                {
                  key: `3 - Send the exact amount (INR ${inrAmount}) to the UPI id`,
                },
                {
                  key: '4 - Once the transaction is successful click on below button',
                },
              ]}
              renderItem={({item}) => (
                <Text style={styles.row3Text}>{item.key}</Text>
              )}
            />
          </View>
        </View>
        <View style={styles.row4}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.paidOrderBtn}
            onPress={() => {
              navigation.navigate('PaidBuyOrder', {
                orderArgs,
                orderId,
                orderETA,
              });
            }}>
            <Text style={styles.paidText}>I have made this payment</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
    height: '100%',
  },
  linearGradient: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 30,
  },
  row1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  row1Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  row2: {
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'center',
    flex: 1,
  },
  row2Row1: {
    fontFamily: 'Satoshi-Bold',
    flex: 2,
    justifyContent: 'center',
  },
  row2Row2: {
    width: '100%',
    paddingBottom: 20,
  },
  row2Row3: {
    flex: 1,
  },
  timer: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 36,
    color: '#ffffff',
  },
  minsRem: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: '#585861',
  },
  row3Text: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: '#ffffff',
    padding: 2,
    alignItems: 'center',
  },
  paidOrderBtn: {
    borderRadius: 12,
    backgroundColor: '#01C38E',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
  },
  paidText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#1E1E1E',
  },
});

export default PayBuyOrder;
