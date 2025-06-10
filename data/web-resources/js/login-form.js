import { utilities } from "./graphQLMutations/utility.js";
import { userMutations } from "./graphQLMutations/userMutations.js"

const FORM_ID = "loginForm";
const SIGNUP_FIELDS = ".signUpFields";
const SIGNIN_FIELDS = ".signInFields";

const FORM_TYPE_ATTRIBUTE = "formType";//form-type converts to formType in dataset
const SIGNIN_FORM = "login";
const SIGNUP_FORM = "createUser";


const init = ()=> {
    document.querySelectorAll('.toggleForm').forEach(
        (element) => {
            element.addEventListener('click', toggleForm);
        }
    );
    const loginForm = document.getElementById(FORM_ID);
    loginForm.addEventListener('submit', submitLogin);
}

const toggleForm = (clickEvent) => {
    let buttonClicked = clickEvent.target;
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

const submitLogin = (formSubmitEvent) => {
    formSubmitEvent.preventDefault(); // Prevent default form submission
    // Get input values
    const formType = activeFormType();
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if( formType == SIGNUP_FORM ){
        const firstName = document.getElementById('firstName').value; 
        const lastName = document.getElementById('lastName').value;
        const user = userMutations.createUser(username, password, firstName, lastName);
        console.log(user);
    }else {
        //sign in as usual...

    }

    const token = userMutations.getUserToken(username, password);
    utilities.setTokentoSS(token.token);

};

init();