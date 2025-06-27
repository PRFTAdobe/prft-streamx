import { utilities } from "https://lumax.streamx.com/scripts/utility.js";
import { userSession } from "/web-resources/js/user-session-utils.js";

const regenerateUserToken = async () => {
  const activeUser = userSession.getActiveUserFromSS();
  let activeUserObj = null;
  if( activeUser === utilities.user01.firstname || activeUser === utilities.user02.email){
    activeUserObj = utilities.user01;
  }else if ( activeUser === utilities.user02.email || activeUser === utilities.user02.email ){
    activeUserObj = utilities.user02;
  }
  if( activeUserObj ){
    const activeUserCreds = activeUser == 'user01' ? utilities.user01 : utilities.user02;
    const loginResponse = await getLoginResponse(activeUserCreds.email, activeUserCreds.password)
    if( !userResponseHasErrors(loginResponse) ){
      userSession.storeLoginSession(activeUser, getUserResponseToken(loginResponse));
    }
  }else{
    console.log("redirecting to login for standard users");
    //remove active session info, its invalid, and let them log in again.  Pass active user and page URL to login screen
    userSession.removeLoginSession();
    window.location.href = `login.html?refreshToken="${activeUser}"&returnUrl="${encodeURI(window.location.pathname)}"`;
  }
}

const createUser = async (userEmail, userPsw, firstname, lastname) => {
    const query = JSON.stringify({
      query: 
        `mutation {
          createCustomerV2(
            input: {
              firstname: "${firstname}",
              lastname: "${lastname}",
              email: "${userEmail}",
              password: "${userPsw}",
              is_subscribed: true
            }
          ) {
            customer {
              firstname,
              lastname,
              email,
              is_subscribed,
            }
          }
        }`});
    return await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
}

const getLoginResponse = async (userEmail, userPsw ) => {
      const query = JSON.stringify({
      query: `mutation {
        generateCustomerToken(email: "${userEmail}", password: "${userPsw}") {
          token
        }
      }`,
      variables: {},
    });
  
    return await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', utilities.HEADERS, query);
}


//depricated
const getUserToken = async (userEmail, userPsw) => {
    const response = await getLoginResponse(userEmail,userPsw);
    return response.data.generateCustomerToken;
}

const getCustomerOrders = async (token) => {
    const query = JSON.stringify({
      query: `{ customerOrders { items { order_number id created_at grand_total status items { id product_sku product_name quantity_ordered } } } }`
    });
  
    const response = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', {...utilities.HEADERS, 'Authorization': `Bearer ${token}`}, query);
  
    return response.errors ? response : response.data.customerOrders;
}


const customerQuery = async (token) => {
  const query = JSON.stringify({
    query: `{ customer { firstname lastname suffix email addresses { firstname lastname street city region { region_code region } postcode country_code telephone } } }`
  });
  const userData = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'POST', {...utilities.HEADERS, 'Authorization': `Bearer ${token}`}, query);
  return userData.errors ? userData : userData.data.customer;
}


const getUserResponseToken = (response) => {
  return response.data?.generateCustomerToken?.token;
}

const userResponseHasErrors = (response) =>{
  return response.errors !== undefined;
}

const getUserResponseError = (response) => {
  return userResponseHasErrors(response) ? response.errors[0].message:null;
}

export const userMutations = {
  getUserToken,
  customerQuery,
  getCustomerOrders,
  getLoginResponse,
  createUser,
  getUserResponseToken,
  userResponseHasErrors,
  getUserResponseError,
  regenerateUserToken
};
