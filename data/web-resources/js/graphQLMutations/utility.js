//global vars
const GRAPHQL_ENDPOINT = `/graphql`;

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'mode': 'no-cors',
  'Content-Type': 'application/json',
  'store': 'lumax'
};

const user01 = {
  firstname: "prft",
  lastname: "lumax",
  email: "prft01@lumax.com",
  password: "prft@123",
  is_subscribed: true
}

const user02 = {
  firstname: "perficient",
  lastname: "lumax",
  email: "prft02@lumax.com",
  password: "prft@123",
  is_subscribed: true
}

const fetchRequests = async (url, method, headers, body) => {
    const requestOptions = {
      method,
      headers,
      body,
      redirect: 'follow',
    };
    const response = await fetch(url, requestOptions);
    return await response.json();
}

  // getter setter - cartID on Local storage
const getCartIDFromSS = () => sessionStorage.getItem("shoppingCartID");
const setCartIDtoSS = (cartID) => sessionStorage.setItem("shoppingCartID", cartID);
const removeCartIDFromSS = () => sessionStorage.removeItem("shoppingCartID");

const getCartQuantityFromSS = () => sessionStorage.getItem("shoppingCartQuantity");
const setCartQuantityToSS = (quantity) => sessionStorage.setItem("shoppingCartQuantity", quantity);
const removeCartQuantityFromSS = () => sessionStorage.removeItem("shoppingCartQuantity");

// getter setter user token 
const getUser1TokenFromSS = () => sessionStorage.getItem("user1_token");
const setUser1TokentoSS = (userToken) => sessionStorage.setItem("user1_token", userToken);
const removeUser1TokenFromSS = () => sessionStorage.removeItem("user1_token");

const getUser2TokenFromSS = () => sessionStorage.getItem("user2_token");
const setUser2TokentoSS = (userToken) => sessionStorage.setItem("user2_token", userToken);
const removeUser2TokenFromSS = () => sessionStorage.removeItem("user2_token");

const getActiveUserFromSS = () => sessionStorage.getItem("active_user");
const setActiveUsertoSS = (user) => sessionStorage.setItem("active_user", user);
const removeActiveUserFromSS = () => sessionStorage.removeItem("active_user");

const getTokenFromSS = () => getActiveUserFromSS() == 'user01' ? getUser1TokenFromSS() : getUser2TokenFromSS();
const setTokentoSS = (userToken) => getActiveUserFromSS() == 'user01' ? setUser1TokentoSS(userToken) : setUser2TokentoSS(userToken); 
const removeTokenFromSS = () => getActiveUserFromSS() == 'user01' ? removeUser1TokenFromSS() : removeUser2TokenFromSS(); 

const updateCartCountOnUI = () => { 
  const cartQuantity = getCartQuantityFromSS(); 
  document.querySelector('.cart-quantity').innerText = cartQuantity ? cartQuantity : 0;
}

export const utilities = {
  GRAPHQL_ENDPOINT,
  HEADERS,
  user01,
  user02,
  fetchRequests,
  getCartIDFromSS,
  setCartIDtoSS,
  removeCartIDFromSS,
  getCartQuantityFromSS,
  setCartQuantityToSS,
  removeCartQuantityFromSS,
  getTokenFromSS,
  setTokentoSS,
  removeTokenFromSS,
  getActiveUserFromSS,
  setActiveUsertoSS,
  removeActiveUserFromSS,
  updateCartCountOnUI
} 