import { withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import { connect } from 'redaction'

import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { useIntl } from 'react-intl'
import BankIcon from 'pages/KAX/BuyIntro/images/bank.svg'
import RangoIcon from 'pages/KAX/BuyIntro/images/rango.png'
import React, {useEffect} from 'react'
import QuickSwapIcon from 'pages/KAX/BuyIntro/images/qswap.png'
import styles from './SellIntro.scss'
import actions from "redux/actions";

function SellIntro(props) {
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
                <h3>Sell Kaxaa and get USD in your bank account </h3>
              </div>
            </div>
            <div className="buy-intro__content">
              <p>
                We are excited to offer a unique feature that allows our valued users to effortlessly sell their KAXAA tokens back to us.
                We understand that liquidity is essential, and we want to provide a seamless experience for our community members.
              </p>
              <p>
                Discover our seamless KAXAA Token Buyback Program, allowing you to effortlessly sell your tokens for competitive rates, receive equivalent USD deposits, and benefit from reliable support.
              </p>
              <i>
                <strong>NOTE:</strong>
                {' '}
                This option is only available for US residents.
              </i>
            </div>
          </div>
          <div className="text-left">
            <a href={`/#${links.withdraw}/ach`} className="btn btn-primary"> Click Here    </a>
          </div>

        </div>

        <div className="buy-intro">
          <div>
            <div className="d-flex align-items-center title-head">
              <img className="fixed-icon" src={RangoIcon} alt="" />
              <div className="buy-intro__title">
                <h1>Rango Chain Swap</h1>
                <h3>Exchange KAXAA to any cryptocurrency </h3>
              </div>
            </div>
            <div className="buy-intro__content">
              <p>
                If you want to exchange your KAXAA tokens to any other cryptocurrency, you can do it easily using our Rango Chain Swap feature.
              </p>
            </div>
          </div>
          <div className="text-left">
            <a href={`/#${links.withdraw}/rango`} className="btn btn-primary"> Click Here    </a>
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
            <a href={`/#${links.withdraw}/quick`} className="btn btn-primary"> Click Here </a>
          </div>

        </div>
        <div style={{ visibility: 'hidden' }} className="buy-intro">
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
            <a href={`/#${links.withdraw}/quick`} className="btn btn-primary"> Click Here </a>
          </div>

        </div>
      </div>
    </>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(SellIntro, styles)))
