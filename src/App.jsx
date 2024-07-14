import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
	Link,
	Route,
	BrowserRouter as Router,
	Switch,
	useLocation,
} from 'react-router-dom'
import './App.css'
import CreateTracking from './CreateTracking.jsx'

function useQuery() {
	return new URLSearchParams(useLocation().search)
}

function Home() {
	const [options, setOptions] = useState([])
	const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id
	const query = useQuery()
	const startParam = query.get('tgWebAppStartParam')

	useEffect(() => {
		const fetchAndStoreOptions = async () => {
			if (!startParam) {
				console.error('No start parameter provided')
				return
			}

			try {
				// Шаг 1: Получение данных из базы данных
				const response = await axios.get(`/api/tracking/${telegramId}/tracks`, {
					params: { start_param: startParam },
				})
				const data = response.data

				// Шаг 2: Сохранение данных в CloudStorage
				const promises = data.map(
					(item, index) =>
						new Promise((resolve, reject) => {
							window.Telegram.WebApp.CloudStorage.setItem(
								`option_${index}`,
								item,
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

				await Promise.all(promises)

				// Шаг 3: Получение всех ключей и значений из CloudStorage
				window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
					if (error) {
						console.error('Error retrieving keys:', error)
					} else {
						window.Telegram.WebApp.CloudStorage.getItems(
							keys,
							(error, items) => {
								if (error) {
									console.error('Error retrieving items:', error)
								} else {
									setOptions(Object.values(items))
								}
							}
						)
					}
				})
			} catch (err) {
				console.error('Error fetching or storing tracks:', err)
			}
		}

		fetchAndStoreOptions()
	}, [telegramId, startParam])

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
