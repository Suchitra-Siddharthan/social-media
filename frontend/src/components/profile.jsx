// Profile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.id;

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/notifications/${userId}`);
      if (response.data.success) {
        // Combine and sort all notifications by date
        const allNotifications = [
          ...response.data.unread,
          ...response.data.read
        ].sort((a, b) => new Date(b.NOTIFICATIONDATE) - new Date(a.NOTIFICATIONDATE));
        
        setNotifications(allNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/notifications/${notificationId}/read`);
      
      if (!response.data.success) {
        console.error('Failed to mark notification as read:', response.data.error);
        return;
      }

      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.NOTIFICATIONID === notificationId
            ? { ...notification, ISREAD: 1 }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/profile/${userId}`);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch profile');
        }

        const profileData = response.data.profile;
        setProfile(profileData);
        setUpdatedProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
    fetchNotifications();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...updatedProfile,
        dateOfBirth: updatedProfile.dateOfBirth
          ? new Date(updatedProfile.dateOfBirth).toISOString().split('T')[0]
          : null,
      };

      await axios.put(`http://localhost:3000/api/profile/${userId}`, payload);
      setProfile(payload);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <div className="profile-field">
        <label>Username:</label>
        <input
          name="username"
          value={updatedProfile.username || ''}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      <div className="profile-field">
        <label>Email:</label>
        <input
          name="email"
          value={updatedProfile.email || ''}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      <div className="profile-field">
        <label>Bio:</label>
        <textarea
          name="bio"
          value={updatedProfile.bio || ''}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      <div className="profile-field">
        <label>Location:</label>
        <input
          name="location"
          value={updatedProfile.location || ''}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      <div className="profile-field">
        <label>Website:</label>
        <input
          name="websiteUrl"
          value={updatedProfile.websiteUrl || ''}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      <div className="profile-field">
        <label>Date of Birth:</label>
        <input
          type="date"
          name="dateOfBirth"
          value={updatedProfile.dateOfBirth || ''}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      {/* <div className="profile-field">
        <label>Premium User:</label>
        <input
          type="checkbox"
          name="isPremium"
          checked={updatedProfile.isPremium || false}
          onChange={(e) =>
            setUpdatedProfile((prev) => ({
              ...prev,
              isPremium: e.target.checked,
            }))
          }
          disabled={!editing}
        />
      </div> */}

      {editing ? (
        <>
          <button  onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setEditing(true)}>Edit Profile</button>
      )}

      {/* Notifications Section */}
      <div className="notifications-section" style={{ marginTop: '40px' }}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)} 
          className="notifications-toggle-button"
        >
          {showNotifications ? '🔔 Close Notifications' : '🔔 View Notifications'}
        </button>
        
        {showNotifications && (
          <div className="notifications-container">
            {notifications.length > 0 ? (
              <ul className="notifications-list">
                {notifications.map((note) => (
                  <li 
                    key={note.NOTIFICATIONID}
                    onClick={() => markNotificationAsRead(note.NOTIFICATIONID)}
                    className={`notification-item ${note.ISREAD === 1 ? 'unread' : 'unread'}`}
                  >
                    <div className="notification-content">
                      <span className="notification-text">{note.NOTIFICATIONTEXT}</span>
                      <span className="notification-date">
                        {new Date(note.NOTIFICATIONDATE).toLocaleString()}
                      </span>
                    </div>
              </li>
            ))}
          </ul>
        ) : (
              <p className="no-notifications">No notifications.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
