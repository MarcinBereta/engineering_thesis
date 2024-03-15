import axios from "axios"
import constants from "../../constants"

const apiCall = async (query, data, token?) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'POST',
            url: constants.url + '/graphql/',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? token : '',
            },
            data: {
                query: query,
                variables: data,
            },
        })
            .then((result) => resolve(result.data))
            .catch((error) => resolve({ errors: { axios: error } }))
    })
}

const apiCallNoToken = async (query, data) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'POST',
            url: constants.url + '/graphql/',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                query: query,
                variables: data,
            },
        })
            .then((result) => resolve(result.data))
            .catch((error) => resolve({ errors: { axios: error } }))
    })
}


export {apiCall, apiCallNoToken}