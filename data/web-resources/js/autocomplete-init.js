!function(){let e=e=>{e.preventDefault();let t=e.currentTarget.href,a=window.adobeDataLayer||{},s=a?.getState("_perficientincpartnersandbox.search")||{};s.allSearches=1,s.searchTerm=document.getElementById("autocomplete-0-input")?.value||"",s.searchResultClicked=e.target?.innerText,s.searchResultURL=t,a.push({event:"searchClick",_perficientincpartnersandbox:{search:s}}),document.dispatchEvent(new CustomEvent("searchClick")),window.location.href=""===s.searchTerm?t:`${t}#searchTerm="${s.searchTerm}"`},t=(e,t)=>`/search/query?size=${t}&query=${e}`,a=async e=>{let t=await e.json(),a=t.hits.hits?t.hits.hits.map(s):[];return{items:a,executionTimeMs:t.took}},s=e=>{let t=e._id,a=e._score,s=e.highlight?.["payload.title"]?.[0]||e._source.payload.title,r=e.highlight?.["payload.content"]?.[0]||s||"";return{path:t,title:s,bestFragment:r,score:a}},r=async e=>{let s=await fetch(t(e,40));return a(s)},i=e=>e&&e.path?e.path:"",l=e=>"string"!=typeof e?e:e.replace(/<em>/g,"<mark>").replace(/<\/em>/g,"</mark>"),n=async()=>{let e=await fetch(t("pants",2));return a(e)},o=async()=>{let e=await fetch(t("tees",2));return a(e)},c=async()=>{let e=await fetch(t("hoodies",2));return a(e)},u=(t,a)=>t`<a class="searchResult aa-ItemLink" href=${i(a)} onClick="${t=>{e(t)}}">
      <div class="aa-ItemContent">
        <div class="aa-ItemIcon aa-ItemIcon--alignTop">
          <svg
            aria-labelledby="title"
            viewBox="0 0 24 24"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke="currentColor"
            stroke-width="2"
            class="block h-full w-auto"
            role="img"
          >
            <title id="title">Guide</title>
            <path
              d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
            ></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </div>
        <div class="aa-ItemContentBody">
          <div
            class="aa-ItemContentTitle"
            dangerouslySetInnerHTML=${{__html:l(a.title)}}
          ></div>
          <div
            class="aa-ItemContentDescription"
            dangerouslySetInnerHTML=${{__html:l(a.bestFragment)}}
          ></div>
        </div>
        <div class="aa-ItemActions">
          <button class="aa-ItemActionButton" type="button" title="Add to cart">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 10 4 15 9 20"></polyline>
              <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
            </svg>
          </button>
        </div>
      </div>
    </a>`,d=e=>{for(let t of e)"childList"===t.type&&Array.from(t.addedNodes).forEach(e=>{if(e.classList.contains("autocomplete__container")){let t=e.querySelector(".autocomplete__search-button");if(t){let a=document.createElementNS("http://www.w3.org/2000/svg","svg");a.setAttribute("height","24"),a.setAttribute("width","24"),a.setAttribute("viewBox","0 0 24 24"),a.setAttribute("fill","none"),a.setAttribute("stroke","currentColor"),a.setAttribute("stroke-linecap","round"),a.setAttribute("stroke-linejoin","round"),a.setAttribute("stroke-width","2"),a.classList.add(...["lucide","lucide-search","h-5","w-5"]);let s=document.createElementNS("http://www.w3.org/2000/svg","circle");s.setAttribute("cx","11"),s.setAttribute("cy","11"),s.setAttribute("r","8");let r=document.createElementNS("http://www.w3.org/2000/svg","path");r.setAttribute("d","m21 21-4.3-4.3"),a.append(s),a.append(r),t.appendChild(a)}}})},h=new MutationObserver(d),p=document.querySelector(".autocomplete");if(p){for(;p.firstChild;)p.removeChild(p.firstChild);h.observe(p,{childList:!0})}!function e(){let{autocomplete:t}=window["@algolia/autocomplete-js"];t({classNames:{root:"autocomplete__container",detachedSearchButton:"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 autocomplete__search-button"},container:".autocomplete",placeholder:"Search...",detachedMediaQuery:"",openOnFocus:!0,getSources:({query:e})=>[{sourceId:"pages",async getItems({query:e}){if(""===e)return[];let t=await r(e);return t.items},getItemUrl:({item:e})=>i(e),templates:{item:({item:e,html:t})=>u(t,e),noResults:""===e?void 0:()=>"No results"}},{sourceId:"hoddiesResults",async getItems({query:e}){if(e)return[];let t=await c();return t.items},getItemUrl:({item:e})=>i(e),templates:{header:({html:t})=>""===e?t`<span class="aa-SourceHeaderTitle"
                      >Hoodies</span
                    >
                    <div class="aa-SourceHeaderLine" />`:null,item:({item:e,html:t})=>u(t,e)}},{sourceId:"pantsResults",async getItems({query:e}){if(e)return[];let t=await n();return t.items},getItemUrl:({item:e})=>i(e),templates:{header:({html:t})=>""===e?t`<span class="aa-SourceHeaderTitle"
                      >Pants</span
                    >
                    <div class="aa-SourceHeaderLine" />`:null,item:({item:e,html:t})=>u(t,e)}},{sourceId:"teesResults",async getItems({query:e}){if(e)return[];let t=await o();return t.items},getItemUrl:({item:e})=>i(e),templates:{header:({html:t})=>""===e?t`<span class="aa-SourceHeaderTitle"
                      >Tees</span
                    >
                    <div class="aa-SourceHeaderLine" />`:null,item:({item:e,html:t})=>u(t,e)}},]})}()}();