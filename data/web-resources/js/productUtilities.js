import { utilities } from "https://lumax.streamx.com/scripts/utility.js";
import { userSession } from "https://lumax.streamx.com/scripts/auth/user-session-utils.js";
import { cartMutations } from "https://lumax.streamx.com/scripts/auth/commerce/cartMutations.js";
import { userMutations } from "https://lumax.streamx.com/scripts/auth/commerce/userMutations.js";
import { addToCartEvent, addToWishlistEvent, removeFromWishlist } from "https://lumax.streamx.com/scripts/analytics/analytics-functions.js"
import { updateCartCountOnUI } from "https://lumax.streamx.com/blocks/header/header.js"
import { wishlistMutation } from "https://lumax.streamx.com/scripts/auth/commerce/wishlistMutation.js"


export const addProductToCart = async (sku, quantity = 1, event) => {
    utilities.addSpinnerSVG(event.target);
    let isError = false;
    let cartID = userSession.getCartIDFromSS();
    if (!cartID) {
        if (userSession.getActiveUserFromSS()) {
            cartID = await cartMutations.getCustomerCart();
            cartID = cartID.id;
        } else {
            cartID = await cartMutations.generateCartID();
        }
        userSession.setCartIDtoSS(cartID);
    }
    let cart = await cartMutations.addProductToCart(cartID, { sku, quantity });

    if (cart.errors) {
        isError = true;
        if (cart.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken();
            cart = await cartMutations.addProductToCart(cartID, { sku, quantity });
            isError = false;
        }
        console.log(cart.errors);
    }
    if (!isError) {
        addToCartEvent(event);
        userSession.setActiveCart(cart);
        updateCartCountOnUI(cart.total_quantity);
        utilities.addCheckmarkSVG(event.target);
    }
}

//for featured products add to cart fucntion
const featuredProductsList = document.querySelectorAll('.product-listing__product');
featuredProductsList?.forEach(featuredProductEle => {
    const productSKU = featuredProductEle.dataset.firstVariantSku;
    const addToCartCTA = featuredProductEle.querySelector('.addToCart');
    addToCartCTA.addEventListener('click', (e) => {
        addProductToCart(productSKU, 1, e)
    });
});

export const removeItemFromCart = async (cartID, uid) => {
    let isError = false;
    let response = await cartMutations.removeItemFromCart(cartID, uid);

    if (response.errors) {
        isError = true;
        if (response.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken();
            response = await cartMutations.removeItemFromCart(cartID, uid);
            isError = false;
        }
        console.log(response.errors);
    }
    if (!isError) {
        userSession.setActiveCart(response);
        updateCartCountOnUI(response.total_quantity);
    }
}

export const updateItemQuantityInCart = async (cartID, uid, quantity) => {
    let isError = false;
    let response = await cartMutations.updateProductInCart(cartID, uid, quantity);

    if (response.errors) {
        isError = true;
        if (response.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken();
            response = await cartMutations.updateProductInCart(cartID, uid, quantity);
            isError = false;
        }
        console.log(response.errors);
    }
    if (!isError) {
        userSession.setActiveCart(response);
        updateCartCountOnUI(response.total_quantity);
    }
    return response;
}

export const fetchCartByID = async (cartID) => {
    let isError = false;
    let response = await cartMutations.getCartByID(cartID);

    if (response.errors) {
        isError = true;
        if (response.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken();
            response = await cartMutations.getCartByID(cartID);
            isError = false;
        }
        console.log(response.errors);
    }
    if (!isError) {
        userSession.setActiveCart(response);
        updateCartCountOnUI(response.total_quantity);
        return response;
    }
}

export const addIncreaseDecreaseQuantityAction=()=>{let e=document.querySelector(".quantity-container");if(e){let t=parseInt(e.querySelector("span")?.textContent??"1",10),n=e.querySelector(":scope > button:nth-of-type(1)"),r=e.querySelector(":scope > button:nth-of-type(2)");n?.addEventListener("click",()=>{t>1&&1==(t-=1)&&n?.setAttribute("disabled",(!0).toString()),e.querySelector("span").innerText=t.toString()}),r?.addEventListener("click",()=>{1===t&&n?.removeAttribute("disabled"),t+=1,e.querySelector("span").innerText=t.toString()})}};

export const addProductToWatchlist = async (sku, quantity = 1, selectedOptions = [] , event) => {
    utilities.addSpinnerSVG(event.target);
    const activeToken = userSession.getActiveUserFromSS() ? userSession.getActiveLoginToken() : null
    
    if (activeToken != null) {

        let response = await wishlistMutation.addProductToWishlist(activeToken, "0", sku, quantity, selectedOptions)
        let isError = false

        if (response.errors) {

            isError = true
            if (response.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken()
                response = await wishlistMutation.addProductToWishlist(activeToken, "0", sku, quantity, selectedOptions)
                isError = false
            }
        }

        if (!isError) {
            addToWishlistEvent(event)
            utilities.addCheckmarkSVG(event.target);
            const wishlistSKUs = userSession.getWishlistSession() || []
            let itemSKU = ""
            if (document.body.dataset.pageType === "Product Detail") {
                itemSKU = document.body.dataset.sku
            } else {
                itemSKU = event.target.closest('.product-card')?.dataset.itemSku
            }
            wishlistSKUs.push(itemSKU)
            userSession.storeWishlistSession(wishlistSKUs)
        }
    }
}

export const removeProductFromWatchlist = async (itemId, event) => {
    utilities.addSpinnerSVG(event.target)
    const activeToken = userSession.getActiveUserFromSS() ? userSession.getActiveLoginToken() : null

    if (activeToken != null) {
        let response = await wishlistMutation.removeProductFromWishlist(activeToken, "0", itemId)
        let isError = false

        if (response.errors) {
            isError = true
            if (response.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken()
                response = await wishlistMutation.removeProductFromWishlist(activeToken, "0", itemId)
                isError = false
            }
        }

        if (!isError) {
            removeFromWishlist(event)
            utilities.addCheckmarkSVG(event.target)
            const wishlistSKUs = userSession.getWishlistSession() || []
            const itemSKU = event.target.closest('.product-card')?.dataset.itemSku
            const updatedWishlistSKUs = wishlistSKUs.filter(sku => sku !== itemSKU)
            userSession.storeWishlistSession(updatedWishlistSKUs)
            return response
        }
    }
}

export const updateProductInWishlist = async (itemId, quantity, event) => {
    utilities.addSpinnerSVG(event.target)
    const activeToken = userSession.getActiveUserFromSS() ? userSession.getActiveLoginToken() : null

    if (activeToken != null) {
        let response = await wishlistMutation.updateProductInWishlist(activeToken, "0", itemId, quantity)
        let isError = false

        if (response.errors) {
            isError = true
            if (response.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken()
                response = await wishlistMutation.updateProductInWishlist(activeToken, "0", itemId, quantity)
                isError = false
            }
        }

        if (!isError) {
            utilities.addCheckmarkSVG(event.target)
            return response
        }
    }
}

export const addWishlistItemToCart = async (itemId, sku, quantity = 1, event) => {
    utilities.addSpinnerSVG(event.target);
    let isError = false;
    let cartID = userSession.getCartIDFromSS();
    if (!cartID) {
        if (userSession.getActiveUserFromSS()) {
            cartID = await cartMutations.getCustomerCart();
            cartID = cartID.id;
        } else {
            cartID = await cartMutations.generateCartID();
        }
        userSession.setCartIDtoSS(cartID);
    }
    let cart = await cartMutations.addProductToCart(cartID, { sku, quantity });

    if (cart.errors) {
        isError = true;
        if (cart.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken();
            cart = await cartMutations.addProductToCart(cartID, { sku, quantity });
            isError = false;
        }
        console.log(cart.errors);
    }
    if (!isError) {
        addToCartEvent(event);
        userSession.setActiveCart(cart);
        updateCartCountOnUI(cart.total_quantity);
        removeProductFromWatchlist(itemId, event);
        utilities.addCheckmarkSVG(event.target);
        return cart;
    }
}