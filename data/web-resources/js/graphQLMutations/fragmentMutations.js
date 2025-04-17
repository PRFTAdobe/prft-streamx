import { utilities } from "./utility.js";

const fetchPromoContentFromCF = async () => {
    const query = JSON.stringify({
      query:  ""
    });
  
    const promotionContent = await utilities.fetchRequests(utilities.GRAPHQL_ENDPOINT, 'GET', utilities.HEADERS, query);
  
    return promotionContent.data;
  }

  export const fragmentMutations = {
    fetchPromoContentFromCF
  };