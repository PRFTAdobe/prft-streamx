import { updateItemQuantityInCart, removeItemFromCart, fetchCartByID } from "../productUtilities.js";
import { aemFragmentsMutations } from "../graphQLMutations/aemFragmentsMutations.js";
import { utilities } from "../graphQLMutations/utility.js";


const updateSubtotalPriceItem = (quantity, price) => {
    return utilities.formatCurrencyUS(quantity * price);
}

const updatePrice = async (el, price, quantity) => {
    const cartID = utilities.getCartIDFromSS();

    const uid = el.closest(".item > div").dataset.uid;
    const response = await updateItemQuantityInCart(cartID, uid, quantity);

    el.closest(".item").querySelector(".subtotal-item").innerHTML = updateSubtotalPriceItem(quantity, price);

    const subtotal = document.querySelectorAll(".item:not(.hidden) .subtotal-item");
    let total = 0;
    if (subtotal) {
        subtotal.forEach((el) => {
            const value = (el.textContent).substring(1);
            if (value) {
                total += parseFloat(value);
            }
        });
        document.querySelector('.subtotal').innerHTML = utilities.formatCurrencyUS(total);
        const discount = document.querySelector('.discount-container .discount').textContent;
        const shipping = document.querySelector('.shipping').textContent;
        if (discount != null && discount != "") {
            const value = response.prices.discounts[0].amount.value;
            if (value) {
                document.querySelector('.discount-container .discount').innerText = utilities.formatCurrencyUS(value);
                total -= value;
            } else {
                total -= parseFloat(discount.substring(1));
            }
        }
        if (shipping != null && discount != "") {
            total += parseFloat(shipping.substring(1));
        }
        document.querySelectorAll('.shipping-information-content .total').forEach((el) => {
            el.innerHTML = utilities.formatCurrencyUS(total);
        });

        document.querySelector('.total').innerHTML = utilities.formatCurrencyUS(total);
    }
}

const removeItem = (cartID) => {
    const removeItemButton = document.querySelectorAll('.remove-item');

    if (removeItemButton) {
        removeItemButton.forEach((el) => {
            el.addEventListener('click', async () => {
                const price = (el.closest(".actions-container").previousElementSibling.querySelector(".value").textContent).substring(1);
                updatePrice(el, price, 0);
                const uid = el.closest(".item > div").dataset.uid;
                el.closest('.item').remove();

                await removeItemFromCart(cartID, uid);

                if (utilities.getCartQuantityFromSS() == 0) {
                    document.querySelector('.no-products').classList.remove('hidden');
                    document.querySelector('.shopping-cart-content').classList.add('hidden');
                    document.querySelector('.shipping-information-content').classList.add('hidden');
                    document.querySelector('.loading-message').classList.add('hidden');
                }
            });
        });
    }
};

const itemTemplate = (item) => `
<div class="flex items-center space-x-4" data-uid="${item.uid}"><div class="shrink-0" data-discover="true"><img
            src="${item.product.thumbnail.url}" alt="${item.product.name}"
            class="w-24 h-24 object-cover rounded-sm"></div>
        <div class="flex-1"><div data-discover="true">
            <h3 class="font-semibold text-lg mb-1">${item.product.name}</h3>
        </div>
        <p class="text-gray-600 mb-2 price"><span class="value">${utilities.formatCurrencyUS(item.prices.price.value)}</span>
        </p>
        <div class="flex items-center space-x-4 actions-container">
            <div class="flex items-center space-x-2 quantity-container">
                <button
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-minus h-4 w-4">
                        <path d="M5 12h14"></path>
                    </svg>
                </button>
                <span class="w-8 text-center">${item.quantity}</span>
                <button
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-plus h-4 w-4">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                    </svg>
                </button>
            </div>
            <button
                class="remove-item inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" class="lucide lucide-trash2 h-4 w-4 text-red-500">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" x2="10" y1="11" y2="17"></line>
                    <line x1="14" x2="14" y1="11" y2="17"></line>
                </svg>
            </button>
        </div>
    </div>
    <div class="text-right">
        <p class="font-semibold text-lg"><span class="subtotal-item">${updateSubtotalPriceItem(item.quantity, item.prices.price.value)}</span></p>
    </div>
</div>`;

const addIncreaseDecreaseQuantityAction = () => {
    const quantityContainer = document.querySelectorAll('.quantity-container');
    if (quantityContainer) {
        quantityContainer.forEach((el) => {
            const price = (el.closest(".actions-container").previousElementSibling.querySelector(".value").textContent).substring(1);

            let quantity = parseInt(
                el.querySelector('span')?.textContent ?? '1',
                10,
            );
            const decreaseQuantityButton = el.querySelector(
                ':scope > button:nth-of-type(1)',
            );
            const increaseQuantityButton = el.querySelector(
                ':scope > button:nth-of-type(2)',
            );
            decreaseQuantityButton.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity -= 1;
                    if (quantity === 1) {
                        decreaseQuantityButton.setAttribute('disabled', true.toString());
                    }
                    if (price) {
                        updatePrice(el, parseInt(price), quantity);
                    }
                }
                el.querySelector('span').innerText = quantity;
            });
            increaseQuantityButton.addEventListener('click', () => {
                if (quantity === 1) {
                    decreaseQuantityButton.removeAttribute('disabled');
                }
                quantity += 1;
                el.querySelector('span').innerText = quantity;
                if (price) {
                    updatePrice(el, parseInt(price), quantity);
                }
            });
        });
    }
};

const promoBannerTemplate = (content) => {
    const imageAlt = content.imagePath.title ? content.imagePath.title : content.imagePath._path;
    const imagePath = content.imagePath._publishUrl.replace("https://publish-p7752-e729659.adobeaemcloud.com", "");
    return ` <div class="flex flex-col md:flex-row items-center p-6">
    <div class="w-full md:w-1/4 mb-4 md:mb-0">
      <img src="${imagePath}" alt="${imageAlt}" class="cf--promo-banner--image w-full h-48 object-cover rounded-lg"></div>
    <div class="w-full md:w-3/4 md:pl-8 text-white">
      <div class="flex items-center gap-2 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" class="lucide lucide-tag h-5 w-5">
          <path
            d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z">
          </path>
          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
        </svg><span class="font-semibold" class="cf--promo-banner--pretilte">Special Offer</span></div>
      <h2 class="text-2xl font-bold mb-2 cf--promo-banner--title">${content.bannerTitle}</h2>
      <p class="mb-4 cf--promo-banner--text">${content.bannerDescription.plaintext}</p>
      <div class="flex items-center gap-4">
          <a class="cf--promo-banner--link" href="${content.ctaUrl}" data-discover="true">
              <button class="cf--promo-banner--CTA inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-white text-dsg-red hover:bg-gray-100">
                ${content.ctaText}
              </button>
          </a>
      </div>
    </div>
  </div>`;
};

const enablePromoUI = (content) => {
    const promoDiv = document.querySelector(".cf--promo-banner--container");
    promoDiv.innerHTML = promoBannerTemplate(content);
    promoDiv.classList.remove('hidden');
}

const updatePromoUI = async () => {
    let promoData = await aemFragmentsMutations.fetchPromoContentFromCF();
    if (promoData) {
        enablePromoUI(promoData);
    }
}

export async function updateValues() {
    const cartID = utilities.getCartIDFromSS();
    let cart = await fetchCartByID(cartID);

    document.querySelectorAll('.subtotal').forEach((el) => {
        el.innerHTML = utilities.formatCurrencyUS(cart.prices.subtotal_excluding_tax.value);
    });

    if (cart.prices.subtotal_including_tax.value - cart.prices.subtotal_excluding_tax.value > 0) {
        document.querySelector('.tax-wrapper ').classList.remove('hidden');
        document.querySelectorAll('.tax').forEach((el) => {
            el.innerText = utilities.formatCurrencyUS(cart.prices.subtotal_including_tax.value - cart.prices.subtotal_excluding_tax.value);
        });
    }

    if (cart.applied_coupons != null) {
        const discounts = cart.prices.discounts[0].amount.value;
        document.querySelectorAll('.discount-container').forEach((el) => {
            el.classList.remove('hidden');
        });

        document.querySelectorAll('.discount').forEach((el) => {
            el.innerText = utilities.formatCurrencyUS(discounts);
        });

        document.querySelector('.discount-info').classList.add('hidden');
        const p = document.createElement('p');
        p.classList.add(
            'text-sm',
            'bg-light-gray',
            'p-1',
            'rounded'
        );
        p.innerHTML = cart.applied_coupons[0].code;

        const couponApplied = document.querySelector('.coupon-applied');
        couponApplied.innerHTML = ""; // Clear existing content
        couponApplied.appendChild(p);
        couponApplied.classList.remove('hidden');

        document.querySelector('#apply-discount').classList.add('hidden');
        document.querySelector('#remove-discount').classList.remove('hidden');
    } else {
        document.querySelectorAll('.discount-container').forEach((el) => {
            el.classList.add('hidden');
        });
        document.querySelectorAll('.discount').forEach((el) => {
            el.innerText = "";
            el.classList.add('hidden');
        });
    }

    const shipping = cart.shipping_addresses[0] ? cart.shipping_addresses[0].available_shipping_methods[0].amount.value : 0;
    const tot = cart.prices.grand_total.value + shipping;
    document.querySelectorAll('.shipping-information-content .total').forEach((el) => {
        el.innerHTML = document.querySelector('.total').innerText;
    });

    document.querySelectorAll('.shipping').forEach((el) => {
        el.innerText = utilities.formatCurrencyUS(shipping);
    });

    document.querySelector('.total').innerText = utilities.formatCurrencyUS(tot);

    document.querySelector('.checkout-button').addEventListener('click', () => {
        document.querySelector('.shipping-information-content').classList.remove('hidden');
        document.querySelector('.shopping-cart-content').classList.add('hidden');
    });

    document.querySelectorAll('.shipping-information-content .total').forEach((el) => {
        el.innerHTML = document.querySelector('.total').innerText;
    });
}

export async function updateCartPage() {
    const cartID = utilities.getCartIDFromSS();

    if (cartID == null) {
        document.querySelector('.no-products') && document.querySelector('.no-products').classList.remove('hidden');
        document.querySelector('.shopping-cart-content') && document.querySelector('.shopping-cart-content').classList.add('hidden');
        document.querySelector('.shopping-cart-content') && document.querySelector('.shipping-information-content').classList.add('hidden');
        document.querySelector('.cart-items-container .item') && document.querySelector('.cart-items-container .item').remove();
    } else {
        document.querySelector('.no-products').classList.add('hidden');
        document.querySelector('.loading-message').classList.remove('hidden');
        let cart = await fetchCartByID(cartID);

        if (!cart || cart.items.length == 0) {
            document.querySelector('.no-products').classList.remove('hidden');
            document.querySelector('.loading-message').classList.add('hidden');
        } else if (cart) {
            document.querySelector('.shopping-cart-content').classList.remove('hidden');
            document.querySelector('.loading-message').classList.add('hidden');
            document.querySelector('.no-products').classList.add('hidden');

            const items = cart.items;
            const itemsContainer = document.querySelector('.cart-items-container');
            itemsContainer.innerHTML = '';

            items.forEach((item) => {
                const div = document.createElement('div');
                div.classList.add(
                    'p-6',
                    'item',
                );
                div.innerHTML = itemTemplate(item).trim();
                itemsContainer.appendChild(div);
            });
            addIncreaseDecreaseQuantityAction();

            updateValues();
            removeItem(cartID);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('cart')) {
        updateCartPage();
        updatePromoUI();
    }
});