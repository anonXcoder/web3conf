import type {Node} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import Inr from './../assets/images/inr.svg';
import SVGUsdt from './../assets/images/usdt.svg';

function TransactionDetailsCard(props): Node {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow1}>
        <Text style={styles.cardRow1Col1Text}>Sent</Text>
        <View style={styles.cardRow1Col2}>
          <Text style={styles.cardRow1Col2Text}>{props.inrAmount}</Text>
          <Inr />
        </View>
      </View>
      <View style={styles.cardRow2}>
        <Text style={styles.cardRow1Col1Text}>Received</Text>
        <View style={styles.cardRow2Col2}>
          <Text style={styles.cardRow1Col2Text}>{props.usdtAmount}</Text>

          <SVGUsdt />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    padding: 15,
    marginTop: 40,
  },
  cardRow1: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  cardRow1Col1Text: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: '#989898',
  },
  cardRow1Col2Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    paddingRight: 10,
  },
  cardRow1Col2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRow2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardRow2Col2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default TransactionDetailsCard;
