import {
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {ethers} from 'ethers';
import {EthereumContext} from './EthereumContext'; // import your Ethereum context here

export const useContract = (address, abi) => {
  const {provider, wallet} = useContext(EthereumContext);

  const contract = useMemo(() => {
    if (!provider || !wallet || !abi || !address) return null;
    try {
      return new ethers.Contract(address, abi, provider).connect(wallet);
    } catch (err) {
      console.error('Failed to create contract object:', err);
      return null;
    }
  }, [wallet?.address, abi, address]);

  return contract;
};

export const useContractRead = (
  contract,
  functionName,
  args = [],
  polling = false,
) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  let intervalId;

  useEffect(() => {
    const callFunction = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await contract[functionName](...args);
        console.log("returning result", result);
        setData(result);
      } catch (err) {
        console.log("returning err", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (contract && functionName) {
      if (polling) {
        // Start the polling
        intervalId = setInterval(callFunction, 5000); // Poll every 5 seconds
      } else {
        callFunction();
      }
    }

    return () => clearInterval(intervalId);
  }, [JSON.stringify(args)]);

  return {data, isLoading, error};
};

export const useContractWrite = (contract, functionName) => {
  const {provider, wallet} = useContext(EthereumContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutateAsync = useCallback(async args => {
    if (!wallet?.address) return;
    setIsLoading(true);
    setError(null);
    let receipt;
    try {
      const gasLimit = await contract.estimateGas[functionName](...args, { from: wallet.address });
      // Add a buffer to the estimated gas limit
      const gasLimitWithBuffer = gasLimit.add(gasLimit.div(3));
      console.log(gasLimitWithBuffer.toString());
      const gasPrice = ethers.utils.parseUnits('300', 'gwei');  // Set gas price as needed
      console.log(gasPrice.toString());
      const overrides = {
        gasLimit: gasLimitWithBuffer,
        gasPrice: gasPrice,
      };
      // console.log("Invoking contract");
      const tx = await contract[functionName](...args, overrides);
      console.log("check tx data", tx);
      receipt = await tx.wait();
      console.log("check receipt data", receipt);
    } catch (err) {
      console.log("Error while invoking contract", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
    return receipt;
  }, [wallet?.address]);

  return {mutateAsync, isLoading, error};
};
