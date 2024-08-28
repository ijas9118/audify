const slider = document.getElementById("price-slider");
const minPriceValue = document.getElementById("minPriceValue");
const maxPriceValue = document.getElementById("maxPriceValue");

noUiSlider.create(slider, {
  start: [50, 200], // Initial values
  connect: true,
  range: {
    min: 0,
    max: 1000,
  },
  format: {
    to: function (value) {
      return `$${Math.round(value)}`;
    },
    from: function (value) {
      return Number(value.replace("$", ""));
    },
  },
});

slider.noUiSlider.on("update", function (values, handle) {
  if (handle === 0) {
    minPriceValue.innerHTML = values[0];
  } else {
    maxPriceValue.innerHTML = values[1];
  }
});
