// eslint-disable-next-line func-names,no-unused-expressions
import { addProductToCart } from './productUtilities.js';
import { addIncreaseDecreaseQuantityAction } from './productUtilities.js';
import { productMutations } from "https://lumax.streamx.com/scripts/auth/commerce/productMutation.js";
import { userSession } from "https://lumax.streamx.com/scripts/auth/user-session-utils.js";
import { updateVariantStatusEvent, addToWishlistEvent } from "https://lumax.streamx.com/scripts/analytics/analytics-functions.js"
import { wishlistMutation } from "https://lumax.streamx.com/scripts/auth/commerce/wishlistMutation.js"

!(function () {
  const formatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  });
  let firstLoad = true;

  const swapImageAction = () => {
    const mainImage = document.querySelector('.main-image');
    const imageListContainer = document.querySelector('.image-list-container');
    if (mainImage && imageListContainer) {
      const handleMouseEnter = (event) => {
        const { target } = event;
        const { alt, src } = target;
        mainImage.alt = alt;
        mainImage.src = src;
      };
      const imageList = [
        ...imageListContainer.getElementsByClassName('image-list-item'),
      ];
      imageList.forEach((item) => {
        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('click', handleMouseEnter);
      });
    }
  };

  const buildPriceAssociativeArray = (prices) => {
    const pricesAsArray = prices.split(',');
    const pricesAssociative = [];
    pricesAsArray.forEach((price) => {
      // eslint-disable-next-line prefer-const
      let [value, ...key] = price.split(':');
      key = key.join(':');
      pricesAssociative[key] = value;
    });
    return pricesAssociative;
  };

  const isVariantInStock = (stockStatusResponse, variantSKU) => {
    const filteredVariant = stockStatusResponse?.filter(product => product.product.sku === variantSKU);
    return filteredVariant[0]?.product?.inStock;
  }

  const updateStockStatusOnUI = (isProductVariantInStock) => {
    const quantityEle = document.querySelector(".quantity-wrapper");
    const addToCartEle = document.querySelector(".add-to-cart-wrapper");
    const outOfStockEle = document.querySelector(".oos-message-container");
    const notifyMeEle = document.querySelector(".notify-me-wrapper");

    document.body.dataset.inStock = isProductVariantInStock;

    if (!firstLoad) {
      updateVariantStatusEvent();
    }

    firstLoad = false;

    if (isProductVariantInStock === true) {
      quantityEle.classList.contains('hidden') ? quantityEle.classList.remove('hidden') : '';
      addToCartEle.classList.contains('hidden') ? addToCartEle.classList.remove('hidden') : '';
      outOfStockEle.classList.contains('hidden') ? '' : outOfStockEle.classList.add('hidden');
      notifyMeEle.classList.contains('hidden') ? '' : notifyMeEle.classList.add('hidden');

    } else {
      const activeUser = userSession.getActiveUserFromSS();

      quantityEle.classList.contains('hidden') ? '' : quantityEle.classList.add('hidden');
      addToCartEle.classList.contains('hidden') ? '' : addToCartEle.classList.add('hidden');
      outOfStockEle.classList.contains('hidden') ? outOfStockEle.classList.remove('hidden') : '';

      if (activeUser && isProductVariantInStock === false) {
        notifyMeEle.classList.remove('hidden')
      } else {
        notifyMeEle.classList.add('hidden')
      }
    }
  }

  const addSwatchButtonActions = (
    swatchButtons,
    priceAssociativeArray,
    baseSku,
    stockStatusResponse
  ) => {
    Array.from(swatchButtons).forEach((swatchButton) => {
      swatchButton.addEventListener('click', (event) => {
        const activeButton =
          event.target.parentElement.querySelector('.active');
        if (activeButton) {
          activeButton.classList.remove('active');
          activeButton.classList.remove('border-black');
          activeButton.classList.add('border-transparent');
        }
        event.target.classList.add('active');
        event.target.classList.add('border-black');
        event.target.classList.remove('border-transparent');
        const selectedColor = event.target.getAttribute('title');
        const swatchLabel = document.querySelector('.swatch-label');
        swatchLabel.textContent = selectedColor;
        const thumbnail = document.querySelector(
          `.image-list-container div[data-color="${selectedColor}"] .image-list-item`,
        );
        if (thumbnail) {
          thumbnail.click();
        }

        let selectedSize;
        let price;
        const sizeButtons = document.querySelectorAll('.size-buttons button');
        if (sizeButtons.length) {
          const activeSizeButton =
            document.querySelector('.size-buttons button.active') ||
            sizeButtons[0];
          selectedSize = activeSizeButton.textContent.trim();
          price = priceAssociativeArray[`${selectedColor}:${selectedSize}`];
        } else {
          price = priceAssociativeArray[`${selectedColor}`];
        }
        const pricesParagraph = document.querySelector('p[data-prices]');
        if (price && pricesParagraph) {
          pricesParagraph.innerText = formatter.format(price);
        }
        let newSku = baseSku;
        if (selectedSize) {
          newSku = `${newSku}-${selectedSize}`;
        }
        newSku = `${newSku}-${selectedColor}`;
        document.body.dataset.sku = newSku;
        if (stockStatusResponse.length) {
          updateStockStatusOnUI(isVariantInStock(stockStatusResponse, newSku));
        }
      });
    });
  };

  const addSizeButtonActions = (
    sizeButtons,
    priceAssociativeArray,
    baseSku,
    stockStatusResponse
  ) => {
    Array.from(sizeButtons).forEach((sizeButton) => {
      sizeButton.addEventListener('click', (event) => {
        const activeButton =
          event.target.parentElement.querySelector('.active');
        if (activeButton) {
          activeButton.classList.remove('active');
          activeButton.classList.remove('border-2');
          activeButton.classList.remove('border-black');
          activeButton.classList.add('border-input');
        }
        event.target.classList.add('active');
        event.target.classList.add('border-2');
        event.target.classList.add('border-black');
        event.target.classList.remove('border-input');
        const selectedSize = event.target.textContent.trim();
        const sizeLabel = document.querySelector('.size-label');
        sizeLabel.textContent = selectedSize;

        let selectedColor;
        let price;

        const swatchButtons = document.querySelectorAll(
          '.swatch-buttons button',
        );
        if (swatchButtons.length) {
          const activeSwatchButton =
            document.querySelector('.swatch-buttons button.active') ||
            swatchButtons[0];
          selectedColor = activeSwatchButton.getAttribute('title');
          price = priceAssociativeArray[`${selectedColor}:${selectedSize}`];
        } else {
          price = priceAssociativeArray[`${selectedSize}`];
        }
        const pricesParagraph = document.querySelector('p[data-prices]');
        if (pricesParagraph) {
          pricesParagraph.innerText = formatter.format(price);
        }
        let newSku = `${baseSku}-${selectedSize}`;
        if (selectedColor) {
          newSku = `${newSku}-${selectedColor}`;
        }
        document.body.dataset.sku = newSku;

        if (stockStatusResponse.length) {
          updateStockStatusOnUI(isVariantInStock(stockStatusResponse, newSku));

          const variant = stockStatusResponse.find(v => v.product.sku === newSku)
          const notifyMeButton = document.querySelector('.notifyWhenInStock')
          
          if (variant && notifyMeButton) {
            notifyMeButton.dataset.selections = JSON.stringify(variant.selections)
          } else if (notifyMeButton) {
            notifyMeButton.dataset.selections = '[]'
          }
        }
      });
    });
  };

  const setDefaultSwatchAndPrice = (swatchButtons, sizeButtons) => {
    if (swatchButtons && swatchButtons.length) {
      const swatchButton = swatchButtons[0];
      swatchButton.click();
    }

    if (sizeButtons && sizeButtons.length) {
      const sizeButton = sizeButtons[0];
      sizeButton.click();
    }
  };

  const init = async () => {
    swapImageAction();
    const { baseSku } = document.body.dataset;
    const pricesParagraph = document.querySelector('p[data-prices]');
    const swatchButtons = document.querySelectorAll('.swatch-buttons button');
    const sizeButtons = document.querySelectorAll('.size-buttons button');

    let stockStatusResponse = await productMutations.getStockStatusBySKU(baseSku);
    stockStatusResponse = stockStatusResponse.data.variants.variants;

    if (pricesParagraph) {
      const { prices } = pricesParagraph.dataset;
      const priceAssociativeArray = buildPriceAssociativeArray(prices);
      addSwatchButtonActions(swatchButtons, priceAssociativeArray, baseSku, stockStatusResponse);
      addSizeButtonActions(sizeButtons, priceAssociativeArray, baseSku, stockStatusResponse);
      setDefaultSwatchAndPrice(swatchButtons, sizeButtons);
    }
  };

  const addToCart = () => {
    let quantity = 0;
    let skuSelected;

    const quantitySpan = document.querySelector('.quantity');

    const addToCartButton = document.querySelector('.addToCart');

    const handleAddToCartClick = (event) => {

      if (quantitySpan) {
        quantity = parseInt(quantitySpan?.innerText, 10);
      }

      skuSelected = document.body.dataset.sku;

      if (quantity && skuSelected) {
        addProductToCart(skuSelected, quantity, event);
      }
    };

    addToCartButton?.addEventListener('click', handleAddToCartClick);
  };

  const addToWatchlist = async () => {

    const notifyMeButton = document.querySelector('.notifyWhenInStock')
    const quantitySpan = document.querySelector('.quantity')

    const handleWatchlistClick = async (event) => {
      const activeToken = userSession.getActiveUserFromSS() ? userSession.getActiveLoginToken() : null
    
      if (activeToken != null) {

        const skuSelected = document.body.dataset.sku
        const quantity = quantitySpan ? parseInt(quantitySpan.innerText) : 1

        let selectedOptions = []
        try {
          selectedOptions = notifyMeButton.dataset.selections 
            ? JSON.parse(notifyMeButton.dataset.selections) 
            : []
        } catch (e) {
          selectedOptions = []
        }

        let response = await wishlistMutation.addProductToWishlist(activeToken, "0", skuSelected, quantity, selectedOptions)
        let isError = false
    
        if (response.errors) {
          if (response.errors[0].extensions?.category == 'graphql-authorization') {
            await userMutations.regenerateUserToken()
            response = await wishlistMutation.addProductToWishlist(userSession.getActiveLoginToken(), "0", skuSelected, quantity, selectedOptions)
            isError = false
          }
        }

        if (!isError) {
          addToWishlistEvent()
        }
      }
    }

    notifyMeButton?.addEventListener('click', handleWatchlistClick)
  }

  init();
  addToCart();
  addIncreaseDecreaseQuantityAction();
  addToWatchlist();
})();
