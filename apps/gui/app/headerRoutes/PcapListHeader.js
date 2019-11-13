import React from 'react';
import Header from './Header';
import AnalysisProfileSelector from '../components/AnalysisProfileSelector';

const PcapListHeader = () => (
    <Header labelTag="navigation.pcaps">
        <AnalysisProfileSelector />
        {/* <div className="d-flex justify-content-end">
        </div> */}
    </Header>
);

export default PcapListHeader;
