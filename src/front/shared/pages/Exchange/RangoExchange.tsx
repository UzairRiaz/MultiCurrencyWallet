import { BestRouteResponse, CosmosTransaction, EvmTransaction, RangoClient, TransactionStatus } from 'rango-sdk'
import React, { useState } from 'react'
import config from 'app-config'
import { useForm, Controller } from 'react-hook-form'
import Arrow from 'pages/Exchange/images/arrow-down.svg'
import Select from 'react-select'
import CSSModules from 'react-css-modules'
import store from 'redux/store'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'
import { TransactionRequest } from '@ethersproject/providers'
import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { getState } from 'redux/core'
import providers from 'common/web3connect/providers'
import kasaHttpClient from 'helpers/kasaHttpClient'
import { executeCosmosTransaction } from 'helpers/rangoKeplr'
import styles from './index.scss'

import ThumbUp from './images/thumb-up.svg'
import GreenTick from './images/green-tick.svg'
import RangoReload from './images/rango-reload.svg'
import RangoDoc from './images/rango-doc.svg'
import RangoSetting from './images/rango-setting.svg'
import RangoConnect from './images/rango-connect.svg'
import fixedIcon1 from './images/rango-fixed-icon-1.svg'
import fixedIcon2 from './images/rango-fixed-icon-2.svg'
import RangoSearch from './images/rango-search-icon.svg'
import RangoBack from './images/rango-back-icon.svg'
import RangoArrowRight from './images/rango-arrow-right.svg'
import ConnectWalletIcon from './images/rango-connect-wallet.svg'
import Cross from './images/cross.svg'
import MetaMask from './images/meta-mask.svg'
import ConnectWallet from './images/wallet-connect.svg'
import web3 from '../../../config/mainnet/web3'

export function RangoExchange(props) {

  const { history } = props
  const rangoClient = new RangoClient(config.kaxa.rango.apiKey)
  const { user } = store.getState()

  const rangoMetadataInit: any = {}
  const [rangoMetadata, setRangoMetadata] = React.useState(rangoMetadataInit)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const getMetadata = async () => {
    const key = 'rango_metadata'
    const cachedData = localStorage.getItem(key)

    if (!cachedData) {
      // no cached
      return fetchMetadata()
    }

    const cachedTime: any = localStorage.getItem(`${key}_time`)

    if (!cachedTime) {
      // no cached
      return fetchMetadata()
    }

    const currentTime = new Date().getTime()
    const hourInMillis = 60 * 60 * 1000
    const diff = currentTime - cachedTime
    if (diff > hourInMillis) {
      // If the cached data is older than 1 hour
      return fetchMetadata()
    }

    // If the cached data is newer than 1 hour, return the data

    const rs = (JSON.parse(cachedData))
    setRangoMetadata(rs)
    return rs
  }

  const fetchMetadata = async () => {
    const meta = await rangoClient.getAllMetadata()
    localStorage.setItem('rango_metadata', JSON.stringify(meta))
    localStorage.setItem('rango_metadata_time', `${(new Date()).getTime()}`)
    setRangoMetadata(meta)
    return meta
  }

  React.useEffect(() => {

    const defaultSellCurrencyDetail = getDefaultSellCurrencyDetailFromQueryString()
    setBlockChainSellSelected(defaultSellCurrencyDetail.blockchain)
    setTokenSellSelected(defaultSellCurrencyDetail.token)
    getMetadata().then((res) => console.log(res))
    if (sellTokenAvailableBalance === '') {
      const defaultTokenSellSymbol = defaultSellCurrencyDetail.token.symbol === 'KAX' ? 'KAXAA' : defaultSellCurrencyDetail.token.symbol
      const defaultBalance = actions.core.getWallet({ currency: defaultTokenSellSymbol }).balance
      setSellTokenAvailableBalance(defaultBalance)
    }
    const jsonRpcProvider = new ethers.JsonRpcProvider(web3.matic_provider)
    const wallet = new ethers.Wallet(getState().user.maticData.privateKey, jsonRpcProvider)
    setKaxaaWallet(wallet)
  }, [])

  const [SelectBlockchain, setSelectBlockchain] = React.useState(false)
  const [SelectToken, setSelectToken] = React.useState(false)
  const [RangoTransitionHistory, setRangoTransitionHistory] = React.useState(false)
  const [RangoSettings, setRangoSettings] = React.useState(false)
  const [RangoLiquiditySources, setRangoLiquiditySources] = React.useState(false)
  const kaxaaWalletInit: any = {}
  const [kaxaaWallet, setKaxaaWallet] = React.useState(kaxaaWalletInit)
  const [swapStarted, setSwapStarted] = React.useState(false)
  const [swapInprogressStep, setSwapInprogressStep] = React.useState(0)

  const defaultBlockchainSell = {
    logo: 'https://api.rango.exchange/blockchains/polygon.svg',
    name: 'POLYGON',
    displayName: 'Polygon',
    type: 'EVM',
  }

  const defaultTokenSell:{
image: string,
symbol: string,
address: string | null,
  } = {
    image: 'https://api.rango.exchange/tokens/POLYGON/KAX.png',
    symbol: 'KAX',
    address: '0x42af7aac6ae6425ffa96370cfd0b12522aa4b458',
  }

  const defaultBlockchainBuy = {
    logo: 'https://api.rango.exchange/blockchains/avax_cchain.svg',
    name: 'AVAX_CCHAIN',
    displayName: 'Avalanche',
    type: 'EVM',
  }

  const defaultTokenBuy = {
    image: 'https://api.rango.exchange/i/kX4edQ',
    symbol: 'AVAX',
    address: null,
  }

  // state: SelectSwapPair, ShowRoute
  const [widgetState, setWidgetState] = React.useState('SelectSwapPair')

  const [blockChainSearchKeyword, setBlockChainSearchKeyword] = React.useState('')
  const [tokenSearchKeyword, setTokenSearchKeyword] = React.useState('')
  const [amount, setAmount] = React.useState(0.0)
  const [blockChainSelectionContext, setBlockChainSelectionContext] = React.useState('sell')
  const [blockChainSellSelected, setBlockChainSellSelected] = React.useState(defaultBlockchainSell)
  const [blockChainBuySelected, setBlockChainBuySelected] = React.useState(defaultBlockchainBuy)
  const [tokenSelectionContext, setTokenSelectionContext] = React.useState('sell')
  const [tokenSellSelected, setTokenSellSelected] = React.useState(defaultTokenSell)
  const [tokenBuySelected, setTokenBuySelected] = React.useState(defaultTokenBuy)

  const initBestRoute: any = {}
  const [bestRoute, setBestRoute] = React.useState(initBestRoute)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [apiCallInProgress, setApiCallInProgress] = React.useState(false)
  const [actionButtonLabel, setActionButtonLabel] = React.useState('Find Route')
  const [externalWalletAddress, setExternalWalletAddress] = React.useState('')

  const [sellTokenAvailableBalance, setSellTokenAvailableBalance] = React.useState('')

  const [walletConnectProviders, setWalletConnectProviders] = React.useState({})
  const [browserWalletProviders, setBrowserWalletProviders] = React.useState({})
  const [connectedWalletSigners, setConnectedWalletSigners] = React.useState({})
  const [connectedWalletAddresses, setConnectedWalletAddresses] = React.useState({})
  const [requiredWalletFlag, setRequiredWalletFlag] = React.useState(true)
  const [metaMaskConnected, setMetaMaskConnected] = React.useState(false)
  const [slippage, setSlippage] = React.useState('1')

  const selectBlockChain = (blockChain) => {

    if (blockChainSelectionContext === 'sell') {
      setBlockChainSellSelected(blockChain)
      setTokenSellSelected({
        image: '',
        symbol: 'Select Token',
        address: null,
      })
    } else {
      setBlockChainBuySelected(blockChain)
      setTokenBuySelected({
        image: '',
        symbol: 'Select Token',
        address: null,
      })
    }

    setWidgetState('SelectSwapPair')
    setSelectBlockchain(false)
    setActionButtonLabel('Find Route')
  }

  function getDefaultSellCurrencyDetailFromQueryString() {
    const queryString = window.location.hash.slice(1)
    const currency = queryString.replace('/exchange?currency=', '')
    const polygonChain = {
      logo: 'https://api.rango.exchange/blockchains/polygon.svg',
      name: 'POLYGON',
      displayName: 'Polygon',
      type: 'EVM',
    }

    switch (currency.toLowerCase()) {
      case 'matic':
        return {
          blockchain: polygonChain,
          token: {
            image: 'https://api.rango.exchange/tokens/ETH/MATIC.png',
            symbol: 'MATIC',
            address: null,
            blockchain: 'POLYGON',
          },
        }
      case 'usdc':
        return {
          blockchain: polygonChain,
          token: {
            image: 'https://api.rango.exchange/tokens/POLYGON/USDC.png',
            symbol: 'USDC',
            address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
            blockchain: 'POLYGON',
          },
        }
      case 'kaxaa':
      default:
        return {
          blockchain: polygonChain,
          token: {
            image: 'https://api.rango.exchange/tokens/POLYGON/KAX.png',
            symbol: 'KAX',
            address: '0x42af7aac6ae6425ffa96370cfd0b12522aa4b458',
            blockchain: 'POLYGON',
          },
        }
    }
  }

  const selectToken = (token) => {
    if (tokenSelectionContext === 'sell') {
      setTokenSellSelected(token)
      let wallet
      if (token.symbol === 'KAX') {
        wallet = actions.core.getWallet({ currency: 'KAXAA' })
      } else {
        wallet =  actions.core.getWallet({ currency: token.symbol })
      }
      setSellTokenAvailableBalance(wallet.balance)
    } else {
      setTokenBuySelected(token)
    }
    setSelectToken(false)
    setWidgetState('SelectSwapPair')
    setActionButtonLabel('Find Route')
  }

  const actionButtonHandler = () => {
    if (apiCallInProgress) {
      return
    }
    if (widgetState === 'SelectSwapPair') {
      findRoute()
    } else if (widgetState === 'ShowRoute') {
      gotoConfirm()
    } else if (widgetState === 'ConfirmSwap') {
      swap()
    }
  }

  const gotoConfirm = () => {
    setWidgetState('ConfirmSwap')
    setActionButtonLabel('Confirm')
  }

  const logTransactionStart = async (routeResponse: BestRouteResponse|undefined) => {

    if (!routeResponse?.result?.swaps) {
      return new Promise<boolean>((resolve, reject) => {
        resolve(false)
      })
    }

    await kasaHttpClient.post('/rango-swap/start', {
      swapResponse: routeResponse,
      requestId: routeResponse.requestId,
    })

    return true
  }

  const logTransactionExecution = async (requestId: string, attributes: any) => {
    await kasaHttpClient.post('/rango-swap/update', {
      requestId,
      ...attributes,
    })
  }
  const swap = async () => {
    if (apiCallInProgress) {
      return
    }
    setApiCallInProgress(true)
    setActionButtonLabel('Confirming Route...')
    const routeResponse = await finalBestRoute()
    await logTransactionStart(routeResponse)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (routeResponse.result?.swaps) {

      setActionButtonLabel('Swaping...')
      setSwapStarted(true)

      let isSuccess = false
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-restricted-syntax
      for (const swap1 of routeResponse.result.swaps) {

        const index = routeResponse?.result?.swaps.indexOf(swap1) ?? 0
        setSwapInprogressStep(index + 1)
        // eslint-disable-next-line no-await-in-loop,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        isSuccess =  await executeTransaction(index + 1, routeResponse)

        if (!isSuccess) {
          break
        }
      }

      setApiCallInProgress(false)
      setActionButtonLabel('Find Route')
      setWidgetState('SelectSwapPair')
      setSwapInprogressStep(0)
      setSwapStarted(false)
      if (isSuccess) {
        setErrorMessage('Successfully Swapped')
        if (routeResponse) {
          logTransactionExecution(routeResponse?.requestId, {
            isCompleted: true,
            // eslint-disable-next-line no-unsafe-optional-chaining
            currentStep: routeResponse?.result?.swaps?.length + 1, // just adding one to show completed
          })
        }

      }

    }
  }

  const executeTransaction = async (step, routeResponse) => {
    logTransactionExecution(routeResponse?.requestId, {
      currentSwap: step,
    })
    const provider = actions.matic.getCurrentWeb3()

    // In multi step swaps, you should loop over routeResponse.route array and create transaction per each item

    let evmTransaction
    let cosmosTransaction
    try {
      // A transaction might needs multiple approval txs (e.g. in harmony bridge),
      // you should create transaction and check approval again and again until `isApprovalTx` field turns to false
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const transactionResponse = await rangoClient.createTransaction({
          requestId: routeResponse.requestId,
          step,
          userSettings: { slippage },
          validations: { balance: true, fee: true },
        })

        console.log('Transaction response: ', transactionResponse, 'step: ', step)
        if (!transactionResponse.ok) {
          setErrorMessage(transactionResponse.error ?? 'Unknown error')
          logTransactionExecution(routeResponse?.requestId, {
            swapProgress: transactionResponse.error ?? 'Unknown error',
          })
          setWidgetState('SelectSwapPair')
          setActionButtonLabel('Find Route')
          return
        }

        // in general case, you should check transaction type and call related provider to sign and send tx
        if (transactionResponse.transaction?.type === 'COSMOS') {
          cosmosTransaction = transactionResponse.transaction as CosmosTransaction

          // eslint-disable-next-line no-await-in-loop
          const txHash = await executeCosmosTransaction(cosmosTransaction)
          // eslint-disable-next-line no-await-in-loop
          const txStatus = await checkTransactionStatusSync(txHash, routeResponse, rangoClient)
          console.log('transaction finished', { txStatus })
          return
        }

        evmTransaction = transactionResponse.transaction as EvmTransaction
        if (evmTransaction.isApprovalTx) {
          const finalTx = prepareEvmTransaction(evmTransaction)
          console.log(finalTx)
          if (evmTransaction.blockChain === 'POLYGON') {

            // eslint-disable-next-line no-await-in-loop
            const nonce = (await  getTransactionCount()) + 1
            // eslint-disable-next-line no-await-in-loop
            const finalGas = await provider.eth.estimateGas(finalTx) * 10
            console.log('finalGas', finalGas)
            const txData: any = { ...finalTx }
            console.log('txData1', txData)

            // eslint-disable-next-line no-await-in-loop
            // const signedTx =  await provider.eth.accounts.signTransaction(txData, getState().user.maticData.privateKey)
            // // eslint-disable-next-line no-await-in-loop
            // await provider.eth.sendSignedTransaction(signedTx.rawTransaction)
            // eslint-disable-next-line no-await-in-loop
            await provider.eth.sendTransaction(txData)

          } else {

            console.log('not polygon transaction', evmTransaction.blockChain)
            console.log(connectedWalletSigners[evmTransaction.blockChain])

            console.log('starting transaction from connected wallet', finalTx)
            // eslint-disable-next-line no-await-in-loop
            const resTx = await connectedWalletSigners[evmTransaction.blockChain].sendTransaction(finalTx)
            console.log('i dont know what happening here', resTx)
          }

          // eslint-disable-next-line no-await-in-loop
          await checkApprovalSync(routeResponse, rangoClient)
          console.log('transaction approved successfully')
        } else {
          break
        }
      }

      const finalTx = prepareEvmTransaction(evmTransaction)

      let sendTransactionResponse :any = null
      let txHash: string | null =  null
      if (evmTransaction.blockChain === 'POLYGON') {
        // eslint-disable-next-line no-await-in-loop
        const nonce = (await  getTransactionCount()) + 1
        // eslint-disable-next-line no-await-in-loop
        const finalGas = await provider.eth.estimateGas(finalTx) * 10
        //   console.log('finalGas', finalGas)
        const txData: any = { ...finalTx }
        // console.log('txData2', txData)
        // // eslint-disable-next-line no-await-in-loop
        // const signedTx =  await provider.eth.accounts.signTransaction(txData, getState().user.maticData.privateKey)
        // // eslint-disable-next-line no-await-in-loop
        // const sendTransactionResponse = await provider.eth.sendSignedTransaction(signedTx.rawTransaction)

        const sendTransactionResponse = await provider.eth.sendTransaction(txData)
        console.log('send Transaction response', sendTransactionResponse)
        txHash = sendTransactionResponse.transactionHash
      } else {
        console.log('not polygon transaction', evmTransaction.blockChain)
        console.log(connectedWalletSigners[evmTransaction.blockChain])
        sendTransactionResponse = await connectedWalletSigners[evmTransaction.blockChain].sendTransaction(finalTx)
        console.log('send Transaction response', sendTransactionResponse)
        txHash = sendTransactionResponse.hash
      }

      if (!txHash) {
        throw new Error('Transaction hash is empty')
      }

      console.log('transaction hash', txHash)
      const txStatus = await checkTransactionStatusSync(
        txHash,
        routeResponse,
        rangoClient,
        step,
      )
      console.log('transaction finished', { txStatus })
      return true

    } catch (e) {

      console.error('transaction failed', e)
      const rawMessage = `${JSON.stringify(e).substring(0, 90)}...`
      setErrorMessage(e.message)
      console.log(e)
      // setBestRoute({})
      setWidgetState('SelectSwapPair')
      setApiCallInProgress(false)
      setActionButtonLabel('Find Route')
      // report transaction failure to server if something went wrong in client for signing and sending the transaction
      await rangoClient.reportFailure({
        data: { message: rawMessage },
        eventType: 'TX_FAIL',
        requestId: routeResponse.requestId,
      })

      return false
    }
  }

  const getTransactionCount =  () => {
    const provider = actions.matic.getCurrentWeb3()
    return  provider.eth.getTransactionCount(getState().user.maticData.address)
  }

  const finalBestRoute = async () => {

    const connectedWallets = [
      { blockchain: 'POLYGON', addresses: [user.maticData.address] },
    ]

    walletConnectsRequired(bestRoute).forEach((blockchainName) => {
      connectedWallets.push({
        blockchain: blockchainName,
        addresses: [ connectedWalletAddresses[blockchainName] ],
      })
    })

    const selectedWallets = {
      'POLYGON': user.maticData.address,
    }

    walletConnectsRequired(bestRoute).forEach((blockchainName) => {
      selectedWallets[blockchainName] = connectedWalletAddresses[blockchainName]
    })

    // eslint-disable-next-line no-prototype-builtins
    if (!selectedWallets.hasOwnProperty(blockChainBuySelected.name)) {
      selectedWallets[blockChainBuySelected.name] = externalWalletAddress
    }

    const result = await rangoClient.getBestRoute({
      amount: amount.toString(),
      from: { 'blockchain': blockChainSellSelected.name, 'symbol': tokenSellSelected.symbol, 'address': tokenSellSelected.address },
      to: { 'blockchain': blockChainBuySelected.name, 'symbol': tokenBuySelected.symbol, 'address': tokenBuySelected.address },
      checkPrerequisites: true,
      connectedWallets,
      selectedWallets,
      swapperGroups: ['stargate'],
      swappersGroupsExclude: true,
    })

    if (result.diagnosisMessages && result.diagnosisMessages?.length > 0) {
      setErrorMessage(result.diagnosisMessages.join(', '))
      setWidgetState('SelectSwapPair')
      setBestRoute({})
      return
    }
    console.log('best route', result)
    setBestRoute(result)
    return result
  }
  const findRoute = async () => {
    if (apiCallInProgress) {
      return
    }
    // some little validation here
    if (blockChainSellSelected.name === blockChainBuySelected.name && tokenSellSelected.symbol === tokenBuySelected.symbol) {
      alert('Same token')
      return
    }

    setApiCallInProgress(true)
    setActionButtonLabel('Finding Best Route...')

    const result = await rangoClient.getBestRoute({
      amount: amount.toString(),
      from: { 'blockchain': blockChainSellSelected.name, 'symbol': tokenSellSelected.symbol, 'address': tokenSellSelected.address },
      to: { 'blockchain': blockChainBuySelected.name, 'symbol': tokenBuySelected.symbol, 'address':  tokenBuySelected.address },
      checkPrerequisites: false,
      connectedWallets: [
      ],
      selectedWallets: {
      },
      swapperGroups: ['stargate'],
      swappersGroupsExclude: true,
    })
    setApiCallInProgress(false)

    if (result.diagnosisMessages && result.diagnosisMessages?.length > 0) {
      setErrorMessage(result.diagnosisMessages.join(', '))
      setBestRoute({})
      setWidgetState('SelectSwapPair')
      setActionButtonLabel('Find Route')
      return
    }

    if (result.missingBlockchains && result.missingBlockchains?.length > 1) {
      setErrorMessage(`Missing blockchains: ${result.missingBlockchains.join(', ')}`)
      setBestRoute({})
      setWidgetState('SelectSwapPair')
      setActionButtonLabel('Find Route')
      return
    }

    if (!result.result) {
      setErrorMessage(`Unknown error, please try again later`)
      setBestRoute({})
      setWidgetState('SelectSwapPair')
      setActionButtonLabel('Find Route')
      return
    }

    if (result.result) {
      setBestRoute(result)
      setErrorMessage('')
      setWidgetState('ShowRoute')
      setActionButtonLabel('SWAP')
    }

  }

  const initProviderForWalletConnect = async (blockchain) => {

    if (walletConnectProviders[blockchain]) {
      console.log('wallet connect provider already initialized', walletConnectProviders[blockchain])
      return
    }
    // Create a WalletConnectProvider instance
    const walletConnectProvider = new WalletConnectProvider({
      rpc: {
        43114: web3.avax_provider,
        137: web3.matic_provider,
      },
    })

    // Enable the provider

    await walletConnectProvider.disconnect()
    await walletConnectProvider.enable()
    browserWalletProviders[blockchain] = new ethers.BrowserProvider(walletConnectProvider)
    walletConnectProviders[blockchain] = walletConnectProvider

    console.log('browserWalletProviders', browserWalletProviders)
    setWalletConnectProviders(walletConnectProviders)
    setBrowserWalletProviders(browserWalletProviders)
  }

  const convertSecondsToDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const checkTransactionStatusSync = async (
    txHash: string,
    bestRoute: BestRouteResponse,
    rangoClient: RangoClient,
    step = 1,
  ) => {
    while (true) {
      console.log('checking txn status: ', txHash, 'step', step)
      // eslint-disable-next-line no-await-in-loop
      const txStatus = await rangoClient.checkStatus({
        requestId: bestRoute.requestId,
        step,
        txId: txHash,
      })

      console.log({ txStatus })
      if (
        !!txStatus.status
          && [TransactionStatus.FAILED, TransactionStatus.SUCCESS].includes(
            txStatus.status,
          )
      ) {
        // for some swappers (e.g. harmony bridge), it needs more than one transaction to be signed for one single step
        // swap. In these cases, you need to check txStatus.newTx and make sure it's null before going to the next step.
        // If it's not null, you need to use that to create next transaction of this step.
        return txStatus
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(3000)
    }
  }

  const prepareEvmTransaction = (evmTransaction: EvmTransaction): TransactionRequest => {
    const manipulatedTx = {
      ...evmTransaction,
      gasPrice: !!evmTransaction.gasPrice ? `0x${parseInt(evmTransaction.gasPrice, 10).toString(16)}` : null,
    }

    let tx = {}
    if (!!manipulatedTx.from) tx = { ...tx, from: manipulatedTx.from }
    if (!!manipulatedTx.to) tx = { ...tx, to: manipulatedTx.to }
    if (!!manipulatedTx.data) tx = { ...tx, data: manipulatedTx.data }
    if (!!manipulatedTx.value) tx = { ...tx, value: manipulatedTx.value }
    if (!!manipulatedTx.gasLimit) tx = { ...tx, gasLimit: manipulatedTx.gasLimit }
    if (!!manipulatedTx.gasPrice) tx = { ...tx, gasPrice: manipulatedTx.gasPrice }
    if (!!manipulatedTx.maxPriorityFeePerGas) tx = { ...tx, maxPriorityFeePerGas: manipulatedTx.maxPriorityFeePerGas }
    if (!!manipulatedTx.maxFeePerGas) tx = { ...tx, maxFeePerGas: manipulatedTx.maxFeePerGas }

    return tx
  }

  // eslint-disable-next-line no-promise-executor-return
  const sleep = (millis: number) => new Promise((resolve) => setTimeout(resolve, millis))

  const  checkApprovalSync = async (bestRoute: BestRouteResponse, rangoClient: RangoClient) => {
    while (true) {
      console.log('checkApprovalSync')
      // eslint-disable-next-line no-await-in-loop
      const approvalResponse = await rangoClient.checkApproval(bestRoute.requestId)
      if (approvalResponse.isApproved) {
        return true
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(3000)
    }
  }

  const renderBlockChainSelection = () => {
    const alreadySelected = blockChainSelectionContext === 'sell' ? blockChainSellSelected.name : blockChainBuySelected.name
    return rangoMetadata.blockchains
      .filter(el => el.enabled)
      .filter(el => blockChainSelectionContext !== 'sell' && ['EVM', 'COSMOS'].includes(el.type))
      .filter(el => {
        if (blockChainSearchKeyword === '') {
          return true
        }
        return  el.displayName.toUpperCase().startsWith(blockChainSearchKeyword.toUpperCase())
      })
      .map((blockchain, index) => (
        <button
          onClick={() => {
            selectBlockChain(blockchain)
          }}
          className={`rango-option--item ${blockchain.name === alreadySelected && 'active'} `}
          key={index}>
          <img alt={blockchain.name} src={blockchain.logo} />
          <div className="text">{blockchain.displayName}</div>
        </button>
      ))
  }

  const walletConnectsRequired =  (bestRoute: BestRouteResponse): Array<string> => {
    if (!bestRoute.result?.swaps) return []

    return bestRoute.result?.swaps?.map(swap => swap.from.blockchain).filter(blockchain => blockchain !== 'POLYGON')
      .reduce((accumulator: string[], value: string) => {
        if (!accumulator.includes(value)) {
          accumulator.push(value)
        }
        return accumulator
      }, [])
  }

  const isChainEvm = (chain: string): boolean => rangoMetadata.blockchains.find(el => el.name === chain)?.type === 'EVM'

  const shouldShowExternalWalletCustomAddress = (bestRoute: BestRouteResponse): boolean => {
    if (!bestRoute.result?.swaps) return false

    return bestRoute.result.swaps[bestRoute.result.swaps.length - 1].to.blockchain !== bestRoute.result.swaps[bestRoute.result.swaps.length - 1].from.blockchain
  }

  return (
    <>
      <div className="kaxaa-balance--convert-info rangoo-contact-support-message">
        <div>
          If you encounter any problems while swapping your crypto, you can
          {' '}
          <a href="#">Contact</a>
          {' '}
          our support team.
        </div>
      </div>
      <br />
      <br />

      <div className={'rango-min-amount-disclaimer'}>
        <strong>DISCLAIMER</strong>: Users must adjust swap amount to meet DEX minimum requirements. The amount varies based on token and DEX used.
      </div>
      <div className="rango-ui d-flex flex-column justify-between">
        <div className="d-flex flex-column rango-flex--between h-100 flex-1">
          <div>
            <div className="rango-flex rango-flex--between">
              <div />
            </div>
            {/* rango-header-start */}
            <div className="rango-flex rango-flex--between">
              <div className="rango-title">SWAP</div>
              <div className="rango-flex">
                <div
                  onClick={() => {
                    history.push(`/rango/transactions`)
                  }}
                  className="rango-icon">
                  <img src={RangoReload} alt="" />
                </div>
                <div className="rango-icon" onClick={() => setRangoTransitionHistory(true)}>
                  <img src={RangoDoc} alt="" />
                </div>
                <div className="rango-icon" onClick={() => setRangoSettings(true)}>
                  <img src={RangoSetting} alt="" />
                </div>
              </div>
            </div>
            {/* rango-header-end */}

            {/* rango-sell-start */}
            <div className="rango-you--sell">
              <div className="rango-flex rango-flex--between">
                <div>You sell</div>
                <div className="rango-sell-balance">
                  Balance:
                  {' '}
                  {sellTokenAvailableBalance}
                  {' '}
                  {tokenSellSelected.symbol}
                </div>
              </div>
              <div className="rango-filter--group">
                <div className="rango-select--item rango-select--blockchain-sell">
                  <div className="rango-select--icon">
                    <img alt={blockChainSellSelected.name} src={blockChainSellSelected.logo} />
                  </div>
                  <div className="rango-select--option">{blockChainSellSelected.displayName}</div>
                  <div className="rango-select--icon">
                    {/* <svg fill="#000000" width="13px" height="13px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"> */}
                    {/*  <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z" /> */}
                    {/* </svg> */}
                  </div>
                </div>
                <div
                  className="rango-select--item"
                  onClick={() => {
                    setTokenSelectionContext('sell')
                    setTokenSearchKeyword('')
                    setSelectToken(true)
                  }}>
                  <div className="rango-select--icon">
                    {tokenSellSelected.image && <img src={tokenSellSelected.image} alt={tokenSellSelected.symbol} />}
                  </div>
                  <div className="rango-select--option">{tokenSellSelected.symbol}</div>
                  <div className="rango-select--icon">
                    <svg fill="#000000" width="13px" height="13px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z" />
                    </svg>
                  </div>
                </div>
                <div className="">
                  <input
                    onChange={(event) => {
                      setAmount(parseFloat(event.target.value))
                      setActionButtonLabel('Find Route')
                      setWidgetState('SelectSwapPair')
                    }}
                    type="number"
                    className="rango-select--item"
                    placeholder="0"
                    value={amount} />
                </div>
              </div>
            </div>
            {/* rango-end-start */}

            <div className="rango-divider--icon">
              {/* <img src={RangoConnect} alt="" /> */}
            </div>

            {/* rango-received-start */}
            <div className="rango-you--receive">
              <div className="rango-flex rango-flex--between">
                <div>You receive</div>
                <div className="rango-sell-balance">
                  {/* $0 */}
                </div>
              </div>
              <div className="rango-filter--group">
                <div
                  className="rango-select--item"
                  onClick={() => {
                    setBlockChainSelectionContext('buy')
                    setBlockChainSearchKeyword('')
                    setSelectBlockchain(true)
                  }}>
                  <div className="rango-select--icon">
                    <img src={blockChainBuySelected.logo} />
                  </div>
                  <div className="rango-select--option">{blockChainBuySelected.displayName}</div>
                  <div className="rango-select--icon">
                    <svg fill="#000000" width="13px" height="13px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z" />
                    </svg>
                  </div>
                </div>
                <div
                  className="rango-select--item"
                  onClick={() => {
                    setTokenSelectionContext('buy')
                    setTokenSearchKeyword('')
                    setSelectToken(true)
                  }}>
                  <div className="rango-select--icon">
                    {tokenBuySelected.image && <img src={tokenBuySelected.image} />}
                  </div>
                  <div className="rango-select--option">{tokenBuySelected.symbol}</div>
                  <div className="rango-select--icon">
                    <svg fill="#000000" width="13px" height="13px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z" />
                    </svg>
                  </div>
                </div>
                <div className="rango-received--value">
                  {bestRoute && bestRoute.result !== null && (
                    <span>
                      ≈
                      {' '}
                      {bestRoute.result?.outputAmount ? parseFloat(bestRoute.result?.outputAmount).toFixed(2) : 0.0}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* rango-received-end */}

            {
              widgetState === 'ShowRoute'
              && (
                <div className="rango-timeline">
                  <div className="fixed-item">
                    <span>
                      <img src={fixedIcon1} alt="" />
                      $
                      {bestRoute.result?.swaps.reduce((a, b) => {
                        b.fee.forEach((fee) => {
                          a += parseFloat(fee?.amount)
                        })
                        return a
                      }, 0).toFixed(3).toString()}
                    </span>
                    <hr />
                    <span>
                      <img src={fixedIcon2} alt="" />
                      ~
                      {convertSecondsToDuration((bestRoute.result?.swaps.reduce((a, b) => a + parseFloat(b?.estimatedTimeInSeconds), 0)))}
                    </span>
                  </div>
                  <div className="scroll-item">

                    {
                      bestRoute.result?.swaps.map((swap, index) => (
                        <>
                          {
                            index === 0 && (
                              <div className="item">
                                <div className="icon">
                                  <img src={swap.from.logo} alt={swap.from.symbol} />
                                </div>
                                <div>
                                  <div className="text">
                                    {parseFloat(swap.fromAmount).toFixed(3).toString()}
                                    {' '}
                                    {swap.from.symbol}
                                  </div>
                                  <div className="text-sm">
                                    on
                                    {' '}
                                    {swap.from.blockchain}
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          <div className="item-connect--between">
                            <div className="divider" />
                            <div className="icon"><img src={swap.swapperLogo} alt="" /></div>
                          </div>

                          <div className="item">
                            <div className="icon">
                              <img src={swap.to.logo} alt="" />
                            </div>
                            <div>
                              <div className="text">
                                {parseFloat(swap.toAmount).toFixed(6).toString()}
                                {' '}
                                {swap.to.symbol}
                              </div>
                              <div className="text-sm">
                                on
                                {' '}
                                {swap.to.blockchain}
                              </div>
                            </div>
                          </div>

                        </>
                      ))
                    }
                  </div>
                </div>
              )
            }

            {
              errorMessage && (
                <div style={{
                  'color': 'red',
                }}>
                  {errorMessage}
                </div>
              )
            }
          </div>
          <div>
            <button onClick={actionButtonHandler} className={`${apiCallInProgress ? 'rango-connect--wallet-disabled' : 'rango-connect--wallet'}`}>
              {' '}
              {actionButtonLabel}
              {' '}
            </button>
          </div>
        </div>

        {SelectBlockchain
          && (
            <div className={`rango-select-widget ${SelectBlockchain ? 'show' : ''}`}>
              <div className="rango-flex rango-flex--between">
                <div className="rango-icon" onClick={() => setSelectBlockchain(false)}>
                  <img src={RangoBack} alt="" />
                </div>
                <div className="rango-title">Select Blockchain</div>
                <div />
              </div>
              <div className="rango-input--icon">
                <img src={RangoSearch} alt="" />
                <input
                  onChange={(event) => {
                    setBlockChainSearchKeyword(event.target.value.trim())
                  }}
                  type="text"
                  className="rango-select--item"
                  placeholder="Search blockchains by name" />
              </div>
              <div className="rango-connect--options">
                {renderBlockChainSelection()}
              </div>
            </div>
          )}

        {SelectToken
          && (
            <div className={`rango-select-widget ${SelectToken ? 'show' : ''}`}>
              <div className="rango-flex rango-flex--between">
                <div className="rango-icon" onClick={() => setSelectToken(false)}>
                  <img src={RangoBack} alt="" />
                </div>
                <div className="rango-title">
                  Select
                  {' '}
                  {tokenSelectionContext === 'sell' ? 'Source' : 'Destination'}
                  {' '}
                  Token
                </div>
                <div />
              </div>
              <div className="rango-input--icon">
                <img src={RangoSearch} alt="" />
                <input
                  onChange={(event) => {
                    setTokenSearchKeyword(event.target.value.trim())
                  }}
                  type="text"
                  className="rango-select--item"
                  placeholder="Search by token name" />
              </div>
              <div className="rango-connect--options signle-item">
                {
                  rangoMetadata
                    .tokens
                    .filter(token => token.blockchain === (tokenSelectionContext === 'sell' ? blockChainSellSelected.name : blockChainBuySelected.name))
                    .filter(token => {
                      if (tokenSelectionContext === 'buy') {
                        return true
                      }

                      if (['KAX', 'MATIC'].includes(token.symbol)) {
                        return true
                      }
                      return token.symbol === 'USDC' && token.blockchain.toLowerCase() === 'polygon' && token.name === null
                    })
                    .filter(token => {
                      if (tokenSearchKeyword === '') {
                        return true
                      }
                      return  token.symbol.toUpperCase().startsWith(tokenSearchKeyword.toUpperCase())
                    })
                    .map((token, index) => (
                      <button
                        onClick={() => {
                          selectToken(token)
                        }}
                        className={`rango-option--item ${token.symbol === (tokenSelectionContext === 'sell' ? tokenSellSelected.symbol : tokenBuySelected.symbol)  && 'active'} `}
                        key={index}>
                        <img alt={token.name} src={token.image} />
                        <div>
                          <div className="text">{token.symbol}</div>
                        </div>
                      </button>
                    ))
                }
              </div>
            </div>
          )}

        {RangoTransitionHistory
          && (
            <div className={`rango-select-widget ${RangoTransitionHistory ? 'show' : ''}`}>
              <div className="rango-flex rango-flex--between">
                <div className="rango-icon" onClick={() => setRangoTransitionHistory(false)}>
                  <img src={RangoBack} alt="" />
                </div>
                <div className="rango-title">Swaps</div>
                <div />
              </div>
              <div className="rango-input--icon">
                <img src={RangoSearch} placeholder="Search by blockchain, token or request Id" alt="" />
                <input type="text" className="rango-select--item" placeholder="Search by token name" />
              </div>
              <div className="rango-not-found">
                Swap not found.
              </div>
            </div>
          )}

        {RangoSettings
          && (
            <div className={`rango-select-widget ${RangoSettings ? 'show' : ''}`}>
              <div className="rango-flex rango-flex--between">
                <div className="rango-icon" onClick={() => setRangoSettings(false)}>
                  <img src={RangoBack} alt="" />
                </div>
                <div className="rango-title">Settings</div>
                <div />
              </div>
              <div className="rango-setting-widget">
                <label>Slippage tolerance</label>
                <div className="rango-flex">
                  <div className="rango-radio-label">
                    <input type="radio" name="1" value="0.5" checked={slippage === '0.5'} onClick={() => { setSlippage('0.5') }} />
                    <span>0.5%</span>
                  </div>
                  <div className="rango-radio-label">
                    <input type="radio" name="1" value="1" checked={slippage === '1'} onClick={() => { setSlippage('1') }} />
                    <span>1%</span>
                  </div>
                  <div className="rango-radio-label">
                    <input type="radio" name="1" value="3" checked={slippage === '3'} onClick={() => { setSlippage('3') }} />
                    <span>3%</span>
                  </div>
                  <div className="rango-radio-label">
                    <input type="radio" name="1" value="5" checked={slippage === '5'} onClick={() => { setSlippage('5') }} />
                    <span>5%</span>
                  </div>
                  <div className="rango-radio-label">
                    <input type="radio" name="1" value="8" checked={slippage === '8'} onClick={() => { setSlippage('8') }} />
                    <span>8%</span>
                  </div>
                  <div className="rango-radio-label">
                    <input type="radio" name="1" value="13" checked={slippage === '13'} onClick={() => { setSlippage('13') }} />
                    <span>13%</span>
                  </div>
                  {/* <div> */}
                  {/*  <input type="text" className="custom-value" placeholder="Custom %" /> */}
                  {/* </div> */}
                </div>
              </div>
              {/* <div className="rango-setting-widget"> */}
              {/*  <div className="rango-flex rango-flex--between"> */}
              {/*    <label className="m-0">Infinite Approval</label> */}
              {/*    <div className="rango-switcher"> */}
              {/*      <input type="checkbox" /> */}
              {/*      <span /> */}
              {/*    </div> */}
              {/*  </div> */}
              {/* </div> */}
              {/* <div className="rango-setting-widget cursor-pointer" onClick={() => setRangoLiquiditySources(true)}> */}
              {/*  <div className="rango-flex rango-flex--between"> */}
              {/*    <label style={{ margin: '0' }}>Liquidity Sources</label> */}
              {/*    <div className="rango-flex"> */}
              {/*      <span>7</span> */}
              {/*      <div className="rango-icon"> */}
              {/*        <img src={RangoArrowRight} /> */}
              {/*      </div> */}
              {/*    </div> */}
              {/*  </div> */}
              {/* </div> */}

            </div>
          )}

        {RangoLiquiditySources
          && (
            <div className={`rango-select-widget ${RangoLiquiditySources ? 'show' : ''}`}>
              <div className="rango-flex rango-flex--between">
                <div className="rango-icon" onClick={() => setRangoLiquiditySources(false)}>
                  <img src={RangoBack} alt="" />
                </div>
                <div className="rango-title">Liquidity Sources</div>
                <div className="rango-btn">
                  Select all
                </div>
              </div>
              <div className="rango-input--icon">
                <img src={RangoSearch} placeholder="Search by blockchain, token or request Id" alt="" />
                <input type="text" className="rango-select--item" placeholder="Search by token name" />
              </div>

              <div className="rango-connect--options signle-item">
                <div className="rango-flex rango-flex--between top-sticky-div">
                  <span>Bridges</span>
                  <span>25</span>
                </div>
                {
                  rangoMetadata.blockchains.filter(blockchain => blockchain.enabled).map((blockchain, index) => (
                    <button className={`rango-option--item `} key={index}>
                      <img src={blockchain.logo} />
                      <div className="flex-1 text-start">
                        <div className="text text-start">{blockchain.name}</div>
                        <div className="text-sm">{blockchain.name}</div>
                      </div>
                      <div className="rango-switcher">
                        <input type="checkbox" />
                        <span />
                      </div>
                    </button>
                  ))
                }
                <div className="rango-flex rango-flex--between top-sticky-div">
                  <span>Exchange</span>
                  <span>25</span>
                </div>
                {
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(index => (
                    <button className={`rango-option--item `} key={index}>
                      <img src="https://api.rango.exchange/blockchains/binance.svg" />
                      <div className="flex-1 text-start">
                        <div className="text text-start">JUNO</div>
                        <div className="text-sm">Juno</div>
                      </div>
                      <div className="rango-switcher">
                        <input type="checkbox" />
                        <span />
                      </div>
                    </button>
                  ))
                }
              </div>

            </div>
          )}

        {widgetState === 'ConfirmSwap'
          && (
            <div className={`rango-select-widget ${widgetState === 'ConfirmSwap' ? 'show' : ''}`}>
              <div className="d-flex flex-column justify-content-between h-100 flex-1">
                <div>
                  <div className="rango-flex rango-flex--between">
                    <div
                      className="rango-icon"
                      onClick={() => {
                        if (apiCallInProgress) return
                        setBestRoute({})
                        setWidgetState('SelectSwapPair')
                        setActionButtonLabel('Find Route')
                      }}>
                      <img src={RangoBack} alt="" />
                    </div>
                    <div className="rango-title">Confirm swap</div>
                    <div />
                  </div>

                  <div className="scroll-item-swap my-4">
                    <div className="flex-1">
                      <div className="item" style={{ fontSize: '11px' }}>
                        <strong style={{ fontSize: '18px' }}>{parseFloat(bestRoute.requestAmount).toFixed(3)}</strong>
                        <br />
                        {' '}
                        {bestRoute.from.symbol}
                        [
                        {bestRoute.from.blockchain}
                        ]
                      </div>
                    </div>
                    <div className="item-connect--between flex-1 mx-3">
                      <div className="divider" />
                    </div>
                    <div className="flex-1">
                      <div className="item" style={{ fontSize: '11px' }}>
                        <strong style={{ fontSize: '18px' }}>{parseFloat(bestRoute.result.outputAmount).toFixed(3)}</strong>
                        <br />
                        {' '}
                        {bestRoute.to.symbol}
                        [
                        {bestRoute.to.blockchain}
                        ]
                      </div>
                    </div>
                  </div>

                  <div className="rango-setting-widget d-flex align-items-center rango-flex--between gap-2">
                    <div className="wallet-item">
                      <label className="m-0">
                        From KAXA Wallet
                      </label>
                    </div>
                    <i>{user.maticData.address}</i>
                  </div>

                  {requiredWalletFlag && walletConnectsRequired(bestRoute).map((wallet) => (
                    <div>
                      {connectedWalletAddresses[wallet] ? (
                        <div className="rango-setting-widget d-flex align-items-center rango-flex--between gap-2">
                          <div>
                            Connected
                            {' '}
                            {wallet}
                            {' '}
                            (
                            {connectedWalletAddresses[wallet] ?? ''}
                            )
                            {' '}
                          </div>
                          <button
                            className="rango-btn"
                            onClick={async () => {

                              if (window?.ethereum && window.ethereum.isConnected()) {
                                // await window.ethereum.request({ method: 'wallet_disconnect' })
                                setMetaMaskConnected(false)
                              } else {
                                walletConnectProviders[wallet].disconnect()
                              }

                              walletConnectProviders[wallet] = null
                              browserWalletProviders[wallet] = null
                              connectedWalletAddresses[wallet] = null
                              connectedWalletSigners[wallet] = null

                              setWalletConnectProviders(walletConnectProviders)
                              setBrowserWalletProviders(browserWalletProviders)
                              setConnectedWalletAddresses(connectedWalletAddresses)
                              setConnectedWalletSigners(connectedWalletSigners)
                              setRequiredWalletFlag(false)
                              setTimeout(() => {
                                setRequiredWalletFlag(true)
                              }, 300)
                            }}>
                            Disconnect
                            {' '}
                          </button>
                        </div>
                      ) : (
                        <div className="rango-setting-widget d-flex align-items-center rango-flex--between gap-2">
                          <div>
                            Connect
                            {' '}
                            {wallet}
                            {' '}
                            wallet.
                            {' '}
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            {
                              isChainEvm(wallet) && window.ethereum && window.ethereum.isMetaMask && (
                                <div
                                  onClick={async () => {
                                    try {

                                      const metamaskProvider: any = window.ethereum
                                      if (!metamaskProvider) {
                                        return
                                      }
                                      const provider = new ethers.BrowserProvider(metamaskProvider)
                                      await provider.send('eth_requestAccounts', [])

                                      const { chainId } = (await getMetadata()).blockchains.filter((blockchain) => blockchain.name.toUpperCase() === wallet.toUpperCase())[0]

                                      try {
                                        await metamaskProvider.request({
                                          method: 'wallet_switchEthereumChain',
                                          params: [{ chainId }],
                                        })
                                      } catch (e) {
                                        if (e.message.includes('Unrecognized chain ID')) {
                                          alert('Your wallet doesn\'t seems to have this chain. Please add this chain to your wallet and try again.')
                                        } else {
                                          alert('Error connecting wallet.')
                                        }

                                        return
                                      }

                                      const signer = await provider.getSigner()

                                      walletConnectProviders[wallet] =  provider
                                      browserWalletProviders[wallet] = provider

                                      setWalletConnectProviders(walletConnectProviders)
                                      setBrowserWalletProviders(browserWalletProviders)
                                      setConnectedWalletSigners(connectedWalletSigners => {
                                        connectedWalletSigners[wallet] = signer
                                        return connectedWalletSigners
                                      })
                                      const walletAddress = await signer.getAddress()
                                      setConnectedWalletAddresses(connectedWalletAddresses => {
                                        connectedWalletAddresses[wallet] = walletAddress
                                        return connectedWalletAddresses
                                      })
                                      setMetaMaskConnected(true)
                                      // User has connected their MetaMask wallet
                                    } catch (error) {
                                      // Handle error (e.g., user denied permission)
                                      console.log(error)
                                      setMetaMaskConnected(false)
                                    }

                                    setRequiredWalletFlag(false)
                                    setTimeout(() => {
                                      setRequiredWalletFlag(true)
                                    }, 300)

                                  }}
                                  className="connect-icon cursor-pointer mr-3">
                                  <img width="24px" src={MetaMask} alt="" />
                                </div>
                              )
                            }
                            <div
                              onClick={async () => {
                                await initProviderForWalletConnect(wallet)
                                const signer = await browserWalletProviders[wallet].getSigner()
                                setConnectedWalletSigners(connectedWalletSigners => {
                                  connectedWalletSigners[wallet] = signer
                                  return connectedWalletSigners
                                })

                                const walletAddress = await connectedWalletSigners[wallet].getAddress()
                                setConnectedWalletAddresses(connectedWalletAddresses => {
                                  connectedWalletAddresses[wallet] = walletAddress
                                  return connectedWalletAddresses
                                })

                                setRequiredWalletFlag(false)
                                setTimeout(() => {
                                  setRequiredWalletFlag(true)
                                }, 1000)

                              }}
                              className="connect-icon cursor-pointer">
                              <img width="24px" src={ConnectWallet} alt="" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {
                    shouldShowExternalWalletCustomAddress(bestRoute) && (

                      <div className="rango-connect--options signle-item">
                        <div className="">
                          <div className="wallet-item">
                            <label>
                              To
                              {' '}
                              External
                              {' '}
                              {bestRoute.to.blockchain}
                              {' '}
                              wallet address
                            </label>
                          </div>
                          <div>
                            <input
                              type="text"
                              className="rango-select--item"
                              onChange={(event) => {
                                setExternalWalletAddress(event.target.value)
                              }} />
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>

                <div>
                  <button onClick={actionButtonHandler} className={`${apiCallInProgress ? 'rango-connect--wallet-disabled' : 'rango-connect--wallet'}`}>
                    {' '}
                    {actionButtonLabel}
                    {' '}
                  </button>
                </div>
              </div>
            </div>
          )}

        {swapStarted
        && (
          <div className="rango-swap--status">

            <div className="head">
              <svg width="24px" height="26px" stroke="#FFC107" fill="#FFC107" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg">
                <defs />
                <polygon points="8.29 1.71 18.5 1.71 13.86 9.14 17.57 9.14 7.36 20.29 9.21 12.86 5.5 12.86 8.29 1.71" />
              </svg>
              Swap
              {' '}
              {bestRoute.requestAmount}
              {' '}
              <strong>
                {bestRoute.from.symbol}
                {' '}
                to
                {' '}
                {bestRoute.to.symbol}
              </strong>
            </div>

            <div className="content">
              {
                bestRoute.result?.swaps?.map((swap, index) => (
                  <div className="item">
                    <div className="icon"><img src={swap.swapperLogo} /></div>
                    <div>
                      <h4>{swap.swapperId}</h4>
                    </div>
                    <p>
                      {parseFloat(swap.toAmount).toFixed(6)}
                      {' '}
                      {swap.to.symbol}

                      {
                        index + 1  <  swapInprogressStep && (
                          <img className="ml-2" src={GreenTick} alt="" />
                        )
                      }

                      {
                        index + 1  ===  swapInprogressStep && (

                          <div className="ml-3">
                            <div className="spinner-border" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div>

                        )

                      }

                      {
                        index + 1  >  swapInprogressStep && (
                          <span>.</span>
                        )
                      }

                    </p>
                  </div>
                ))
              }

            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default CSSModules(styles, { allowMultiple: true })
