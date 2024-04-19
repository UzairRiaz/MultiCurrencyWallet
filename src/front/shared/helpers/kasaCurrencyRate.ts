
import kasaHttpClient from 'helpers/kasaHttpClient'

const kasaCurrencyRate = () => {
  try {
    return kasaHttpClient
      .get('/currency-rate')
      .then((result: any) => result.data)
      .catch((error) => {
        console.error('kaxaa: currency rate:', error)

        return 0
      })
  } catch (error) {
    console.error('kaxaa: currency rate:', error)
  }
  return 0
}

export default {
  kasaCurrencyRate,
}
