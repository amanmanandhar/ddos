import React from 'react'
import Navbar from '../Navbar'
import LoginForm from '../LoginForm'

function Homescreen() {
  return (
       <div style={{ width: "100%" }}>
        <div>
          <Navbar />
          <div
            style={{ padding: "20px", textAlign: "center", color: "green" }}
          ></div>
          <LoginForm />
        </div>
      </div>
  )
}

export default Homescreen