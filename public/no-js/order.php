<?php
$order_id = $_GET['id'] ?? '';
$orders_file = __DIR__ . '/api/orders.json';
$orders = json_decode(file_get_contents($orders_file), true);
$order = $orders[$order_id] ?? null;

if (!$order) {
    header("Location: /no-js/index.html");
    exit;
}

// Handle rate update for dynamic orders
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_rate') {
    if ($order['rateType'] === 'dynamic') {
        $rates_json = file_get_contents('http://localhost/no-js/api/index.php?action=update_rates');
        $rates = json_decode($rates_json, true)['rates'];
        
        $pair = $order['fromCurrency'] . '/' . $order['toCurrency'];
        $new_rate = $rates[$pair];
        
        $order['rate'] = $new_rate;
        $order['receiveAmount'] = $order['amount'] * floatval($new_rate) * 0.99;
        
        $orders[$order_id] = $order;
        file_put_contents($orders_file, json_encode($orders));
    }
    
    header("Location: /no-js/order.php?id=$order_id");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order <?= htmlspecialchars($order_id) ?> - CryptoSwap</title>
    <link rel="stylesheet" href="/src/index.css">
</head>
<body class="bg-[#1a1d24] text-white">
    <header class="bg-[#22262e] border-b border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex h-16 items-center justify-between">
                <div class="flex items-center">
                    <span class="ml-2 text-xl font-bold">CryptoSwap</span>
                </div>
                <nav class="flex items-center gap-6">
                    <a href="/no-js/index.html" class="text-sm text-gray-400 hover:text-blue-400">Home</a>
                    <a href="/no-js/faq.html" class="text-sm text-gray-400 hover:text-blue-400">FAQ</a>
                    <a href="/no-js/support.html" class="text-sm text-gray-400 hover:text-blue-400">Support</a>
                    <a href="/" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                        <span class="text-sm">No-JS Mode <span class="text-green-400">On</span></span>
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-[#22262e] rounded-lg p-6 border border-gray-800">
            <div class="mb-6">
                <h2 class="text-2xl font-bold">Order Details</h2>
                <div class="mt-1">
                    <span class="text-sm text-gray-400">Order ID:</span>
                    <code class="ml-2 text-sm bg-[#2c313c] px-2 py-1 rounded font-mono"><?= htmlspecialchars($order_id) ?></code>
                </div>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
                <div class="bg-[#2c313c] p-6 rounded-lg border border-gray-700">
                    <div class="text-center mb-6">
                        <div class="text-gray-400 mb-2">Send exactly</div>
                        <div class="text-3xl font-mono font-bold text-blue-400 mb-2">
                            <?= htmlspecialchars($order['amount']) ?> <?= htmlspecialchars($order['fromCurrency']) ?>
                        </div>
                        <div class="text-sm text-gray-400">
                            You will receive approximately <?= number_format($order['receiveAmount'], 8) ?> <?= htmlspecialchars($order['toCurrency']) ?>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="text-center text-gray-400 text-sm mb-2">
                            Send payment to this address:
                        </div>
                        <div class="bg-[#22262e] border border-gray-700 rounded-lg p-3 font-mono text-sm break-all">
                            <?= htmlspecialchars($order['depositAddress']) ?>
                        </div>
                        <div class="text-center">
                            <span class="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm">
                                Awaiting payment...
                            </span>
                        </div>
                    </div>
                </div>

                <div class="space-y-4 text-sm">
                    <div class="flex justify-between py-3 border-b border-gray-800">
                        <span class="text-gray-400">Exchange pair</span>
                        <span><?= htmlspecialchars($order['fromCurrency']) ?> → <?= htmlspecialchars($order['toCurrency']) ?></span>
                    </div>

                    <div class="flex justify-between py-3 border-b border-gray-800">
                        <span class="text-gray-400">Exchange rate</span>
                        <span>1 <?= htmlspecialchars($order['fromCurrency']) ?> = <?= htmlspecialchars($order['rate']) ?> <?= htmlspecialchars($order['toCurrency']) ?></span>
                    </div>

                    <div class="flex justify-between py-3 border-b border-gray-800">
                        <span class="text-gray-400">Exchange mode</span>
                        <span>
                            <?= htmlspecialchars($order['rateType']) ?>
                            <span class="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/20">
                                <?= $order['rateType'] === 'fixed' ? '1.5%' : '1%' ?>
                            </span>
                        </span>
                    </div>

                    <div class="flex justify-between py-3 border-b border-gray-800">
                        <span class="text-gray-400">You send</span>
                        <span><?= htmlspecialchars($order['amount']) ?> <?= htmlspecialchars($order['fromCurrency']) ?></span>
                    </div>

                    <div class="flex justify-between py-3 border-b border-gray-800">
                        <span class="text-gray-400">You receive</span>
                        <span class="text-green-400">
                            <?= number_format($order['receiveAmount'], 8) ?> <?= htmlspecialchars($order['toCurrency']) ?>
                        </span>
                    </div>

                    <div class="flex items-center justify-between py-3 border-b border-gray-800">
                        <span class="text-gray-400">Recipient:</span>
                        <span class="font-mono text-sm break-all ml-4"><?= htmlspecialchars($order['recipientAddress']) ?></span>
                    </div>
                </div>
            </div>

            <?php if ($order['rateType'] === 'dynamic'): ?>
            <form method="POST" class="mt-6">
                <input type="hidden" name="action" value="update_rate">
                <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Update Rate
                </button>
            </form>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>