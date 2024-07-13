import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function App() {
	const [tracks, setTracks] = useState([])

	useEffect(() => {
		const fetchTracks = async () => {
			const initData = window.Telegram.WebApp.initData // Получение init data от Telegram
			try {
				const response = await fetch(
					`https://f3d5-2a02-bf0-1413-2ebc-ed86-9e39-25f4-572a.ngrok-free.app/api/tracking/${initData.user.id}/tracks`, // Используйте user.id из initData
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${initData.auth_date}`, // Пример использования auth_date как токена (замените на ваш токен)
						},
					}
				)

				if (!response.ok) {
					throw new Error(`HTTP status ${response.status}`)
				}

				const data = await response.json()
				console.log('Tracks fetched:', data)
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
								{tracks.length > 0 ? (
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
