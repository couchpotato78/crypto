document.addEventListener('DOMContentLoaded', function () {
    // ... (existing code)

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
                    <td><input type="text" value="0" class="amount-input" data-crypto-id="${crypto.id}" maxlength="8" /></td>
                    <td class="total-value">0.00</td>
                `;
                tbody.appendChild(row);

                // Add an event listener to the input field for amount
                const amountInput = row.querySelector('.amount-input');
                amountInput.addEventListener('change', () => {
                    updateTotalValue(row);
                    updateTotalPortfolioValue();
                    saveChanges(row);
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

function saveChanges(row) {
    const rowData = {
        name: row.cells[0].textContent,
        symbol: row.cells[1].textContent,
        price: row.cells[2].textContent,
        lastUpdated: row.cells[3].textContent,
        amount: row.cells[4].querySelector('.amount-input').value,
        totalValue: row.cells[5].textContent,
        totalPortfolioValue: document.getElementById('totalPortfolioValue').textContent,
    };

    // Convert rowData to a JSON string
    const jsonData = JSON.stringify(rowData, null, 2);

    // Create a Blob containing the data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a link element for downloading the file
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'crypto_portfolio_change.txt';

    // Append the link to the document and trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Remove the link from the document
    document.body.removeChild(downloadLink);
}
