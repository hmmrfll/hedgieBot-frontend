import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function Home() {
	const [options, setOptions] = useState([])
	const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id

	useEffect(() => {
		const fetchOptions = async () => {
			if (!telegramId) {
				console.error('Telegram ID not found')
				return
			}
			try {
				const response = await axios.get(`/api/tracking/${telegramId}/tracks`)
				setOptions(response.data)
			} catch (err) {
				console.error('Error fetching tracks:', err)
			}
		}

		fetchOptions()
	}, [telegramId])

	return (
		<div className='home-content'>
			<h2>Tracked options:</h2>
			<hr className='separator' />
			<ul className='options-list'>
				{options.map((option, index) => (
					<li key={index}>{option}</li>
				))}
			</ul>
			<Link to='/create-tracking' className='link-button'>
				<button className='create-tracking-button'>Create Tracking</button>
			</Link>
		</div>
	)
}

function App() {
	console.log('App component rendered')

	return (
		<Router>
			<div className='app-container'>
				<Switch>
					<Route exact path='/'>
						<Home />
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
