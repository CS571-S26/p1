import { useState } from 'react'
import './App.css'
import {Button} from 'react-bootstrap';

function App() {

  return (
    <>
        <h2>
          Welcome to Food Road Trip Generator!
        </h2>
        <Button onClick={() => alert("You have clicked the button! Stay tuned for updates!")}>
            Get Started Here!!!!
        </Button>
    </>
  )
}

export default App
