import type {Node} from 'react';
import {useState, useEffect} from 'react';

import {StyleSheet, Text, View, Image, ActivityIndicator} from 'react-native';
import Logo from './../assets/images/logo.svg';
function NoOrders(props): Node {
  const [loadingLength, setLoadingLength] = useState(0);
  useEffect(() => {
    console.log('loadingLength:::', loadingLength);
    setLoadingLength(loadingLength + 1);
  }, [props.isLoading]);
  return (
    <View style={styles.section}>
      <View style={styles.row1}>
        <Logo />
      </View>
      {loadingLength < 2 && !props.settingUp ? (
        <View style={styles.backdrop}>
          <ActivityIndicator size="large" color="#01C38E" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        ''
      )}

      <View style={styles.row2}>
        <Text style={styles.row2Row1}>P2PX IS A</Text>
        <Text style={styles.row2Row2}>
          Decentralised Peer to Peer Exchange.
        </Text>
        <Text style={styles.row2Row3}>
          Non Custodial, Fully Decentralised - Crypto to Fiat On-Ramps and
          Off-Ramps.
        </Text>
      </View>
      <View style={styles.row3}>
        <Text style={styles.row3Title}>BENEFITS OF THIS APP</Text>
        <View style={styles.row3Card}>
          <View style={styles.row3CardCol}>
            <View style={styles.row3CardNum}>
              <Text style={styles.row3CardNumText}>1</Text>
            </View>
          </View>
          <View style={styles.row3CardCol}>
            <Text style={styles.row3CardText1}>Fully Decentralised</Text>
            <Text style={styles.row3CardText2}>
              P2PX is built with smart contracts that are governed by the P2PX
              DAO.
            </Text>
          </View>
        </View>
        <View style={styles.row3Card}>
          <View style={styles.row3CardCol}>
            <View style={styles.row3CardNum}>
              <Text style={styles.row3CardNumText}>2</Text>
            </View>
          </View>
          <View style={styles.row3CardCol}>
            <Text style={styles.row3CardText1}>Blazing Fast P2P</Text>
            <Text style={styles.row3CardText2}>
              Liquidity on P2PX is facilitated by active peers located around
              the world.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    display: 'flex',
    flex: 1,
  },
  row1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flex: 0.4,
    marginLeft: -3,
  },
  row2: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    // marginTop: 30,
    // mnarginBottom: 30,
    flex: 0.8,
  },
  row2Row1: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    lineHeight: 16,
    fontSize: 12,
  },
  row2Row2: {
    fontFamily: 'Satoshi-Black',
    color: '#ffffff',
    lineHeight: 32,
    fontSize: 24,
  },
  row2Row3: {
    fontFamily: 'Satoshi-Regular',
    color: '#ffffff',
    fontWeight: 400,
    lineHeight: 19,
    fontSize: 14,
    opacity: 0.5,
    marginTop: 10,
  },
  row3: {
    fontFamily: 'Satoshi-Regular',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  row3Title: {
    fontFamily: 'Satoshi-Bold',
    letterSpacing: 2,
    color: '#ffffff',
  },
  row3Card: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#181818',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  row3CardCol: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 10,
    flexWrap: 'nowrap',
  },
  row3CardNum: {
    borderRadius: 50,
    width: 40,
    height: 40,
    marginLeft: -5,
    backgroundColor: '#343434',
    justifyContent: 'center',
  },
  row3CardNumText: {
    fontFamily: 'Satoshi-Medium',
    color: '#666666',
    textAlign: 'center',
    fontSize: 21,
  },
  row3CardText1: {
    fontFamily: 'Satoshi-Bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  row3CardText2: {
    fontFamily: 'Satoshi-Medium',

    color: '#666666',
    marginRight: 10,
  },

  backdrop: {
    position: 'absolute',
    // display:"flex",
    // gap:4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
  },
  loadingText: {
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 1,
    marginTop: 5,
    marginBottom: 15,

    color: '#ffffff',
  },
});

export default NoOrders;
