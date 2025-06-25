import decorateHeader from 'https://lumax.streamx.com/blocks/header/header.js';

function initHeader() {
    let navContainer = document.querySelector(".nav");
    decorateHeader(navContainer);
    navContainer.classList.remove("hidden");
}

initHeader();