import { checkoutMutations } from "./graphQLMutations/checkoutMutations.js";
import { utilities } from "./graphQLMutations/utility.js";

let address = {
    firstname: '',
    lastname: '',
    street: '',
    city: '',
    region: '',
    postcode: '',
    telephone: '',
    save_in_address_book: true
};

const step1 = document.querySelectorAll('.step-1');
const step2 = document.querySelectorAll('.step-2');
const step3 = document.querySelectorAll('.step-3');

const empty = (value) =>
    value === null || value === undefined || value === '';

const isEmptyValueStep1 = () => {
    const inputList = Array.from(
        document.querySelectorAll('.checkout-form .shipping-info'),
    );

    return inputList.some((element) =>
        empty(element.value),
    );
};

const updateStep1State = async () => {
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

    return await checkoutMutations.setShippingAddress(cartID, address);
};

const updateStep2State = async () => {
    const inputList = Array.from(
        document.querySelectorAll('.checkout-form input[name="payment"]:checked'),
    );

    if (inputList.length == 0) {
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

    return await checkoutMutations.setPaymentMethod(cartID);

};

const showStep2 = async () => {
    if (!isEmptyValueStep1()) {
        const response = await updateStep1State();

        if (!response.errors) {
            const billingAddress = document.querySelector('.billing-address');
            const cartID = utilities.getCartIDFromLS();

            const billignAddressResponse = billingAddress.value ? await checkoutMutations.setBillingAddress(cartID, address, billingAddress.value) : '';
            if (billignAddressResponse.errors) {
                console.log("error while setting billing address");
            } else {
                Array.from(step1).forEach((element) => {
                    element.classList.remove('block');
                    element.classList.add('hidden');
                });
                Array.from(step2).forEach((element) => {
                    element.classList.remove('hidden');
                    element.classList.add('block');
                });
            }
        }
    }
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

const showStep3 = async () => {
    const response = await updateStep2State();

    if (!response.errors && response != null) {
        Array.from(step2).forEach((element) => {
            element.classList.remove('block');
            element.classList.add('hidden');
        });

        const cartID = utilities.getCartIDFromLS();
        const shippingMethod = await checkoutMutations.setShippingMethod(cartID);
        const placeOrder = !shippingMethod.errors ? await checkoutMutations.placeOrder(cartID) : '';

        if(!shippingMethod.errors && !placeOrder.errors) {
            Array.from(step3).forEach((element) => {
                element.classList.remove('hidden');
                element.classList.add('block');
            });
            replaceUserData();
        }
    }

};

const continuePaymentButton = () => {
    const cpButton = document.querySelectorAll('.continue-payment');
    Array.from(cpButton).forEach((button) => {
        button.addEventListener('click', () => showStep2());
    });
};

const placeOrderButton = () => {
    const poButton = document.querySelectorAll('.place-order');
    Array.from(poButton).forEach((button) => {
        button.addEventListener('click', () => showStep3());
    });
};

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
    continuePaymentButton();
    placeOrderButton();
    updatePaymentoptions();
}

