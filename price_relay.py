from fastapi import FastAPI, WebSocket, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import httpx
import asyncio
import json
from typing import Dict, Set
from datetime import datetime
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="public"), name="static")

# Store active WebSocket connections and orders
active_connections: Set[WebSocket] = set()
orders = {}

# Cache for prices
price_cache = {
    "timestamp": 0,
    "prices": {}
}

async def fetch_prices() -> Dict:
    """Fetch cryptocurrency prices from exchanges."""
    try:
        async with httpx.AsyncClient() as client:
            # Fetch BTC/USD price as reference
            btc_resp = await client.get('https://api.coinbase.com/v2/prices/BTC-USD/spot')
            btc_data = btc_resp.json()
            btc_usd_price = float(btc_data['data']['amount'])

            # Fetch XMR/BTC price
            xmr_resp = await client.get('https://api.binance.com/api/v3/ticker/price?symbol=XMRBTC')
            xmr_data = xmr_resp.json()
            xmr_btc_price = float(xmr_data['price'])

            # Fetch LTC/BTC price
            ltc_resp = await client.get('https://api.binance.com/api/v3/ticker/price?symbol=LTCBTC')
            ltc_data = ltc_resp.json()
            ltc_btc_price = float(ltc_data['price'])

            # Calculate all pairs
            prices = {
                'XMR/BTC': f"{xmr_btc_price:.8f}",
                'BTC/XMR': f"{(1 / xmr_btc_price):.8f}",
                'LTC/BTC': f"{ltc_btc_price:.8f}",
                'BTC/LTC': f"{(1 / ltc_btc_price):.8f}",
                'XMR/LTC': f"{(xmr_btc_price / ltc_btc_price):.8f}",
                'LTC/XMR': f"{(ltc_btc_price / xmr_btc_price):.8f}",
            }

            return prices
    except Exception as e:
        logger.error(f"Error fetching prices: {e}")
        raise

@app.post("/no-js/create-order")
async def create_order(
    request: Request,
    fromCurrency: str = Form(...),
    toCurrency: str = Form(...),
    amount: float = Form(...),
    recipientAddress: str = Form(...),
    rateType: str = Form(...)
):
    """Create a new order in No-JS mode."""
    order_id = str(uuid.uuid4())
    
    # Get current rates
    prices = await fetch_prices()
    rate = prices.get(f"{fromCurrency}/{toCurrency}")
    
    if not rate:
        return HTMLResponse("Invalid currency pair")
    
    # Calculate amounts
    fee_percentage = 0.015 if rateType == "fixed" else 0.01
    receive_amount = amount * float(rate) * (1 - fee_percentage)
    
    # Generate deposit address (in production, this would be from your wallet system)
    deposit_address = f"{fromCurrency.lower()}1qzfq9d05tg3qwfha4d20n8xe25h349y18gtenr5"
    
    # Store order
    orders[order_id] = {
        "id": order_id,
        "fromCurrency": fromCurrency,
        "toCurrency": toCurrency,
        "amount": amount,
        "rate": rate,
        "rateType": rateType,
        "depositAddress": deposit_address,
        "recipientAddress": recipientAddress,
        "receiveAmount": receive_amount,
        "status": "awaiting_payment",
        "createdAt": datetime.now().isoformat()
    }
    
    # Redirect to order page
    return RedirectResponse(f"/no-js/order/{order_id}", status_code=303)

@app.get("/no-js/order/{order_id}")
async def get_order(order_id: str):
    """Get order details in No-JS mode."""
    order = orders.get(order_id)
    if not order:
        return HTMLResponse("Order not found")
    
    # In production, you'd use a template engine like Jinja2
    html = f"""
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order {order_id} - CryptoSwap</title>
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
                <code class="ml-2 text-sm bg-[#2c313c] px-2 py-1 rounded font-mono">{order_id}</code>
              </div>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div class="bg-[#2c313c] p-6 rounded-lg border border-gray-700">
                <div class="text-center mb-6">
                  <div class="text-gray-400 mb-2">Send exactly</div>
                  <div class="text-3xl font-mono font-bold text-blue-400 mb-2">
                    {order['amount']} {order['fromCurrency']}
                  </div>
                  <div class="text-sm text-gray-400">
                    You will receive approximately {order['receiveAmount']:.8f} {order['toCurrency']}
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="text-center text-gray-400 text-sm mb-2">
                    Send payment to this address:
                  </div>
                  <div class="bg-[#22262e] border border-gray-700 rounded-lg p-3 font-mono text-sm break-all">
                    {order['depositAddress']}
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
                  <span>{order['fromCurrency']} → {order['toCurrency']}</span>
                </div>

                <div class="flex justify-between py-3 border-b border-gray-800">
                  <span class="text-gray-400">Exchange rate</span>
                  <span>1 {order['fromCurrency']} = {order['rate']} {order['toCurrency']}</span>
                </div>

                <div class="flex justify-between py-3 border-b border-gray-800">
                  <span class="text-gray-400">Exchange mode</span>
                  <span>
                    {order['rateType']}
                    <span class="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/20">
                      {order['rateType'] == 'fixed' ? '1.5%' : '1%'}
                    </span>
                  </span>
                </div>

                <div class="flex justify-between py-3 border-b border-gray-800">
                  <span class="text-gray-400">You send</span>
                  <span>{order['amount']} {order['fromCurrency']}</span>
                </div>

                <div class="flex justify-between py-3 border-b border-gray-800">
                  <span class="text-gray-400">You receive</span>
                  <span class="text-green-400">
                    {order['receiveAmount']:.8f} {order['toCurrency']}
                  </span>
                </div>

                <div class="flex items-center justify-between py-3 border-b border-gray-800">
                  <span class="text-gray-400">Recipient:</span>
                  <span class="font-mono text-sm break-all ml-4">{order['recipientAddress']}</span>
                </div>
              </div>
            </div>

            {f'''
            <form method="POST" action="/no-js/update-rate/{order_id}" class="mt-6">
              <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                Update Rate
              </button>
            </form>
            ''' if order['rateType'] == 'dynamic' else ''}
          </div>
        </main>
      </body>
    </html>
    """
    
    return HTMLResponse(html)

@app.post("/no-js/update-rate/{order_id}")
async def update_rate(order_id: str):
    """Update the rate for a dynamic rate order."""
    order = orders.get(order_id)
    if not order or order['rateType'] != 'dynamic':
        return HTMLResponse("Invalid order")
    
    # Get new rates
    prices = await fetch_prices()
    new_rate = prices.get(f"{order['fromCurrency']}/{order['toCurrency']}")
    
    if not new_rate:
        return HTMLResponse("Failed to update rate")
    
    # Update order with new rate and amount
    order['rate'] = new_rate
    order['receiveAmount'] = order['amount'] * float(new_rate) * 0.99  # 1% fee
    
    # Redirect back to order page
    return RedirectResponse(f"/no-js/order/{order_id}", status_code=303)

@app.get("/prices")
async def get_prices():
    """REST endpoint for fetching prices."""
    # If cache is older than 1 minute, fetch new prices
    if datetime.now().timestamp() - price_cache["timestamp"] > 60:
        try:
            prices = await fetch_prices()
            price_cache["timestamp"] = datetime.now().timestamp()
            price_cache["prices"] = prices
        except Exception as e:
            logger.error(f"Error fetching prices: {e}")
            return {"error": "Failed to fetch prices"}
    
    return price_cache

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)