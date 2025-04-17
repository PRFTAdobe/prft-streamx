import { utilities } from "./utility.js";

const fetchPromoContentFromCF = async () => {
    const fetchurl = `${utilities.AEM_GRAPHQL_ENDPOINT}/execute.json/lumax/BannerByPath;path=${utilities.CF_PROMO_PATH}`;
    const promotionContent = await utilities.fetchRequests(fetchurl, 'GET', utilities.HEADERS);
  
    return promotionContent.data.shoppingCartBannerModelByPath.item;
  }

  export const fragmentMutations = {
    fetchPromoContentFromCF
  };