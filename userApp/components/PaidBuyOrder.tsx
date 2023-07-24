import type {Node} from 'react';
import {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import GLOBALS from '../Globals';
import BROKER_FACTORY_ARTIFACT from '../abis/BrokerFactory.json';
import CONFIG_ARTIFACT from '../abis/P2pxConfig.json';
import {ethers} from 'ethers';
import {
  useContract,
  useContractWrite,
  useContractRead,
} from '../contexts/ContractHooks';
import Close_Button from './../assets/images/Close_Button.svg';

function PaidBuyOrder({route, navigation}): Node {
  console.log('paidbuyorder params-', route.params);
  const {orderArgs, orderId, routeOrder} = route.params;
  const contract = useContract(
    GLOBALS.BROKER_FACTORY_CONTRACT,
    BROKER_FACTORY_ARTIFACT.abi,
  );
  const {mutateAsync, isLoading, error} = useContractWrite(
    contract,
    'paidBuyOrder',
  );
  const [paidTxDone, setPaidTxDone] = useState(false);
  const [processingTimeText, setProcessingTimeText] = useState('');
  const {
    data: contractOrder,
    isLoading: isOrderLoading,
    error: orderError,
  } = useContractRead(contract, 'orders', [orderId], true);

  const configContract = useContract(
    GLOBALS.CONFIG_CONTRACT,
    CONFIG_ARTIFACT.abi,
  );
  const {
    data: orderETA,
    isLoading: isOrderETALoading,
    error: error3,
  } = useContractRead(configContract, 'processingTime');

  //TODO - do not allow to go back from here

  useEffect(() => {
    (async () => {
      try {
        console.log('placing paid tx with param - ', orderId);
        if (!routeOrder) {
          const tx = await mutateAsync([orderId]);
          console.log('check paid tx data', tx);
        }
        setPaidTxDone(true);
      } catch (err) {
        // TODO - go back here and show error in toast
      }
    })();
    // return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (orderETA) {
      let text =
        moment
          .duration({seconds: Number(orderETA?.buyMin.toString())})
          .humanize() +
        ' - ' +
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

  useEffect(() => {
    if (contractOrder && contractOrder.status == 3) {
      navigation.navigate('CompleteBuyOrder', {order: contractOrder});
    }
  }, [JSON.stringify(contractOrder)]);

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.crossRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.popToTop()}>
          <Close_Button />
        </TouchableOpacity>
      </View>
      <View style={styles.row1}>
        <Image source={require('./../assets/images/order_paid.png')} />
        {!paidTxDone && (
          <Text style={styles.row1Text1}>Requesting to verify payment</Text>
        )}
        {paidTxDone && (
          <Text style={styles.row1Text11}>
            We are verifying the payment you made this might take (
            {processingTimeText}), USDT will be sent automatically to the (
            {routeOrder
              ? routeOrder.recipientAddr
              : orderArgs[3] || orderArgs.recipientAddr}
            ) on polygon network, once the verification is complete
          </Text>
        )}
        <Text style={styles.row1Text2}>
          Transactions might take more time to settle occassionaly .If the
          payment is made from your side it will be surely settled to your
          wallet address on polygon network.{' '}
        </Text>
        <Text style={styles.orderId}>Order Id :{orderId}</Text>
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
  crossRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  row1: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row1Text1: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#ffffff',
    paddingTop: 30,
    paddingBottom: 10,
  },
  row1Text11: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#ffffff',
    paddingTop: 30,
    paddingBottom: 10,
    letterSpacing: 0.5,
  },
  row1Text2: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#989898',
  },
  orderId: {
    letterSpacing: 1,
    marginTop: 20,
    color: '#000000',
    paddingTop: 1,
    paddingBottom: 1,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: '#01c38e',
    borderRadius: 2,
    fontFamily: 'Satoshi-Bold',
  },
});

export default PaidBuyOrder;
