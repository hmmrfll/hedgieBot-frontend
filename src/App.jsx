import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function App() {
	const [trackedOptions, setTrackedOptions] = useState([])
	const [selectedOptions, setSelectedOptions] = useState([])
	const [isDeleteMode, setIsDeleteMode] = useState(false)

	useEffect(() => {
		// Получение всех ключей из CloudStorage
		window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
			if (error) {
				console.error('Error retrieving keys from Cloud Storage:', error)
			} else {
				// Получение всех значений по ключам из CloudStorage
				window.Telegram.WebApp.CloudStorage.getItems(keys, (error, items) => {
					if (error) {
						console.error('Error retrieving items from Cloud Storage:', error)
					} else {
						const options = Object.keys(items).map((key, index) => ({
							key,
							index,
							...JSON.parse(items[key]),
						}))
						setTrackedOptions(options)
					}
				})
			}
		})
	}, [])

	const handleDeleteClick = () => {
		setIsDeleteMode(!isDeleteMode)
		setSelectedOptions([])
	}

	const handleOptionSelect = key => {
		setSelectedOptions(prev =>
			prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
		)
	}

	const handleDeleteConfirm = () => {
		const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id

		const promises = selectedOptions.map(
			key =>
				new Promise((resolve, reject) => {
					// Удаление из CloudStorage
					window.Telegram.WebApp.CloudStorage.removeItem(
						key,
						(error, success) => {
							if (error) {
								reject(error)
							} else {
								resolve(success)
							}
						}
					)
				})
		)

		Promise.all(promises)
			.then(() => {
				const deletionPromises = selectedOptions.map(optionKey => {
					const option = trackedOptions.find(opt => opt.key === optionKey)
					if (option) {
						return fetch(
							`https://f3d5-2a02-bf0-1413-2ebc-ed86-9e39-25f4-572a.ngrok-free.app/api/tracking/${telegramId}/tracks/${option.index}`,
							{
								method: 'DELETE',
							}
						).then(response => response.json())
					}
				})

				return Promise.all(deletionPromises)
			})
			.then(() => {
				setTrackedOptions(
					trackedOptions.filter(option => !selectedOptions.includes(option.key))
				)
				setIsDeleteMode(false)
			})
			.catch(error => {
				console.error(
					'Error removing items from Cloud Storage or database:',
					error
				)
			})
	}

	return (
		<Router>
			<div className='app-container'>
				<Switch>
					<Route exact path='/'>
						<div className='home-content'>
							<div className='header'>
								<h2>Tracked options:</h2>
								<button className='delete-button' onClick={handleDeleteClick}>
									{isDeleteMode ? 'Cancel' : 'Delete'}
								</button>
							</div>
							<hr className='separator' />
							{isDeleteMode && (
								<button
									className='confirm-delete-button'
									onClick={handleDeleteConfirm}
								>
									Confirm Delete
								</button>
							)}
							<ul className='options-list'>
								{trackedOptions.map(option => (
									<li key={option.key} className='option-item'>
										{isDeleteMode && (
											<input
												type='checkbox'
												checked={selectedOptions.includes(option.key)}
												onChange={() => handleOptionSelect(option.key)}
											/>
										)}
										Asset: {option.asset}, Expiry Date: {option.expiryDate},
										Strike Price: {option.strikePrice}, Option Type:{' '}
										{option.optionType}, Option Price: {option.optionPrice},
										Notification Price: {option.notificationPrice}, Percent
										Change: {option.percentChange}
									</li>
								))}
							</ul>
							<Link to='/create-tracking' className='link-button'>
								<button className='create-tracking-button'>
									Create Tracking
								</button>
							</Link>
						</div>
					</Route>
					<Route path='/create-tracking'>
						<CreateTracking />
					</Route>
				</Switch>
			</div>
		</Router>
	)
}

export default App
