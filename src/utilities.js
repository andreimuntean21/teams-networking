export function $(selector) {
  return document.querySelector(selector);
}

export function debounce(fn, ms) {
  let timer;
  console.info("debounce", ms);

  return function (e) {
    console.info("inside debounce...", e.target.value);

    clearTimeout(timer);
    timer = setTimeout(function () {
      console.warn("debounce timeout");
      fn(e);
    }, ms);
    //console.info("timer %o", timer);
  };
}

/**
 *
 * @param {String|Element} el
 */

export function mask(el) {
  if (typeof el == "string") {
    el = $(el);
  }
  el && el.classList.add("loading-mask");
}

/**
 *
 * @param {String|Element} el
 */

export function unmask(el) {
  if (typeof el == "string") {
    el = $(el);
  }
  el.classList.remove("loading-mask");
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async () => {
  console.info("1. start sleeping...");
  await sleep(2000);
})();

export function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(([key, value]) => {
      if (key !== "id") {
        return value.toLowerCase().includes(search);
      }
    });
  });
}
