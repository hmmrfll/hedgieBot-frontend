import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function App() {
	const [trackedOptions, setTrackedOptions] = useState([])

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
						const options = Object.values(items).map(item => JSON.parse(item))
						setTrackedOptions(options)
					}
				})
			}
		})
	}, [])

	return (
		<Router>
			<div className='app-container'>
				<Switch>
					<Route exact path='/'>
						<div className='home-content'>
							<h2>Tracked options:</h2>
							<hr className='separator' />
							<ul className='options-list'>
								{trackedOptions.map((option, index) => (
									<li key={index}>
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
