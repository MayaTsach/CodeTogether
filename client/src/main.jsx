import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CodeBlockPage from './CodeBlockPage.jsx' 
import './App.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/codeblock/:id" element={<CodeBlockPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
