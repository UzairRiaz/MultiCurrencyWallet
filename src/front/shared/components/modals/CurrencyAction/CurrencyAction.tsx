import React from 'react'
import { connect } from 'redaction'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import erc20Like from 'common/erc20Like'
import { constants } from 'helpers'

import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import icons from 'components/ui/CurrencyIcon/images'
import config from 'app-config'
import actions from 'shared/redux/actions'
import styles from './CurrencyAction.scss'

import QuickSwapIcon from './images/qswap.png'
import BankIcon from './images/bank.svg'
import RangoIcon from './images/rango.png'

@connect(({
  ui: { dashboardModalsAllowed },
}) => ({
  dashboardView: dashboardModalsAllowed,
}))
@cssModules(styles, { allowMultiple: true })
class CurrencyAction extends React.Component<any, any> {
  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }
    // @ts-ignore
    actions.modals.close(name)
  }

  handleClickCurrency = (item) => {
    const {
      data: { context },
      history,
      intl: { locale },
    } = this.props

    const { currency, address, standard } = item

    if (context === 'Deposit') {
      this.handleClose()

      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
        address,
        standard,
      })
    } else {
      let targetCurrency = currency
      switch (currency.toLowerCase()) {
        case 'btc (multisig)':
        case 'btc (pin-protected)':
          targetCurrency = 'btc'
          break
      }

      this.handleClose()

      history.push(
        localisedUrl(locale, `${standard ? '/token' : ''}/${targetCurrency}/${address}/send`),
      )
    }

  }

  render() {
    const {
      props: {
        data: { currencies, context },
        dashboardView,
      },
    } = this

    // if currencies is one, do autoselect
    if (currencies.length == 1) {
      this.handleClickCurrency(currencies.shift())
    }

    return (
      <>
        <div styleName={cx({
          'modal-overlay': true,
        })}>
          <div styleName={cx({
            'modal': true,
            'modal_dashboardView': dashboardView,
          })}>
            <div styleName="header">
              <p styleName="title">{context}</p>
              <p styleName="text">
                <FormattedMessage
                  id="currencyAction81"
                  defaultMessage="Please choose a currency, which you want to {context}"
                  values={{ context: context.toLowerCase() }}
                />
              </p>
              <CloseIcon styleName="closeButton" onClick={this.handleClose} data-testid="modalCloseIcon" />
            </div>
            <div styleName={cx({
              'content': true,
              'content_dashboardView': dashboardView,
            })}>

              <div styleName={cx({
                'currenciesWrapper': true,
                'currenciesWrapper_dashboardView': dashboardView,
              })}>
                {currencies.filter((item) => {
                  const allowedTokens = ['{matic}usdc', '{matic}kaxaa', '{matic}matic'];
                  return item?.tokenKey && allowedTokens.includes(item.tokenKey)
                }).map((item, index) => {
                  let iconName = item.currency.toLowerCase()
                  let itemTitle = item.currency
                  let itemFullTitle = item.fullName

                  switch (item.currency) {
                    case 'BTC (Multisig)':
                      iconName = 'btc'
                      itemTitle = 'BTC (MTS)'
                      itemFullTitle = 'BTC (MTS)'
                      break
                    case 'BTC (SMS-Protected)':
                      iconName = 'btc'
                      itemTitle = 'BTC (SMS)'
                      itemFullTitle = 'BTC (SMS)'
                      break
                    case 'BTC (PIN-Protected)':
                      iconName = 'btc'
                      itemTitle = 'BTC (PIN)'
                      itemFullTitle = 'BTC (PIN)'
                      break
                  }

                  if (!icons[iconName] && item.standard && item.baseCurrency) {
                    iconName = item.baseCurrency
                  }

                  let renderIcon = icons[iconName]
                  const renderStyle = {
                    backgroundColor: '',
                  }

                  const tokenStandard = item.standard?.toLowerCase()
                  const currencyKey = item.currency.toLowerCase()

                  if (tokenStandard && config[tokenStandard][currencyKey]) {
                    const token = config[tokenStandard][currencyKey]

                    if (token.icon) {
                      renderIcon = token.icon
                    }
                    if (token.iconBgColor) {
                      renderStyle.backgroundColor = token.iconBgColor
                    }
                  }

                  return (
                    <div styleName="card" key={index} onClick={() => this.handleClickCurrency(item)}>
                      <CurrencyIcon
                        styleName="circle"
                        name={itemTitle}
                        source={renderIcon && renderIcon}
                        style={renderStyle}
                      />
                      <div styleName="info">
                        <p>{itemTitle}</p>
                        <span>{itemFullTitle}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <p style={{
              fontSize: '12px',
              color: 'red',
              textAlign: 'center',
              fontWeight: '400',
            }}>
              <br />
              <br />
              WARNING: This wallet only supports POLYGON (MATIC) Network tokens. If you mistakenly send tokens to a wrong address, or send them using the wrong network, the tokens will not be recoverable and will effectively be lost.
            </p>
          </div>
        </div>

        {/* <div className="get-kaxaa--modal" styleName={cx({
          'modal-overlay': true,
        })}>
          <div styleName={cx({
            'modal': true,
            'modal_dashboardView': dashboardView,
          })}>
            <div styleName="header">
              <p styleName="title">Get Kax</p>
              <p styleName="text">
                Please choose method you want to withdraw
              </p>
              <CloseIcon styleName="closeButton" onClick={this.handleClose} data-testid="modalCloseIcon" />
            </div>
            <div styleName={cx({
              'content': true,
              'content_dashboardView': dashboardView,
            })}>

              <div className='card-item--holder' styleName={cx({
                'currenciesWrapper': true,
                'currenciesWrapper_dashboardView': dashboardView,
              })}>

                <div styleName="card" className='card-item'>
                  <div>
                    <img width={'50px'} height={'50px'} className='icon' src={BankIcon} alt='icon' />
                  </div>
                  <div styleName="info">
                    <p className='title'>ACH/WIRE</p>
                    <span>Purchase kaxaa, Matic and USDC by linking bank or wire</span>
                  </div>
                </div>
                <div styleName="card" className='card-item'>
                  <div>
                    <img width={'50px'} height={'50px'} className='icon' src={QuickSwapIcon} alt='icon' />
                  </div>
                  <div styleName="info">
                    <p className='title'>QuickSwap</p>
                    <span>Swap Polygon tokens for kaxaa tokens.</span>
                  </div>
                </div>
                <div styleName="card" className='card-item'>
                  <div>
                    <img width={'50px'} height={'50px'} className='icon' src={RangoIcon} alt='icon' />
                  </div>
                  <div styleName="info">
                    <p className='title'>Rango Chain</p>
                    <span>Swap tokens on multiple networks for kaxaa tokens.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

      </>
    )
  }
}

export default injectIntl(CurrencyAction)
