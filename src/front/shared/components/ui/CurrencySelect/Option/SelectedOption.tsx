import React from 'react'

import cssModules from 'react-css-modules'
import styles from './SelectedOption.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'
import config from 'app-config'


const SelectedOption = (props) => {
  let { icon, title, blockchain } = props

  return (
    <div styleName="selectedoptionrow">
      {(blockchain) ? `${title.replaceAll('*','')} (${blockchain})` : title}
        <span styleName="selected-option-circle">
        <CurrencyIcon styleName="selected-option-icon" name={icon} />
      </span>
    </div>
  )
}


export default cssModules(SelectedOption, styles)
