import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [userProfile, setUserProfile] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <div className="profile-container">
      <h2>{userProfile.username}'s Profile</h2>
      <p>Email: {userProfile.email}</p>
      <p>Bio: {userProfile.bio}</p>
      <p>Location: {userProfile.location}</p>
    </div>
  );
};

export default Profile;
