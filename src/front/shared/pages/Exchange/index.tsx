import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import { localStorage, constants, links, externalConfig, utils } from 'helpers'
import { getLocal } from '@walletconnect/utils'
import kasaHttpClient from 'shared/helpers/kasaHttpClient'
import scriptImport from 'shared/components/ScriptImport/ScriptImport'
import { RangoExchange } from 'pages/Exchange/RangoExchange'
import { NavLink } from 'react-router-dom'
import store from 'redux/store'
import IframeLoader from 'components/ui/IframeLoader/IframeLoader'
import actions from 'redux/actions'
import styles from './index.scss'
import QuickSwap from './QuickSwap'
import AtomicSwap from './AtomicSwap'

// assets
import USD from './images/usd.svg'
import Card from './images/credit-card.svg'
import Token from './images/kaxa-token.svg'
import RightArrow from './images/right-arrow.svg'
import Eye from './images/eye.svg'
import Connect from './images/connect.svg'
import Cross from './images/cross.svg'
import Pig from './images/pig.svg'
import Timer from './images/time.svg'
import Bank from './images/bank.svg'
import Plus from './images/plus.svg'
import Warning from './images/warning.svg'

// option from the WP panel
const globalMode = window.exchangeMode

const GlobalModes = {
  atomic: 'atomic',
  quick: 'quick',
  only_atomic: 'only_atomic',
  only_quick: 'only_quick',
}

const Exchange = function (props) {

  scriptImport('https://atrium.mx.com/connect.js')

  const { location, history, match: { params: { paymentType } } } = props
  const walletStore = store.getState()
  const noNetworks = !Object.values(externalConfig.enabledEvmNetworks).length

  const validMode = globalMode && GlobalModes[globalMode]
  let showOnlyOneType = validMode === GlobalModes.only_atomic || validMode === GlobalModes.only_quick

  const exchangeSettings = localStorage.getItem(constants.localStorage.exchangeSettings) || {}
  let initialState = location.pathname.match(/\/exchange\/quick/) ? 'quick' : 'atomic'

  if (noNetworks) {
    showOnlyOneType = true
    initialState = GlobalModes.quick
    exchangeSettings.swapMode = initialState
    localStorage.setItem(constants.localStorage.exchangeSettings, exchangeSettings)
  } else if (showOnlyOneType) {
    // and hide tabs next
    initialState = globalMode.replace(/only_/, '')
  } else if (validMode && location.pathname === '/exchange') {
    // show the default WP mode if url isn't specified
    initialState = validMode
  } else if (exchangeSettings.swapMode) {

    // this atomic is from url so dont change
    if (initialState === 'atomic') {

    } else {
      // ignore last state
      initialState = 'quick' // exchangeSettings.swapMode
    }

  } else {
    // mode isn't saved for new users. Save it
    exchangeSettings.swapMode = initialState
    localStorage.setItem(constants.localStorage.exchangeSettings, exchangeSettings)
  }

  const [swapMode, setSwapMode] = useState(initialState)

  const [achSubview, setAchSubview] = useState('redeem-kax')
  const [pending, setPending] = useState(false)
  const [mxUserId, setMxUserId] = useState('')
  const [mxConnectWidgetUrl, setMxConnectWidgetUrl] = useState('')
  const initLinkedAccounts: Array<any> = []
  const [linkedAccounts, setLinkedAccounts] = useState(initLinkedAccounts)
  const [kaxInput, setKaxInput] = useState('')
  const [usdInput, setUsdInput] = useState('')
  const [removeAccountName, setRemoveAccountName] = useState('')
  const [mxConnectObj, setMxConnectObj] = useState({
    load: (url: string) => {
      console.log('empty', url)
    },
  })
  const [profileVerificationApprovalPendingNotification, setProfileVerificationApprovalPendingNotification] = useState(false)
  const [applyProfileVerificationNotification, setApplyProfileVerificationNotification] = useState(false)
  const [completeProfileNotification, setCompleteProfileNotification] = useState(false)

  const once = true
  useEffect(() => {
    actions.modals.closeAll()
    switch (paymentType) {
      case 'ach':
        setSwapMode('ach')
        break
      case 'rango':
        setSwapMode('atomic')
        break
      case 'quick':
        setSwapMode('quick')
        break
    }

    if (swapMode === 'ach') {
      profileVerificationStatusCheck()
      initMxConnect()
      fetchLinkedAccounts()
    }

  }, [once])

  const profileVerificationStatusCheck = async () => {
    kasaHttpClient.get('/sila/verification-status').then((response) => {
      console.log(response.data)
      if (response.data.step === 'completeProfile') {
        setCompleteProfileNotification(true)
      }

      if (response.data.step === 'applyVerification') {
        setApplyProfileVerificationNotification(true)
      }

      if (response.data.step === 'pending') {
        setProfileVerificationApprovalPendingNotification(true)
      }
    })
  }

  const handleUSDChange = (event) => {
    const usd = event.target.value
    const convertedKAX = usd / kaxaaIndex
    const Kax = utils.toMeaningfulFloatValue({ value: convertedKAX })
    setUsdInput(usd)
    setKaxInput(Kax)
  }

  const handleKAXChange = (event) => {
    const kax =  Math.ceil(event.target.value)
    const convertedUSD = kax * kaxaaIndex
    const usd = utils.toMeaningfulFloatValue({ value: convertedUSD })

    setKaxInput(kax.toString())
    setUsdInput(usd)
  }

  const mxConnectWidget = () => {
    const mxConnect = new window.MXConnect({
      id: 'connect-widget',
      iframeTitle: 'Connect',
      onEvent(type, payload) {
        if (type === 'mx/connect/memberConnected') {
          console.log(payload)
          handleMemberConnected(payload)
        }
      },
      config: { ui_message_version: 4 },
      targetOrigin: '*',
    })

    setMxConnectObj(mxConnect)
  }

  const handleMemberConnected = async (memberConnected) => {
    const res = await kasaHttpClient.post('/sila/link-account', {
      mxMemberId: memberConnected.member_guid,
    })
    await fetchLinkedAccounts();
    (document.getElementById('connect-widget') as HTMLElement).innerHTML = ''
    setAchSubview('redeem-kax')
  }

  const initMxConnect = async () => {
    const res = await kasaHttpClient.get('/sila/get-mx-user')
    setMxUserId(res.data.mxUserId)
    setMxConnectWidgetUrl(res.data.mxUrl.widget_url.url)
    setTimeout(() => {
      mxConnectWidget()
    }, 1000)
  }

  const handleAddBank = async () => {
    if (disableGetKaxButton()) {
      return
    }
    setAchSubview('mxconnect-widget')
    mxConnectObj.load(mxConnectWidgetUrl)
  }

  const handleDeleteBank = async (accountName: string) => {
    if (removeAccountName !== '') {
      return
    }
    setRemoveAccountName(accountName);

    (document.getElementById(`remove_account_${accountName}`) as HTMLElement).innerHTML = 'Removing...'
    await kasaHttpClient.post('/sila/unlink-account', {
      accountName,
    })
    fetchLinkedAccounts()
    setRemoveAccountName('')
  }

  const kaxaaBalance = getLocal('kaxa:balance') ?? 0
  const kaxaaIndex = getLocal('kaxa:index')
  const usdBalance = kaxaaBalance
    ? utils.toMeaningfulFloatValue({
      value: kaxaaBalance,
      rate: kaxaaIndex,
    })
    : 0

  const openAtomicMode = () => {
    if (exchangeSettings.atomicCurrency) {
      const { sell, buy } = exchangeSettings.atomicCurrency

      history.push(`${links.exchange}/${sell}-to-${buy}`)
    }

    updateSwapMode('atomic')
  }

  const openQuickMode = () => {
    if (exchangeSettings.quickCurrency) {
      const { sell, buy } = exchangeSettings.quickCurrency

      history.push(`${links.exchange}/quick/${sell}-to-${buy}`)
    } else {
      history.push(`${links.exchange}/quick`)
    }

    updateSwapMode('quick')
  }

  const updateSwapMode = (mode) => {
    setSwapMode(mode)
    const exchangeSettings = localStorage.getItem(constants.localStorage.exchangeSettings)

    exchangeSettings.swapMode = mode
    localStorage.setItem(constants.localStorage.exchangeSettings, exchangeSettings)
  }

  const fetchLinkedAccounts = async () => {
    const res = await kasaHttpClient.get('/sila/list-accounts')
    if (res.data.success === false) {
      return
    }
    setLinkedAccounts(res.data)
    console.log('list-accounts', res.data)
  }
  const disableGetKaxButton = () => {
    if (completeProfileNotification || applyProfileVerificationNotification || profileVerificationApprovalPendingNotification) {
      return true
    }

    return false
  }

  const handleContinueBankTransfer = async () => {
    if (disableGetKaxButton()) {
      return
    }
    const radios = document.querySelectorAll('input[type="radio"][name="accountName"]')
    let selectedAccountName

    radios.forEach((radio: HTMLInputElement) => {
      if (radio.checked) {
        selectedAccountName = radio.value
      }
    })

    if (pending) {
      return
    }

    if (!kaxInput) {
      alert('Please enter amount')
      return
    }

    setPending(true)
    const res = await kasaHttpClient.post('/sila/redeem-sila', {
      amount: parseFloat(kaxInput),
      accountName: selectedAccountName,
    })
    setPending(false)

    alert(res.data.message)

    window.location.href = '#/'
  }

  return (
    <div style={{ marginTop:'20px' }}>

      {
        !window.location.href.includes('exchange/quick') && swapMode === 'ach' && (
          <div className="page-tile--holder">
            <h3>Buy Kaxaa with ACH</h3>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="/#/sell-kax">Withdraw KAXAA</a>
              </li>
              <li>
                Sell KAXAA with ACH
              </li>
            </ul>
          </div>
        )
      }

      {
        !window.location.href.includes('exchange/quick') && swapMode === 'atomic' && (
          <div className="page-tile--holder">
            <h3>Sell Kaxaa with Rango Exchange</h3>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="/#/sell-kax">Withdraw KAXAA</a>
              </li>
              <li>
                Sell Kaxaa with Rango Exchange
              </li>
            </ul>
          </div>
        )
      }

      {/* {!showOnlyOneType && ( */}
      {/*  <div styleName="tabsWrapper"> */}
      {/*    <button */}
      {/*      type="button" */}
      {/*      styleName={`tab ${swapMode === 'quick' ? 'active' : ''}`} */}
      {/*      onClick={openQuickMode} */}
      {/*    > */}
      {/*      <FormattedMessage id="quickSwap" defaultMessage="QuickSwap" /> */}
      {/*    </button> */}
      {/*    <button */}
      {/*      type="button" */}
      {/*      styleName={`tab ${swapMode === 'atomic' ? 'active' : ''}`} */}
      {/*      onClick={openAtomicMode} */}
      {/*    > */}
      {/*      Rango Chain Swap */}
      {/*    </button> */}
      {/*    <button */}
      {/*      type="button" */}
      {/*      styleName={`tab ${swapMode === 'ach' ? 'active' : ''}`} */}
      {/*      onClick={() => setSwapMode('ach')} */}
      {/*    > */}
      {/*      <FormattedMessage id="ach" defaultMessage="ACH" /> */}
      {/*    </button> */}
      {/*  </div> */}
      {/* )} */}

      {
        window.location.href.includes('exchange/quick')
          && (
            <div styleName="tabsWrapper">
              <button
                type="button"
                styleName={`tab ${swapMode === 'quick' ? 'active' : ''}`}
                onClick={openQuickMode}
              >
                <FormattedMessage id="quickSwap" defaultMessage="QuickSwap" />
              </button>
              <button
                type="button"
                styleName={`tab ${swapMode === 'rango-exchange' ? 'active' : ''}`}
                onClick={() => {
                  setSwapMode('rango-exchange')
                }}
              >
                Rango Chain Swap
              </button>
            </div>
          )
      }

      {swapMode === 'quick' && !noNetworks && (
        <div styleName="container">
          {/* pass props from this component into the components
        because there has to be "url" props like match, location, etc.
        but this props are only in the Router children */}
          <QuickSwap {...props} />
        </div>
      )}

      {/* {swapMode === 'atomic' && <AtomicSwap {...props} />} */}
      {swapMode === 'atomic' && <RangoExchange {...props} />}

      {
        swapMode === 'rango-exchange' && (
          <div styleName="page_center">
            <div className="kaxaa-balance--convert-info">
              <div>
                If you encounter any problems while swapping your crypto, you can
                {' '}
                <a href="#">Contact</a>
                {' '}
                our support team.
              </div>
            </div>

            <IframeLoader
              src={`https://ewallet.kaxaa.com/rango-widget/index.html?widgetType=exchange&address=${walletStore.user.maticData.address}`}
              width="600"
              height="800"
              title="Rango Exchange"
            />
          </div>

        )
      }

      {swapMode === 'ach' && achSubview === 'redeem-kax'
        && (
          <div styleName="page_center">

            {completeProfileNotification
            && (
              <div className="alert alert--info">
                <div>
                  <img src={Warning} />
                </div>
                <div className="alert-text">
                  Complete your profile to enable ACH from any USA bank. &nbsp;
                  <a href="/#/kyc">Complete Your Profile</a>
                </div>
              </div>
            )}

            {applyProfileVerificationNotification
            && (
              <div className="alert alert--info">
                <div>
                  <img src={Warning} />
                </div>
                <div className="alert-text">
                  Submit your profile for verification to enable ACH from any USA bank.  &nbsp;
                  <a href="/#/kyc">Go to Profile</a>
                </div>
              </div>
            )}

            {profileVerificationApprovalPendingNotification
            && (
              <div className="alert alert--info">
                <div>
                  <img src={Warning} />
                </div>
                <div className="alert-text">
                  We have received your profile for verification. We will notify you once your profile is approved.
                </div>
              </div>
            )}

            <div styleName="starter-modal__container-content">
              <div styleName="kax_token">
                Redeem
                <strong styleName="brand_color"> KAXAA TOKEN</strong>
                <span styleName="brand_color"> KAX</span>
              </div>
              <div styleName="w-100">
                <div styleName="kax_token_val">
                  <div>
                    <input
                      type="number"
                      placeholder="0"
                      value={kaxInput}
                      onChange={handleKAXChange}
                    />
                    KAX
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="0"
                      value={usdInput}
                      disabled
                    />
                    $
                  </div>
                </div>

                <ul styleName="kax-token-stats">
                  <li>
                    <div styleName="kax-token_list">
                      <div styleName="flex_between">
                        <div styleName="flex">
                          <img width="40px" src={Token} alt="kax" />
                          <strong>KAX</strong>
                          Balance
                        </div>
                        <div styleName="stat-amount">{kaxaaBalance}</div>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div styleName="kax-token_list">
                      <div styleName="flex_between">
                        <div styleName="flex">
                          <img width="40px" src={USD} alt="usd" />
                          USD Balance
                        </div>
                        <div styleName="stat-amount">{usdBalance}</div>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div styleName="kax-token_list">
                      <div styleName="flex_between">
                        <div styleName="flex">
                          <div className="btn-icon" style={{ background: '#ffc107' }}>
                            <img width="20px" src={Bank} alt="usd" />
                          </div>
                          Add Bank Account
                        </div>
                        <div>
                          <button onClick={handleAddBank} type="button" className="starter-modal__btn btn-flex btn-sm">
                            Add
                            {' '}
                            <img style={{ width: '22px' }} src={Plus} alt=">" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>

                  {
                    linkedAccounts.map((account, index) => (
                      <li className="account-added">
                        <div styleName="kax-token_list">
                          <div styleName="flex_between">
                            <div styleName="flex">
                              <div className="custom-radio">
                                <input name="accountName" value={account.account_name} type="radio" defaultChecked={index == 0} />
                                <span />
                              </div>
                              <div className="btn-icon">
                                <img width="30px" src={Bank} alt="usd" />
                              </div>
                              <div className="info">
                                <div styleName="flex">
                                  <h4 style={{ color: '#000' }}>{account.account_owner_name}</h4>
                                  {/* <span className="badge bg-primary">Default</span> */}
                                </div>
                                <span>
                                  XXXX XXXX XXXX
                                  {account.account_number.substring(1)}
                                </span>
                              </div>
                            </div>
                            <div className="flex">
                              <button
                                id={`remove_account_${account.account_name}`}
                                onClick={() => {
                                  handleDeleteBank(account.account_name)
                                }}
                                type="button"
                                className="btn btn-border-danger">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  }

                  <li
                    style={{ cursor: 'pointer', display: 'none' }}
                    styleName="select_payemnt_type"
                  >
                    <div styleName="kax-token_list">
                      <div styleName="flex_between">
                        <div styleName="flex">
                          <img width="35px" src={Card} alt="card" />
                          value
                        </div>
                        <img styleName="arrow_img" src={RightArrow} alt=">" />
                      </div>
                    </div>
                  </li>
                </ul>

                <div styleName="token_btn">
                  <button
                    onClick={handleContinueBankTransfer}
                    styleName={(pending || disableGetKaxButton()) ? 'starter-modal__btn_grey' : 'starter-modal__btn'}
                  >
                    {pending ? 'Processing...' : 'Redeem'}
                  </button>
                </div>
              </div>
            </div>

            <NavLink exact to={links.home}>
              <div styleName="pig_link">
                <span>Go to</span>
                <img src={Pig} alt="home" />
              </div>
            </NavLink>

          </div>
        )}

      <div id="connect-widget" />

    </div>
  )
}

export default CSSModules(Exchange, styles, { allowMultiple: true })
