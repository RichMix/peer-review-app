import * as connection from 'connection/reviewConnection'
import { getCurrentAccount } from 'connection/reviewConnection'
import { get, getXML, post, axioget, axiopost } from './endpoint'

export const getAllIndexedReviews = () => {
  let URL = '/reviews/all/?sortBy=createdAt&sortOrder=desc'
  return axioget(URL)
}

// Used in bottom part of Overview. In ListCard
export const getLatestNIndexedReviews = (limit) => {
  let URL = `/reviews/all/?limit=${limit}&sortBy=createdAt&sortOrder=desc`
  return axioget(URL)
}

export const getMostVouchedNIndexedReviews = (limit) => {
  let URL = `/reviews/all/?limit=${limit}&sortBy=vouchers&sortOrder=desc`
  return axioget(URL)
}
/**
 * Function to add a single review.
 * Takes the object created by the form in AddReview page.
 * Splits the data to be written to blockchain and to the DB.
 * Writes data to the blockchain first, then to the DB.
 *
 * @param {Object} data
 */
export const addReview = (data) => {
  // Prepare blockchain data.
  let chainData = {
    id: data.id,
    author: data.author,
    journalId: data.journalId,
    publisher: data.publisher,
    manuscriptId: data.manuscriptId,
    manuscriptHash: data.manuscriptHash,
    reviewHash: data.reviewHash,
    timestamp: data.timestamp,
    recommendation: data.recommendation,
    url: data.url,
  }
  return getCurrentAccount().then((address) => {
    // Prepare DB data.
    let dbData = {
      id: data.id,
      articleTitle: data.articleTitle,
      author: address,
      content: data.content,
      index: data.index,
      articleDOI: data.articleDOI,
    }
    console.log(chainData)
    return connection
      .addReview(chainData) // Write to blockchain.
      .then((tx) => {
        // Then to db.
        return axiopost(`/reviews/${address}`, dbData).then((dbJson) => {
          let response = {
            tx: tx,
            chainData: {
              ...chainData,
              verified: false,
              vouchers: [],
            },
            dbData: dbJson.data,
          }
          return response
        })
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        throw err
      })
  })
}

export const getAllBlockchainReviews = async () => {
  let reviewIds
  try {
    reviewIds = await connection.getOwnReviewIdsArray() // Fetch review ids to fetch reviews one by one. (Smart contract can't return all reviews at once.)
    if (reviewIds.length === 0)
      // return empty array if there are no reviews.
      return []
  } catch (e) {
    console.error('Error getting review ids. Is the contract deployed?\n')
    throw e
  }

  console.log('Review ids are')
  console.log(reviewIds)

  let reviewPromises = []
  for (let i = 0; i < reviewIds.length; i++) {
    reviewPromises.push(connection.getReview(reviewIds[i]))
  }

  return Promise.all(reviewPromises)
    .then((reviewArr) => {
      // Must format the reviews as a JSON. Data retrieved from blockchain is an array.
      return reviewArr.map((review) => {
        return {
          id: review[0],
          author: review[1],
          journalId: review[2],
          publisher: review[3],
          manuscriptId: review[4],
          manuscripthash: review[5],
          reviewHash: review[6],
          timestamp: review[7].toNumber(), // Handle BigNumber
          recommendation: review[8].toNumber(),
          url: review[9],
          verified: review[10],
          vouchers: review[11],
        }
      })
    })
    .catch((e) => {
      console.log(e)
      console.log('Error fetching reviews')
    })
}

export const getOneBlockchainReview = (id) => {
  return connection
    .getReview(id)
    .then((review) => {
      console.log(review)
      return {
        id: review[0],
        author: review[1],
        journalId: review[2],
        publisher: review[3],
        manuscriptId: review[4],
        manuscripthash: review[5],
        reviewHash: review[6],
        timestamp: review[7].toNumber(), // Handle BigNumber
        recommendation: review[8].toNumber(),
        url: review[9],
        verified: review[10],
        vouchers: review[11],
      }
    })
    .catch((e) => {
      console.log(e)
      console.log('Error fetching review')
    })
}

/**
 * Function to add multiple reviews to blockchain in a single transaction, and subsequently to the DB.
 * Takes a reviewsArr and reformats using function decomposeReviews, according to the smart contract's addMultipleReviews method.
 *
 * @param {object} reviewsArr - Array of reviews to be added.
 */
export const addMultipleReviewsFromPublons = (reviewsArr) => {
  console.log('Array of reviews to be added are:')
  console.log(reviewsArr)
  let reviewFieldsObj = decomposeReviews(reviewsArr)
  console.log('Decomposed array to object:')
  console.log(reviewFieldsObj)
  return connection.addMultipleReviewsFromPublons(reviewFieldsObj)
}

/**
 * Function to decompose reviews.
 * Takes an array of reviews and formats them into an object of arrays, where each array is a concatanation of each field of the review obj.
 *
 * @param {Array} reviewsArr - An array of review Objects
 * @returns {Object} Object consisting of an array of fields. E.g. returnedObj.journalIds returns all the journalIds of reviews as an array.
 * Example Input:
 * [{ journalId: 'SPR', manuscriptId: '13795232', manuscriptHash:'8adf343bc1...', timestamp: 543254325, recommendation: 0},
 * { journalId: 'WLY', manuscriptId: '455534123', manuscriptHash:'2cdae9836f1...', timestamp: 54352452, recommendation: 2}]
 *
 * Example output:
 *  {
 *    journalIds: ['SPR', 'WLY'],
 *    manuscriptIds: ['13795432', '455534123'],
 *    manuscriptHashes: ['8adf343bc1...', '2cdae9836f1...'],
 *    timestamps: [543254325, 54352452],
 *    recommendations: [0, 2]
 *    content:...
 *  };
 */
export const decomposeReviews = (reviewsArr) => {
  let result = {}

  reviewsArr.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      result[key] = (result[key] || []).concat([obj[key]])
    })
  })

  return result
}

export const vouchReview = (id) => {
  console.log(`Vouching review ${id}`)
  return connection.vouchReview(id)
}

export const deleteReview = (id) => {
  console.log(`Deleting review ${id}`)
  return connection.deleteReview(id)
}

export const getAllDatabaseReviews = (address) => {
  console.log(`Sending a GET at: /reviews/${address}`)
  return axioget(`/reviews/${address}`)
}

export const getOneDatabaseReview = (address, id) => {
  console.log(`Sending a GET at: /reviews/${address}/${id}`)
  return axioget(`/reviews/${address}/${id}`)
}

export const getReviewsOfArticleFromF1000R = (doi) => {
  console.log(`Sending a GET at: /reviews/xml/f1000research/?doi=${doi}`)
  return getXML(`/reviews/xml/f1000research/?doi=${doi}`)
}

export const getReviewOfArticleFromF1000R = (doi, index) => {
  console.log(
    `Sending a GET at: /reviews/xml/f1000research/?doi=${doi}&index=${index}`,
  )
  return getXML(`/reviews/xml/f1000research/?doi=${doi}&index=${index}`)
}

export const getReviewsOfAcademicFromPublons = (academicId, page) => {
  // default page = 1
  page = page === undefined ? 1 : page
  return axioget(
    `/reviews/import/publons/?academicId=${academicId}&page=${page}`,
  )
}
