import React from 'react';
import { Navigate } from 'react-router-dom';
import list from '../utils/api';

const Logout = (): any => {
    React.useEffect(() => {
        list.logout();
    }, []);

    return <Navigate to="/login" />;
};

export default Logout;
