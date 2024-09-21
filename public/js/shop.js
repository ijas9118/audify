async function searchProduct(query) {
  // Check if the query is not empty or undefined
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  try {
    // Use fetch to send a GET request to the backend
    const response = await fetch(`shop/search-products?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const products = await response.json();
      renderSearchResults(products); // Call function to render the results
    } else {
      console.error('Error fetching products');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Function to render search results dynamically
function renderSearchResults(products) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = ''; // Clear previous results

  if (products.length === 0) {
    resultsContainer.innerHTML = '<p>No products found</p>';
    return;
  }

  // Create product cards or list items for each matching product
  products.forEach(product => {
    const productCard = `
      <div class="card mt-2">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">₹${product.price.toFixed(2)}</p>
        </div>
      </div>
    `;
    resultsContainer.innerHTML += productCard;
  });
}
