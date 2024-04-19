/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react'

import CSSModules from 'react-css-modules'
import { connect } from 'redaction'
import { Link, NavLink, withRouter } from 'react-router-dom'
import { links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import { FormattedMessage, useIntl } from 'react-intl'

// thirdparty
import { useForm } from 'react-hook-form'

// custom
import styles from './OTP.scss'
import kasaHttpClient from 'helpers/kasaHttpClient'
import { setLocal } from '@walletconnect/utils'

// assets

function OTP(props) {
  const {
    history,
    location: { pathname, hash, search },
    userData,
  } = props

  const { locale } = useIntl()
  const [backendErrorMessage, setBackendErrorMessage] = useState('');


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // otp timer
  const [seconds, setSeconds] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [resendButtonVisible, setResendButtonVisible] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [timeUpdate, setTimerUpdate] = useState(true);

  const resolveQueryParams =  ()=> {
    const params = new URLSearchParams(search)
    const paramsToResolve: any = {}
    paramsToResolve['page'] = params.get('q')
    const phone = params.get('phone')
    const email = params.get('email')

    if (phone && phone !== 'undefined') {
      paramsToResolve['phone'] = phone
    }
    if (email && email !== 'undefined') {
      paramsToResolve['email'] = email
    }

    return paramsToResolve;
  }

  const getTimer = ()=>{

    setTimeout(()=>{
      kasaHttpClient.get('otp/timer?' + (new URLSearchParams(resolveQueryParams())).toString())
          .then(response => {
            const mins = parseInt(String(response.data.seconds / 60));
            const seconds = parseInt(String(response.data.seconds % 60));
            setMinutes(mins); setSeconds(seconds);
          })
          .catch(error => {
            setResendButtonVisible(true);
            setShowTimer(false);
            setBackendErrorMessage(error.response.data.message[0]);

            setTimeout(()=>{
              setBackendErrorMessage('');
            }, 6000);
          })
    }, 1000);
  }

  const resendCode = ()=>{
    const {page, ...username} = resolveQueryParams();
    kasaHttpClient.post(page === 'signup' ? '/otp/resend-signup' : '/otp/resend-password-reset', username)
        .then(response => {
          setMinutes(5);
          setSeconds(0);
          setResendButtonVisible(false);
          setShowTimer(true)
        })
        .catch(error => {
          setBackendErrorMessage(error.response.data.message[0]);

          setTimeout(()=>{
            setBackendErrorMessage('');
          }, 6000);

        })
  }

  const onSubmit = handleSubmit((data) => {
    const {page, ...username} = resolveQueryParams();

    kasaHttpClient
        .post(page === 'signup' ? '/otp/signup-confirm' : '/auth/forgot-password-confirm', {
          ...data,
          ...username,
        })
        .then((response) => {
          if (page === 'signup') {
            setLocal('kasa:token', response.data.accessToken)
            setLocal('kasa:user', response.data.profile.name)
            localStorage.setItem('firstTimeLogin', 'true')
            setCookieAfterLogin('kasa_wordpress_logged_in_', {
              email: response.data.profile.email,
              user: response.data.profile.name,
            })
            
            
            return goHome()
          } else {
            const passwordResetToken = encodeURIComponent(response.data.token)
            history.push(
                localisedUrl(
                    locale,
                    links.changePassword + `?password-reset-token=${passwordResetToken}`
                )
            )
          }
        })
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

  const setCookieAfterLogin = (name, data) => {
    const jsonData = JSON.stringify(data);
    const expires = "expires=Thu, 01 Jan 2099 00:00:00 GMT";
    const domain = '.'+ location.hostname.split('.').reverse()[1] + "." +
        location.hostname.split('.').reverse()[0];
    document.cookie = name + "=" + jsonData + ";" + expires + ";domain="+domain+";path=/";
  }


  useEffect(() => {

    if(timeUpdate){
      getTimer();
      setTimerUpdate(false);
    }

    let otpTimer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(otpTimer)
          setResendButtonVisible(true);
        } else {
          setMinutes(minutes - 1)
          setSeconds(59)
        }
      }
    }, 1000)

    return () => {
      clearInterval(otpTimer)
    }
  })

  return (
      <div styleName="w-100">
        <div styleName="starter-modal__container-content">
          <div>
            <h4 styleName="kaxaa-page---title">
              <span styleName="text-brand"> Verify Your Identity</span>
            </h4>

            {showTimer &&
                <div styleName="otp-msg">
                  <strong>One time password</strong> has been sent to your registered <br /> Email address
                  and Mobile number. Valid till{' '}
                  <strong style={{ display: 'block' }}>
                    {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </strong>
                </div>
            }


            {backendErrorMessage &&
                <div style={{color:'red', textAlign: 'center', marginBottom: '10px', fontSize: '15px' }}>
                  {backendErrorMessage}
                </div>
            }


            <div styleName="custom-from--wrapper">
              <form onSubmit={onSubmit}>
                <div styleName="form-group">
                  <div styleName="">
                    <label styleName="text-brand-hover" htmlFor="email-otp">
                      Email
                    </label>
                  </div>
                  <div styleName="opt-group">
                    <input
                        type="text"
                        placeholder="Enter Email Code"
                        styleName={errors?.emailToken && errors?.emailToken.type && 'validation-error'}
                        aria-invalid={errors.emailToken ? 'true' : 'false'}
                        {...register('emailToken', {
                          required: 'Please enter Email OTP',
                          minLength: {
                            value: 6,
                            message: 'OTP length should be 6 digits',
                          },
                          maxLength: {
                            value: 6,
                            message: 'OTP length should be 6 digits',
                          },
                        })}
                    />
                  </div>
                  {errors?.emailToken && errors?.emailToken.type && (
                      <p styleName="required-lable">{errors?.emailToken.message}</p>
                  )}
                </div>
                <div styleName="form-group">
                  <div styleName="">
                    <label styleName="text-brand-hover" htmlFor="phone-otp">
                      Phone
                    </label>
                  </div>
                  <div styleName="opt-group" id="phone-otp">
                    <input
                        type="text"
                        placeholder="Enter Phone Code"
                        styleName={errors?.phoneToken && errors?.phoneToken.type && 'validation-error'}
                        aria-invalid={errors.phoneToken ? 'true' : 'false'}
                        {...register('phoneToken', {
                          required: 'Please enter Phone OTP',
                          minLength: {
                            value: 6,
                            message: 'OTP length should be 6 digits',
                          },
                          maxLength: {
                            value: 6,
                            message: 'OTP length should be 6 digits',
                          },
                        })}
                    />
                  </div>
                  {errors?.phoneToken && errors?.phoneToken.type && (
                      <p styleName="required-lable">{errors?.phoneToken.message}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginBottom: '10px', fontSize: '15px' }}>
                  {resendButtonVisible &&
                      <span>
                    Did&apos;t receive the verfication?
                  <a href="javascript:void(0)" onClick={resendCode} styleName="text-brand">
                    Resend
                  </a>
                  </span>
                  }
                </div>
                <input type="submit" value="VERIFY" className="w-100 starter-modal__btn" />
              </form>
              {/* <p style={{ fontSize: '14px', margin: '20px 0 0' }}>
              If you do not receive the OTP within 2 minutes,
              please click on the &quot;RESEND OTP&quot; button. Resend request can be made three times maximum.
            </p> */}
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
})(withRouter(CSSModules(OTP, styles)))
