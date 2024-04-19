/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState } from 'react'
import kasaHttpClient from 'helpers/kasaHttpClient'

import CSSModules from 'react-css-modules'
import { connect } from 'redaction'
import ReactRecaptcha3 from 'react-google-recaptcha3'
import { NavLink, withRouter } from 'react-router-dom'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { useIntl } from 'react-intl'

// thirdparty
import { Controller, FieldValues, useForm } from 'react-hook-form'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'

// custom
import { getLocal } from '@walletconnect/utils'
import styles from './Signup.scss'

// assets
import profile from './images/profile.svg'
import email from './images/email.svg'
import lock from './images/password.svg'
import eye from './images/eye.svg'
import eyeHide from './images/eye-password-hide.svg'

function Signup(props) {
  const {
    history,
    location,
  } = props

  const [showPassword, setShowPassword] = useState(false)
  const [backendErrorMessage, setBackendErrorMessage] = useState('')
  const [isSignUpBtnDisable, setIsSignUpBtnDisable] = useState(false)

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

  const onSubmit = handleSubmit(async (data) => {

    if (isSignUpBtnDisable) {
      return
    }
    setIsSignUpBtnDisable(true)

    data.captchaToken = await ReactRecaptcha3.getToken()

    kasaHttpClient
      .post('user/sign-up', data)
      .then((response) => {
        goOTPVerification(data)
        setIsSignUpBtnDisable(false)
      })
      .catch((error) => {
        setBackendErrorMessage(error.response.data.message[0])
        setIsSignUpBtnDisable(false)
        setTimeout(() => {
          setBackendErrorMessage('')
        }, 6000)
      })
  })

  const goOTPVerification = (data: FieldValues) => {
    const email = encodeURIComponent(data.email)
    const phone = encodeURIComponent(data.phone)
    history.push(
      localisedUrl(locale, `${links.otpVerification}?q=signup&email=${email}&phone=${phone}`),
    )
  }

  const goHome = () => {
    history.push(localisedUrl(locale, links.wallet))
  }
  const isLoggedIn = () => {
    const token = getLocal('kasa:token')

    if (token) {
      goHome()
    }
  }

  isLoggedIn()

  return (
    <div styleName="w-100">
      <div styleName="starter-modal__container-content">
        <div>
          <h4 styleName="kaxaa-page---title">
            Quickly Create
            <span styleName="text-brand"> Kaxaa Account </span>
          </h4>

          <div styleName="custom-from--wrapper">
            <form onSubmit={onSubmit}>
              {backendErrorMessage
                    && (
                      <div style={{ color:'red', textAlign: 'center', marginBottom: '10px', fontSize: '15px' }}>
                        {backendErrorMessage}
                      </div>
                    )}
              <div styleName="form-group">
                <label styleName="text-brand-hover" htmlFor="full-name">
                  Full Name
                  <span styleName="required-lable">*</span>
                </label>
                <div styleName="icon-field-left">
                  <img styleName="icon-field" src={profile} style={{ width: '24px' }} alt=";)" />
                  <input
                    styleName={errors?.name && errors?.name.type && 'validation-error'}
                    type="text"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Enter Your Full Name"
                  />
                  {errors?.name && errors?.name.type && (
                    <span styleName="required-lable">{errors?.name.message}</span>
                  )}
                </div>
              </div>
              <div styleName="form-group">
                <label styleName="text-brand-hover" htmlFor="for-email">
                  Email
                  <span styleName="required-lable">*</span>
                </label>
                <div styleName="icon-field-left">
                  <img styleName="icon-field" src={email} alt="e" />
                  <input
                    styleName={errors?.email && errors?.email.type && 'validation-error'}
                    type="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    placeholder="Enter Your Email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Entered value does not match email format',
                      },
                    })}
                  />
                  {errors?.email && errors?.email.type && (
                    <span styleName="required-lable">{errors?.email.message}</span>
                  )}
                </div>
              </div>
              <div styleName="form-group">
                <label styleName="text-brand-hover" htmlFor="phone">
                  Phone
                  <span styleName="required-lable">*</span>
                </label>
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
                      placeholder="Enter Phone Number"
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
              </div>
              <div styleName="form-group">
                <label styleName="text-brand-hover" htmlFor="password">
                  Password
                  <span styleName="required-lable">*</span>
                </label>
                <div styleName="icon-field-left">
                  <input
                    type={!showPassword ? 'password' : 'text'}
                    placeholder="Enter Your Password"
                    styleName={errors?.password && errors?.password.type && 'validation-error'}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    {...register('password', {
                      required: 'Password is required',
                      pattern: {
                        value: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,})/,
                        message:
                                'Min. 8 characters including numbers, 1 capital & 1 special character',
                      },
                    })}
                  />
                  {errors.password && errors.password.type && (
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
              {/* <ReCAPTCHA
                sitekey="6Lfy3rAiAAAAAFm5CwqgFrcxYmyu7PSzEllyFFSt"
                onChange={onChange}
              /> */}
              {/* {captchaError && <span styleName="required-lable">Please verify that you are not a robot</span>} */}
              <div styleName="form-group" className="mt-2" style={{ marginBlock: '0' }}>
                <label styleName="text-brand-hover" style={{ fontSize: '14px', marginBlock: '10px' }}>
                  Terms & Condition:
                </label>
                <div className="effect-item">
                  <label styleName="custom-checkbox" style={{ fontSize: '12px', fontWeight: '400' }} htmlFor="terms">
                    <input
                      id="terms"
                      type="checkbox"
                      aria-invalid={errors.terms ? 'true' : 'false'}
                      {...register('terms', { required: 'Please agree to terms & conditions' })}
                    />
                    <span styleName="checkmark" style={{ border: '1px solid #ccc' }} />
                    By creating an account you indicate you have read and agree to the
                    {' '}
                    <a href="https://staging.kaxaa.com/ico-advisory-2-2-2/terms-condition/" target="_blank" rel="noreferrer"> Terms & Conditions </a>
                    {' '}
                    and
                    <a href="https://staging.kaxaa.com/ico-advisory-2-2-2/privacy-policy/" target="_blank" rel="noreferrer"> Privacy Policy </a>
                  </label>
                </div>
                {errors.terms && errors.terms.type && (
                  <span styleName="required-lable">{errors?.terms.message}</span>
                )}
              </div>
              {/* <div className='divider'></div> */}
              <div styleName="form-group" className="mt-2">
                <label styleName="text-brand-hover" style={{ fontSize: '14px', marginBlock: '10px' }}>
                  Account Agreement Disclosure:
                </label>
                <div className="effect-item">
                  <label styleName="custom-checkbox" style={{ fontSize: '12px', fontWeight: '400' }} htmlFor="agreement">
                    <input
                      id="agreement"
                      type="checkbox"
                      aria-invalid={errors.disclosure ? 'true' : 'false'}
                      {...register('disclosure', { required: 'Please agree to account agreement disclosure' })}
                    />
                    <span styleName="checkmark" style={{ border: '1px solid #ccc' }} />
                    I have read the
                    {' '}
                    <a href="https://docs.silamoney.com/docs/agreement_and_disclosures_requirements" target="_blank" rel="noreferrer"> Disclosure and Consent </a>
                    {' '}
                    I Agree to the
                    {' '}
                    <a href="https://docs.silamoney.com/docs/agreement_and_disclosures_requirements#evolve-end-user-account-agreement" target="_blank" rel="noreferrer">
                      Evolve Customer Account Agreement
                    </a>
                    {' '}
                    and the
                    <a href="https://www.silamoney.com/legal/evolve-electronic-communications-consent" target={'_blank'} rel="noreferrer">
                      Evolve e-communications consent
                    </a>
                  </label>
                </div>
                {errors.disclosure && errors.disclosure.type && (
                  <span styleName="required-lable">{errors?.disclosure.message}</span>
                )}
              </div>
              <input type="submit" value={isSignUpBtnDisable ? 'SIGNING UP...' : 'SIGN UP'} className="w-100 starter-modal__btn" />
            </form>
          </div>
        </div>
        <div styleName="next-page--link">
          Already have an account?
          <NavLink exact styleName="text-brand" to={`${links.signin}`}>
            Login
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(Signup, styles)))
