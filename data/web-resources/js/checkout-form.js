import { checkoutMutations } from "./graphQLMutations/checkoutMutations.js";
import { userMutations } from "./graphQLMutations/userMutations.js";
import { utilities } from "./graphQLMutations/utility.js";

let address = {
    firstname: '',
    lastname: '',
    street: '',
    city: '',
    region: '',
    postcode: '',
    telephone: '',
    save_in_address_book: true,
    email: ''
};

const step1 = document.querySelectorAll('.step-1');
const step2 = document.querySelectorAll('.step-2');
const step3 = document.querySelectorAll('.step-3');

const resetRadioSelection = () => {
    const payments = document.querySelectorAll('.payment-group > div');
    Array.from(payments).forEach((payment) => {
        payment.classList.remove('border-dsg-red');
        payment.classList.add('border-gray-200');
    });
};

const manageRadioOption = (event) => {
    resetRadioSelection();
    const element = event.target;
    if (element instanceof HTMLElement) {
        if (element.matches('.rounded-lg')) {
            element.querySelector('input')?.setAttribute('checked', 'true');
            element.classList.add('border-dsg-red');
            element.classList.remove('border-gray-200');
        } else if (element.matches('.aspect-square')) {
            element.nextElementSibling?.setAttribute('checked', 'true');
            element.parentElement?.classList.add('border-dsg-red');
            element.parentElement?.classList.remove('border-gray-200');
        }
    }
};

const updatePaymentoptions = () => {
    const paymentGroup = document.querySelectorAll('.payment-group > div');
    Array.from(paymentGroup).forEach((paymentOption) => {
        paymentOption.addEventListener('click', (event) => {
            manageRadioOption(event);
        });
    });
};

const replaceUserData = () => {
    const name = document.querySelector('.checkout-name');
    (name).innerText = `${address.firstname} ${address.lastname}`;

    const phone = document.querySelector('.checkout-phone');
    (phone).innerText = address.telephone;

    const street = document.querySelector('.checkout-address');
    (street).innerText = address.street;

    const city = document.querySelector('.checkout-city');
    (city).innerText = `${address.city}, ${address.region} ${address.postcode}`;

    const payment = document.querySelector('.checkout-payment');
    (payment).innerText = `${address.payment}`;
};

const updateStep2State = async () => {
    document.querySelector('.payment-error-message').classList.add('hidden');

    const inputList = Array.from(
        document.querySelectorAll('.checkout-form input[name="payment"]:checked'),
    );

    if (inputList.length == 0) {
        document.querySelector('.payment-error-message').classList.remove('hidden');
        return;
    }

    const value = inputList.reduce((acc, el) => {
        if (el.id !== undefined) {
            // Check for valid element and ID
            acc[el.name] = el.value; // Or acc[el.id] = el.value if you only want the value
        }
        return acc;
    }, {});

    address = { ...address, ...value };

    const cartID = utilities.getCartIDFromLS();
    let isError = false;

    // Set payment method
    let response = await checkoutMutations.setPaymentMethod(cartID);

    if (response.errors) {
        isError = true;
        if (response.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken();
            response = await checkoutMutations.setPaymentMethod(cartID);
            isError = false;
        }
        console.log(response.errors);
    }

    return isError;
};

const showStep3 = async () => {
    let isError = await updateStep2State();

    if (isError != null && !isError) {
        const cartID = utilities.getCartIDFromLS();

        // Set shipping method
        const shippingMethod = await checkoutMutations.setShippingMethod(cartID);
        if (shippingMethod.errors) {
            isError = true;
            if (shippingMethod.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken();
                response = await checkoutMutations.setShippingMethod(cartID);
                isError = false;
            }
            console.log(shippingMethod.errors);
        }

        if (!isError) {
            const placeOrderNumber = await checkoutMutations.placeOrder(cartID);
            if (placeOrderNumber.errors) {
                isError = true;
                if (placeOrderNumber.errors[0].extensions?.category == 'graphql-authorization') {
                    await userMutations.regenerateUserToken();
                    response = await checkoutMutations.placeOrderNumber(cartID);
                    isError = false;
                }
                console.log(placeOrderNumber.errors);
            }

            if (!isError) {
                document.querySelector('.order-number').innerHTML = placeOrderNumber;
                utilities.removeCartIDFromLS();
                utilities.removeCartQuantityFromLS();
                utilities.updateCartCountOnUI();

                Array.from(step2).forEach((element) => {
                    element.classList.remove('block');
                    element.classList.add('hidden');
                });

                Array.from(step3).forEach((element) => {
                    element.classList.remove('hidden');
                    element.classList.add('block');
                });
                const tabs = document.querySelector('.tabs');
                tabs.classList.add('hidden');

                replaceUserData();
            }
        }
    }
};

const placeOrderButton = () => {
    const poButton = document.querySelectorAll('.place-order');
    Array.from(poButton).forEach((button) => {
        button.addEventListener('click', () => showStep3());
    });
};

const updateStep1State = async () => {
    let isError = false;
    const inputList = Array.from(
        document.querySelectorAll('.checkout-form input:not([type="radio"])'),
    );
    const value = inputList.reduce((acc, el) => {
        if (el.id !== undefined) {
            if (el.id == 'region') {
                const e = el.nextElementSibling;
                acc[el.id] = e.options[e.selectedIndex].value;
            } else {
                acc[el.id] = el.value; // Or acc[el.id] = el.value if you only want the value
            }
        }
        return acc;
    }, {});

    address = { ...address, ...value };

    const cartID = utilities.getCartIDFromLS();
    const activeUser = utilities.getActiveUserFromLS();
    let response;

    // Set Guest Email on Cart when user is not logged in
    if (activeUser == null) {
        response = await checkoutMutations.setGuestEmailOnCart(cartID, address.email);
        if (response.errors) {
            isError = true;
            if (response.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken();
                response = await checkoutMutations.setGuestEmailOnCart(cartID, address.email);
                isError = false;
            }
            console.log(response.errors);
        }
    }

    if (!isError) {
        // Set shipping address
        response = await checkoutMutations.setShippingAddress(cartID, address);
        if (response.errors) {
            isError = true;
            if (response.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken();
                response = await checkoutMutations.setShippingAddress(cartID, address);
                isError = false;
            }
            console.log(response.errors);
        }
    }

    return isError;
};

const empty = (value) =>
    value === null || value === undefined || value === '';

const isEmptyValueStep1 = () => {
    const inputList = Array.from(
        document.querySelectorAll('.checkout-form div:not(.hidden) .shipping-info'),
    );

    return inputList.some((element) =>
        empty(element.value),
    );
};

const showStep2 = async () => {
    document.querySelector('.form-error-message').classList.add('hidden');
    if (!isEmptyValueStep1()) {
        let isError = await updateStep1State();

        if (!isError) {
            const billingAddress = document.querySelector('.billing-address');
            const cartID = utilities.getCartIDFromLS();

            // Set billing address
            let billignAddressResponse = billingAddress.value ? await checkoutMutations.setBillingAddress(cartID, address, billingAddress.value) : '';

            if (billignAddressResponse.errors) {
                isError = true;
                if (billignAddressResponse.errors[0].extensions?.category == 'graphql-authorization') {
                    await userMutations.regenerateUserToken();
                    billignAddressResponse = await checkoutMutations.setBillingAddress(cartID, address, billingAddress.value);
                    isError = false;
                }
                console.log(billignAddressResponse.errors);
            }

            if (!isError) {
                Array.from(step1).forEach((element) => {
                    element.classList.remove('block');
                    element.classList.add('hidden');
                });
                Array.from(step2).forEach((element) => {
                    element.classList.remove('hidden');
                    element.classList.add('block');
                });
                const shipping = document.querySelector('.shipping-information');
                const payment = document.querySelector('.payment-method');

                shipping.classList.remove('text-dsg-red');
                shipping.classList.add('text-gray-500');

                payment.classList.remove('text-gray-500');
                payment.classList.add('text-dsg-red');

                shipping.querySelector('div').classList.remove('border-dsg-red');
                shipping.querySelector('div').classList.add('border-gray-200');
                payment.querySelector('div').classList.remove('border-gray-200');
                payment.querySelector('div').classList.add('border-dsg-red');
            }
        }
    } else {
        document.querySelector('.form-error-message').classList.remove('hidden');
    }
};

const continuePaymentButton = () => {
    const cpButton = document.querySelectorAll('.continue-payment');
    Array.from(cpButton).forEach((button) => {
        button.addEventListener('click', () => showStep2());
    });
};

async function filterByCountry() {
    const statesSelect = document.querySelector('#dropdown-states');
    const statesInput = document.querySelector('#region')
    const regions = await checkoutMutations.getRegionsByCountry('US');

    statesSelect.innerHTML = '';

    regions.forEach(region => {
        statesInput.style.display = 'none';
        statesSelect.classList.remove("hidden");
        statesSelect.innerHTML += `<option value='${region.code}'>` + region.name + `</option>`;
    });
}

if (location.href.includes('cart')) {
    await filterByCountry();
    const activeUser = utilities.getActiveUserFromLS();
    if (activeUser == null) {
        document.querySelector('.email-input').classList.remove('hidden');
    }
    continuePaymentButton();
    placeOrderButton();
    updatePaymentoptions();
}

