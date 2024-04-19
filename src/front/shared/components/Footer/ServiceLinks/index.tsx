import CSSModules from 'react-css-modules'
import config from 'helpers/externalConfig'
import styles from '../Footer.scss'

type ServiceLinksProps = {
  versionName: string | null
  versionLink: string | null
}

function ServiceLinks({ versionName, versionLink }: ServiceLinksProps) {
  const serviceLink = config?.opts?.ui?.serviceLink || 'https://tools.onout.org/wallet'

  return (
    <div styleName="serviceLinks">
      <div className='d-flex align-items-center mb-3' style={{gridGap: '10px'}}>
        <a href="https://staging.kaxaa.com/ico-advisory-2-2-2/terms-condition/" target={'_blank'}>Terms & Condition</a>
        {''}
        <span>|</span>
        {''}
        <a href="https://staging.kaxaa.com/ico-advisory-2-2-2/privacy-policy/" target={'_blank'}>Privacy Policy</a>
      </div>
      {versionName && versionLink && (
        <span>
          <a href={versionLink} target="_blank" rel="noreferrer">
            {versionName}
          </a>
        </span>
      )}
      <span>
        Powered by
        {' '}
        <a href="https://staging.kaxaa.com/" target="_blank" rel="noreferrer">kaxaa.com</a>
      </span>
    </div>
  )
}

export default CSSModules(ServiceLinks, styles, { allowMultiple: true })
