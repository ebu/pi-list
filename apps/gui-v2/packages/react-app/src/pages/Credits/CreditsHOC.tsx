import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import list from '../../utils/api';
import { MainContentLayout } from '../Common';
import Credits from './Credits';

function CreditsHOC() {
    return (
        <>
            <MainContentLayout middlePageContent={<Credits />} />
        </>
    );
}

export default CreditsHOC;
