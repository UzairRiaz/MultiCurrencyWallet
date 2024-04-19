import { useState, useEffect } from 'react'
import { Link, NavLink, withRouter } from 'react-router-dom'

import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import CSSModules from 'react-css-modules'
import actions from 'redux/actions'
import cx from 'classnames'

import styles from 'pages/Wallet/Wallet.scss'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { BigNumber } from 'bignumber.js'
import config from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import { FormattedMessage, useIntl } from 'react-intl'
import kaxaa from 'components/ui/CurrencyIcon/images/kaxaa.svg'
import dollar from './images/dollar.svg'
import btc from './images/btcIcon.svg'
import Convert from './images/convert.svg'

const BalanceForm = function ({
  activeFiat,
  activeCurrency,
  fiatBalance,
  currencyBalance,
  handleReceive,
  handleWithdraw,
  currency,
  currencyView = false,
  handleInvoice = () => { },
  isFetching = false,
  showButtons = true,
  type,
  singleWallet = false,
  multisigPendingCount = 10,
  history,
}) {

  const { locale } = useIntl()
  const [selectedCurrency, setActiveCurrency] = useState(activeCurrency)
  const isWidgetBuild = config && config.isWidget

  useEffect(() => {
    if (type === 'wallet' && activeCurrency !== activeFiat.toLowerCase()) {
      setActiveCurrency('kax')
    } else {
      setActiveCurrency(activeCurrency)
    }
  }, [activeCurrency])

  const active = activeFiat ? activeFiat.toLowerCase() : 'usd'

  // @ToDo
  // в Data у валют есть флаги isUserProtected и isSMSProtected
  // нужно по ним проверять, а не по "служебному" названию монеты
  // Use flags in currency data (isUserProtected and isSMSProtected)
  // eslint-disable-next-line default-case
  switch (currency) {
    case 'btc (multisig)':
    case 'btc (pin-protected)':
      currency = 'BTC'
      break
  }

  const handleClickCurrency = (currency) => {
    setActiveCurrency(currency)
    actions.user.pullActiveCurrency(currency)
  }

  const handleGoToMultisig = () => {
    actions.multisigTx.goToLastWallet()
  }

  const buttonsDisabled = !((config.opts.ui.disableInternalWallet && metamask.isConnected()) || !config.opts.ui.disableInternalWallet)

  const sendButtonDisabled =  false   // !currencyBalance || buttonsDisabled

  const handleGetKax = () => {
    history.push(localisedUrl(locale, links.buyKax))
  }

  const handleCustomConvert = () => {
    history.push(localisedUrl(locale, links.sellKax))
  }

  return (
    <>
      <div
        styleName={
          `${isWidgetBuild && !config.isFullBuild ? 'yourBalance widgetBuild' : 'yourBalance'}`
        }
      >
        <div styleName="yourBalanceTop" className="data-tut-widget-balance">
          <p styleName="yourBalanceDescr">
            {singleWallet
              ? <FormattedMessage id="YourWalletbalance" defaultMessage="Balance" />
              : <FormattedMessage id="Yourtotalbalance" defaultMessage="Ваш общий баланс" />}
          </p>
          <div styleName="yourBalanceValue">
            {isFetching && (
              <div styleName="loaderHolder">
                <InlineLoader />
              </div>
            )}
            {selectedCurrency === active ? (
            // eslint-disable-next-line no-restricted-globals
              <p>
                {(activeFiat === 'USD' || activeFiat === 'CAD') && <img src={dollar} alt="dollar" />}
                {
                // eslint-disable-next-line no-restricted-globals
                  !isNaN(fiatBalance) ? new BigNumber(fiatBalance).dp(2, BigNumber.ROUND_FLOOR).toString() : ''
                }
              </p>
            ) : (
              <p className="data-tut-all-balance">
                {currency.toUpperCase() === 'BTC' ? <img src={btc} alt="btc" /> : ''}
                {currency.toUpperCase() === 'KAX' ? <img src={kaxaa} styleName="curKaxaa" alt="kax" /> : ''}
                {new BigNumber(currencyBalance).dp(6, BigNumber.ROUND_FLOOR).toString()}
              </p>
            )}
          </div>
          <div styleName="yourBalanceCurrencies">
            <button
              type="button"
              styleName={selectedCurrency === active ? 'active' : undefined}
              onClick={() => handleClickCurrency(active)}
            >
              {active}
            </button>
            <span styleName="separator" />
            <button
              type="button"
              styleName={selectedCurrency === currency ? 'active' : undefined}
              onClick={() => handleClickCurrency(currency)}
            >
              {currencyView || currency}
            </button>
          </div>
        </div>
        {multisigPendingCount > 0 && (
          <div onClick={handleGoToMultisig}>
            <p styleName="multisigWaitCount">
              <FormattedMessage
                id="Balance_YouAreHaveNotSignegTx"
                defaultMessage="{count} transaction needs your confirmation"
                values={{
                  count: multisigPendingCount,
                }}
              />
            </p>
          </div>
        )}
        <div
          className={cx({
            [styles.yourBalanceBottomWrapper]: true,
          })}
        >
          <div styleName="yourBalanceBottom">
            {showButtons ? (
              <div style={{ display: 'grid', gridGap: '10px', width: '100%' }}>
                <div styleName="btns" className="data-tut-withdraw-buttons">
                  <Button blue disabled={buttonsDisabled} id="depositBtn" onClick={() => handleReceive('Deposit')}>
                    <FormattedMessage id="YourtotalbalanceDeposit" defaultMessage="Пополнить" />
                  </Button>
                  <Button blue disabled={sendButtonDisabled} id={!sendButtonDisabled ? 'sendBtn' : ''} onClick={() => handleWithdraw('Send')}>
                    <FormattedMessage id="YourtotalbalanceSend" defaultMessage="Отправить" />
                  </Button>
                </div>
                <div styleName="btns" className="data-tut-withdraw-buttons">
                  <Button blue disabled={buttonsDisabled} onClick={() => handleGetKax()}>
                    Get KAX
                  </Button>
                  <Button blue disabled={buttonsDisabled} onClick={() => handleCustomConvert()}>
                    Withdraw
                  </Button>
                </div>
                <NavLink to='/exchange/quick' className='btn-exchange'>
                  exchange
                </NavLink>
              </div>
            ) : (
              <Button blue disabled={!currencyBalance} styleName="button__invoice" onClick={handleInvoice}>
                <FormattedMessage id="RequestPayment" defaultMessage="Запросить" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div
      className='kaxaa-balance--convert-info'
        styleName={
          `${isWidgetBuild && !config.isFullBuild ? 'yourBalance widgetBuild margin-top-10' : 'yourBalance margin-top-10'}`
        }
      >
        <div className='d-flex align-items-start'>
          <div className='icon'>
            <img src={Convert} />
          </div>
          <div className='ml-3 mb-1'>
            <p className='mb-0'>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              If you're looking to convert your KAXAA tokens to USDC/MATIC on the Polygon network,
              QuickSwap provides an optimal solution as it is built on the Polygon exchange.

            </p>
            <a className='text-primary' href={'/#/exchange/quick'}> Click Here</a>
          </div>
        </div>

      </div>

    </>
  )
}

export default withRouter(CSSModules(BalanceForm, styles, { allowMultiple: true }))
