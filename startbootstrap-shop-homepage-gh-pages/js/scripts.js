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

// Modification dans scripts.js

// Fonction pour récupérer le paramètre d'URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fonction pour charger la crypto choisie en priorité
async function loadSelectedCrypto() {
    const cryptoId = getQueryParam("crypto") || "bitcoin"; // Par défaut : Bitcoin
    
    try {
        const response = await fetch(`https://api.coincap.io/v2/assets/${cryptoId}`);
        const data = await response.json();
        if (data.data) {
            document.getElementById("crypto-name").innerText = data.data.name;
            document.getElementById("crypto-price").innerText = `$${parseFloat(data.data.priceUsd).toFixed(2)}`;
            document.getElementById("crypto-image").src = `assets/${data.data.id}.png`;
        }
    } catch (error) {
        console.error("Erreur lors du chargement des données de la crypto :", error);
    }
}

// Charger la crypto choisie au chargement de la page
document.addEventListener("DOMContentLoaded", loadSelectedCrypto);
