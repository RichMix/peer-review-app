const URL =  'http://localhost:' + (process.env.REACT_APP_SERVER_PORT || 3000);

export const post = (endpoint, body) => {
  console.log('IN POST');
  return fetch(URL + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
};

export const get = (endpoint) => {
  return fetch(URL + endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(res => res.json());
};

export const getXML = (endpoint) => {
  return fetch(URL + endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/xml'
    },
  }).then(res => res.text());
};
