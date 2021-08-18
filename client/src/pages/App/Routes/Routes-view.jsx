import TopBar from 'components/TopBar'
import AddReview from 'pages/AddReview'
import AllReviews from 'pages/AllReviews'
import Overview from 'pages/Overview'
import Settings from 'pages/Settings'
import SingleReview from 'pages/SingleReview'
import VouchReview from 'pages/VouchReview'
import PropTypes from 'prop-types'
import React from 'react'
import { Redirect, Switch } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'

RoutesView.propTypes = {
  refreshReviews: PropTypes.func.isRequired,
  isLoggedInWithMetamask: PropTypes.bool.isRequired,
  isLoggedInWithMagic: PropTypes.bool.isRequired,
  isNoUserFound: PropTypes.bool.isRequired,
  isConnectedToBloxberg: PropTypes.bool.isRequired,
}

export default function RoutesView({
  isLoggedInWithMagic,
  isLoggedInWithMetamask,
  isNoUserFound,
  isConnectedToBloxberg,
  ...props
}) {
  let propsdata = { ...props }
  propsdata.user = propsdata.user.data
  console.log('RoutesViewRoutesViewRoutesView------------', { ...propsdata })

  // Don't repeat props isLoggedInWithWallet, isNoUserFound, and isConnectedToBloxberg
  // Logged in to wallet if logged in to Magic or Metamask.
  const PrivateRouteWithAuth = (propsdata) => {
    return (
      <PrivateRoute
        isLoggedInWithWallet={isLoggedInWithMagic || isLoggedInWithMetamask}
        isNoUserFound={isNoUserFound}
        isConnectedToBloxberg={isConnectedToBloxberg}
        {...propsdata}
      />
    )
  }

  const TopBarWithMagic = (propsdata) => {
    return <TopBar isLoggedInWithMagic={isLoggedInWithMagic} {...propsdata} />
  }

  return (
    <Switch>
      <PrivateRouteWithAuth path="/Overview">
        <TopBarWithMagic title="Overview" {...propsdata} />
        <Overview {...propsdata} />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/Reviews/AddReview">
        <TopBarWithMagic title="Reviews" {...propsdata} />
        <AddReview {...propsdata} refreshReviews={propsdata.refreshReviews} />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/Reviews/MyReviews">
        <TopBarWithMagic title="Reviews" {...propsdata} />
        <AllReviews {...propsdata} />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/Reviews/VouchReview">
        <TopBarWithMagic title="Reviews" {...propsdata} />
        <VouchReview {...propsdata} />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/Reviews/:id">
        <TopBarWithMagic title="Review" {...propsdata} />
        <SingleReview {...propsdata} />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/Reviews/">
        {/* Redirect to AddReview at route /Review/ */}
        <Redirect to="/Reviews/AddReview" />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/Settings">
        <TopBarWithMagic title="Settings" {...propsdata} />
        <Settings {...propsdata} />
      </PrivateRouteWithAuth>
      <PrivateRouteWithAuth path="/">
        <Redirect to="/Overview" />
      </PrivateRouteWithAuth>
    </Switch>
  )
}
