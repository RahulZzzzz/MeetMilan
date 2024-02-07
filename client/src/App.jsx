import './App.css'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Landing from './components/Landing'
import Home from './components/Home'


//Problem in myStream ==> undefined
//Maybe due to we're not using useCallback()

function App() {

  
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/meet" element={<Landing/>}/>
      </Routes>
    </BrowserRouter>

  )
  
}

export default App
