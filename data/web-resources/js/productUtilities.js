import { utilities } from "./graphQLMutations/utility.js";
import { cartMutations } from "./graphQLMutations/cartMutations.js";
import { userMutations } from "./graphQLMutations/userMutations.js";
// import { addToCartEvent } from "./analytics-functions.js"

export const addProductToCart = async (sku, quantity = 1, event) => {
    let isError = false;
    let cartID = utilities.getCartIDFromSS();
    if (!cartID) {
        cartID = await cartMutations.generateCartID();
        utilities.setCartIDtoSS(cartID);
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
        // addToCartEvent(event);
        utilities.setCartQuantityToSS(cart.total_quantity);
        utilities.updateCartCountOnUI();
    }
}

//for featured products add to cart fucntion
const featuredProductsList = document.querySelectorAll('.product-listing__product');
featuredProductsList?.forEach(featuredProductEle => {
    const productSKU = featuredProductEle.dataset.firstVariantSku;
    const addToCartCTA = featuredProductEle.querySelector('.addToCart');
    addToCartCTA.addEventListener('click', () => {
        addProductToCart(productSKU, 1)
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
        utilities.setCartQuantityToSS(response.total_quantity);
        utilities.updateCartCountOnUI();
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
        utilities.setCartQuantityToSS(response.total_quantity);
        utilities.updateCartCountOnUI();
    }
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
        utilities.setCartQuantityToSS(response.total_quantity);
        utilities.updateCartCountOnUI();
        return response;
    }
}
