if (window) {

  if (Object.defineProperty) {
    ['crypto', 'msCrypto', 'Math'].forEach((prop) => {
      Object.defineProperty(window, prop, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: window[prop]
      });
    });

    ['random', 'max', 'min', 'pow', 'floor', 'ceil'].forEach((prop) => {
      Object.defineProperty(Math, prop, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: Math[prop]
      });
    });
  }

  if (Object.freeze) {
    if (window.crypto) {
      Object.freeze(window.crypto);
    }

    if (window.msCrypto) {
      Object.freeze(window.msCrypto);
    }

    if (window.performance) {
      Object.freeze(window.performance);
    }
  }

}
