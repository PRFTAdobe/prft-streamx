import { utilities } from "https://lumax.streamx.com/scripts/utility.js";
import { userSession } from "/web-resources/js/user-session-utils.js";

import { userMutations } from "./graphQLMutations/userMutations.js";

const FORM_ID = "loginForm";
const SIGNUP_FIELDS = ".signUpFields";
const SIGNIN_FIELDS = ".signInFields";

const FORM_TYPE_ATTRIBUTE = "formType";//form-type converts to formType in dataset
const SIGNIN_FORM = "login";
const SIGNUP_FORM = "createUser";

const init = ()=> {
    if( userSession.getActiveUserFromSS() ){
        //if user is logged in, redirect to my-orders
        window.location.pathname = "/my-orders.html";
    }

    document.querySelectorAll('.toggleForm').forEach(
        (element) => {
            element.addEventListener('click', toggleForm);
        }
    );

    document.querySelectorAll(".quicklogin").forEach( 
        (button) => {
            button.addEventListener("click", 
                () => {
                    quickLogin(button));
                }
            );
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

const quickLogin = async (button) => {
    const demoUserID = button.getAttribute("data-user-id");
    const demoUserCreds = utilities[demoUser];
    console.log(utilities[demoUser]);
    
    if( demoUserCreds ){
        button.setAttribute("disabled",true);
        utilities.addSpinnerSVG(button);
        if( demoUserID.contains("user") ){
            //standard user login
            const response = await userMutations.getLoginResponse(demoUserCreds.email,demoUserCreds.password);
            showHideErrorMessage(userMutations.getUserResponseError(response));
            if( !userMutations.userResponseHasErrors(respsone)){
                utilities.addCheckmarkSVG(button);
                userSession.storeLoginSession(username,userMutations.getUserResponseToken(response));
                redirectSuccess();
            }
        }else if (demoUserID.contains("supplier")){
            //supplier login
        }
        
    }
    
}

const redirectSuccess = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const returnUrl = queryParams.get(utilities.RETURN_URL_QP); 
    if( returnUrl ){
        window.location.pathname = decodeURI(returnUrl);
    }else{
        window.location.pathname = "/my-orders.html"
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
        const user = await userMutations.createUser(username, password, firstName, lastName);
        console.log(user);
    }else {
        //sign in as usual...

    }

    const response = await userMutations.getLoginResponse(username, password);
    showHideErrorMessage(userMutations.getUserResponseError(response));//if no error, message is null which will hide field.
    if( !userMutations.userResponseHasErrors(response) ){
        //login success - store token and switch spinner to checkmark
        utilities.addCheckmarkSVG(buttonClicked);
        userSession.storeLoginSession(username,userMutations.getUserResponseToken(response));
        
        console.log("Logged in with:"+username);
        console.log("Using token:"+userMutations.getUserResponseToken(response));
        document.querySelector(".successMessage").classList.remove("hidden");
        setTimeout( () => {
            redirectSuccess();
        },2500);
    }else{
        //login failed, remove spinner and re-enable button.
        utilities.removeSpinnerSVG(buttonClicked);
        document.querySelector(".errorMessage")
        console.log("Found errors:"+userMutations.getUserResponseError(response));
    }
    buttonClicked.removeAttribute("disabled");
};

init();