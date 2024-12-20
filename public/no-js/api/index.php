<?php
header('Content-Type: application/json');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Initialize session for CSRF protection
session_start();

// Store orders in a JSON file (in production, use a proper database)
$orders_file = __DIR__ . '/orders.json';
if (!file_exists($orders_file)) {
    file_put_contents($orders_file, '{}');
}

// Fetch current rates from exchanges
function fetch_rates() {
    $rates = [];
    
    try {
        // Fetch BTC/USD as reference
        $btc_resp = file_get_contents('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        $btc_data = json_decode($btc_resp, true);
        $btc_usd = floatval($btc_data['data']['amount']);
        
        // Fetch XMR/BTC
        $xmr_resp = file_get_contents('https://api.binance.com/api/v3/ticker/price?symbol=XMRBTC');
        $xmr_data = json_decode($xmr_resp, true);
        $xmr_btc = floatval($xmr_data['price']);
        
        // Fetch LTC/BTC
        $ltc_resp = file_get_contents('https://api.binance.com/api/v3/ticker/price?symbol=LTCBTC');
        $ltc_data = json_decode($ltc_resp, true);
        $ltc_btc = floatval($ltc_data['price']);
        
        // Calculate all pairs
        $rates = [
            'XMR/BTC' => number_format($xmr_btc, 8, '.', ''),
            'BTC/XMR' => number_format(1 / $xmr_btc, 8, '.', ''),
            'LTC/BTC' => number_format($ltc_btc, 8, '.', ''),
            'BTC/LTC' => number_format(1 / $ltc_btc, 8, '.', ''),
            'XMR/LTC' => number_format($xmr_btc / $ltc_btc, 8, '.', ''),
            'LTC/XMR' => number_format($ltc_btc / $xmr_btc, 8, '.', '')
        ];
    } catch (Exception $e) {
        error_log("Error fetching rates: " . $e->getMessage());
    }
    
    return $rates;
}

// Handle POST request to create order
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'create_order') {
        $order_id = uniqid();
        $rates = fetch_rates();
        
        $from_currency = $_POST['fromCurrency'];
        $to_currency = $_POST['toCurrency'];
        $amount = floatval($_POST['amount']);
        $rate_type = $_POST['rateType'];
        
        $rate = $rates["$from_currency/$to_currency"];
        $fee = $rate_type === 'fixed' ? 0.015 : 0.01;
        $receive_amount = $amount * floatval($rate) * (1 - $fee);
        
        // Generate deposit address (in production, use your wallet system)
        $deposit_address = strtolower($from_currency) . "1qzfq9d05tg3qwfha4d20n8xe25h349y18gtenr5";
        
        $order = [
            'id' => $order_id,
            'fromCurrency' => $from_currency,
            'toCurrency' => $to_currency,
            'amount' => $amount,
            'rate' => $rate,
            'rateType' => $rate_type,
            'depositAddress' => $deposit_address,
            'recipientAddress' => $_POST['recipientAddress'],
            'receiveAmount' => $receive_amount,
            'status' => 'awaiting_payment',
            'createdAt' => time()
        ];
        
        $orders = json_decode(file_get_contents($orders_file), true);
        $orders[$order_id] = $order;
        file_put_contents($orders_file, json_encode($orders));
        
        header("Location: /no-js/order.php?id=$order_id");
        exit;
    }
}

// Handle rate updates
if (isset($_GET['action']) && $_GET['action'] === 'update_rates') {
    echo json_encode(['rates' => fetch_rates()]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
?>