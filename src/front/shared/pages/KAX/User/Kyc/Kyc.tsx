/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react'
import 'react-phone-number-input/style.css'
import CSSModules from 'react-css-modules'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { connect } from 'redaction'

import { withRouter } from 'react-router-dom'

import styles from './Kyc.scss'
import { Controller, useForm } from 'react-hook-form'
import kasaHttpClient from 'shared/helpers/kasaHttpClient'
import Select from 'react-select'
import InputMask from "react-input-mask";
import store from 'redux/store'

// assets

function Profile(props) {

  const { user } = store.getState()
  const [step, setStep] = useState(1)
  const [formLevelErrors, setFormLevelErrors] = useState([])
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false)
  const [applyForKycLoading, setApplyForKycLoading] = useState(false)
  const [userFirstName, setUserFirstName] = useState('')
  const unitedStates = [{ value: '', label: 'Select state' }, { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' }, { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }];

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: async () => {
      const res = await kasaHttpClient.get('/sila/profile')
      setUserFirstName(res.data.profile.firstName)
      return res.data.profile
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (profileUpdateLoading) {
      return
    }

    const submitData = JSON.parse(JSON.stringify(data))
    if (submitData.ssn.includes('*')) {
      submitData.ssn = ''
    }
    const stateObject = submitData.state
    submitData.state = stateObject.value

    if (submitData.dateOfBirth.includes('T')) {
      submitData.dateOfBirth = submitData.dateOfBirth.split('T')[0]
    }

    submitData.cryptoAddress = user.maticData.address



    setProfileUpdateLoading(true)
    const res = await kasaHttpClient.post('/sila/profile', submitData)
    setProfileUpdateLoading(false)
    let errorCounter = 0
    const validationKeys = Object.keys(res.data.validationErrors)
    validationKeys.forEach((key) => {
      if (key === 'formLevel') {
        setFormLevelErrors(res.data.validationErrors[key])
        errorCounter += res.data.validationErrors[key].length
        return
      }
      setError(key, {
        type: 'manual',
        message: res.data.validationErrors[key],
      })
      errorCounter += 1
    })

    if (errorCounter === 0) {
      onVerify()
    }
  })

  const onVerify = async () => {
    if (applyForKycLoading) {
      return
    }

    setApplyForKycLoading(true)
    const res = await kasaHttpClient.post('/sila/verify')
    setApplyForKycLoading(false)

    if (res.data.success) {
      setStep(2)
    }
  }
  const ssnValue = watch('ssn')

  return (
    <div className="page-wrapper">
      <div className="card--wrapper">
        <h5>Identification Verification</h5>
        {step === 1 && (
          <p>
            This ACH Level requires us to gather information form you. Please fill out the required
            fields below.
          </p>
        )}
        {step === 1 && (
          <form action="">
            {formLevelErrors.length > 0 && (
              <>
                <div className="alert alert-danger" role="alert">
                  <ul>
                    {formLevelErrors.map((error, index) => (
                      <li key={`error-${index}`}>{error}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            <div className="row">
              <div className="col-md-6 col-12">
                <div className="form-group">
                  <div className="float-input">
                    <label className="label label-required">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter First Name"
                      className="form-control"
                      {...register('firstName', {
                        required: {
                          value: true,
                          message: 'First name is required',
                        },
                      })}
                    />
                  </div>
                  {errors?.firstName && errors?.firstName.type && (
                    <span styleName="form-error">{errors.firstName.message}</span>
                  )}
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-group">
                  <div className="float-input">
                    <label className="label label-required">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter Last Name "
                      className="form-control"
                      {...register('lastName', {
                        required: {
                          value: true,
                          message: 'Last name is required',
                        },
                      })}
                    />
                  </div>

                  {errors?.lastName && errors?.lastName.type && (
                    <span styleName="form-error">{errors.lastName.message}</span>
                  )}
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-group">
                  <div className="float-input">
                    <label className="label label-required">Email</label>
                    <input
                      type="text"
                      placeholder="Enter Email"
                      className="form-control"
                      {...register('email', {
                        required: {
                          value: true,
                          message: 'Email is required',
                        },
                      })}
                    />
                  </div>

                  {errors?.email && errors?.email.type && (
                    <span styleName="form-error">{errors.email.message}</span>
                  )}
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-group">


                  <Controller
                    rules={{ required: { value: true, message: "Phone number is required" } }}
                    control={control}
                    name='phoneNumber'
                    render={({ field }) => {
                      return (
                        <>
                          <div className="float-input">
                            <label className="label label-required">Phone Number</label>
                            <InputMask mask="(999) 999-9999"
                             placeholder={'Example (123) 456-7890'}
                              className="form-control"
                              onChange={(phoneNumber) => {
                                field.onChange(phoneNumber)
                              }}
                              value={field.value}
                            />
                          </div>
                          {errors?.phoneNumber && errors?.phoneNumber.type && (<span style={{ color: 'red', fontSize: '12px' }}>{errors.phoneNumber.message}</span>)}
                        </>
                      );
                    }}
                  />

                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-group">


                  <Controller
                    rules={{ required: { value: true, message: "Date of Birth is required" } }}
                    control={control}
                    name='dateOfBirth'
                    render={({ field }) => {
                      return (
                        <>
                          <div className="float-input">
                            <label className="label label-required">Date of birth </label>
                            <InputMask mask="9999-99-99"
                                  placeholder={'Example 1990-12-30'}
                                  className="form-control"
                                  onChange={(value) => {
                                    field.onChange(value)
                                  }}
                                  value={field.value}
                                />
                          </div>

                          {errors?.dateOfBirth && errors?.dateOfBirth.type && (
                            <span style={{ color: 'red', fontSize: '12px' }}>{errors.dateOfBirth.message}</span>
                          )}
                        </>
                      )
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-group">

                  {
                    (ssnValue && ssnValue.includes("*")) ? (
                      <>
                        <div className="float-input">
                          <label className="label label-required">Social Security Number</label>
                          <input type='text' className="form-control" value={ssnValue} disabled={true} />
                        </div>
                      </>
                    ) :
                      (<Controller
                        rules={{ required: { value: true, message: "SSN is required" } }}
                        control={control}
                        name='ssn'
                        render={({ field }) => {
                          return (
                            <>
                              <div className="float-input">
                                <label className="label label-required">Social Security Number</label>
                                <InputMask mask="999-99-9999"
                                  placeholder={'Example 123-45-6789'}
                                  className="form-control"
                                  onChange={(value) => {
                                    field.onChange(value)
                                  }}
                                  value={field.value}
                                />
                              </div>
                              {errors?.ssn && errors?.ssn.type && (
                                <span style={{ color: 'red', fontSize: '12px' }}>{errors.ssn.message}</span>
                              )}
                            </>
                          )
                        }}
                      />)
                  }


                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <div className="float-input">
                    <label className="label label-required">Street Address</label>
                    <input
                      type="text"
                      placeholder="Enter Street Address"
                      className="form-control"
                      {...register('address', {
                        required: {
                          value: true,
                          message: 'Street address is required',
                        },
                      })}
                    />
                  </div>

                  {errors?.address && errors?.address.type && (
                    <span styleName="form-error">{errors.address.message}</span>
                  )}
                </div>
              </div>
              <div className="col-md-4 col-12">
                <div className="form-group">
                  <div className="float-input">
                    <label className="label label-required">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      className="form-control"
                      {...register('city', {
                        required: {
                          value: true,
                          message: 'City is required',
                        },
                      })}
                    />
                  </div>

                  {errors?.city && errors?.city.type && (
                    <span styleName="form-error">{errors.city.message}</span>
                  )}
                </div>
              </div>
              <div className="col-md-4 col-12">
                <div className="form-group">


                  <Controller
                    control={control}
                    rules={{ required: { value: true, message: "State is required" } }}
                    name='state'
                    render={({ field }) => {
                      const selectedValue = unitedStates.find((item) => item.value === field.value);
                      return (
                        <>
                          <div className="float-input">
                            <label className="label label-required">State</label>
                            <Select
                              className=''
                              options={unitedStates}

                              onChange={(item) => {
                                field.onChange(item)
                              }}

                              value={selectedValue}
                            />
                          </div>
                          {errors?.state && errors?.state.type && (
                            <span style={{ color: 'red', fontSize: '12px' }}>{errors.state.message}</span>
                          )}
                        </>
                      )
                    }}
                  />
                </div>
              </div>
              <div className="col-md-4 col-12">
                <div className="form-group">
                  <div className="float-input">
                    <label className="label label-required">Zip </label>
                    <input
                      type="text"
                      placeholder="Zip"
                      className="form-control"
                      {...register('zip', {
                        required: {
                          value: true,
                          message: 'Zip is required',
                        },
                      })}
                    />
                  </div>

                  {errors?.zip && errors?.zip.type && (
                    <span styleName="form-error">{errors.zip.message}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-6 text-end">&nbsp;</div>

              <div className="col-6 text-end">
                <a
                  type="link"
                  onClick={() => {
                    onSubmit()
                  }}
                  className={'btn btn-primary btn-primary ' + (profileUpdateLoading ? ' disabled' : '')}
                >
                  {' '}
                  {profileUpdateLoading ? 'Submitting...' : 'Submit'}{' '}
                </a>

              </div>
            </div>
          </form>
        )}
        {step === 2 && (
          <div className="d-flex flex-column justify-content-between mt-3 h-100 flex-1">
            <div className="flex-1">
              <div className="thank-u-msg">
                Thanks <strong> {userFirstName}</strong>,
                <p>
                  We have received your request and will send you an email once the verification
                  process is complete. This may take a few minutes to a few hours.
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <a
                type="link"
                onClick={() => setStep(step - 1)}
                className="text-secondary mr-3 cursor-pointer"
              >
                Back
              </a>
              <a href="/#/kax" className="btn btn-primary">
                Go to Get KAX
              </a>
            </div>
          </div>
        )}
      </div>
    </div >
  )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(Profile, styles)))
