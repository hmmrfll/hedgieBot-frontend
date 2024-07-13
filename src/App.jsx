// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function App() {
	const [tracks, setTracks] = useState([])

	useEffect(() => {
		const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id
		const fetchTracks = async () => {
			try {
				const response = await fetch(
					`https://f3d5-2a02-bf0-1413-2ebc-ed86-9e39-25f4-572a.ngrok-free.app/api/tracking/${telegramId}/tracks`
				)
				const data = await response.json()
				setTracks(data)
			} catch (error) {
				console.error('Error fetching tracks:', error)
			}
		}
		fetchTracks()
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
								{tracks.map((track, index) => (
									<li key={index}>
										Asset: {track.asset}, Expiry Date: {track.expiryDate},
										Strike Price: {track.strikePrice}, Option Type:{' '}
										{track.optionType}, Option Price: {track.optionPrice},
										Notification Price: {track.notificationPrice}, Percent
										Change: {track.percentChange}
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
