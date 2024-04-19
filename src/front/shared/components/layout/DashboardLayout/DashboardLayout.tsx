import React, { ReactNode, useEffect, useState } from 'react'
import cssModules from 'react-css-modules'
import { isMobile } from 'react-device-detect'
import cx from 'classnames'
import FAQ from 'components/FAQ/FAQ'
import { ModalConductorProvider } from 'components/modal'
import store from 'redux/store'
import actions from 'redux/actions'
import styles from './styles.scss'

type ComponentProps = {
  page: 'history' | 'invoices'
  children?: ReactNode
  BalanceForm: ReactNode
}

function DashboardLayout(props: ComponentProps) {
  const { children, page } = props
  const { user } = store.getState()
  const balanceRef = React.useRef(null) // Create a ref object

  const once = true

  useEffect(() => {
    const aleadyShownMaticDisclaimer = localStorage.getItem('maticDisclaimer')

    if (!aleadyShownMaticDisclaimer && user.maticData?.balance < 0.01) {
      setMaticModal(true)
    }
  }, [once])
  let activeView = 0

  if (page === 'history' && !isMobile) {
    activeView = 1
  }
  if (page === 'invoices') activeView = 2

  const [maticModal, setMaticModal] = useState(false)

  return (
    <article className="data-tut-start-widget-tour">
      {window.CUSTOM_LOGO && <img className="cutomLogo" src={window.CUSTOM_LOGO} alt="logo" />}
      <section
        styleName={`wallet ${window.CUSTOM_LOGO ? 'hasCusomLogo' : ''}`}
      >
        <div className="data-tut-store" styleName="walletContent" ref={balanceRef}>
          <div styleName="walletBalance">
            {props.BalanceForm}
            {/*
            <div
              className={cx({
                [styles.desktopEnabledViewForFaq]: true,
                [styles.faqWrapper]: true,
              })}
            >
              <FAQ />
            </div> */}
          </div>
          <div
            styleName={cx({
              yourAssetsWrapper: activeView === 0,
              activity: activeView === 1 || activeView === 2,
              active: true,
            })}
          >
            <ModalConductorProvider>{children}</ModalConductorProvider>
          </div>
          {/* <div
            className={cx({
              [styles.mobileEnabledViewForFaq]: true,
              [styles.faqWrapper]: true,
            })}
          >
            <FAQ />
          </div> */}
        </div>
      </section>

      {maticModal
        && (
          <div className={`modal-custom matic-modal ${maticModal ? 'show-modal' : ''} `}>
            <div className="modal-content">
              <h2> Welcome to KAXAA - Your Gateway to the Crypto World! </h2>
              <div className="content">
                <div className="auto-fr">
                  <div className="icon">
                    {/* eslint-disable-next-line max-len */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" fill="none" viewBox="0 0 1024 1024" id="polygon-token">
                      <circle cx="512" cy="512" r="512" fill="#8247E5" />
                      <path fill="#fff" d="M681.469 402.456C669.189 395.312 653.224 395.312 639.716 402.456L543.928 457.228L478.842 492.949L383.055 547.721C370.774 554.865 354.81 554.865 341.301 547.721L265.162 504.856C252.882 497.712 244.286 484.614 244.286 470.325V385.786C244.286 371.498 251.654 358.4 265.162 351.256L340.073 309.581C352.353 302.437 368.318 302.437 381.827 309.581L456.737 351.256C469.018 358.4 477.614 371.498 477.614 385.786V440.558L542.7 403.646V348.874C542.7 334.586 535.332 321.488 521.824 314.344L383.055 235.758C370.774 228.614 354.81 228.614 341.301 235.758L200.076 314.344C186.567 321.488 179.199 334.586 179.199 348.874V507.237C179.199 521.525 186.567 534.623 200.076 541.767L341.301 620.353C353.582 627.498 369.546 627.498 383.055 620.353L478.842 566.772L543.928 529.86L639.716 476.279C651.996 469.135 667.961 469.135 681.469 476.279L756.38 517.953C768.66 525.098 777.257 538.195 777.257 552.484V637.023C777.257 651.312 769.888 664.409 756.38 671.553L681.469 714.419C669.189 721.563 653.224 721.563 639.716 714.419L564.805 672.744C552.525 665.6 543.928 652.502 543.928 638.214V583.442L478.842 620.353V675.125C478.842 689.414 486.21 702.512 499.719 709.656L640.944 788.242C653.224 795.386 669.189 795.386 682.697 788.242L823.922 709.656C836.203 702.512 844.799 689.414 844.799 675.125V516.763C844.799 502.474 837.431 489.377 823.922 482.232L681.469 402.456Z" />
                    </svg>
                  </div>
                  <div>
                    <p>
                      KAXAA is a revolutionary cryptocurrency that operates on the Polygon Chain, utilizing the MATIC token as its fee mechanism. The Polygon Chain is known for its high-speed and low-cost transactions, making KAXAA an efficient and cost-effective option for crypto enthusiasts.
                    </p>
                    <br />
                    <p>
                      Getting started with KAXAA is simple and user-friendly. To begin your journey, all you need to do is deposit some Matic tokens. These Matic tokens act as the fuel for your transactions on the KAXAA platform. By depositing Matic, you gain access to a world of exciting possibilities, from trading and investing to participating in various decentralized applications (dApps).
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <a className="btn btn" onClick={() => {
                  setMaticModal(false)
                  localStorage.setItem('maticDisclaimer', 'true')
                }}>Cancel</a>
                <a
                  className="btn btn-primary"
                  onClick={() => {
                    localStorage.setItem('maticDisclaimer', 'true')
                    setMaticModal(false)
                    window.location.href = `/#/token/{matic}matic/${user.maticData?.address}/receive`
                  }}>
                  Click Here
                </a>
              </div>
            </div>
          </div>
        )}

    </article>
  )
}

export default cssModules(DashboardLayout, styles, { allowMultiple: true })
