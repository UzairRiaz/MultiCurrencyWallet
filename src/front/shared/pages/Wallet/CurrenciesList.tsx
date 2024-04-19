import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'
import {
  constants,
  metamask,
  externalConfig as exConfig,
} from 'helpers'
import actions from 'redux/actions'

import Button from 'components/controls/Button/Button'
import Tooltip from 'shared/components/ui/Tooltip/Tooltip'
import Table from 'components/tables/Table/Table'
import ConnectWalletModal from 'components/modals/ConnectWalletModal/ConnectWalletModal'
// import Slider from './WallerSlider'
import { useEffect, useState } from 'react'
import Row from './Row/Row'
import styles from './Wallet.scss'

const addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = config?.opts?.addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase
const noInternalWallet = config?.opts?.ui?.disableInternalWallet
// const isWidgetBuild = config && config.isWidget

type CurrenciesListProps = {
  subHeading: string
  multisigPendingCount: number
  goToСreateWallet: () => void
  hiddenCoinsList: string[]
  tableRows: IUniversalObj[]
}

function CurrenciesList(props: CurrenciesListProps) {

  const [availableKaxaa, setAvailableKaxaa] = useState(null)

  const once = true

  useEffect(() => {
    actions.erc20matic.getAvailableBalance('kaxaa').then((balance) => {
      setAvailableKaxaa(balance)
    })
  }, [once])

  const {
    tableRows,
    goToСreateWallet,
    multisigPendingCount,
  } = props

  const openAddCustomTokenModal = () => {
    actions.modals.open(constants.modals.AddCustomToken)
  }

  const handleRestoreMnemonic = () => {
    actions.modals.open(constants.modals.RestoryMnemonicWallet)
  }

  const showAssets = !(config?.opts?.ui?.disableInternalWallet)
    ? true
    : !!(metamask.isConnected())

  return (
    <div styleName="yourAssets">
      {showAssets && (
        <>
          {/* {(exConfig && exConfig.opts && exConfig.opts.showWalletBanners) || isWidgetBuild ? (
            <Slider multisigPendingCount={multisigPendingCount} />
          ) : (
            ''
          )} */}
          <h3 styleName="yourAssetsHeading">
            <small>
              <FormattedMessage id="YourAssets" defaultMessage="Your assets" />
              :
            </small>
            {' '}
            {props.subHeading}
          </h3>
          <div styleName="yourAssetsDescr">
            <FormattedMessage
              id="YourAssetsDescription"
              defaultMessage="Here you can safely store, send and receive assets"
            />
          </div>

          <Table
            className={`${styles.walletTable} data-tut-address`}
            rows={tableRows.filter((item) => true, // ['KAXAA', 'MATIC', 'USDC'].includes(item.currency)
            ).sort((a, b) => a.fullName.localeCompare(b.fullName))}
            rowRender={(row, index) => (
              <Row
                key={index}
                currency={row}
                itemData={{ ...row, ...{ availableKaxaa } }}
              />
            )}
          />
          <div styleName="addCurrencyBtnWrapper">
            {/* add custom token */}
            {/* <Button id="addCustomTokenBtn" onClick={openAddCustomTokenModal} transparent fullWidth> */}
            {/*  <FormattedMessage id="addCustomToken" defaultMessage="Add custom token" /> */}
            {/* </Button> */}
            {addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase && !noInternalWallet && (
              <Button onClick={handleRestoreMnemonic} small link>
                <FormattedMessage id="ImportKeys_RestoreMnemonic" defaultMessage="Restore from 12-word seed" />
                &nbsp;
                <Tooltip id="ImportKeys_RestoreMnemonic_tooltip">
                  <span>
                    <FormattedMessage
                      id="ImportKeys_RestoreMnemonic_Tooltip"
                      defaultMessage="12-word backup phrase"
                    />
                    <br />
                    <br />
                    <div styleName="alertTooltipWrapper">
                      <FormattedMessage
                        id="ImportKeys_RestoreMnemonic_Tooltip_withBalance"
                        defaultMessage="Please, be causious!"
                      />
                    </div>
                  </span>
                </Tooltip>
              </Button>
            )}
            {/* {!addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase && (
              <Button id="addAssetBtn" onClick={goToСreateWallet} transparent fullWidth>
                <FormattedMessage id="addAsset" defaultMessage="Add currency" />
              </Button>
            )} */}
          </div>
        </>
      )}
      {!showAssets && !metamask.isConnected() && (
        <ConnectWalletModal noCloseButton />
      )}
    </div>
  )
}

export default CSSModules(CurrenciesList, styles, { allowMultiple: true })
