// import { environment } from '../../environments/environment';
//
// function getUrlQueryByObject(data: any) {
//   return Object.keys(data)
//     .reduce((prev, filter) => `${prev}&filter[${filter}]=${data[filter]}`.replace(/^&/, '?')
//       , '');
// }
//
// async function api(url: string, method: string, params = {}, body = {}) {
//   const baseUrl = environment.apiUrl;
//   const token = await AsyncStorage.getItem('token');
//   const authorization = !!token ? { Authorization: `Bearer ${token}` } : null;
//   const urlQuery = getUrlQueryByObject(params);
//   const request = fetch(`${baseUrl}/${url}${urlQuery}`, {
//     method,
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       ...authorization
//     },
//     body: JSON.stringify(method === 'POST' ? body : undefined)
//   });
//
//   return request
//     .then(response => {
//       let result;
//
//       try {
//         result = response.json();
//       } catch (_) {
//         result = { message: `${response.status} ${response.statusText}` };
//       }
//
//       return result;
//     });
// }
//
// export const apiService = {
//   signIn: payload => api('login', 'POST', {}, payload),
//
//   candidatesFetchList: params => api('candidates', 'GET', params),
//
//   candidateFetchOne: id => api(`candidates/${id}`, 'GET'),
//
//   tagsByCandidateFetchList: id => api(`tags?candidate_id=${id}`, 'GET')
// };