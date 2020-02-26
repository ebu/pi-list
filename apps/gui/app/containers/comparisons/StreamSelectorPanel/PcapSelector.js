import React from 'react';
import PropTypes from 'prop-types';
import Select from '../../../components/common/Select';
import { T } from '../../../utils/translation';

const NoPcapsSelector = () => (
    <div className="row">
        <T t="pcap.no_pcaps" />
    </div>
);

const PcapSelector = props => {
    const entries = props.pcaps.map(pcap => ({ label: pcap.file_name, value: pcap.id }));

    return (
        <div className="row type">
            <div className="col-xs-2">
                <div className="lst-text-right">PCAP:</div>
            </div>
            <div className="col-xs-10">
                <Select options={entries} value={props.selectedPcapId} onChange={props.onChange} />
            </div>
        </div>
    );
};

PcapSelector.propTypes = {
    pcaps: PropTypes.array.isRequired,
    selectedPcapId: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

PcapSelector.defaultProps = {
    selectedPcapId: null,
};

const PcapSelectorHoc = props => {
    if (props.pcaps.length === 0) {
        return <NoPcapsSelector />;
    }

    return <PcapSelector pcaps={props.pcaps} selectedPcapId={props.selectedPcapId} onChange={props.onChange} />;
};

PcapSelectorHoc.propTypes = {
    pcaps: PropTypes.array.isRequired,
    selectedPcapId: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

PcapSelectorHoc.defaultProps = {
    selectedPcapId: null,
};

PcapSelectorHoc.defaultProps = {};

export default PcapSelectorHoc;
