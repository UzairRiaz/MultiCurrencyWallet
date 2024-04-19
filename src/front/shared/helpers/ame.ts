import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.one

// TODO: =================================

type EstimateFeeParams = {
  method: string
}

const estimateFeeValue = async (params: EstimateFeeParams) => ethLikeHelper.ame.estimateFeeValue(params)

const estimateGasPrice = async (): Promise<number> => ethLikeHelper.ame.estimateGasPrice()

export default {
  estimateFeeValue,
  estimateGasPrice,
}
