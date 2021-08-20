import { getCurrentAccount } from 'connection/reviewConnection'
import { get, post, put, axiopost, axioput, axioget } from './endpoint'

const ORCiD_URL = 'https://sandbox.orcid.org/v2.1'

export const getAllAuthorNames = () => {
  return axioget('/authors/')
}

/**
 * Function to add a single author.
 * Takes the object created by the form in Register page.
 *
 * @param {Object} data
 */
export const addAuthor = (data) => {
  return getCurrentAccount().then((address) => {
    // Prepare DB data.
    let dbData = {
      ...data,
      reviews: [],
    }
    console.log(`User data to be saved: ${dbData}`)
    return axiopost(`/authors/${address}`, dbData)
  })
}

export const updateAuthor = (author) => {
  console.log(author)
  return getCurrentAccount().then((address) => {
    console.log(`Sending put to /authors/${address}`)
    return axioput(`/authors/${address}`, author)
  })
}

export const requestAccessToken = (authCode) => {
  let msg = { code: authCode }
  return axiopost('/authors/orcid/oauth/token', msg)
}

export const requestOrcidName = (orcid, accessToken) => {
  let headers = { Authorization: 'Bearer ' + accessToken }
  console.log(`Sending a get to /authors/orcid/${orcid}/person`)
  return axioget(`/authors/orcid/${orcid}/person`, headers)
    .then((personObj) => {
      return {
        firstName: personObj.name['given-names'].value,
        lastName: personObj.name['family-name'].value,
      }
    })
    .catch((err) => console.error(err))
}

/**
 *
 * @returns {String[]} - Array of emails, empty array if no mails exist.
 * @param {*} orcid
 * @param {*} accessToken
 */
export const requestOrcidEmails = (orcid, accessToken) => {
  let headers = { Authorization: 'Bearer ' + accessToken }
  console.log(`Sending a get to /authors/orcid/${orcid}/email`)
  return axioget(`/authors/orcid/${orcid}/email`, headers)
    .then((emailObj) => {
      console.log(emailObj)
      return {
        emails: emailObj.email,
      }
    })
    .catch((err) => console.error(err))
}
