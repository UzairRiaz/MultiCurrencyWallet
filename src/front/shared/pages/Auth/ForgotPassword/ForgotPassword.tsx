/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react'

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

// custom
import styles from './ForgotPassword.scss'

// assets
import email from './images/email.svg'
import kasaHttpClient from 'helpers/kasaHttpClient'

function ForgotPassword(props) {
  const {
    history,
    location: { pathname, hash },
    userData,
  } = props

  const [loginType, setLoginType] = useState(false)
  const [backendErrorMessage, setBackendErrorMessage] = useState('')

  const { locale } = useIntl()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const onSubmit = handleSubmit((data) => {
    kasaHttpClient
        .post('/auth/forgot-password', data)
        .then((response) => {
          goOTPVerification(data)
        })
        .catch((error) => {
          setBackendErrorMessage(error.response.data.message[0]);

          setTimeout(()=>{
            setBackendErrorMessage('');
          }, 6000);
        })
  })

  const goOTPVerification = (data) => {
    const phone = data.phone ? encodeURIComponent(data.phone) : ''
    const email = data.email ? encodeURIComponent(data.email) : ''
    history.push(
        localisedUrl(
            locale,
            `${links.otpVerification}?q=forgot-password&email=${email}&phone=${phone}`
        )
    )
  }

  return (
      <div styleName="w-100">
        <div styleName="starter-modal__container-content">
          <div>
            <h4 styleName="kaxaa-page---title">
              Reset your
              <span styleName="text-brand"> Password</span>
            </h4>
            <div styleName="custom-from--wrapper">
              {backendErrorMessage &&
                  <div style={{color:'red', textAlign: 'center', marginBottom: '10px', fontSize: '15px' }}>
                    {backendErrorMessage}
                  </div>
              }
              <form onSubmit={onSubmit}>
                <div styleName="form-group">
                  <label styleName="text-brand-hover" htmlFor="email-phone">
                    Enter your verified {loginType ? 'Email Address' : 'Phone Number'} and we will
                    send you a password reset {loginType ? 'link' : 'message'}.
                  </label>
                  <div className="position-relative">
                    {loginType ? (
                        <div styleName="icon-field-left">
                          <img styleName="icon-field" src={email} alt="email" />
                          <input
                              type="email"
                              placeholder="Enter Your Email Address"
                              styleName={errors?.email && errors?.email.type && 'validation-error'}
                              aria-invalid={errors.email ? 'true' : 'false'}
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
                        </>
                    )}

                    <span styleName="select-login--type" onClick={() => setLoginType(!loginType)}>
                    {!loginType ? 'Use Email' : 'Use Phone'}
                  </span>
                  </div>
                </div>
                <input type="submit" value="VERIFY" className="w-100 starter-modal__btn" />
              </form>
            </div>
          </div>

          <div styleName="next-page--link">
            Back to
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
})(withRouter(CSSModules(ForgotPassword, styles)))
