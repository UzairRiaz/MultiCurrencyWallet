import React, {useEffect} from 'react'
import { withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import { connect } from 'redaction'

import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { useIntl } from 'react-intl'
import styles from './BuyIntro.scss'

import ArrowDown from './images/arrow-down.svg'
import BankIcon from './images/bank.svg'
import RangoIcon from './images/rango.png'
import QuickSwapIcon from './images/qswap.png'
import actions from "redux/actions";

function BuyIntro(props) {
  const { locale } = useIntl()

  useEffect(() => {
    actions.modals.closeAll()
  })

  return (
    <>
      <div className="buy-intro--holder">
        <div className="buy-intro">
          <div>
            <div className="d-flex align-items-center title-head">
              <img className="fixed-icon" src={BankIcon} alt="" />
              <div className="buy-intro__title">
                <h1>ACH</h1>
                <h3>Buy KAXAA with ACH</h3>
              </div>
            </div>
            <div className="buy-intro__content">
              <p>
                It gives you ability to purchase KAX tokens directly using your regular bank account.
                By linking your bank account to our wallet, you can easily and securely transfer funds from your account to our platform,
                and equivalent KAXAA will be deposited to your wallet.
              </p>
              <p>
                This option is great for users who want to invest in KAXAA without going through hassle of using separate exchanges
              </p>
              <i>
                <strong>NOTE:</strong>
                {' '}
                This option is only available for US residents.
              </i>
            </div>
          </div>
          <div className="text-left">
            <a href={`/#${links.getKax}/ach`} className="btn btn-primary"> Click Here    </a>
          </div>

        </div>

        <div className="buy-intro">
          <div>
            <div className="d-flex align-items-center title-head">
              <img className="fixed-icon" src={RangoIcon} alt="" />
              <div className="buy-intro__title">
                <h1>Rango Chain Swap</h1>
                <h3>Exchange any cryptocurrency you own to KAXAA</h3>
              </div>
            </div>
            <div className="buy-intro__content">
              <p>
                This allows you to transfer or exchange any cryptocurrencies you already have in your external wallet to KAXAA.
              </p>
            </div>
          </div>
          <div className="text-left">
            <a href={`/#${links.getKax}/rango`} className="btn btn-primary"> Click Here    </a>
          </div>

        </div>
      </div>

      <div className="buy-intro--holder">

        <div className="buy-intro">
          <div>
            <div className="d-flex align-items-center title-head">
              <img className="fixed-icon" src={QuickSwapIcon} alt="" />
              <div className="buy-intro__title">
                <h1>QuickSwap</h1>
                <h3>Exchange USDC, MATIC and KAXAA with minimum fee.</h3>
              </div>
            </div>
            <div className="buy-intro__content">
              <p>
                If you already own USDC, MATIC or KAXAA in your KAXAA wallet, you can exchange them with each other using QuickSwap.
              </p>
            </div>
          </div>
          <div className="text-left">
            <a href={`/#${links.getKax}/quickSwap`} className="btn btn-primary"> Click Here    </a>
          </div>

        </div>

        <div style={{ visibility: 'hidden'}} className="buy-intro">
          <div>
            <div className="d-flex align-items-center title-head">
              <img className="fixed-icon" src={QuickSwapIcon} alt="" />
              <div className="buy-intro__title">
                <h1>QuickSwap</h1>
                <h3>Exchange USDC, MATIC and KAXAA with minimum fee.</h3>
              </div>
            </div>
            <div className="buy-intro__content">
              <p>
                If you already own USDC, MATIC or KAXAA in your KAXAA wallet, you can exchange them with each other using QuickSwap.
              </p>
            </div>
          </div>
          <div className="text-left">
            <a href={`/#${links.getKax}/quickSwap`} className="btn btn-primary"> Click Here    </a>
          </div>

        </div>

      </div>
    </>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(BuyIntro, styles)))
