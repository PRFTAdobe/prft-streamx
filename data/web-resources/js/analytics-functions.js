function sendECommerceEvent(product){
  let products = window.adobeDataLayer.getState("_perficientincpartnersandbox.product");
  if( !products ) products = [];
  
  let exists = false;
  for(var i=0;i<products.length;i++){
    if(products[i].sku === product.sku){
      exists = true;
      //if product is already in cart, update quantity
      if(products[i].cartAdd && product.cartAdd){
        products[i].cartAdd.value = product.cartAdd.value;
        products[i].cartAdd.quantity += product.cartAdd.quantity;
      }else if(product.cartAdd){//if new add-to-cart event, just copy cart info
        products[i].cartAdd = product.cartAdd
      }
      //if page Impression does not exist on product previously, add it.
      if(!products[i].pageImpression && product.pageImpression){
        products[i].pageImpression = product.pageImpression;
      }
      break;
    }
  }
  if(!exists) products.push(product);
    window.adobeDataLayer.push({
    "event": "eCommerce",
     "_perficientincpartnersandbox" : {
       "product": products
     }
  });
  return products;
}

function getProductDetails(event){
  let productDetailsJSON = null;
  if( document.body.getAttribute("data-page-type") === "Product Detail" ){
    //Detail Page
    productDetailsJSON = document.body.getAttribute("data-product-details");
  }else if (event){
    //listing-tile, only from add-to-cart clicks
    console.log("Event Type:"+typeof event);
    const product = event?.target?.closest(".product-listing__product");
    productDetailsJSON = product?.getAttribute("data-product-details");
  }

  return productDetailsJSON ? JSON.parse(productDetailsJSON.replaceAll("\n","")):null;
}

function addToCart(event){
  let productDetails = getProductDetails(event);
  if (productDetails){
    let quantity = parseInt(document.querySelector("span.quantity")?.innerHTML || 1 );
    productDetails.cartAdd = {"value": 1,"quantity":quantity};//todo, update to not use innerHTML...
    sendECommerceEvent(productDetails);
  }
}

function pageLoaded(){
  let pagePath = window.location.pathname;
  let pageType = document.body.hasAttribute("data-page-type") ? document.body.getAttribute("data-page-type") : "Content Page";
  if( pagePath === "/"){
    pageType = "Homepage";
  }else if( pagePath === "/cart.html"){
    pageType = "Cart"
  }
  
  let userName = window.localStorage.active_user;
  let userInfo = {
    "loggedInStatus": userName ? "true":"false",
  }
  if( userName ){
    userInfo.userId = userName;
  }
  
  let pageInfo = {
    "pageName": document.title,
    "pageType": pageType || "Content Page",
    "pageURL": pagePath,
    "fullPageURL": window.location.href,
  };
  
  if( document.body.hasAttribute("data-product-category") ){
    pageInfo.category = document.body.getAttribute("data-product-category");
  }

  window.adobeDataLayer.push({
    "event":"pageLoaded",
    "_perficientincpartnersandbox" : {
      "pageInfo":pageInfo,
      "user":userInfo
    }
  });
  
  let productDetails = getProductDetails();  
  if( productDetails ){
    productDetails.productImpression = {"value":1};
    sendECommerceEvent(productDetails);
  }
}

//add to cart logic
function initAddToCartClick(){
  const elements = document.getElementsByClassName("addToCart");
  Array.from(elements).forEach(function(element) {
    element.addEventListener('click', addToCart);
  });
}

window.adobeDataLayer = window.adobeDataLayer || [];
document.addEventListener("resultsLoaded", initAddToCartClick )
initAddToCartClick();
pageLoaded();