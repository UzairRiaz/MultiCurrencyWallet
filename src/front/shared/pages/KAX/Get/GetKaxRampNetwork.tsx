import { withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import styles from 'pages/KAX/Get/GetKax.scss'
import { connect } from 'redaction'
import React from "react";

function GetKaxRampNetwork(props): JSX.Element {

    return (
        <div>
            </div>

    //     <div styleName="w-100">
    // //     <div styleName="page_center">
    // //     <div styleName="starter-modal__container-content">
    // //     <div className="bank-account-info">
    // //     <div className="title">Bank Account</div>
    // //     <div className="sub-title">Free</div>
    // //     <p>dsddsds</p>
    //     </div>
    )
}

export default connect({
  userData: 'user',
})(withRouter(CSSModules(GetKaxRampNetwork, styles)))
