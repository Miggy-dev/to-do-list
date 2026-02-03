import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


import App from './App.jsx'
import Home from './pages/home.jsx'
import ListItem from './pages/list-item.jsx'
import Register from './pages/register.jsx'

import './css/global.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        
        <Route path='/' element={<App/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/list-item' element={<ListItem/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)