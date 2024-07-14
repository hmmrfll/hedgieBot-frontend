import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function App() {
	console.log('App component rendered')

	const [options, setOptions] = useState([])
	const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const response = await axios.get(
					`https://f3d5-2a02-bf0-1413-2ebc-ed86-9e39-25f4-572a.ngrok-free.app/api/tracking/${telegramId}/tracks`
				)
				setOptions(response.data)
			} catch (err) {
				console.error('Error fetching tracks:', err)
			}
		}

		fetchOptions()
	}, [telegramId])

	return (
		<Router>
			<div className='app-container'>
				<Switch>
					<Route exact path='/'>
						<div className='home-content'>
							{console.log('Rendering Home Page')}
							<h2>Tracked options:</h2>
							<hr className='separator' />
							<ul className='options-list'>
								{options.map((option, index) => (
									<li key={index}>{option}</li>
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
