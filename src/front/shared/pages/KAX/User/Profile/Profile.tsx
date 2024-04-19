/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react'

import CSSModules from 'react-css-modules'
import { connect } from 'redaction'

import { Link, NavLink, withRouter } from 'react-router-dom'
import { links, utils } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { FormattedMessage, useIntl } from 'react-intl'

// custom
import { getLocal } from '@walletconnect/utils'
import styles from './Profile.scss'

// assets

function Profile(props) {

  return (
    <div styleName="w-100">
      Profile
    </div>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(Profile, styles)))
