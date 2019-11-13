import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Select from './common/Select';
import { T } from '../utils/translation';

const AnalysisProfileSelector = () => {
    const [profiles, setProfiles] = useState([]);
    const [defaultProfile, setDefaultProfile] = useState(null);

    useEffect(() => {
        api.analysisProfile
            .getInfo()
            .then(data => {
                setProfiles(data.all);
                setDefaultProfile(data.default);
            })
            .catch(err => console.error(err));
    }, []);

    const profileEntries = profiles.map(profile => ({
        value: profile.id,
        label: profile.label,
    }));

    const onChangeProfile = e => {
        setDefaultProfile(e.value);
        api.analysisProfile.setDefaultProfile(e.value).catch(err => console.error(err));
    };

    return (
        <div className="row end-xs lst-align-items-center lst-no-margin">
            <div className="col-xs-4 lst-text-right lst-stream-info2-label">
                <T t="analysis_profiles.active_profile" />
                <span>:</span>
            </div>
            <div className="col-xs-4 lst-text-left">
                <Select options={profileEntries} value={defaultProfile} onChange={onChangeProfile} />
            </div>
        </div>
    );
};

export default AnalysisProfileSelector;
