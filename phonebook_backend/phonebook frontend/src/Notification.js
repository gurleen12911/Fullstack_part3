import React from 'react';

const Notification = ({ message, isError }) => {
  const notificationStyle = {
    color: isError ? 'red' : 'green',
    background: isError ? 'lightgrey' : 'lightgreen',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  };

  if (message === null) {
    return null;
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  );
};

export default Notification;
