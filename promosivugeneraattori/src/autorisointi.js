import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Autorisointi = () => {
  const [clientId, setClientId] = useState('')

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    console.log("access token: " + accessToken)
    if (accessToken != null && accessToken != undefined) {
      // If the access token is present, navigate to the lomake page
      return <Navigate to="/lomake" />
      }
  }, []);

  const getClientId = async (callback) => {
    try {
      const response = await axios.post('http://localhost:4000/api/config');
      setClientId(response.data["CLIENT_ID"]);
      callback(response.data["CLIENT_ID"]);
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleAuthClick = async (e) => {
    e.preventDefault()
    // Remove existing access token from local storage
    localStorage.removeItem("access_token");
    // Clear any cookies attached to the session
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const redirectUri = "http://localhost:3000/lomake";
    const scope = "https://www.googleapis.com/auth/youtube";  

   getClientId(async (updatedClientId) => {
      console.log("cielntid handleauthclikissä: " + updatedClientId)
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${updatedClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      window.location.replace(authUrl);
      })
    }
    

  return (
    <div className='App'>
      <h1>Promosivugeneraattori</h1>
      <button onClick={handleAuthClick}>Sign in with Google</button>
    </div>
  );
}

export default Autorisointi;