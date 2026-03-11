// content.js
console.log('helo')

const currencySymbolToName = {
	'$': 'USD',
	'€': 'EUR',
	'£': 'GBP',
	'¥': 'JPY',
	// Add more mappings as needed
}
// const regex = /€\s*([+-]?\s?\d*(?:,\d{3})*(?:\.\d{2})?)/g
const regex = /(?<=€\s*)([+-]?\s?\d*(?:,\d*)?)/g
// Function to convert an amount from a specified currency to TND
function convertToTND(amount, exchangeRates) {
	const tndRate = exchangeRates['TND']
	const fromCurrencyRate = exchangeRates['EUR']

	if (!fromCurrencyRate) {
		console.error(`Exchange rate for ${fromCurrency} not found.`)
		return null
	}

	const convertedAmount = (amount / fromCurrencyRate) * tndRate
	return convertedAmount.toFixed(2) // Keep only two decimal places
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	console.log('receved msg', message, sender, sendResponse)

	if (message.action === 'convertPrices') {
		console.log('receved msg',message)
		currency = 'EUR'
		currency_symbol = '€'
		_match = null
		total_el = document.querySelector('.total-balance-due')
		if (total_el)
			{
				_match = total_el.innerText.match(regex)

			}
		if (_match) {
			let amount = _match.map(match => match.replace(",",".").trim())
			// currency = currencySymbolToName[_match[0].match(/\W/gm)[0]]
            // currency_symbol = _match[0].match(/\W/gm)[0]
			// console.log(_match[0].match(/\W/gm)[0])
			chrome.runtime.sendMessage({ action: 'convertCurrency', amount: amount, currency: currency }, function (response) {
				// console.log('Received response from background.jssss:', response, amount)
				for (let index = 0; index < amount.length; index++) {
					console.log('here')
					const element = currency_symbol + amount[index]
					const regex = new RegExp(element, 'g')
					new_val = parseFloat(response[index]).toFixed(2) + ' TND'
					total_el.innerHTML = total_el.innerHTML.replace(regex, new_val)
					console.log(element, response[index])
				}
			})
		}

		document.querySelectorAll('table').forEach((table) => {
			Array.from(table.rows).forEach((row) => {
				Array.from(row.cells).forEach((cell) => {
					match = cell.innerText.match(regex)
					if (match) {
						console.log(match, parseFloat(match))
						let amount = match.map(match => match.replace(",",".").trim())

						chrome.runtime.sendMessage({ action: 'convertCurrency', amount: amount, currency: currency }, function (response) {
							console.log('Received response from background.jssss:', response, amount)
							for (let index = 0; index < amount.length; index++) {
								console.log('here')
								let element = currency_symbol + amount[index]
                                if (currency_symbol == "$")
                                {element = `\\$${amount[index]}`}
								const regex = new RegExp(element, 'g')
								new_val = parseFloat(response[index]).toFixed(2) + ' TND'
								cell.innerHTML = cell.innerHTML.replace(regex, new_val)
								console.log(element, response[index])
							}
						})
					}
				})
			})
		})
	}
})

