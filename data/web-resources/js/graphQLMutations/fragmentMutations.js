import { utilities } from "./utility.js";

const fetchPromoContentFromCF = async () => {
    /* const query = JSON.stringify({
      query:  `query GetBannerByPath($path: String!) { shoppingCartBannerModelByPath(_path: $path){ item { bannerTitle bannerDescription { plaintext } imagePath { ... on DocumentRef { _path _publishUrl title } } ctaText ctaUrl } } }`,
      variables: {
        "path": "/content/dam/LumaX/shopping-cart/test-banner"
        },
    }); */
    // const fetchurl = utilities.GRAPHQL_ENDPOINT;
    const cfEndPoint = `/content/dam/LumaX/shopping-cart/test-banner`;
    const fetchurl = `/graphql/execute.json/lumax/BannerByPath;path=${cfEndPoint}`;
    const promotionContent = await utilities.fetchRequests(fetchurl, 'GET', utilities.HEADERS);
  
    return promotionContent.data.shoppingCartBannerModelByPath.item;
  }

  export const fragmentMutations = {
    fetchPromoContentFromCF
  };