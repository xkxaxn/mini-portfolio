import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portfolio from './pages/Portfolio'
import EditPage from './pages/EditPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/edit" element={<EditPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
