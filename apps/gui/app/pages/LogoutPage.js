import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import api from '../utils/api';
import websocket from '../utils/websocket';

const LogoutPage = () => {
    useEffect(() => {
        api.logout({ socketid: websocket.socketId() });
        websocket.shutdown();
    }, []);

    return <Redirect to="/login" />;
};

export default LogoutPage;
