/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from 'react'

import CSSModules from 'react-css-modules'
import { connect } from 'redaction'

import { Link, NavLink, withRouter } from 'react-router-dom'
import {links, utils, user, constants} from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { FormattedMessage, useIntl } from 'react-intl'

// custom
import { getLocal } from '@walletconnect/utils'
import actions from 'redux/actions'
import kasaHttpClient from 'shared/helpers/kasaHttpClient'
import scriptImport from 'shared/components/ScriptImport/ScriptImport'
// import { Widget } from '@rango-dev/widget-embedded'
import config from 'app-config'
import store from 'redux/store'
import QuickSwap from 'pages/Exchange/QuickSwap'
import IframeLoader from 'components/ui/IframeLoader/IframeLoader'
import styles from './GetKax.scss'

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

import PlaidLink from './images/plaid-link.png'

function GetKax(props) {

  scriptImport('https://atrium.mx.com/connect.js')
  const walletStore = store.getState()
  const [view, setView] = useState('get-kax')
  const [PaymentMethod, setPaymentMethod] = useState(false)
  const [SelectedVal, SetSelectedVal] = useState('Credit Card') // preselect and hide the other options
  const [mxUserId, setMxUserId] = useState('')
  const [mxConnectWidgetUrl, setMxConnectWidgetUrl] = useState('')
  const initLinkedAccounts: Array<any> = []
  const [linkedAccounts, setLinkedAccounts] = useState(initLinkedAccounts)
  const [kaxInput, setKaxInput] = useState('')
  const [usdInput, setUsdInput] = useState('')
  const [pending, setPending] = useState(false)
  const [removeAccountName, setRemoveAccountName] = useState('')
  const [profileVerificationApprovalPendingNotification, setProfileVerificationApprovalPendingNotification] = useState(false)
  const [applyProfileVerificationNotification, setApplyProfileVerificationNotification] = useState(false)
  const [completeProfileNotification, setCompleteProfileNotification] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [tab, setTab] = useState('quickSwap')

  const [mxConnectObj, setMxConnectObj] = useState({
    load: (url: string) => {
      console.log('empty', url)
    },
  })

  const kaxaaBalance = getLocal('kaxa:balance') ?? 0
  const kaxaaIndex = getLocal('kaxa:index')
  const usdBalance = kaxaaBalance
    ? utils.toMeaningfulFloatValue({
      value: kaxaaBalance,
      rate: kaxaaIndex,
    })
    : 0

  let externalExchangeReference: Window | null = null
  let externalWindowTimer: ReturnType<typeof setTimeout> | null = null

  const { match: { params: { paymentType } } } = props

  const { locale } = useIntl()

  const once = true
  useEffect(() => {
    switch (paymentType) {
      case 'ach':
        setTab('fiat')
        break
      case 'rango':
        setTab('swap')
        break
      case 'quickSwap':
        setTab('quickSwap')
        break
      default:
        setTab('fiat')
    }

    if (paymentType === 'fiat') {
      profileVerificationStatusCheck()
      initMxConnect()
      fetchLinkedAccounts()
    }

      fetchBankAccounts()
  }, [once])

    const fetchBankAccounts = async () => {
      kasaHttpClient.get('/user/get-bank-accounts')
        .then((res) => {
          console.log(res.data)
          setAccounts(res.data.accounts)
        })
    }

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

  const fetchLinkedAccounts = async () => {
    const res = await kasaHttpClient.get('/sila/list-accounts')

    if (res.data.success === false) {
      return
    }
    setLinkedAccounts(res.data)
  }

  const handleMemberConnected = async (memberConnected) => {
    const res = await kasaHttpClient.post('/sila/link-account', {
      mxMemberId: memberConnected.member_guid,
    })
    await fetchLinkedAccounts()
    setView('get-kax')
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
      window.location.href = '/#/kyc'
      return
    }
    const res = await kasaHttpClient.get('/user/kyc-token')
    elementClient.run(res.data.token);
    setView('widget')
    mxConnectObj.load(mxConnectWidgetUrl)
  }
  const EJS = window.FortressElementsJS;
  const elementClient = EJS.createElementClient({
    elementName: EJS.ElementNames.KYC,
    onMessage: async (message) => {
      console.log(message)
      if(message?.payload?.status == "success"){
        var mxConnect = new window.MXConnect({
          id: "connect-widget", 
          iframeTitle: "Connect",
          onEvent: async function(type, payload) {
            console.log(type)
            if(type === "mx/connect/memberConnected") {
              const res = await kasaHttpClient.post('/user/mx-connect', {
                token: payload.member_guid
                })
              console.log(payload)
              console.log(res)
            }
          },
          config: {
            mode: "verification",
            color_scheme: "light",
            ui_message_version: 4
          },
          targetOrigin: "*"
      })
        const res = await kasaHttpClient.get('/user/mx-url')
        mxConnect.load(res.data.url.widgetUrl);
      }
    },
    theme: { primaryColor: '#a8c416', secondaryColor: '#CCC' },
    uiLabels: {
      statusScreenButton: "Continue",
    },
  });


  const handleUSDChange = (event) => {
    const usd = Math.ceil(event.target.value)

    const convertedKAX = usd / kaxaaIndex
    const Kax = utils.toMeaningfulFloatValue({ value: convertedKAX })
    setUsdInput(usd.toString())
    setKaxInput(Kax)
  }

  const handleKAXChange = (event) => {
    const kax = event.target.value
    const convertedUSD = kax * kaxaaIndex
    const usd = utils.toMeaningfulFloatValue({ value: convertedUSD })

    setKaxInput(kax)
    setUsdInput(usd)
  }

  const handleContinueBankTransfer = async () => {
    if (disableGetKaxButton()) {
      alert('Please complete your profile verification to conitnue.')
      window.location.href = '/#/kyc'
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

    if (!usdInput) {
      alert('Please enter amount')
      return
    }

    setPending(true)
    const res = await kasaHttpClient.post('/sila/issue-sila', {
      amount: parseFloat(usdInput),
      accountName: selectedAccountName
      ,
    })
    setPending(false)

    alert(res.data.message)

    window.location.href = '#/'
  }

  const handleContinuetoCC = () => {
    const walletAddress = actions.core.getWallet({ currency: 'KAXAA' })?.address
    const link = user.getExternalExchangeLink({
      address: walletAddress,
      currency: 'KAXAA',
    })
    console.log('link', link)
    if (link && (externalExchangeReference === null || externalExchangeReference.closed)) {
      setPending(true)
      const newWindowProxy = window.open(link)
      console.log('newWindowProxy', newWindowProxy)
      externalExchangeReference = newWindowProxy

      console.log('after set', externalExchangeReference)
      startCheckingExternalWindow()
    } else {
      // in this case window reference must exist and the window is not closed
      externalExchangeReference?.focus()
    }
  }
  const startCheckingExternalWindow = () => {
    const timer = setInterval(() => {
      console.log('checking external window', externalExchangeReference)
      if (externalExchangeReference?.closed) {
        closeExternalExchange()
      }
    }, 1000)

    externalWindowTimer = timer
    // setExternalWindowTimer(timer);
  }

  const closeExternalExchange = () => {
    if (externalExchangeReference) {
      externalExchangeReference?.close()
      externalExchangeReference = null
    }

    console.log('externalWindowTimer', externalWindowTimer)
    if (externalWindowTimer) {
      clearInterval(externalWindowTimer)
      externalWindowTimer = null
      // setExternalWindowTimer(null);
    }

    setPending(false)
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

  const disableGetKaxButton = () => {
    if (completeProfileNotification || applyProfileVerificationNotification || profileVerificationApprovalPendingNotification) {
      return true
    }

    return false
  }

  const renderTabs = () => (
    <div styleName="tabsWrapper">

      <button
        type="button"
        className={`tab ${tab === 'quickSwap' ? 'active' : ''}`}
        onClick={() => {
          setTab('quickSwap')
        }}
      >
        Quick Swap
      </button>
      <button
        type="button"
        className={`tab ${tab === 'swap' ? 'active' : ''}`}
        onClick={() => {
          setTab('swap')
        }}
      >
        Rango Chain Swap
        {' '}
      </button>

      <button
        type="button"
        className={`tab ${tab === 'fiat' ? 'active' : ''}`}
        onClick={() => {
          setTab('fiat')
        }}
      >
        ACH
      </button>
    </div>
  )

  return (
    <div styleName="w-100" style={{ marginTop: '20px' }}>
      {/* {renderTabs()} */}
      <div styleName="page_center">

        {
          tab === 'fiat' && (
            <div className="page-tile--holder">
              <h3>Buy Kaxaa with ACH</h3>
              <ul>
                <li>
                  <a href="#">Home</a>
                </li>
                <li>
                  <a href="/#/buy-kax">Get KAXAA</a>
                </li>
                <li>
                  Buy KAXAA with ACH
                </li>
              </ul>
            </div>
          )
        }

        {
          tab === 'swap' && (
            <div className="page-tile--holder">
              <h3>Buy Kaxaa with Rango Exchange</h3>
              <ul>
                <li>
                  <a href="#">Home</a>
                </li>
                <li>
                  <a href="/#/buy-kax">Get KAXAA</a>
                </li>
                <li>
                  Buy Kaxaa with Rango Exchange
                </li>
              </ul>
            </div>
          )
        }

        {tab === 'quickSwap'
            && (
              <div styleName="w-100">
                <div styleName="page_center">
                  <QuickSwap {...props} />
                </div>
              </div>
            )}

        {tab === 'fiat'
            && (
              <div styleName="w-100">
                {view === 'info'
                          && (
                            <div styleName="page_center">
                              <div styleName="starter-modal__container-content">
                                <div className="bank-account-info">
                                  <div className="title">Bank Account</div>
                                  <div className="sub-title">Free</div>
                                  <p>
                                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                                    We've partnered with a services called plaid to safely connect to your bank accounts.
                                  </p>
                                  <p>Plaid is not authorized to save or share and of your external account information</p>
                                  <div className="button-holder">
                                    <button styleName="starter-modal__btn" onClick={() => setView('get-kax')}>Securely Connect</button>
                                  </div>
                                  <span>Secure and safe. We take your financial protection seriously</span>
                                </div>
                              </div>
                            </div>
                          )}

                {view === 'get-kax' && (
                  <div styleName="page_center">

                    {completeProfileNotification
                                && (
                                  <div className="alert alert--info">
                                    <div>
                                      <img src={Warning} />
                                    </div>
                                    <div className="alert-text">
                                      Complete your profile to enable ACH from any USA bank.
                                      {' '}
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
                                      Submit your profile for verification to enable ACH from any USA bank.
                                      {' '}
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
                        Get
                        <strong styleName="brand_color"> KAXAA TOKEN</strong>
                        <span styleName="brand_color"> KAX</span>
                      </div>
                      <div styleName="w-100">
                        <div styleName="kax_token_val">
                          <div>
                            <input
                              type="text"
                              pattern="[0-9]*"
                              value={usdInput}
                              placeholder="0"
                              onChange={handleUSDChange}
                            />
                            $
                          </div>
                          <div>
                            <input
                              type="number"
                              value={kaxInput}
                              placeholder="0"
                              disabled
                            />
                            KAX
                          </div>
                        </div>

                        {/* <div style={{ textAlign: 'center' }}>
              <div styleName='one-time-purchase'><img src={Refresh} /> One-time purchase</div>
            </div> */}

                        <ul styleName="kax-token-stats">
                          <li>
                            <div styleName="kax-token_list">
                              <div styleName="flex_between">
                                <div styleName="flex">
                                  <img width="40px" src={Token} alt="kax" />
                                  <strong style={{ color: '#000' }}>KAX</strong>
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
                        {
                          accounts?.map((account:any) => (
                           <li key={account.accountGuid}>
                            <div styleName="kax-token_list">
                              <div styleName="flex_between">
                                <div styleName="flex">
                                  <img width="40px" src={USD} alt="usd" />
                                  {account.name}
                                </div>
                                <div styleName="stat-amount">{account.accountNumberLast4}</div>
                              </div>
                            </div>
                          </li>                            
                          ))
                        }
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
                                  <button type="button" onClick={handleAddBank} className="starter-modal__btn btn-flex btn-sm">
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
                                        <img width="30px" src={account.smallLogoUrl} alt="usd" />
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
                            styleName={`${PaymentMethod ? 'select_payemnt_type' : ''}`}
                            onClick={() => setPaymentMethod(!PaymentMethod)}
                          >
                            <div styleName="kax-token_list">
                              <div styleName="flex_between">
                                <div styleName="flex">
                                  <img width="35px" src={Card} alt="card" />
                                  {SelectedVal}
                                </div>
                                <img styleName="arrow_img" src={RightArrow} alt=">" />
                              </div>
                            </div>
                          </li>
                        </ul>

                        <div styleName={`${PaymentMethod ? 'show-method' : 'hide-method'}`}>
                          <div styleName="token_payemt_types">
                            <div styleName="card_head">Choose a payment method</div>
                            <ul>
                              <li
                                onClick={() => {
                                  // eslint-disable-next-line no-unused-expressions
                                  SetSelectedVal('Bank Transfer'), setPaymentMethod(false)
                                }}
                              >
                                <div styleName="grid-item">
                                  <strong>Bank Transfer</strong>
                                  <span>Make An ACH transfer</span>
                                </div>
                                {/* <img styleName="arrow_img" src={RightArrow} /> */}
                              </li>
                              <li
                                onClick={() => {
                                  // eslint-disable-next-line no-unused-expressions
                                  SetSelectedVal('Debit Card'), setPaymentMethod(false)
                                }}
                              >
                                <div styleName="grid-item">
                                  <strong>Debit Card</strong>
                                  <span>Connect your card</span>
                                </div>
                                {/* <img styleName="arrow_img" src={RightArrow} /> */}
                              </li>
                              <li
                                onClick={() => {
                                  // eslint-disable-next-line no-unused-expressions
                                  SetSelectedVal('Domestic Card'), setPaymentMethod(false)
                                }}
                              >
                                <div styleName="grid-item">
                                  <strong>Domestic Card</strong>
                                  <span>
                                    Better for large sun withdrawals within
                                    {' '}
                                    <br />
                                    {' '}
                                    the US. Wire fees apply
                                  </span>
                                </div>
                                {/* <img styleName="arrow_img" src={RightArrow} /> */}
                              </li>
                              <li
                                onClick={() => {
                                  // eslint-disable-next-line no-unused-expressions
                                  SetSelectedVal('Credit Card'), setPaymentMethod(false)
                                }}
                              >
                                <div styleName="grid-item">
                                  <strong>Credit Card</strong>
                                  <span>Process of major cards</span>
                                </div>
                                {/* <img styleName="arrow_img" src={RightArrow} /> */}
                              </li>
                              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                              <li
                                onClick={() => {
                                  // eslint-disable-next-line no-unused-expressions
                                  SetSelectedVal('Transfer Crypto'), setPaymentMethod(false)
                                }}
                              >
                                <div styleName="grid-item">
                                  <strong>Transfer Crypto</strong>
                                  <span>Convert other crypto tokens of KAX</span>
                                </div>
                                {/* <img styleName="arrow_img" src={RightArrow} /> */}
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div styleName="token_btn">
                          {/* eslint-disable-next-line react/button-has-type */}
                          <button
                            onClick={handleContinueBankTransfer}
                            styleName={(pending || disableGetKaxButton()) ? 'starter-modal__btn_grey' : 'starter-modal__btn'}
                          >
                            {pending ? 'Processing..' : 'Get KAX'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div id="connect-widget" />
              </div>
            )}

        {tab === 'swap' && (
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

            {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
            <IframeLoader
              src={`https://ewallet.kaxaa.com/rango-widget/index.html?widgetType=buy-kax&address=${walletStore.user.maticData.address}`}
              width="600"
              height="800"
            />
          </div>

        )}
      </div>
    </div>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(GetKax, styles)))
