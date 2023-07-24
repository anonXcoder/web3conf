import {useState, useEffect} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ethers} from 'ethers';
import CustomKeyboard from './CustomKeyboard';
import CONFIG_ARTIFACT from '../abis/P2pxConfig.json';
import GLOBALS from '../Globals';
import {useContract, useContractRead} from '../contexts/ContractHooks';
import USDT_Primary from './../assets/images/usdt_primary.svg';
import Rupee_Primary from './../assets/images/rupee_primary.svg';
import USDT_Secondary from './../assets/images/usdt_secondary.svg';
import Inr from './../assets/images/inr.svg';
import Back_Button from './../assets/images/Back_Button.svg';
import Close_Button from './../assets/images/Close_Button.svg';
import CurrencyX from './../assets/images/CurrencyX';
import Info from './../assets/images/Info.svg';

function ConfirmBuyOrder({navigation}): Node {
  console.log('ConfirmBuyOrder rendered');

  const [usdtAmount, setUsdtAmount] = useState('');
  const [inrAmount, setInrAmount] = useState('');
  const [selectedDenom, setSelectedDenom] = useState('usdt');
  const [price, setPrice] = useState('');
  const [gradientColors, setGradientColors] = useState([
    '#10201c',
    '#11211c',
    '#121a18',
    '#000000',
    '#000000',
  ]);
  const [pageValid, setPageValid] = useState(false);
  const [disabledStyle, setDisabledStyle] = useState<StyleProp<ViewStyle>>();

  const contract = useContract(GLOBALS.CONFIG_CONTRACT, CONFIG_ARTIFACT.abi);
  const {
    data: buyPrice,
    isLoading: isLoading1,
    error: error1,
  } = useContractRead(contract, 'buyINRPrice');
  const {
    data: txLimit,
    isLoading: isTxLimitLoading,
    error: error2,
  } = useContractRead(contract, 'limitPerTxn');

  useEffect(() => {
    if (txLimit) {
      setUsdtAmount(
        Number(ethers.utils.formatUnits(txLimit.toString(), 6)).toLocaleString(
          'en-US',
        ),
      );
    }
  }, [txLimit]);

  useEffect(() => {
    if (usdtAmount && buyPrice) {
      const priceFromContract = ethers.utils.formatUnits(
        buyPrice.toString(),
        6,
      );
      setPrice(priceFromContract);
      setInrAmount(
        Number(
          (
            Number(usdtAmount.split(',').join('')) * Number(priceFromContract)
          ).toFixed(2),
        ).toLocaleString('en-US'),
      );
    }
  }, [usdtAmount, buyPrice]);

  useEffect(() => {
    usdtAmt = Number(usdtAmount.split(',').join(''));
    if (txLimit && usdtAmt > 0) {
      if (
        usdtAmt <=
        Number(ethers.utils.formatUnits(txLimit.toString(), 6)).toString()
      ) {
        setGradientColors([
          '#10201c',
          '#11211c',
          '#121a18',
          '#000000',
          '#000000',
        ]);
        setPageValid(true);
        setDisabledStyle({opacity: 1});
      } else {
        setGradientColors([
          '#3f1f1f',
          '#3e2a2a',
          '#3b1414',
          '#000000',
          '#000000',
        ]);
        setPageValid(false);

        setDisabledStyle({opacity: 0.5});
      }
    }
  }, [Number(usdtAmount.split(',').join(''))]);

  const switchCurrency = () => {
    if (selectedDenom == 'inr') {
      setSelectedDenom('usdt');
    } else {
      setSelectedDenom('inr');
    }
  };

  const onChangeAmount = text => {
    if (text != '.' && text.match(/[^$,.\d]/)) {
      // we don't want non-numerical values here
      return;
    }

    if (selectedDenom == 'inr') {
      const inr = inrAmount ? inrAmount + text : text;
      if (text == '.') {
        setInrAmount(inr);
      } else {
        updatePriceByInr(inr);
      }
    } else {
      const usdt = usdtAmount ? usdtAmount + text : text;
      if (text == '.') {
        setUsdtAmount(usdt);
      } else {
        updatePriceByUsdt(usdt);
      }
    }
  };

  const onClearAmount = () => {
    if (selectedDenom == 'inr') {
      if (inrAmount != '') {
        const inr = inrAmount.slice(0, -1);
        updatePriceByInr(inr);
      }
    } else {
      if (usdtAmount != '') {
        const usdt = usdtAmount.slice(0, -1);
        updatePriceByUsdt(usdt);
      }
    }
  };

  const updatePriceByInr = inr => {
    let rawAmount = inr.split(',').join('');
    setInrAmount(Number(rawAmount).toLocaleString('en-IN'));
    setUsdtAmount(
      Number((Number(rawAmount) / Number(price)).toFixed(2)).toLocaleString(
        'en-US',
      ),
    );
  };

  const updatePriceByUsdt = usdt => {
    let rawAmount = usdt.split(',').join('');
    setUsdtAmount(Number(rawAmount).toLocaleString('en-US'));
    setInrAmount(
      Number((Number(rawAmount) * Number(price)).toFixed(2)).toLocaleString(
        'en-IN',
      ),
    );
  };
  const handleButtonPress = () => {
    if (isLoading1 || isTxLimitLoading) {
      return;
    }
    if (usdtAmount > 0 && !isLoading1 && !isTxLimitLoading) {
      navigation.navigate('PlaceBuyOrder', {
        inrAmount: inrAmount,
        usdtAmount: usdtAmount,
      });
    } else {
      ToastAndroid.showWithGravity(
        'Please enter valid amount',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
  };
  return (
    <SafeAreaView style={styles.body}>
      <LinearGradient
        colors={gradientColors}
        start={{x: 0.8, y: 0}}
        end={{x: 0.2, y: 1}}
        style={styles.linearGradient}>
        <View style={styles.row1}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Back_Button />
          </TouchableOpacity>
          <Text style={styles.row1Text}>Buy USDT</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.popToTop()}>
            <Close_Button />
          </TouchableOpacity>
        </View>
        <View style={styles.row2}>
          <View style={styles.row2row1}>
            {selectedDenom == 'inr' ? <Rupee_Primary /> : <USDT_Primary />}
            <TextInput
              style={styles.inrInput}
              keyboardType="numeric"
              value={selectedDenom == 'inr' ? inrAmount : usdtAmount}
              onChangeText={onChangeAmount}
              editable={false}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row2row2}
            onPress={switchCurrency}>
            {selectedDenom == 'usdt' ? <Inr /> : <USDT_Secondary />}
            <Text style={styles.row2row2Text}>
              {selectedDenom == 'usdt' ? inrAmount : usdtAmount}
            </Text>
            <CurrencyX onPress={switchCurrency} />
          </TouchableOpacity>
        </View>
        <View style={styles.row3}>
          <Text style={styles.row3Text1}>
            You are buying{' '}
            <Text style={styles.row3Text2}>{usdtAmount} USDT</Text> for{' '}
            {inrAmount} rupees. Your max transaction limit is 100 USDT.
          </Text>
        </View>
        <CustomKeyboard onChange={onChangeAmount} onClear={onClearAmount} />
        <View style={styles.row4}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.continueBtn, disabledStyle]}
            onPress={handleButtonPress}
            disabled={!pageValid}>
            {isLoading1 && isTxLimitLoading ? (
              <Text style={styles.continueText}>Loading...</Text>
            ) : (
              <Text style={styles.continueText}>Continue</Text>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row1Text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  row2: {
    flex: 1,
    justifyContent: 'center',
  },
  row2row1: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row2row2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inrInput: {
    fontFamily: 'Satoshi-Bold',
    height: 70,
    fontSize: 40,
    color: '#FFFFFF',
  },
  row2row2Text: {
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
    color: '#6E6E6E',
    paddingLeft: 10,
    paddingRight: 10,
  },
  row3: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  row3Text1: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    fontWeight: 500,
    color: '#848484',
    textAlign: 'center',
  },
  row3Text2: {
    color: '#00A478',
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
  },
  row4: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtn: {
    borderRadius: 12,
    backgroundColor: '#01C38E',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
  },
  continueText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#1E1E1E',
  },
});

export default ConfirmBuyOrder;
