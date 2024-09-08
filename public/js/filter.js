document.getElementById('filter-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  // Create a FormData object from the form
  const formData = new FormData(event.target);

  // Convert FormData to a plain object
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });
  alert(formData.category)

  // Add price range to the formObject
  const minPrice = priceSlider.noUiSlider.get()[0].replace('₹', '');
  const maxPrice = priceSlider.noUiSlider.get()[1].replace('₹', '');
  formObject.minPrice = minPrice;
  formObject.maxPrice = maxPrice;

  // Convert formObject to JSON
  const body = JSON.stringify(formObject);

  // Fetch filtered and sorted products
  try {
    const response = await fetch('/shop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    // Check for successful response
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Assuming `data.productsHtml` contains the HTML for the products
    document.getElementById('product-list').innerHTML = data.productsHtml;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
});