import { decorateHeader } from 'https://lumax.streamx.com/blocks/header/header.js';

async function initHeader() {
    let navContainer = document.querySelector(".nav");
    await decorateHeader(navContainer);
    navContainer.classList.remove("hidden");
}

initHeader();