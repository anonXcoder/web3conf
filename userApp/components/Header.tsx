import type {Node} from 'react';
import {StyleSheet, Text, View, Button, Linking} from 'react-native';
import TwitterSvg from './../assets/images/twitterIcon.svg';
import TelegramSvg from './../assets/images/telegram.svg';
import ShortP2pxSvg from './../assets/images/shortlogop2px.svg';

function Header(): Node {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <ShortP2pxSvg />
        <Text style={styles.heading}>P2PX</Text>
      </View>
      <View style={styles.socialHandles}>
        <TwitterSvg
          onPress={() => Linking.openURL('https://twitter.com/P2PX_finance')}
        />
        <TelegramSvg
          onPress={() => Linking.openURL('https://t.me/+agxDoLQAsfc3NDI1')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'Satoshi-Black',
    color: '#ffffff',
    letterSpacing: 1,
    fontSize: 24,
  },
  subHeading: {
    fontFamily: 'Satoshi-Regular',
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.5,
    paddingTop: 5,
  },
  socialHandles: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
  },

  logo: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
});

export default Header;
