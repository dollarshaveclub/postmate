if (window) {
  const propertyDefinition = {
    enumerable: true,
    configurable: false,
    writable: false
  };

  if (Object.defineProperty) {
    ['crypto', 'msCrypto', 'Math'].forEach((prop) => {
      propertyDefinition.value = window[prop];
      Object.defineProperty(window, prop, propertyDefinition);
    });

    ['random', 'max', 'min', 'pow', 'floor', 'ceil'].forEach((prop) => {
      propertyDefinition.value = Math[prop];
      Object.defineProperty(Math, prop, propertyDefinition);
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
