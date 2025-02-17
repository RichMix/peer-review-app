import LoaderView from 'components/Loader'
import PropTypes from 'prop-types'
import React from 'react'
import {
  getLatestNIndexedReviews,
  getMostVouchedNIndexedReviews,
} from 'utils/review'
import OverviewView from './Overview-view'

export default class OverviewContainer extends React.Component {
  static propTypes = {
    reviewsOfUser: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      graphStatsData: {
        'Most Recent Review': this.getMostRecentReviewYear(),
        'First Review': this.getFirstReviewYear(),
        'Most Reviewed Publisher': this.getMostReviewedJournal(),
      },
    }
  }

  componentDidMount() {
    getLatestNIndexedReviews(4)
      .then((reviews) => {
        this.setState({ reviewVerification: reviews.data })
      })
      .catch(console.error)
    getMostVouchedNIndexedReviews(4)
      .then((reviews) => {
        this.setState({ highlightedReviews: reviews.data })
      })
      .catch(console.error)
  }

  getReviewsThisYear = () => {
    if (this.props.reviewsOfUser.length === 0) return 0
    return this.props.reviewsOfUser.reduce((accumulator, currentReview) => {
      let currentReviewYear = this.unixTimestampToUTCYear(
        currentReview.timestamp,
      )
      if (currentReviewYear === new Date().getUTCFullYear())
        return ++accumulator
      return accumulator
    }, 0)
  }

  unixTimestampToUTCYear = (timestamp) => {
    return new Date(timestamp * 1000).getUTCFullYear() // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  }

  getMostReviewedJournal = () => {
    if (this.props.reviewsOfUser.length === 0) return 'N/A'
    // from https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
    function mode(array) {
      if (array.length === 0) return null
      var modeMap = {}
      var maxEl = array[0].publisher,
        maxCount = 1
      for (var i = 0; i < array.length; i++) {
        var el = array[i].publisher
        if (modeMap[el] == null) modeMap[el] = 1
        else modeMap[el]++
        if (modeMap[el] > maxCount) {
          maxEl = el
          maxCount = modeMap[el]
        }
      }
      return maxEl
    }

    return mode(this.props.reviewsOfUser)
  }

  getMostRecentReviewYear = () => {
    if (this.props.reviewsOfUser.length === 0) return 'N/A'
    let largestTimestampedReview = this.props.reviewsOfUser.reduce(
      (accumulator, currentReview) => {
        if (currentReview.timestamp > accumulator.timestamp)
          return currentReview
        return accumulator
      },
    )
    return this.unixTimestampToUTCYear(largestTimestampedReview.timestamp)
  }

  getFirstReviewYear = () => {
    if (this.props.reviewsOfUser.length === 0) return 'N/A'
    let largestTimestampedReview = this.props.reviewsOfUser.reduce(
      (accumulator, currentReview) => {
        if (currentReview.timestamp < accumulator.timestamp)
          return currentReview
        return accumulator
      },
    )
    return this.unixTimestampToUTCYear(largestTimestampedReview.timestamp)
  }

  getNumberOfReviews = () => {
    if (this.props.reviewsOfUser.length === 0) return 0
    return this.props.reviewsOfUser.length
  }
  getNumberOfVerifiedReviews = () => {
    if (this.props.reviewsOfUser.length === 0) return 0
    return this.props.reviewsOfUser.filter((review) => review.verified === true)
      .length
  }

  // Returns the number of unique publisher names in reviewsOfUser.
  getNumberOfAffiliatedPublishers = () => {
    if (this.props.reviewsOfUser.length === 0) return 0
    // Extract publisher names as an array.
    let publisherNames = this.props.reviewsOfUser.map((review) => {
      return review.publisher
    })
    return new Set(publisherNames).size // Create a set and return its size.
  }

  render() {
    if (this.props.isLoading) return <LoaderView />

    // Format data on the cards
    let cardsData = {
      'Peer Reviews': this.getNumberOfReviews(),
      'Verified Reviews': this.getNumberOfVerifiedReviews(),
      'Reviews This Year': this.getReviewsThisYear(),
      'Affiliated Publishers': this.getNumberOfAffiliatedPublishers(),
    }

    return (
      <OverviewView
        {...this.props}
        highlightedReviews={this.state.highlightedReviews}
        reviewVerification={this.state.reviewVerification}
        graphStatsData={this.state.graphStatsData}
        cardsData={cardsData}
        reviewsOfUser={this.props.reviewsOfUser}
      />
    )
  }
}
