/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState } from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'redaction'

import { NavLink, withRouter } from 'react-router-dom'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { FormattedMessage, useIntl } from 'react-intl'

// thirdparty
import { useForm, Controller } from 'react-hook-form'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'
import ReactRecaptcha3 from 'react-google-recaptcha3'

// custom
import kasaHttpClient from 'helpers/kasaHttpClient'
import { getLocal, setLocal } from '@walletconnect/utils'
import styles from './Signin.scss'

// assets
import email from './images/email.svg'
import lock from './images/password.svg'
import eye from './images/eye.svg'
import eyeHide from './images/eye-password-hide.svg'

function Signin(props) {
  const {
    history,
    location,
  } = props

  const [loginType, setLoginType] = useState(true) // true > email & false > phone
  const [showPassword, setShowPassword] = useState(false) // eye - show password

  // Recaptcha error message
  const [backendErrorMessage, setBackendErrorMessage] = useState('')
  const [isLoginBtnDisable, setIsLoginBtnDisable] = useState(false)

  const { locale } = useIntl()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    ReactRecaptcha3.init('6LdGy3AkAAAAAC6N1PKqi6St0orkq1hpOz90JgTx')
  }, [])

  const redirectToRestoreWallet = () => {
    history.push(localisedUrl(locale, links.createWallet))
  }

  const onSubmit = handleSubmit(async (data) => {

    if (isLoginBtnDisable) {
      return
    }
    setIsLoginBtnDisable(true)

    const captchaToken = await ReactRecaptcha3.getToken()

    const postData = {
      username: data.email !== '' ? data.email : data.phone,
      password: data.password,
      captchaToken,
    }

    kasaHttpClient
      .post('auth/login', postData)
      .then((response) => {
        setLocal('kasa:user', response.data.profile.name)
        setLocal('kasa:token', response.data.accessToken)
        setCookieAfterLogin('kasa_wordpress_logged_in_', {
          user: response.data.profile.name,
          email: response.data.profile.email,
        })
        setIsLoginBtnDisable(false)
        redirectToRestoreWallet()
      })
      .catch((error) => {
        setIsLoginBtnDisable(false)
        if (error.response.data.statusCode === 401) {
          setBackendErrorMessage('Your provided credentials are invalid.')
        } else {
          setBackendErrorMessage(error.response.data.message[0])
        }

        setTimeout(() => {
          setBackendErrorMessage('')
        }, 6000)

      })
  })

  const goHome = () => {
    history.push(localisedUrl(locale, links.wallet))
  }

  const isLoggedIn = () => {
    const token = getLocal('kasa:token')

    if (token) {
      goHome()
    }
  }

  const setCookieAfterLogin = (name, data) => {
    const jsonData = JSON.stringify(data)
    const expires = 'expires=Thu, 01 Jan 2099 00:00:00 GMT'
    const domain = `.${window.location.hostname.split('.').reverse()[1]}.${
      window.location.hostname.split('.').reverse()[0]}`
    document.cookie = `${name}=${jsonData};${expires};domain=${domain};path=/`
  }

  isLoggedIn()

  return (
    <div styleName="w-100">
      <div styleName="starter-modal__container-content">
        <div>
          <h4 styleName="kaxaa-page---title">
            <FormattedMessage id="login" defaultMessage="Login" />
            <span styleName="text-brand"> Kaxaa Wallet </span>
          </h4>
          <div styleName="custom-from--wrapper">
            {backendErrorMessage
                  && (
                    <div style={{ color:'red', textAlign: 'center', marginBottom: '10px', fontSize: '15px' }}>
                      {backendErrorMessage}
                    </div>
                  )}
            <form onSubmit={onSubmit}>
              <div styleName="form-group">
                <label styleName="text-brand-hover" htmlFor="email-phone">
                  {loginType ? 'Email' : 'Phone'}
                  <span styleName="required-lable">*</span>
                </label>
                <div className="position-relative" id="email-phone">
                  {loginType ? (
                    <div styleName="icon-field-left">
                      <img styleName="icon-field" src={email} alt="email" />
                      <input
                        placeholder="Enter Your Email"
                        styleName={errors?.email && errors?.email.type && 'validation-error'}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        {...register('email', {
                          required: {
                            value: true,
                            message: 'Email is required',
                          },
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Entered value does not match email format',
                          },
                        })}
                      />
                      {errors?.email && errors?.email.type && (
                        <span styleName="required-lable">{errors.email.message}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <Controller
                        name="phone"
                        control={control}
                        rules={{
                          required: {
                            value: true,
                            message: 'Phone number is required',
                          },
                          validate: (value) => isValidPhoneNumber(value),
                        }}
                        render={({ field: { onChange, value } }) => (
                          <PhoneInput
                            international
                            placeholder="Enter phone number"
                            defaultCountry="US"
                            value={value}
                            flagUrl="https://flag.pk/flags/4x3/{xx}.svg"
                            flags={flags}
                            onChange={onChange}
                            className={errors.phone && errors.phone?.type && 'red-field'}
                          />
                        )}
                      />
                      {errors.phone && errors.phone?.type && (
                        <span styleName="required-lable">
                          {errors.phone && errors.phone?.type !== 'required'
                            ? 'Invalid Phone'
                            : errors.phone?.message}
                        </span>
                      )}
                    </>
                  )}

                  <span
                    styleName="select-login--type"
                    type="button"
                    onClick={() => setLoginType(!loginType)}
                  >
                    {!loginType ? 'Use Email' : 'Use Phone'}
                  </span>
                </div>
              </div>
              <div styleName="form-group">
                <div styleName="flex-between">
                  <label styleName="text-brand-hover" htmlFor="password">
                    {` Password`}
                    <span styleName="required-lable">*</span>
                  </label>
                  <NavLink
                    exact
                    to={`${links.forgotPassword}`}
                    className="forgot-link"
                  >
                    Forgot Password?
                  </NavLink>
                </div>
                <div styleName="icon-field-left">
                  <input
                    type={!showPassword ? 'password' : 'text'}
                    className={errors?.password && 'red-field'}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    {...register('password', { required: 'Password is required' })}
                    placeholder="Enter Your Password"
                  />
                  {errors.password && (
                    <span styleName="required-lable">{errors?.password.message}</span>
                  )}
                  <img styleName="icon-field" src={lock} alt="lock" />
                  <img
                    styleName="icon-field-right"
                    onClick={() => setShowPassword(!showPassword)}
                    src={!showPassword ? eye : eyeHide}
                    alt="show"
                  />
                </div>
              </div>
              <input className="w-100 starter-modal__btn" type="submit" value={isLoginBtnDisable ? 'LOGGING IN...' : 'LOGIN'} />
            </form>
          </div>
        </div>

        <div styleName="next-page--link">
          New to kaxaa wallet?
          {' '}
          <NavLink exact styleName="text-brand" to={links.signup}>
            Create an account
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(Signin, styles)))
