import { userMutations } from "https://lumax.streamx.com/scripts/auth/commerce/userMutations.js";
import { userSession } from "https://lumax.streamx.com/scripts/auth/user-session-utils.js";

export const loadMyWatchList = async () => {
    const activeToken = userSession.getActiveUserFromSS() ? userSession.getActiveLoginToken() : null;
};

export const updateOnLogOut = async () => {
    document.querySelector('.my-watchlist-content')?.classList.add('hidden');
    document.querySelector('.log-out-user')?.classList.remove('hidden');
}

if (location.href.includes('my-watchlist')) {
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const source = urlParams.get('source');
    if (source == 'order_email' && !userSession.getActiveUserFromSS()) {
        location.pathname = '/login.html';
    }else{
        loadMyWatchList();
    }
}