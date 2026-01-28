import { userMutations } from "https://lumax.streamx.com/scripts/auth/commerce/userMutations.js"
import { userSession } from "https://lumax.streamx.com/scripts/auth/user-session-utils.js"
import { wishlistMutation } from "https://lumax.streamx.com/scripts/auth/commerce/wishlistMutation.js"

// Helper function to show spinner in any button
const showSpinner = (button) => {
  button.disabled = true
  button.classList.add('opacity-70', 'pointer-events-none')
  button.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `
}

export const loadMyWatchlist = async () => {
  const activeToken = userSession.getActiveUserFromSS() ? userSession.getActiveLoginToken() : null

  if (activeToken != null) {
    let wishlist = await wishlistMutation.getCustomerWishlist(activeToken)
    let isError = false

    if (wishlist.errors) {
      isError = true
      console.log(wishlist.errors)
      if (wishlist.errors[0].extensions?.category == 'graphql-authorization') {
        await userMutations.regenerateUserToken()
        wishlist = await wishlistMutation.getCustomerWishlist(userSession.getActiveLoginToken())
        isError = false
      }
    }

    if (!isError) {
      document.querySelector('.my-watchlist-content')?.classList.remove('hidden')
      document.querySelector('.log-out-user')?.classList.add('hidden')

      const itemListEmptyElement = document.querySelector('.watchlist-empty')
      const watchlistContent = document.querySelector('.watchlist-content')

      if (wishlist?.length > 0) {
        itemListEmptyElement?.classList.add('hidden')
        
        watchlistContent.innerHTML = wishlist.map(item => {
          const product = item.product
          const imageUrl = item.configured_variant?.image?.url || product.image.url
          const name = item.configured_variant?.name || product.name
          const price = product.price_range.minimum_price.final_price.value
          const stockStatus = item.configured_variant?.stock_status || product.stock_status

          const isOutOfStock = stockStatus === 'OUT_OF_STOCK'

          return `
            <div class="product-card bg-white shadow-sm border-radius p-4 rounded-md" data-item-id="${item.id}">
              <a class="m-auto" href="/products/${product.url_key}.html">
                <img alt="${name}" class="object-contain" loading="lazy" src="${imageUrl}" width="100%" height="100%">
              </a>
              <a href="/products/${product.url_key}.html">
                <h3 class="font-bold">${name}</h3>
              </a>
              <p class="font-bold">$${price.toFixed(2)}</p>
              
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button class="btn-qty-minus cursor-pointer flex items-center justify-center rounded-md border border-gray-200 h-10 w-10 shadow-sm bg-white disabled:opacity-50" ${item.quantity <= 1 ? 'disabled' : ''}> - </button> 
                  <span class="quantity w-8 text-center font-medium">${item.quantity}</span> 
                  <button class="btn-qty-plus cursor-pointer flex items-center justify-center rounded-md border border-gray-200 h-10 w-10 shadow-sm bg-white"> + </button>
                </div>

                <button class="btn-remove group cursor-pointer flex items-center justify-center rounded-md h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all active:scale-95 shadow-sm" aria-label="Eliminar producto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" x2="10" y1="11" y2="17"></line>
                    <line x1="14" x2="14" y1="11" y2="17"></line>
                  </svg>
                </button>

                <div class="add-to-cart-wrapper flex-1">
                  <button 
                    class="addToCart w-full transition active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 shadow-sm ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-600 hover:bg-red-700 text-white'}"
                    ${isOutOfStock ? 'disabled' : ''}
                  > 
                    ${isOutOfStock ? 'Out of stock' : 'Add to Cart'} 
                  </button>
                </div>
              </div>
            </div>`
        }).join('')

        watchlistContent.onclick = async (e) => {
          const card = e.target.closest('.product-card')
          if (!card) return

          const itemId = card.dataset.itemId
          const currentQty = parseInt(card.querySelector('.quantity').innerText)
          const currentToken = userSession.getActiveLoginToken()

          // Delete logic
          const btnRemove = e.target.closest('.btn-remove')
          if (btnRemove) {
            showSpinner(btnRemove)
            const res = await wishlistMutation.removeProductFromWishlist(currentToken, "0", itemId)
            if (!res.errors) loadMyWatchlist()
          }

          const btnPlus = e.target.closest('.btn-qty-plus')
          if (btnPlus) {
            showSpinner(btnPlus)
            const res = await wishlistMutation.updateProductInWishlist(currentToken, "0", itemId, currentQty + 1)
            if (!res.errors) loadMyWatchlist()
          }

          const btnMinus = e.target.closest('.btn-qty-minus')
          if (btnMinus && currentQty > 1) {
            showSpinner(btnMinus)
            const res = await wishlistMutation.updateProductInWishlist(currentToken, "0", itemId, currentQty - 1)
            if (!res.errors) loadMyWatchlist()
          }

          const btnAdd = e.target.closest('.addToCart')
          if (btnAdd && !btnAdd.disabled) {
            showSpinner(btnAdd)
            setTimeout(() => loadMyWatchlist(), 1000)
          }
        }

      } else {
        watchlistContent.innerHTML = ''
        itemListEmptyElement?.classList.remove('hidden')
      }
    }
  } else {
    updateOnLogOut()
  }
}

export const updateOnLogOut = async () => {
  document.querySelector('.my-watchlist-content')?.classList.add('hidden')
  document.querySelector('.log-out-user')?.classList.remove('hidden')
}

if (location.href.includes('my-watchlist')) {
  const queryString = location.search
  const urlParams = new URLSearchParams(queryString)
  const source = urlParams.get('source')
  if (source == 'order_email' && !userSession.getActiveUserFromSS()) {
    location.pathname = '/login.html'
  } else {
    loadMyWatchlist()
  }
}