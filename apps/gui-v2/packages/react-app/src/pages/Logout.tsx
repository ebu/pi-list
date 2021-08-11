import React from 'react';
import { Redirect } from 'react-router-dom';
import list from '../utils/api';

const Logout = (): any => {
    React.useEffect(() => {
        list.logout();
    }, []);

    return <Redirect to="/login" />;
};

export default Logout;
