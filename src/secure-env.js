if (window) {
  const propertyDefinition = {
    enumerable: true,
    configurable: false,
    writable: false
  };

  if (Object.defineProperty) {
    ['crypto', 'msCrypto', 'Math'].forEach((prop) => {
      propertyDefinition.value = window[prop];

      try {
        Object.defineProperty(window, prop, propertyDefinition);
      } catch (e) {
        console.error(e);
      }
    });

    ['random', 'max', 'min', 'pow', 'floor', 'ceil'].forEach((prop) => {
      propertyDefinition.value = Math[prop];

      try {
        Object.defineProperty(Math, prop, propertyDefinition);
      } catch (e) {
        console.error(e);
      }
    });
  }

  if (Object.freeze) {
    if (window.crypto) {
      try {
        Object.freeze(window.crypto);
      } catch (e) {
        console.error(e);
      }
    }

    if (window.msCrypto) {
      try {
        Object.freeze(window.msCrypto);
      } catch (e) {
        console.error(e);
      }
    }
  }

}
