import { utilities } from "./utility.js";

const fetchPromoContentFromCF = async () => {
    const now = new Date();
    const timestamp = now.getTime(); 
    const fetchurl = `${utilities.AEM_GRAPHQL_ENDPOINT}/execute.json/lumax/BannerByPath;path=${utilities.CF_PROMO_PATH}?ts=${timestamp}`;
    const promotionContent = await utilities.fetchRequests(fetchurl, 'GET', utilities.HEADERS);
  
    return promotionContent.data.shoppingCartBannerModelByPath.item;
  }

  export const aemFragmentsMutations = {
    fetchPromoContentFromCF
  };
