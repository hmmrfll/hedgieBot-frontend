import axios from 'axios'
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import './CreateTracking.css'

const CreateTracking = () => {
	const history = useHistory()
	const [assets] = useState(['BTC', 'ETH'])
	const [selectedAsset, setSelectedAsset] = useState('')
	const [expiryDates, setExpiryDates] = useState([])
	const [selectedExpiryDate, setSelectedExpiryDate] = useState('')
	const [optionType, setOptionType] = useState('')
	const [strikePrices, setStrikePrices] = useState([])
	const [selectedStrikePrice, setSelectedStrikePrice] = useState('')
	const [optionPrice, setOptionPrice] = useState('')
	const [notificationPrice, setNotificationPrice] = useState('')
	const [percentChange, setPercentChange] = useState('')
	const [error, setError] = useState('')

	const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id

	const handleGoBack = () => {
		history.push('/')
	}

	const handleAssetChange = async e => {
		const asset = e.target.value
		setSelectedAsset(asset)
		try {
			const response = await axios.get(
				`https://www.deribit.com/api/v2/public/get_instruments?currency=${asset}&expired=false`
			)
			const expiryDates = response.data.result
				.map(asset => new Date(asset.expiration_timestamp))
				.filter(
					(date, index, self) =>
						self.findIndex(d => d.getTime() === date.getTime()) === index
				)
				.map(date => formatDate(date)) // Добавление форматирования дат
			setExpiryDates(expiryDates)
		} catch (error) {
			console.error('Error fetching expiry dates:', error)
			setError('Failed to fetch expiry dates.')
		}
	}

	const handleExpiryDateChange = async e => {
		const date = e.target.value
		setSelectedExpiryDate(date)
		console.log(`Selected expiry date: ${date}`)
		if (optionType) {
			fetchStrikePrices(date, optionType)
		}
	}

	const handleOptionTypeChange = async e => {
		const type = e.target.value
		setOptionType(type)
		console.log(`Selected option type: ${type}`)
		if (selectedExpiryDate) {
			fetchStrikePrices(selectedExpiryDate, type)
		}
	}

	const fetchStrikePrices = async (expiryDate, optionType) => {
		if (!expiryDate || !optionType) return

		try {
			const response = await axios.get(
				`https://www.deribit.com/api/v2/public/get_instruments?currency=${selectedAsset}&expired=false`
			)
			const filteredInstruments = response.data.result.filter(
				item =>
					formatDate(new Date(item.expiration_timestamp)) === expiryDate &&
					item.option_type === optionType
			)
			const uniqueStrikePrices = filteredInstruments
				.map(item => item.strike)
				.filter((price, index, self) => price && self.indexOf(price) === index)
			setStrikePrices(uniqueStrikePrices)
			console.log(`Fetched strike prices: ${uniqueStrikePrices}`)
		} catch (error) {
			console.error('Error fetching strike prices:', error)
			setError('Failed to fetch strike prices.')
		}
	}

	const formatDate = date => {
		const months = [
			'JAN',
			'FEB',
			'MAR',
			'APR',
			'MAY',
			'JUN',
			'JUL',
			'AUG',
			'SEP',
			'OCT',
			'NOV',
			'DEC',
		]
		const d = new Date(date)
		const day = d.getDate()
		const month = months[d.getMonth()]
		const year = d.getFullYear().toString().slice(-2) // Получаем последние две цифры года
		return `${day < 10 ? '0' + day : day}${month}${year}`
	}

	const formatOptionType = type => {
		return type.charAt(0).toUpperCase() // Берём только первую букву и делаем её заглавной
	}

	const handleStrikePriceChange = async e => {
		const strikePrice = e.target.value
		setSelectedStrikePrice(strikePrice)
		console.log(`Selected strike price: ${strikePrice}`)

		if (!selectedAsset || !optionType || !selectedExpiryDate) {
			console.error('Missing required parameters')
			setError('Missing required parameters for fetching option price.')
			return
		}

		try {
			const instrumentName = `${selectedAsset.toUpperCase()}-${selectedExpiryDate}-${strikePrice}-${formatOptionType(
				optionType
			)}`
			console.log(`Fetching option price for instrument: ${instrumentName}`)
			const response = await axios.get(
				`https://www.deribit.com/api/v2/public/ticker?instrument_name=${instrumentName}`
			)
			console.log('API response:', response.data)
			if (
				response.data &&
				response.data.result &&
				response.data.result.mark_price !== undefined
			) {
				setOptionPrice(response.data.result.mark_price)
				setError('')
			} else {
				console.error(
					'No result found for the given instrument name or mark_price not available'
				)
				setError('No price data available for this option.')
				setOptionPrice('')
			}
		} catch (error) {
			console.error('Error fetching option price:', error)
			setError('Error fetching option price.')
			setOptionPrice('')
		}
	}

	const handleTrackClick = async () => {
		console.log('Track button clicked')
		const newTrack = {
			asset: String(selectedAsset),
			expiryDate: String(selectedExpiryDate),
			strikePrice: Number(selectedStrikePrice),
			optionType: String(optionType),
			optionPrice: Number(optionPrice),
			notificationPrice: Number(notificationPrice),
			percentChange: Number(percentChange),
		}

		// Логирование telegramId и newTrack
		console.log('Telegram ID:', telegramId)
		console.log('New Track:', newTrack)

		if (!telegramId) {
			alert('Telegram ID is missing!')
			return
		}

		try {
			const response = await fetch(
				`https://f3d5-2a02-bf0-1413-2ebc-ed86-9e39-25f4-572a.ngrok-free.app/api/tracking/${telegramId}/tracks`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(newTrack),
				}
			)
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`)
			}
			const data = await response.json()
			alert('Track added successfully')
			console.log('Response data:', data)

			// Сохранение данных в Cloud Storage
			const cloudKey = `track_${Date.now()}`
			window.Telegram.WebApp.CloudStorage.setItem(
				cloudKey,
				JSON.stringify(newTrack),
				(error, success) => {
					if (error) {
						console.error('Error storing item in Cloud Storage:', error)
					} else {
						console.log('Item stored successfully in Cloud Storage:', success)
					}
				}
			)

			history.push('/') // Перенаправляем пользователя на основной экран после закрытия уведомления
		} catch (error) {
			console.error('Error adding track:', error.message)
			setError(`Error adding track: ${error.message}`)
		}
	}

	return (
		<div className='create-tracking-container'>
			<div className='header'>
				<button className='back-button' onClick={handleGoBack}>
					Back
				</button>
				<h2>Create tracking</h2>
			</div>
			<div className='separator'></div>
			<form>
				<div className='form-group'>
					<label htmlFor='asset'>Asset</label>
					<select
						id='asset'
						value={selectedAsset}
						onChange={handleAssetChange}
						required
					>
						<option value=''>Select asset</option>
						{assets.map(asset => (
							<option key={asset} value={asset}>
								{asset}
							</option>
						))}
					</select>
				</div>
				{expiryDates.length > 0 && (
					<div className='form-group'>
						<label htmlFor='expiry-date'>Expiry Date</label>
						<select
							id='expiry-date'
							value={selectedExpiryDate}
							onChange={handleExpiryDateChange}
							required
						>
							<option value=''>Select expiry date</option>
							{expiryDates.map(date => (
								<option key={date} value={date}>
									{date}
								</option>
							))}
						</select>
					</div>
				)}
				{selectedExpiryDate && (
					<div className='form-group'>
						<label>Option Type</label>
						<div>
							<label>
								<input
									type='radio'
									name='option-type'
									value='call'
									onChange={handleOptionTypeChange}
									required
								/>
								Call
							</label>
							<label>
								<input
									type='radio'
									name='option-type'
									value='put'
									onChange={handleOptionTypeChange}
									required
								/>
								Put
							</label>
						</div>
					</div>
				)}
				{strikePrices.length > 0 && (
					<div className='form-group'>
						<label htmlFor='strike-price'>Strike Price</label>
						<select
							id='strike-price'
							value={selectedStrikePrice}
							onChange={handleStrikePriceChange}
							required
						>
							<option value=''>Select strike price</option>
							{strikePrices.map(price => (
								<option key={price} value={price}>
									{price}
								</option>
							))}
						</select>
					</div>
				)}
				{selectedStrikePrice && (
					<div className='form-group'>
						<label htmlFor='option-price'>Option Price (Premium)</label>
						<input
							type='text'
							id='option-price'
							value={optionPrice}
							readOnly
							required
						/>
					</div>
				)}
				{selectedStrikePrice && (
					<div className='form-group'>
						<label htmlFor='notification-price'>Notification Price</label>
						<input
							type='number'
							id='notification-price'
							value={notificationPrice}
							onChange={e => setNotificationPrice(e.target.value)}
							required
						/>
					</div>
				)}
				{notificationPrice && (
					<div className='form-group'>
						<label htmlFor='percent-change'>Notify on Change (%)</label>
						<input
							type='number'
							id='percent-change'
							value={percentChange}
							onChange={e => setPercentChange(e.target.value)}
							required
						/>
					</div>
				)}
				{percentChange && (
					<button
						type='button'
						className='create-tracking-button'
						onClick={handleTrackClick}
					>
						Track
					</button>
				)}
				{error && <div className='error-message'>{error}</div>}
			</form>
		</div>
	)
}

export default CreateTracking
