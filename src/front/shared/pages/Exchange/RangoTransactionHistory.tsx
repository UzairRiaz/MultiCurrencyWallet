import { useEffect, useState } from 'react'
import kasaHttpClient from 'helpers/kasaHttpClient'
import { RangoClient } from 'rango-sdk'
import config from 'app-config'
import arrowRight from './images/arrow-right-his.svg'
import GreenTick from './images/green-tick.svg'
import ErrorIcon from './images/error-icon.svg'
import CopyIcon from './images/copy-icon.svg'
import RangoSearch from './images/rango-search-icon.svg'

export function RangoTransactionHistory() {

  const rangoClient = new RangoClient(config.kaxa.rango.apiKey)
  const [transactions, setTransactions] = useState([])
  const initialActiveRequestId: any = {}
  const [activeRequestId, setActiveRequestId] = useState(initialActiveRequestId)
  const [rangoMetadata, setRangoMetadata] = useState<any>(null)
  useEffect(() => {
    getMetadata()
    fetchTransactions()

  }, [])
  const fetchTransactions = async () => {
    const res =  await kasaHttpClient.get('rango-swap/list')

    if (res.data.length > 0) {
      setTransactions(res.data)
      setActiveRequestId(res.data[0])
    }
  }

  const getMetadata = async () => {
    const key = 'rango_metadata'
    const cachedData = localStorage.getItem(key)

    if (!cachedData) {
      // no cached
      return fetchMetadata()
    }

    const cachedTime: any = localStorage.getItem(`${key}_time`)

    if (!cachedTime) {
      // no cached
      return fetchMetadata()
    }

    const currentTime = new Date().getTime()
    const hourInMillis = 60 * 60 * 1000
    const diff = currentTime - cachedTime
    if (diff > hourInMillis) {
      // If the cached data is older than 1 hour
      return fetchMetadata()
    }

    // If the cached data is newer than 1 hour, return the data

    const rs = (JSON.parse(cachedData))
    setRangoMetadata(rs)
    return rs
  }

  const fetchMetadata = async () => {
    const meta = await rangoClient.getAllMetadata()
    localStorage.setItem('rango_metadata', JSON.stringify(meta))
    localStorage.setItem('rango_metadata_time', `${(new Date()).getTime()}`)
    setRangoMetadata(meta)
    return meta
  }

  const getTokenIconByTokenInfo = (token: any) => {
    if (!rangoMetadata) {
      return ''
    }

    const tokenMetadata = rangoMetadata.tokens.find((item: any) => item.symbol === token.symbol && item.blockchain === token.blockchain)

    if (!tokenMetadata) {
      return ''
    }

    return tokenMetadata.image
  }

  return (
    <>
      <h5 className="mb-2 my-4 font-weight-600 text-center">Rango Transaction History</h5>
      <div className="history-content-box mt-2">
        <div className="history-view">
          <div className="left-col">
            <div className="head">
              {/* <div className="input-left-icon"> */}
              {/*  <img src={RangoSearch} className="icon" alt="" /> */}
              {/*  <input type="text" className="form-control" placeholder="Search by blockchains" /> */}
              {/* </div> */}
              <label htmlFor="" className="mt-4 mb-0">Your History</label>
            </div>
            <div className="content">

              {
                transactions.map((transaction: any, index) => (

                  <div
                    onClick={() => {
                      setActiveRequestId(transaction)
                    }}
                    className={`history-item ${transaction.isCompleted ? 'success' : 'error'} ${transaction.requestId === activeRequestId.requestId ? 'active' : ''}`}>
                    <div className="box">
                      <div className="icon">
                        <img src={getTokenIconByTokenInfo(transaction.swapResponse.from)} alt="" />
                      </div>
                      <span>{parseFloat(transaction.swapResponse.requestAmount).toFixed(3)}</span>
                      <p>{transaction.swapResponse.from.blockchain}</p>
                    </div>
                    <img width="20px" src={arrowRight} alt="" />
                    <div className="box">
                      <div className="icon">
                        <img src={getTokenIconByTokenInfo(transaction.swapResponse.to)} alt="" />
                      </div>
                      <span>{parseFloat(transaction.swapResponse.result.outputAmount).toFixed(3)}</span>
                      <p>{transaction.swapResponse.to.blockchain}</p>
                    </div>
                    {
                      transaction.isCompleted ? (
                        <img src={GreenTick} width="16px" className="history-status-icon" alt="" />
                      ) : (
                        <img src={ErrorIcon} width="16px" className="history-status-icon" alt="" />
                      )
                    }

                  </div>

                ))
              }
            </div>
          </div>

          <div className="right-col">

            <div className="history-flow">

              {
                activeRequestId?.swapResponse?.result.swaps?.map((swap: any, index: number) => (

                  <>
                    {
                      index === 0 && (
                        <div className={`wallet ${activeRequestId.currentStep > (index + 1) ? 'success' : 'error'}`}>
                          <div className="icon">
                            <img src={swap.from.logo} alt="" />
                          </div>
                          <span>{parseFloat(swap.fromAmount).toFixed(3)}</span>
                          <p>
                            {swap.from.symbol}
                            {' '}
                            [
                            {swap.from.blockchain}
                            ]
                          </p>
                        </div>
                      )
                    }

                    <div className="relation">
                      {/* <div className="label-group"> */}
                      {/*  <div>Inbound tx</div> */}
                      {/*  <div>Inbound tx</div> */}
                      {/* </div> */}
                      <div className="icon">
                        <img src={swap.swapperLogo} alt="" />
                      </div>
                      <span>{swap.swapperId}</span>
                      <img width="16px" src={arrowRight} alt="" />
                      {
                        activeRequestId.currentStep > (index + 1) ? (
                          <img src={GreenTick} width="16px" className="history-status-icon" alt="" />

                        ) : (
                          <img src={ErrorIcon} width="16px" className="history-status-icon" alt="" />
                        )
                      }
                    </div>

                    <div className={`wallet ${activeRequestId.currentStep > (index + 1) ? 'success' : 'error'}`}>
                      <div className="icon">
                        <img src={swap.to.logo} alt="" />
                      </div>
                      <span>{parseFloat(swap.toAmount).toFixed(3)}</span>
                      <p>
                        {swap.to.symbol}
                        {' '}
                        [
                        {swap.to.blockchain}
                        ]
                      </p>
                    </div>
                  </>
                ))
              }
            </div>
            <div className="text-center w-100">
              {
                activeRequestId?.swapProgress && JSON.parse(activeRequestId?.swapProgress).length && (
                  <div>
                    <span className="text-danger error-msg">Error</span>
                    <p className="status-code mt-2 mb-4">{activeRequestId.swapProgress}</p>
                  </div>
                )
              }

              <hr />

              {/* <p className="date-time mb-4">Finished 5 days ago @ 5/30/23, 11:27:04 PM</p> */}
              <div className="d-flex align-items-center justify-content-center">
                <p className="m-0 mr-2">Status:</p>
                {
                  activeRequestId.isCompleted ? (
                    <label htmlFor="" className="badge badge-success m-0">Success</label>
                  ) : (
                    <label htmlFor="" className="badge badge-danger m-0">Failed</label>
                  )
                }
              </div>
              <div className="d-flex align-items-center justify-content-center gap-3 my-4">
                <span className="d-inline-block mr-3">Request ID:</span>
                <input type="text" value={activeRequestId.requestId} className="form-control w-auto h-auto" style={{ minHeight: 'auto' }} />
                <img src={CopyIcon} width="14px" className="cursor-pointer ml-3" alt="" />
              </div>
              <div className="mt-4">

                {
                  (!activeRequestId.isCompleted) && activeRequestId.currentStep > 1 && (
                    <p>
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      Don't worry, your fund is Safe
                      <br />
                      {' '}
                      It is converted to
                      {' '}
                      <u>{parseFloat(activeRequestId.swapResponse?.result.swaps[activeRequestId.currentStep - 1].toAmount).toFixed(3)}</u>
                      {' '}
                      <strong className="text-primary font-weight-600">{activeRequestId.swapResponse?.result.swaps[activeRequestId.currentStep - 1].to.symbol}</strong>
                      {' '}
                      on your
                      {' '}
                      <strong className="text-primary font-weight-600">{activeRequestId.swapResponse?.result.swaps[activeRequestId.currentStep - 1].to.blockchain}</strong>
                      {' '}
                      wallet
                    </p>
                  )
                }

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
