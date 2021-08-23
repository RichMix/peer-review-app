import Context from 'components/Context'
import { getCurrentAccount, setContract } from 'connection/reviewConnection'
import { Magic } from 'magic-sdk'
import React from 'react'
import { get, axioget } from 'utils/endpoint'
import { getAllBlockchainReviews } from 'utils/review'
import Web3 from 'web3'
import AppView from './App-view'
import axios from 'axios'
axios.defaults.withCredentials = true

const customNodeOptions = {
  rpcUrl: 'https://core.bloxberg.org/', // your own node url
  chainId: 8995, // chainId of your own node
}

const URLForSetCookie =
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : window.location.origin) + '/api/authors/setcookie'

console.log('URLForSetCookie', URLForSetCookie)

// const magic = new Magic('pk_live_F9112C8C0CC44C87', { network: customNodeOptions });
const magic = new Magic('pk_test_73CB4D23D1653E8D', {
  network: customNodeOptions,
})

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      isConnectedToBloxberg: false,
      isLoggedInWithMagic: false,
      isLoggedInWithMetamask: false,
      isNoUserFound: false,
      reviewsOfUser: [],
      user: {},
      magicMetadata: null, // make falsy
      // instance: {} // @truffle/contract instance of the ReviewStorage.
    }
  }

  async componentDidMount() {
    // Check if Metamask is there and user is already logged in (window.enable()).
    // If so, prompt log in with Metamask (to avoid showing user the login screen again).
    if (typeof window.ethereum !== 'undefined') {
      console.log('Hmm you seem to have Metamask. Lets see if its enabled')
      window.ethereum.autoRefreshOnNetworkChange = false // Supress browser console warning.
      const web3 = new Web3(window.ethereum)
      setContract() // Set the contract instance. Is this the right way?
      web3.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          console.log('Yes its enabled!')
          this.loginWithMetamask()
        } else {
          console.log(
            'No, Metamask is not enabled. I will let you choose your wallet.',
          )
          this.setState({ isLoading: false })
        }
      })
    }

    // Check if there is user session already with Magic.
    else if (await magic.user.isLoggedIn()) {
      console.log('Logged in with Magic!')
      const web3 = new Web3(magic.rpcProvider)
      window.web3 = web3
      setContract() // Set the contract instance. Is this the right way?
      this.setState({
        isLoggedInWithMagic: true,
        isConnectedToBloxberg: true,
      })
      magic.user.getMetadata().then((metadata) => {
        this.setState({ magicMetadata: metadata })
        console.log('User metadata: ', metadata)
        let addr = metadata.publicAddress
        this.createCookie(addr)

        this.init(addr)
      })
    } else {
      this.setState({ isLoading: false })
      // Login with magic or Metamask
    }

    // Load the contract instance
  }

  loginWithMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        this.setState({ isLoading: true })
        const accounts = await window.ethereum.enable()
        console.log(`The account address is ${accounts[0]}`)
        const web3 = new Web3(window.ethereum)
        window.web3 = web3
        const accountAddress = await web3.utils.toChecksumAddress(accounts[0]) // ethereum.enable returns lower case addresses. Adresses saved checksumed in DB.
        const netId = await web3.eth.net.getId()
        this.checkConnectedNetwork(parseInt(netId))
        this.setState({ isLoggedInWithMetamask: true })
        this.createCookie(accountAddress)
        this.init(accountAddress)

        // Event listener for when the account is changed.
        // Fetch new user when address changes.
        window.ethereum.on('accountsChanged', async () => {
          let newAccount = await getCurrentAccount()
          console.log('Metamask account changed')
          this.setState({ isLoading: true })
          this.createCookie(newAccount)
          this.init(newAccount)
        })

        // Event listener for when the network is changed. Metamask will stop doing this automatically soon. https://github.com/MetaMask/metamask-extension/issues/8077
        // Fetch new user when address changes.
        window.ethereum.on('networkChanged', async () => {
          console.log('Connected chain changed')
          const netId = await web3.eth.net.getId()
          this.setState({ isLoading: true })
          this.checkConnectedNetwork(parseInt(netId))
          this.createCookie(accountAddress)
          this.init(accountAddress)
        })
      } catch (e) {
        this.setState({ isLoading: false })
        console.error(e)
      }
    } else {
      alert('Please install Metamask or another wallet')
    }
  }

  /**
   * Logs the user in using Magic.
   */
  loginWithMagic = async (data) => {
    const web3 = new Web3(magic.rpcProvider)
    window.web3 = web3
    setContract()
    const email = data.email
    await magic.auth.loginWithMagicLink({ email })
    let metadata = await magic.user.getMetadata()
    this.setState({
      magicMetadata: metadata,
      isLoggedInWithMagic: true,
      isConnectedToBloxberg: true,
    })
    console.log('Magic metadata:', metadata)
    this.createCookie(metadata.publicAddress)
    this.init(metadata.publicAddress)
  }

  /**
   * Logs user out from magic
   */
  logoutFromMagic = () => {
    console.log('Logging out')
    magic.user.logout().then(() => {
      console.log('Logged out')
      // localStorage.removeItem('didToken');
      this.setState({ isLoggedInWithMagic: false })
    })
  }

  // /**
  //  * Adds the review to the state. Called when reviews are successfully added to the DB and Blockchain.
  //  * @param reviewsAdded - Array of the reviews added.
  //  */
  // addReviewsToState = (reviewsAdded) => {
  //   this.setState((state) => {
  //     return state.reviewsOfUser.concat(reviewsAdded);
  //   });
  // }

  /**
   * Removes the review from the state. Called when reviews are successfully removed to the DB and Blockchain.
   * @param id - Id of the review to be deleted.
   */
  deleteReviewFromState = (id) => {
    this.setState((state) => {
      let index = state.reviewsOfUser.findIndex((review) => review.id === id)
      state.reviewsOfUser.splice(index, 1)
      return state
    })
  }
  /**
   * Function to initialize the user after web3 is injected and the accounts are unlocked.
   * Gets the user object using the address.
   * Then gets all reviews saved to blockchain of this user.
   *
   * @returns {Promise} - async function fetchBlockchainReviewsAndSetReviewsOfUser
   */
  init = (address) => {
    // Get the user object from database.
    this.setState({ isLoading: true })
    this.getUserObjAndSetUserState(address)
      .catch((err) => {
        // User not found, register.
        console.error(err)
        this.setState({ isLoading: false, isNoUserFound: true })
        return Promise.reject('reject') // Break the chain, avoid entering next then. (Is there a better practice?)
      })
      // Then fetch the reviews of the user.
      .then(this.fetchBlockchainReviewsAndSetReviewsOfUser)
      .catch((error) => {
        console.error(error)
      })
  }

  fetchBlockchainReviewsAndSetReviewsOfUser = () => {
    return getAllBlockchainReviews().then((reviewsOfUser) => {
      this.setState({
        reviewsOfUser: reviewsOfUser,
        isLoading: false,
        isNoUserFound: false,
      })
    })
  }
  /**
   * Takes and address and returns a Promise resolving to the user object from the database.
   */
  getUserObj = (address) => {
    return axioget(`/authors/${address}`)
  }

  getUserObjAndSetUserState = (address) => {
    return (
      this.getUserObj(address)
        // Get the user object from database.
        .then((user) => {
          console.log('Found user:')
          console.log(user)
          this.setState({
            user: user.data,
          })
        })
    )
  }

  refreshUser = () => {
    if (!this.state.user._id) return console.error('User object is empty!')
    this.getUserObjAndSetUserState(this.state.user._id)
  }

  // Checks if the network id is of bloxberg's. Sets the state var isConnectedToBloxberg accordingly. 8995 => bloxberg id, 5777 => ganache id
  checkConnectedNetwork = (id) => {
    console.log('Checking network id: ' + id)
    id === 8995 || id === 5777
      ? this.setState({ isConnectedToBloxberg: true })
      : this.setState({ isLoading: false, isConnectedToBloxberg: false })
  }

  // test for JWT AND COOKIE

  createCookie = (address) => {
    let addressToken = {
      addressForToken: address,
    }
    axios({
      method: 'post',
      url: URLForSetCookie,
      data: addressToken,
      headers: { withCredentials: true, 'Content-Type': 'application/json' },
    }).then((res) => {
      console.log(res.data)
    })
  }

  render() {
    return (
      <Context.Provider
        value={{
          user: this.state.user,
          reviews: this.state.reviewsOfUser,
          refreshUser: this.refreshUser,
          magicMetadata: this.state.magicMetadata,
        }}
      >
        <AppView
          addReviewsToState={this.addReviewsToState}
          deleteReviewFromState={this.deleteReviewFromState}
          loginWithMagic={this.loginWithMagic}
          logoutFromMagic={this.logoutFromMagic}
          refreshReviews={this.fetchBlockchainReviewsAndSetReviewsOfUser}
          loginWithMetamask={this.loginWithMetamask}
          {...this.state}
        />
      </Context.Provider>
    )
  }
}
