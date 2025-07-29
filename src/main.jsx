import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { UserContextProvider } from '../utils/UserContext.jsx'


createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
        <UserContextProvider>
          <App />
        </UserContextProvider>
    </BrowserRouter>
  // </StrictMode>,
)
