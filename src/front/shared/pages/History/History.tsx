import { Component, Fragment } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import CSSModules from 'react-css-modules'
import { connect } from 'redaction'
import actions from 'redux/actions'
import styles from 'components/tables/Table/Table.scss'
// import { externalConfig } from 'helpers'
import InfiniteScrollTable from 'components/tables/InfiniteScrollTable/InfiniteScrollTable'
import ContentLoader from 'components/loaders/ContentLoader/ContentLoader'
import FilterForm from 'components/FilterForm/FilterForm'
// import InvoicesList from 'pages/Invoices/InvoicesList'
import SwapsHistory from 'pages/History/SwapsHistory/SwapsHistory'
import { onInit as onSwapCoreInited } from 'instances/newSwap'
import stylesHere from './History.scss'
import Row from './Row/Row'

const filterHistory = (items, filter) => {
  if (filter === 'sent') {
    return items.filter(({ direction }) => direction === 'out')
  }

  if (filter === 'received') {
    return items.filter(({ direction }) => direction === 'in')
  }

  return items
}

@connect(({
  user: { activeFiat },
  history: {
    transactions,
    filter,
    swapHistory,
  },
}) => ({
  activeFiat,
  items: filterHistory(transactions, filter),
  swapHistory,
}))
@CSSModules(stylesHere, { allowMultiple: true })
class History extends Component<any, any> {

  constructor(props) {
    super(props)

    // if (window.performance) {
    //   if (performance.navigation.type === 1) {
    //     console.log('reloaded')
    //     window.location.href = '#/wallet'
    //     setTimeout(() => {
    //       window.location.href = '#/history'
    //     }, 500)
    //
    //   } else {
    //     // alert( "This page is not reloaded");
    //   }
    // }

    const {
      items,
      match: {
        params: {
          page = null,
        },
      },
    } = props

    const commentsList = actions.comments.getComments()

    this.state = {
      page,
      items,
      filterValue: '',
      isLoading: false,
      renderedItems: 10,
      commentsList: commentsList || null,
    }
  }

  componentDidMount() {
    this.setState(() => ({ isLoading: true }))
    actions.user.setTransactions()
    this.setState(() => ({ isLoading: false }))

    onSwapCoreInited(() => {
      actions.core.getSwapHistory()
    })
  }

  componentDidUpdate(prevProps) {
    const { items: prevItems } = prevProps
    const { items } = this.props

    if (items !== prevItems) {
      this.createItemsState(items)
    }
  }

  createItemsState = (items) => {
    this.setState(() => ({ items }))
  }

  loadMore = () => {
    const { items } = this.props
    const { renderedItems } = this.state

    if (renderedItems < items.length) {
      this.setState(state => ({
        renderedItems: state.renderedItems + Math.min(10, items.length - state.renderedItems),
      }))
    }
  }

  rowRender = (row, rowIndex) => {
    const { activeFiat } = this.props
    const { commentsList } = this.state

    return (
      <Row
        activeFiat={activeFiat}
        key={rowIndex}
        hiddenList={commentsList}
        {...row}
      />
    )
  }

  handleFilterChange = ({ target }) => {
    const { value } = target

    this.setState(() => ({ filterValue: value }))
  }

  handleFilter = () => {
    const { filterValue, items } = this.state

    if (filterValue && filterValue.length) {
      const newRows = items.filter(({ address }) => address && address.includes(filterValue.toLowerCase()))
      this.setState(() => ({ items: newRows }))

    } else {
      this.resetFilter()
    }
  }

  loading = () => {
    this.setState(() => ({ isLoading: true }))
    setTimeout(() => this.setState(() => ({ isLoading: false })), 1000)
  }

  resetFilter = () => {

    this.loading()
    const { items } = this.props
    this.setState(() => ({ filterValue: '' }))

    this.createItemsState(items)
  }

  render() {
    const { filterValue, items, isLoading } = this.state
    const { swapHistory } = this.props
    const titles = []

    return (
      <>
        <section styleName="history">
          <h3 styleName="historyHeading">
            <FormattedMessage id="History_Activity_Title" defaultMessage="Activity" />
          </h3>
          {items ? (
            <div>
              <FilterForm
                filterValue={filterValue}
                onSubmit={this.handleFilter}
                onChange={this.handleFilterChange}
                resetFilter={this.resetFilter}
              />
              <div>
                {
                  items.length > 0 && !isLoading ? (
                    <InfiniteScrollTable
                      className={styles.history}
                      titles={titles}
                      bottomOffset={400}
                      getMore={this.loadMore}
                      itemsCount={items.length}
                      items={items.slice(0, this.state.renderedItems)}
                      rowRender={this.rowRender}
                    />
                  ) : (
                    <ContentLoader rideSideContent empty={!isLoading} nonHeader />
                  )
                }
              </div>
            </div>
          ) : (
            <div styleName="historyLoader">
              <ContentLoader rideSideContent />
            </div>
          )}
        </section>

        {/* {externalConfig.opts.invoiceEnabled && <InvoicesList onlyTable />} */}

        { swapHistory.length > 0
        && <SwapsHistory orders={swapHistory.filter((item) => item.step >= 1)} />}

      </>
    )
  }
}

export default injectIntl(History)
