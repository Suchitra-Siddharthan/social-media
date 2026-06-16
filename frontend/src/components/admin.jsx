import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Admin = () => {
  const [report, setReport] = useState(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(()=>{
      fetchReport();
    },[]);

  // Fetch report data
  const fetchReport = async () => {
    try {
      const response=await axios.get('http://localhost:3000/api/report',{
        headers:{
          Authorization:`Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setReport(response.data);
      } else {
        console.error('❌ Failed to fetch report');
      }
    } catch (error) {
      console.error('❌ Error fetching report:', error);
    }
  };

  const logout=()=>{
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href='/';
    };

  // Download the report as a CSV
  const handleDownload = () => {
    if (!report) return;

    const csvContent = `data:text/csv;charset=utf-8,${Object.keys(report[0]).join(',')}\n${report
      .map((row) => Object.values(row).join(','))
      .join('\n')}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'admin_report.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <button onClick={fetchReport}>Generate Report</button>

      {report && (
        <div>
          <h3>Total Users: {report.totalUsers}</h3>
          <h3>Total Posts: {report.totalPosts}</h3>
          <h3>Total Likes: {report.totalLikes}</h3>
          <h3>Total Comments: {report.totalComments}</h3>
        
          <h3>Most Popular User</h3>
          <p>{report.maxPopularityUser?.Username}</p>
        
          <h3>Highest Engagement Post</h3>
          <p>{report.maxEngagementPost?.Content}</p>
        </div>
        )}
    </div>
  );
};

export default Admin;
