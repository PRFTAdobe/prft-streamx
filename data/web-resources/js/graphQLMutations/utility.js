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

const addCheckmarkSVG = (button) => {
  removeSpinnerSVG();
  let wrapper = document.createElement("div");
  wrapper.class = "checkmark";
  wrapper.innerHTML = `<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                      </svg>`
  button.appendChild(wrapper);
  setTimeout(()=>{button.removeChild(wrapper);},500);
}
const addSpinnerSVG = (button) => {
  let wrapper = document.createElement("div");
  wrapper.class = "spinner";
  wrapper.innerHTML = `<svg class="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
  width="24" height="24">
  <path
    d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
    stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
  <path
    d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
    stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900">
  </path>
</svg>`
  button.appendChild(wrapper);
}
const removeSpinnerSVG = (button) => {
  button.removeChild(wrapper);
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
  updateCartCountOnUI,
  addCheckmarkSVG,
  addSpinnerSVG
} 