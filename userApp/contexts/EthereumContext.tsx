import {createContext, useState, useEffect} from 'react';
import {ethers} from 'ethers';
import * as Keychain from 'react-native-keychain';
import GLOBALS from '../Globals';

export const EthereumContext = createContext();

export const EthereumProvider = ({children}) => {
  const [provider, setProvider] = useState(null);
  const [wallet, setWallet] = useState(null);

  console.log('EthereumProvider rendered');
  useEffect(() => {
    console.log('EthereumProvider use effect called');
    const tempProvider = new ethers.providers.JsonRpcProvider(GLOBALS.RPC_URL);
    console.log("tempProvider - ", tempProvider);

    Keychain.getGenericPassword().then(credentials => {
      let tempWallet;
      if (credentials) {
        // If wallet credentials already exist, use them
        const privateKey = credentials.password;
        tempWallet = new ethers.Wallet(privateKey, tempProvider);
      } else {
        // If no wallet credentials exist, create a new wallet
        tempWallet = ethers.Wallet.createRandom().connect(tempProvider);
        Keychain.setGenericPassword('wallet', tempWallet.privateKey);
      }
      setWallet(tempWallet);
    });

    setProvider(tempProvider);
  }, []);

  return (
    <EthereumContext.Provider value={{provider, wallet}}>
      {children}
    </EthereumContext.Provider>
  );
};
