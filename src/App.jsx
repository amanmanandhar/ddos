import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homescreen from "./components/screen/Homescreen";
import Dashboardscreen from './components/screen/DashboardScreen';


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Homescreen/>}></Route>
      </Routes>
      <Routes>
        <Route path="/dashboard" element={<Dashboardscreen/>}></Route>
      </Routes>
    </BrowserRouter>
      
      
    
  )
}

export default App
