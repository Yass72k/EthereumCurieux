async function fetchCryptoPrice(cryptoId, elementId) {
    try {
        const response = await fetch(`https://api.coincap.io/v2/assets/${cryptoId}`);
        const data = await response.json();
        if (data.data && data.data.priceUsd) {
            document.getElementById(elementId).innerText = `$${parseFloat(data.data.priceUsd).toFixed(2)}`;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération du prix de ${cryptoId} :`, error);
    }
}

function startPriceUpdates() {
    fetchCryptoPrice("bitcoin", "btc-price");
    fetchCryptoPrice("ethereum", "eth-price");
    fetchCryptoPrice("xrp", "xrp-price");
    fetchCryptoPrice("tether", "usdt-price");
    fetchCryptoPrice("solana", "sol-price");
    fetchCryptoPrice("binance-coin", "bnb-price");
    fetchCryptoPrice("usd-coin", "usdc-price");
    fetchCryptoPrice("dogecoin", "doge-price");

    setInterval(() => {
        fetchCryptoPrice("bitcoin", "btc-price");
        fetchCryptoPrice("ethereum", "eth-price");
        fetchCryptoPrice("ripple", "xrp-price");
        fetchCryptoPrice("tether", "usdt-price");
        fetchCryptoPrice("solana", "sol-price");
        fetchCryptoPrice("binance-coin", "bnb-price");
        fetchCryptoPrice("usd-coin", "usdc-price");
        fetchCryptoPrice("dogecoin", "doge-price");
    }, 10000);
}

document.addEventListener("DOMContentLoaded", startPriceUpdates);
