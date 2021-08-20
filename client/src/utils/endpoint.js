import axios from 'axios'
axios.defaults.withCredentials = true
const URL =
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : window.location.origin) + '/api'

export const post = (
  endpoint,
  body,
  headers = { 'Content-Type': 'application/json' },
) => {
  console.log('IN POST')
  return fetch(URL + endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  })
    .then(handleErrors)
    .then((res) => res.json())
}

export const get = (
  endpoint,
  headers = { 'Content-Type': 'application/json' },
) => {
  return fetch(URL + endpoint, {
    method: 'GET',
    headers: headers,
  })
    .then(handleErrors)
    .then((res) => res.json())
}

export const put = (endpoint, body) => {
  console.log('IN PUT')
  console.log(body)
  return fetch(URL + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(handleErrors)
}

export const getXML = (endpoint) => {
  return fetch(URL + endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/xml',
    },
  })
    .then(handleErrors)
    .then((res) => res.text())
}

// Fetch does not `catch` HTTP statuses >3xx but has a handy ok flag.
// Throw Error to be caught if HTTP status is not OK.
// from https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
function handleErrors(response) {
  if (response.status != 200) {
    return response.json().then((errObj) => {
      console.log(errObj)
      throw new Error(errObj.description)
    })
  }
  return response
}

export const axioget = (endpoint) => {
  return axios
    .get(URL + endpoint, {
      withCredentials: true,
      'Content-Type': 'application/json',
    })
    .then(handleErrors)
    .then((res) => res)
}

export const axiopost = (endpoint, body) => {
  return axios({
    method: 'post',
    url: URL + endpoint,
    data: body,
    headers: { withCredentials: true, 'Content-Type': 'application/json' },
  })
    .then(handleErrors)
    .then((res) => res)
}

export const axioput = (endpoint, body) => {
  return axios({
    method: 'put',
    url: URL + endpoint,
    data: body,
    headers: { withCredentials: true, 'Content-Type': 'application/json' },
  })
    .then(handleErrors)
    .then((res) => res)
}
