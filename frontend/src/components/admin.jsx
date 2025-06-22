import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [report, setReport] = useState(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Fetch report data
  const fetchReport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/report');
      if (response.data.success) {
        setReport(response.data.report);
      } else {
        console.error('❌ Failed to fetch report');
      }
    } catch (error) {
      console.error('❌ Error fetching report:', error);
    }
  };

  // Perform backup
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await axios.post('http://localhost:5000/api/backup');
      alert('✅ Backup Completed Successfully');
    } catch (error) {
      alert('❌ Backup Failed');
      console.error('❌ Backup Error:', error);
    } finally {
      setIsBackingUp(false);
    }
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
      <button onClick={handleBackup} disabled={isBackingUp}>
        {isBackingUp ? 'Backing Up...' : 'Backup Data'}
      </button>
      <button onClick={fetchReport}>Generate Report</button>

      {report && (
        <div>
          <h3>Report</h3>
          <table>
            <thead>
              <tr>
                <th>Total Users</th>
                <th>User with Highest Popularity</th>
                <th>Post with Highest Engagement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{report.totalUsers}</td>
                <td>{report.userWithHighestPopularity.username}</td>
                <td>{report.postWithHighestEngagement.title}</td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleDownload}>Download Report</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
