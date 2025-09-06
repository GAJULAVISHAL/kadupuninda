import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CustomerPage } from "./pages/CustomerPage"
import { AdminPage } from "./pages/AdminPage"
import { PasswordProtect } from "./components/PasswordProtect"
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerPage />} />
          <Route path="/admin" 
            element={
              <PasswordProtect>
                <AdminPage/>
              </PasswordProtect>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
