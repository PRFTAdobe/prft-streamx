//Session Storage Keys
const ACTIVE_USER_KEY = "active_user";
const CART_ID_KEY = "shoppingCartID";
const CART_QUANTITY = "shoppingCartQuantity";

export const user01 = {
  firstname: "prft",
  lastname: "lumax",
  email: "prft01@lumax.com",
  password: "prft@123",
  is_subscribed: true
}

export const user02 = {
  firstname: "perficient",
  lastname: "lumax",
  email: "prft02@lumax.com",
  password: "prft@123",
  is_subscribed: true
}

const getTokenKeyForUser = (userID) => {
  //base64 encoded for privacy
  return btoa(userID)+"_token";
}
  // getter setter - cartID on Local storage
const getCartIDFromSS = () => sessionStorage.getItem(CART_ID_KEY);
const setCartIDtoSS = (cartID) => sessionStorage.setItem(CART_ID_KEY, cartID);
const removeCartIDFromSS = () => sessionStorage.removeItem(CART_ID_KEY);

const getCartQuantityFromSS = () => sessionStorage.getItem(CART_QUANTITY);
const setCartQuantityToSS = (quantity) => sessionStorage.setItem(CART_QUANTITY, quantity);
const removeCartQuantityFromSS = () => sessionStorage.removeItem(CART_QUANTITY);

const getActiveUserFromSS = () => sessionStorage.getItem(ACTIVE_USER_KEY);
const setActiveUsertoSS = (user) => sessionStorage.setItem(ACTIVE_USER_KEY, user);
const removeActiveUserFromSS = () => sessionStorage.removeItem(ACTIVE_USER_KEY);

const getActiveLoginToken = () => {
  let activeUser = getActiveUserFromSS();
  let token_key = getTokenKeyForUser(activeUser);
  return sessionStorage.getItem(token_key);
}

const storeLoginSession = (user,userToken) => {
  setActiveUsertoSS(user);
  let token_key = getTokenKeyForUser(user)
  sessionStorage.setItem(token_key, userToken);
}

const removeLoginSession = () => {
  let activeUser = getActiveUserFromSS();
  let token_key = getTokenKeyForUser(activeUser);
  sessionStorage.removeItem(token_key);
  sessionStorage.removeItem(ACTIVE_USER_KEY);
}

export const userSession = {
  user01,
  user02,
  getActiveLoginToken,
  storeLoginSession,
  getCartIDFromSS,
  setCartIDtoSS,
  removeCartIDFromSS,
  getCartQuantityFromSS,
  setCartQuantityToSS,
  removeCartQuantityFromSS,
  getActiveUserFromSS,
  setActiveUsertoSS,
  removeActiveUserFromSS
} 