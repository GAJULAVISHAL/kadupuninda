import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CustomerPage } from "./pages/CustomerPage"
import { AdminPage } from "./pages/AdminPage"
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerPage />} />
          <Route path="/admin" element={<AdminPage/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
