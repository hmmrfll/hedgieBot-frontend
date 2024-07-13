// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function App() {
	const [tracks, setTracks] = useState([])
	const telegramId = '494274334' // используйте свой Telegram ID для тестирования

	useEffect(() => {
		const fetchTracks = async () => {
			try {
				const response = await fetch(
					`https://f3d5-2a02-bf0-1413-2ebc-ed86-9e39-25f4-572a.ngrok-free.app/api/tracking/${telegramId}/tracks`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					}
				)

				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`)
				}

				const data = await response.json()
				console.log('Tracks fetched:', data)
				if (!Array.isArray(data) || !data.length) {
					console.error('Data is not an array or empty:', data)
					setTracks([])
				} else {
					setTracks(data)
				}

				console.log('Tracks fetched:', data)
				setTracks(data)
			} catch (error) {
				console.error('Error fetching tracks:', error.message)
			}
		}

		fetchTracks()
	}, [telegramId])

	return (
		<Router>
			<div className='app-container'>
				<Switch>
					<Route exact path='/'>
						<div className='home-content'>
							<h2>Tracked options:</h2>
							<hr className='separator' />
							<ul className='options-list'>
								{Array.isArray(tracks) && tracks.length > 0 ? (
									tracks.map((track, index) => (
										<li key={index}>
											Asset: {track.asset}, Expiry Date: {track.expiryDate},
											Strike Price: {track.strikePrice}, Option Type:{' '}
											{track.optionType}, Option Price: {track.optionPrice},
											Notification Price: {track.notificationPrice}, Percent
											Change: {track.percentChange}
										</li>
									))
								) : (
									<li>No tracks found</li>
								)}
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
