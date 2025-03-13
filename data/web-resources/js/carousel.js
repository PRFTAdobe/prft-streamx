/* eslint-disable no-undef */
const loadEmblaCarousel = () =>
  new Promise((resolve, reject) => {
    const emblaCarouselScript = document.createElement('script');
    emblaCarouselScript.src =
      'https://unpkg.com/embla-carousel/embla-carousel.umd.js';
    emblaCarouselScript.defer = true;
    emblaCarouselScript.onload = resolve;
    emblaCarouselScript.onerror = reject;
    document.body.appendChild(emblaCarouselScript);
  });
const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
  const togglePrevNextBtnsState = () => {
    if (emblaApi.canScrollPrev()) prevBtn.removeAttribute('disabled')
    else prevBtn.setAttribute('disabled', 'disabled')

    if (emblaApi.canScrollNext()) nextBtn.removeAttribute('disabled')
    else nextBtn.setAttribute('disabled', 'disabled')
  }

  emblaApi
    .on('select', togglePrevNextBtnsState)
    .on('init', togglePrevNextBtnsState)
    .on('reInit', togglePrevNextBtnsState)

  return () => {
    prevBtn.removeAttribute('disabled')
    nextBtn.removeAttribute('disabled')
  }
}

const addPrevNextBtnsClickHandlers = (emblaApi, prevBtn, nextBtn) => {
  const scrollPrev = () => {
    emblaApi.scrollPrev()
  }
  const scrollNext = () => {
    emblaApi.scrollNext()
  }
  prevBtn.addEventListener('click', scrollPrev, false)
  nextBtn.addEventListener('click', scrollNext, false)

  const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
    emblaApi,
    prevBtn,
    nextBtn
  )

  return () => {
    removeTogglePrevNextBtnsActive()
    prevBtn.removeEventListener('click', scrollPrev, false)
    nextBtn.removeEventListener('click', scrollNext, false)
  }
}

const enableEmblaCarousel = async () => {
  try {
    await loadEmblaCarousel();
    const emblaCarousels = document.querySelectorAll('.embla');
    Array.from(emblaCarousels).forEach((emblaCarousel) => {
        const OPTIONS = { "loop": true}

        const emblaNode = document.querySelector('.embla')
        const viewportNode = emblaNode.querySelector('.embla__viewport')
        const prevBtnNode = emblaNode.querySelector('.embla__button--prev')
        const nextBtnNode = emblaNode.querySelector('.embla__button--next')

        const emblaApi = EmblaCarousel(viewportNode, OPTIONS)

        const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
          emblaApi,
          prevBtnNode,
          nextBtnNode
        )

        emblaApi.on('destroy', removePrevNextBtnsClickHandlers)
    });
  } catch (error) {
    console.error('Failed to load embla carousel', error);
  }
};

enableEmblaCarousel()