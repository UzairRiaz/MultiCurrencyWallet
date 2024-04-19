/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import { connect } from 'redaction'

import { withRouter } from 'react-router-dom'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { FormattedMessage, useIntl } from 'react-intl'

// thirdparty
import { useForm } from 'react-hook-form'

// custom
import styles from './ResetPassword.scss'

// assets
import lock from './images/password.svg'
import eye from './images/eye.svg'
import eyeHide from './images/eye-password-hide.svg'
import kasaHttpClient from 'helpers/kasaHttpClient'

function ResetPassword(props) {
  const {
    history,
    location: { pathname, hash },
    userData,
  } = props

  const [showPassword, setShowPassword] = useState(false)
  const [backendErrorMessage, setBackendErrorMessage] = useState('');

  const { locale } = useIntl()

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = handleSubmit((data) => {
    kasaHttpClient
        .post('/user/change-password', {
          password: data.password,
          newPassword: data.new_password,
        })
        .then((response) => goHome())
        .catch((error) => {
          setBackendErrorMessage(error.response.data.message[0]);

          setTimeout(()=>{
            setBackendErrorMessage('');
          }, 6000);
        })
  })

  const goHome = () => {
    history.push(localisedUrl(locale, links.createWallet))
  }

  return (
      <div styleName="w-100">
        <div styleName="starter-modal__container-content">
          <div>
            <h4 styleName="kaxaa-page---title">
              Reset your <span styleName="text-brand">password</span>
            </h4>
            <div styleName="custom-from--wrapper">
              {backendErrorMessage &&
                  <div style={{color:'red', textAlign: 'center', marginBottom: '10px', fontSize: '15px' }}>
                    {backendErrorMessage}
                  </div>
              }

              <form onSubmit={onSubmit}>
                <div styleName="form-group">
                  <label styleName="text-brand-hover" htmlFor="current-passwor">
                    Current Password
                    <span styleName="required-lable">*</span>
                  </label>
                  <div styleName="icon-field-left">
                    <input
                        id="current-password"
                        type={!showPassword ? 'password' : 'text'}
                        placeholder="Enter Your Current Password"
                        styleName={errors?.password && errors?.password.type && 'validation-error'}
                        aria-invalid={errors.password ? 'true' : 'false'}
                        {...register('password', { required: 'Password is required' })}
                    />
                    {errors.password && errors.password.type && (
                        <span styleName="required-lable">{errors?.password.message}</span>
                    )}
                    <img styleName="icon-field" src={lock} alt="lock" />
                    <img
                        styleName="icon-field-right"
                        onClick={() => setShowPassword(!showPassword)}
                        src={!showPassword ? eye : eyeHide}
                        alt="eye"
                    />
                  </div>
                </div>
                <div styleName="form-group">
                  <label styleName="text-brand-hover" htmlFor="new-password">
                    New Password
                    <span styleName="required-lable">*</span>
                  </label>
                  <div styleName="icon-field-left">
                    <input
                        id="new-password"
                        type={!showPassword ? 'password' : 'text'}
                        placeholder="Enter New Password"
                        styleName={
                            errors?.new_password && errors?.new_password.type && 'validation-error'
                        }
                        aria-invalid={errors.new_password ? 'true' : 'false'}
                        {...register('new_password', {
                          required: 'Password is required',
                          pattern: {
                            value: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,})/,
                            message:
                                'Min. 8 characters including numbers, 1 capital & 1 special character',
                          },
                        })}
                    />
                    {errors.new_password && errors.new_password.type && (
                        <span styleName="required-lable">{errors?.new_password.message}</span>
                    )}
                    <img styleName="icon-field" src={lock} alt="lock" />
                    <img
                        styleName="icon-field-right"
                        onClick={() => setShowPassword(!showPassword)}
                        src={!showPassword ? eye : eyeHide}
                        alt="eye"
                    />
                  </div>
                </div>
                <div styleName="form-group">
                  <label styleName="text-brand-hover" htmlFor="confirm-password">
                    Confirm Password
                    <span styleName="required-lable">*</span>
                  </label>
                  <div styleName="icon-field-left">
                    <input
                        id="confirm-password"
                        type={!showPassword ? 'password' : 'text'}
                        placeholder="Enter Confirm Password"
                        styleName={
                            errors?.confirm_password &&
                            errors?.confirm_password.type &&
                            'validation-error'
                        }
                        aria-invalid={errors.confirm_password ? 'true' : 'false'}
                        {...register('confirm_password', { required: 'Password is required' })}
                    />
                    {errors.confirm_password && errors.confirm_password.type && (
                        <span styleName="required-lable">{errors?.confirm_password.message}</span>
                    )}

                    {watch('confirm_password') !== watch('new_password') &&
                    getValues('confirm_password') ? (
                        <span styleName="required-lable">password not match</span>
                    ) : null}
                    <img styleName="icon-field" src={lock} alt="lock" />
                    <img
                        styleName="icon-field-right"
                        onClick={() => setShowPassword(!showPassword)}
                        src={!showPassword ? eye : eyeHide}
                        alt="eye"
                    />
                  </div>
                </div>
                <button id="preloaderCreateBtn" type="submit" className="w-100 starter-modal__btn">
                  {' '}
                  RESET PASSWORD{' '}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(ResetPassword, styles)))
