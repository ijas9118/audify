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

function previewImage(event, previewId) {
  const reader = new FileReader();
  reader.onload = function () {
    const output = document.getElementById(previewId);
    output.src = reader.result;
    output.style.display = 'block';
  };
  reader.readAsDataURL(event.target.files[0]);
}

function updateMainImage(src) {
  document.getElementById('mainImage').src = src;
}