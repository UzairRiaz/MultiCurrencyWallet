import { isMobile } from 'react-device-detect'

import { Switch, Route } from 'react-router-dom'

import { links } from 'helpers'
import LocalStorage from 'pages/LocalStorage/LocalStorage'
import SwapComponent from 'pages/Swap/Swap'
import TurboSwap from 'pages/TurboSwap/TurboSwap'
import History from 'pages/History/History'
import CreateWallet from 'pages/CreateWallet/CreateWallet'
import NotFound from 'pages/NotFound/NotFound'
import Wallet from 'pages/Wallet/Wallet'
import Exchange from 'shared/pages/Exchange'
import CurrencyWallet from 'pages/CurrencyWallet/CurrencyWallet'
import Transaction from 'pages/Transaction/Transaction'
import BtcMultisignProcessor from 'pages/Multisign/Btc/Btc'
// Auth
import Signin from 'shared/pages/Auth/Signin/Signin'
import Signup from 'shared/pages/Auth/Signup/Signup'
import OTP from 'shared/pages/Auth/OTP/OTP'
import ForgotPassword from 'shared/pages/Auth/ForgotPassword/ForgotPassword'
import ChangePassword from 'shared/pages/Auth/ChangePassword/ChangePassword'
import ResetPassword from 'shared/pages/Auth/ResetPassword/ResetPassword'

// KAX
import GetKax from 'shared/pages/KAX/Get/GetKax'
import Profile from 'shared/pages/KAX/User/Profile/Profile'
import Kyc from 'shared/pages/KAX/User/Kyc/Kyc'
import FortressKyc from 'shared/pages/KAX/User/Kyc/FortressKyc.js';

// import MarketmakerPromo from 'pages/Marketmaker/MarketmakerPromo'
// import MarketmakerSettings from 'pages/Marketmaker/MarketmakerSettings'
// import CreateInvoice from 'pages/Invoices/CreateInvoice'
// import InvoicesList from 'pages/Invoices/InvoicesList'
// import Invoice from 'pages/Invoices/Invoice'

import SaveMnemonicModal from 'components/modals/SaveMnemonicModal/SaveMnemonicModal'
import SaveKeysModal from 'components/modals/SaveKeysModal/SaveKeysModal'

import RestoryMnemonicWallet from 'components/modals/RestoryMnemonicWallet/RestoryMnemonicWallet'
import ProtectedRoute from 'pages/Auth/ProtectedRoute/ProtectedRoute'
import { RangoTransactionHistory } from 'pages/Exchange/RangoTransactionHistory'
import BuyIntro from 'pages/KAX/BuyIntro/BuyIntro'
import SellIntro from 'pages/KAX/SellIntro/SellIntro'
import ScrollToTop from '../components/layout/ScrollToTop/ScrollToTop'

const routes = (
  <ScrollToTop>
    <Switch>
      <Route exact path="/:page(exit)" component={Wallet} />

      {/* auth switch */}
      <Route exact path={`${links.signin}`} component={Signin} />
      <Route exact path={`${links.signup}`} component={Signup} />
      <Route exact path={'/test-widget'} component={() => <iframe
        src={'https://global-stg.transak.com/?apiKey=df3909be-dd56-4672-9005-f57a7ffdaef8&fiatCurrency=USD&cryptoCurrencyList=MATIC'}
        style={{ width: '100%', height: '730px' }} />
      } />

      <Route exact path={`${links.otpVerification}`} component={OTP} />
      <Route exact path={`${links.forgotPassword}`} component={ForgotPassword} />
      <Route exact path={`${links.changePassword}`} component={ChangePassword} />
      <ProtectedRoute exact path={`${links.resetPassword}`} component={ResetPassword} />

      {/* KAX */}
      <ProtectedRoute exact path={`${links.getKax}/:paymentType`} component={GetKax} />
      <ProtectedRoute exact path={`${links.buyKax}`} component={BuyIntro} />
      <ProtectedRoute exact path={`${links.sellKax}`} component={SellIntro} />
      <ProtectedRoute exact path={`${links.profileKaxUser}`} component={Profile} />
      <ProtectedRoute exact path={`${links.kyc}`} component={Kyc} />

      <ProtectedRoute path={`${links.atomicSwap}/:orderId`} component={SwapComponent} />
      <ProtectedRoute path={`${links.turboSwap}/:orderId`} component={TurboSwap} />

      <ProtectedRoute path="/:ticker(btc|eth|bnb|matic|arbeth|aureth|xdai|ftm|avax|movr|one|phi|ame|ghost|next)/tx/:tx?" component={Transaction} />
      <ProtectedRoute path="/:token(token)/:ticker/tx/:tx?" component={Transaction} />

      <ProtectedRoute
        path="/:ticker(btc|eth|bnb|matic|arbeth|aureth|xdai|ftm|avax|movr|one|phi|ame|ghost|next)/:address/:action(receive|send)?"
        component={CurrencyWallet}
      />
      <ProtectedRoute path="/:token(token)/:ticker/:address" component={CurrencyWallet} />
      <ProtectedRoute path="/:token(token)/:ticker/:address/withdraw" component={CurrencyWallet} />
      <ProtectedRoute path="/:fullName-wallet/:address?" component={CurrencyWallet} />
      <ProtectedRoute path="/:token(token)/:ticker/:address?/:exchange" component={CurrencyWallet} />

      <ProtectedRoute path={`${links.withdraw}/:paymentType`} component={Exchange} />
      <ProtectedRoute path={`${links.exchange}/quick/createOrder`} component={Exchange} />
      <ProtectedRoute path={`${links.exchange}/quick/:sell-to-:buy`} component={Exchange} />
      <ProtectedRoute path={`${links.exchange}/quick`} component={Exchange} />
      <ProtectedRoute path={`${links.exchange}/:sell-to-:buy/:linkedOrderId`} component={Exchange} />
      <ProtectedRoute path={`${links.exchange}/:sell-to-:buy`} component={Exchange} />
      <ProtectedRoute path={`${links.exchange}`} component={Exchange} />
      <ProtectedRoute path={`${links.rangoTransactionHistory}`} component={RangoTransactionHistory} />

      <ProtectedRoute path={`${links.localStorage}`} component={LocalStorage} />

      <ProtectedRoute path={`${links.send}/:currency/:address/:amount`} component={Wallet} />
      <ProtectedRoute path={`${links.wallet}`} component={Wallet} />

      <ProtectedRoute exact path={`${links.createWallet}`} component={CreateWallet} />

      <Route path={`${links.createWallet}/:currency`} component={CreateWallet} />
      <Route path={`${links.restoreWallet}`} component={RestoryMnemonicWallet} />

      <Route path={`${links.multisign}/btc/:action/:data/:peer`} component={BtcMultisignProcessor} />
      <Route path={`${links.multisign}/btc/:action/:data`} component={BtcMultisignProcessor} />

      {/* <Route path={`${links.createInvoice}/:type/:wallet`} component={CreateInvoice} /> */}
      {/* {isMobile && <Route path={`${links.invoices}/:type?/:address?`} component={InvoicesList} />} */}
      {/* <Route path={`${links.invoice}/:uniqhash?/:doshare?`} component={Invoice} /> */}

      <ProtectedRoute path={`${links.savePrivateSeed}`} component={SaveMnemonicModal} />
      <ProtectedRoute path={`${links.savePrivateKeys}`} component={SaveKeysModal} />

      <Route exact path={`${links.notFound}`} component={NotFound} />
      <ProtectedRoute exact path="/" component={Wallet} />
      <ProtectedRoute exact path={`${links.connectWallet}`} component={Wallet} />
      <ProtectedRoute path={`${links.currencyWallet}`} component={Wallet} />

      {/* <Route exact path={`${links.marketmaker}`} component={MarketmakerPromo} /> */}
      {/* <Route exact path={`${links.marketmaker_short}`} component={MarketmakerPromo} /> */}
      {/* <Route path={`${links.marketmaker}/:token/:utxoCoin?`} component={MarketmakerSettings} /> */}
      {/* <Route path={`${links.marketmaker_short}/:token/:utxoCoin?`} component={MarketmakerSettings} /> */}
      {/* Route for KYC test*/}
      <ProtectedRoute path={"/fortess-kyc"} component={FortressKyc} exact />
      {/* In desktop mode - the history is shown in the wallet design */}
      {!isMobile && (
        <Switch>
          <Route exact path="/:page(invoices)/:type?/:address?" component={Wallet} />
          <Route exact path="/:page(history)" component={Wallet} />
        </Switch>
      )}
      {isMobile && (
        <Switch>
          <Route exact path={`${links.history}/(btc)?/:address?`} component={History} />
          <Route exact path="/:page(invoices)/:type?/:address?" component={History} />
        </Switch>
      )}

      <Route component={NotFound} />
    </Switch>
  </ScrollToTop>
)

export default routes
