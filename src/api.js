// src/api.js
import axios from 'axios'

const API_URL = 'https://www.deribit.com/api/v2/public'

export const getAssets = async () => {
	try {
		const response = await axios.get(
			`${API_URL}/get_instruments?currency=BTC&expired=false`
		)
		return response.data.result.map(instrument => instrument.base_currency)
	} catch (error) {
		console.error('Error fetching assets:', error)
		return []
	}
}
