import axios from 'axios'

const getKaxaaIndexPrice = () => {
  try {
    return axios
      // https://indexapi.kaxaa.com
      .get('https://indexapi.kaxaa.com/?type=json')
      .then((result: any) => {
        // eslint-disable-next-line camelcase
        const { value } = result.data
        // // eslint-disable-next-line camelcase
        if (!value) {
          return 0
        }
        return value
      })
      .catch((error) => {
        console.error('kaxaa: index price err:', error)

        return 0
      })
  } catch (error) {
    console.error('kaxaa: index price catch:', error)
  }
  // 0 USD
  return 0
}

export default {
  getKaxaaIndexPrice,
}
