import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Autorisointi = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      // If the access token is present, navigate to the lomake page
      return <Navigate to="/lomake" />
      }
    getClientIdAndClientSecret()
  }, []);

  /*
  const checkAuth = async () => {
    // Make a request to the server to check if the user is already authorized
    try {
      const response = await axios.get('/api/check-auth');
      setIsAuth(response.data.isAuth);
    } catch (err) {
      console.log(err);
    }
  }
  */

  const getClientIdAndClientSecret = () => {
    axios.get('http://localhost:4000/api/config')
    .then(response => {
      setClientId(response.data["CLIENT_ID"])
      console.log("clientti id: " + response.data["CLIENT_ID"])
      setClientSecret(response.data["CLIENT_SECRET"])
      console.log("clientti secret: " + response.data["CLIENT_SECRET"])
    })
    .catch(error => {
      console.log(error);
    })
    }

  const handleAuthClick = async () => {

    const redirectUri = "http://localhost:3000/lomake";
    const scope = "https://www.googleapis.com/auth/youtube";
  
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  
    window.location.replace(authUrl);
  
    try {
      const code = window.location.search.split("code=")[1];
      const tokenUrl = `https://www.googleapis.com/oauth2/v4/token?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`;
  
      const response = await fetch(tokenUrl, {
        method: "POST",
      });
      const data = await response.json();
      const accessToken = data.access_token;
      // Store the access token in local storage for later use
      localStorage.setItem("access_token", accessToken);
      // Redirect the user to the next page in the app
      Navigate("/lomake");
    } catch (error) {
      console.error(error);
    }
  }

  if (isAuth) {
    // If the user is already authorized, redirect them to the "Lomake" component
    return <Navigate to='/lomake' />
  }

  return (
    <div className='App'>
      <h1>Promosivugeneraattori</h1>
      {error && <p>{error}</p>}
      <button onClick={handleAuthClick}>Sign in with Google</button>
    </div>
  );
}

export default Autorisointi;