document.addEventListener('DOMContentLoaded', function () {
    // Replace 'YOUR_API_ENDPOINT' with the actual endpoint of your API
    const apiEndpoint = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

    // Include your API key in the headers
    const apiKey = '57bb5728-46ac-45ac-9840-3a1e709fa18b';
    const headers = new Headers({
        'X-CMC_PRO_API_KEY': apiKey,
        'Content-Type': 'application/json',
    });

    // Fetch cryptocurrency data from your API
    fetch(apiEndpoint, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Log the received data to the console
            console.log('Received data:', data);

            // Get the table body
            const tbody = document.querySelector('#cryptoTable tbody');

            // Clear existing rows
            tbody.innerHTML = '';

            // Check if the data contains a 'data' property
            if (data && data.data) {
                // Iterate over the list of cryptocurrencies
                data.data.forEach(crypto => {
                    // Log each crypto object to the console
                    console.log('Crypto:', crypto);

                    // Check if the required information is available
                    if (crypto.name && crypto.symbol && crypto.quote && crypto.quote.USD && crypto.quote.USD.price && crypto.last_updated) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${crypto.name}</td>
                            <td>${crypto.symbol}</td>
                            <td>${crypto.quote.USD.price.toFixed(2)}</td>
                            <td>${new Date(crypto.last_updated).toLocaleString()}</td>
                            <td><input type="text" value="0" class="amount-input" data-crypto-id="${crypto.id}" /></td>
                            <td class="total-value">0.00</td>
                        `;
                        tbody.appendChild(row);

                        // Add an event listener to the input field for amount
                        const amountInput = row.querySelector('.amount-input');
                        amountInput.addEventListener('change', () => {
                            updateTotalValue(row);
                            updateTotalPortfolioValue();
                        });

                        // Load previously entered amount from localStorage
                        const storedAmount = localStorage.getItem(`crypto-${crypto.id}`);
                        if (storedAmount !== null) {
                            amountInput.value = storedAmount;
                            updateTotalValue(row);
                            updateTotalPortfolioValue();
                        }
                    }
                });
            } else {
                console.error('Unexpected data format:', data);
            }

            // Update total portfolio value initially
            updateTotalPortfolioValue();
        })
        .catch(error => console.error('Error fetching data:', error));
});

function updateTotalValue(row) {
    const priceCell = row.cells[2];
    const amountInput = row.querySelector('.amount-input');
    const totalValueCell = row.cells[5]; // Update the index to target the correct cell

    const price = parseFloat(priceCell.textContent);
    const amount = parseFloat(amountInput.value);

    if (!isNaN(price) && !isNaN(amount)) {
        const totalValue = (price * amount).toFixed(2);
        totalValueCell.textContent = totalValue;

        // Save the entered amount to localStorage
        const cryptoId = amountInput.getAttribute('data-crypto-id');
        localStorage.setItem(`crypto-${cryptoId}`, amountInput.value);
    } else {
        totalValueCell.textContent = '0.00';
    }
}

function updateTotalPortfolioValue() {
    const totalValueCells = document.querySelectorAll('.total-value');
    let totalPortfolioValue = 0;

    totalValueCells.forEach(cell => {
        totalPortfolioValue += parseFloat(cell.textContent);
    });

    const totalPortfolioValueElement = document.querySelector('#totalPortfolioValue');
    totalPortfolioValueElement.textContent = `Total Value Portfolio: $${totalPortfolioValue.toFixed(2)}`;
}
