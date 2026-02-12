import { utilities } from "https://lumax.streamx.com/scripts/utility.js";
import { userSession } from "https://lumax.streamx.com/scripts/auth/user-session-utils.js";
import { userMutations } from "https://lumax.streamx.com/scripts/auth/commerce/userMutations.js";

const FORM_ID = "loginForm";
const SIGNUP_FIELDS = ".signUpFields";
const SIGNIN_FIELDS = ".signInFields";

const FORM_TYPE_ATTRIBUTE = "formType";//form-type converts to formType in dataset
const SIGNIN_FORM = "login";
const SIGNUP_FORM = "createUser";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const source = urlParams.get('source');

const IS_REDIRECT_TO_ORDER = source == 'order_email';

const init = ()=> {
    if( userSession.getActiveUserFromSS() ){
        //if user is logged in, redirect
        if (IS_REDIRECT_TO_ORDER) {
            window.location.pathname = "/my-orders.html"
        }else{
            window.location.pathname = "/cart.html";
        }
    }

    document.querySelectorAll('.toggleForm').forEach(
        (element) => {
            element.addEventListener('click', toggleForm);
        }
    );

    const userDropdown = document.getElementById('userDropdown');
    const signAsButton = document.getElementById('signAsButton');

    populateUserDropdown(userDropdown);

    userDropdown.addEventListener('change', e => {
        signAsButton.disabled = !e.target.value;
    });
    signAsButton.addEventListener("click", () => {
        quickLogin(signAsButton, userDropdown.value);
    });

    const loginForm = document.getElementById(FORM_ID);
    let queryParams = new URLSearchParams(window.location.search);
    let activeUser = queryParams.get(utilities.REFRESH_TOKEN_QP);
    if(activeUser){
        document.getElementById("email").value = activeUser;
        document.querySelector(".signInFields .expiredSession").classList.remove("hidden");
        document.querySelector(".signInFields .descText").classList.add("hidden");
    }
    
    loginForm.addEventListener('submit', submitLogin);
}

const initCart = async () => {
    const header = await import ("https://lumax.streamx.com/blocks/header/header.js");
    await header.updateCartDetailsOnLoad(true);
}

const initWishlist = async (token) => {
    const wishlist = await import ("https://lumax.streamx.com/scripts/auth/commerce/wishlistMutation.js");
    let getCustomerWishlistResponse = await wishlist.getCustomerWishlist(activeToken)
    let isError = false

    if (getCustomerWishlistResponse.errors) {
      isError = true
      console.log(getCustomerWishlistResponse.errors)
      if (getCustomerWishlistResponse.errors[0].extensions?.category == 'graphql-authorization') {
        await userMutations.regenerateUserToken()
        getCustomerWishlistResponse = await wishlist.getCustomerWishlist(userSession.getActiveLoginToken())
        isError = false
      }
    }

    if (!isError) {
        const wishlistSKUs = []
        if (getCustomerWishlistResponse?.length > 0) {
            getCustomerWishlistResponse.forEach(item => {
                wishlistSKUs.push(item.configured_variant?.sku || item.product.sku)
            })
        }
        userSession.storeWishlistSession(wishlistSKUs)
    }
}

const toggleForm = (clickEvent) => {
    let currentForm = activeFormType();
    //toggle signin fields based on current display
    toggleFields(SIGNIN_FIELDS,currentForm == SIGNUP_FORM);
    //toggle signup fields based on current display
    toggleFields(SIGNUP_FIELDS,currentForm == SIGNIN_FORM);
    //toggle display attribute to match updated value.
    return activeFormType(currentForm == SIGNIN_FORM ? SIGNUP_FORM:SIGNIN_FORM);
}

const toggleFields = (selector, isVisible)=> {
    document.querySelectorAll(selector).forEach(
        (element) => {
            isVisible ? element.classList.remove("hidden"):element.classList.add("hidden");
            element.querySelectorAll("input").forEach(
                (childInput) => {
                    isVisible ? childInput.removeAttribute("disabled"):childInput.setAttribute("disabled",true);
                }
            )
        }
    );
}

const activeFormType = (newValue) => {
    if( newValue ){
        document.getElementById(FORM_ID).dataset[FORM_TYPE_ATTRIBUTE] = newValue;
    }
    return document.getElementById(FORM_ID).dataset[FORM_TYPE_ATTRIBUTE];
}

const showHideErrorMessage = (message) => {
    let errorMessageEl = document.querySelector("p.errorMessage");

    if( message === null || message === "" ){//empty, hide
        errorMessageEl.innerText = "";
        errorMessageEl.classList.add("hidden");
    }else{
        errorMessageEl.innerText = message;
        errorMessageEl.classList.remove("hidden");
    }
}

const quickLogin = async (button, demoUserID) => {
    userSession.removeLoginSession();
    const demoUserCreds = userSession[demoUserID];
    
    if( demoUserCreds ){
        button.setAttribute("disabled",true);
        utilities.addSpinnerSVG(button);
        const response = await userMutations.getLoginResponse(demoUserCreds.email,demoUserCreds.password);
        showHideErrorMessage(userMutations.getUserResponseError(response));
        if(!userMutations.userResponseHasErrors(response)){
            utilities.addCheckmarkSVG(button);
            userSession.storeLoginSession(demoUserCreds.email,userMutations.getUserResponseToken(response));
            const isSupplier = await userMutations.isSupplier(userMutations.getUserResponseToken(response));
            if (!isSupplier) {
                await initCart();
                await initWishlist(userMutations.getUserResponseToken(response));
                redirectSuccess();
            } else {
              redirectSupplierSuccess();  
            }
        }    
    }
}

const redirectSupplierSuccess = async () => {
    window.location.pathname = "/supplier-dashboard";
}

const redirectSuccess = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const returnUrl = queryParams.get(utilities.RETURN_URL_QP); 
    if( returnUrl ){
        window.location.pathname = decodeURI(returnUrl);
    }else if (IS_REDIRECT_TO_ORDER) {
        window.location.pathname = "/my-orders.html"
    }else{
        window.location.pathname = "/cart.html"
    }
}

const submitLogin = async (formSubmitEvent) => {  
    formSubmitEvent.preventDefault(); // Prevent default form submission
    // Get input values
    var buttonClicked = formSubmitEvent.submitter;

    //don't allow spamming the submit event!
    buttonClicked.setAttribute("disabled", true);
    utilities.addSpinnerSVG(buttonClicked);

    const formType = activeFormType();
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if( formType == SIGNUP_FORM ){
        const firstName = document.getElementById('firstName').value; 
        const lastName = document.getElementById('lastName').value;
        const createUserResp = await userMutations.createUser(username, password, firstName, lastName);
        showHideErrorMessage(userMutations.getUserResponseError(createUserResp));
        if(userMutations.userResponseHasErrors(createUserResp)){
            utilities.removeSpinnerSVG(buttonClicked);
            buttonClicked.removeAttribute("disabled");
            return;
        } 
    }

    const response = await userMutations.getLoginResponse(username, password);
    showHideErrorMessage(userMutations.getUserResponseError(response));//if no error, message is null which will hide field.
    if( !userMutations.userResponseHasErrors(response) ){
        //login success - store token and switch spinner to checkmark
        utilities.addCheckmarkSVG(buttonClicked);
        userSession.storeLoginSession(username,userMutations.getUserResponseToken(response));
        const isSupplier = await userMutations.isSupplier(userMutations.getUserResponseToken(response));
            if (!isSupplier) {   
                await initCart();
                await initWishlist(userMutations.getUserResponseToken(response));
                document.querySelector(".successMessage").classList.remove("hidden");
                setTimeout( () => {
                    redirectSuccess();
                },2500);
            } else {
                document.querySelector(".successMessage").classList.remove("hidden");
                setTimeout( () => {
                    redirectSupplierSuccess();  
                },2500);
            }
    }else{
        //login failed, remove spinner and re-enable button.
        utilities.removeSpinnerSVG(buttonClicked);
        console.log("Found errors:"+userMutations.getUserResponseError(response));
    }
    buttonClicked.removeAttribute("disabled");
};

const populateUserDropdown = (userDropdown) => {
    userSession.suppliers.forEach( (supplier, index) => {
        const display_name = `${supplier.firstname} - ${supplier.jobTitle}`;
        const option = document.createElement('option');
        option.value = `supplier${index+1}`;
        option.className = "flex items-center py-2";
        const span = document.createElement('span');
        span.textContent = display_name;
        option.appendChild(span);
        userDropdown.appendChild(option);
    });
};

init();