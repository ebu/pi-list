import React from 'react';
import './styles.scss';
import {
    ScatterChart,
    Scatter,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Brush,
    ReferenceArea,
} from 'recharts';
import { TimeValueTooltip } from '../index';
import _ from 'lodash';
import LabelYAxis from '../LabelYAxis/LabelYAxis';

interface IComponentProps {
    graphicData: Array<IScatterGraphic>;
    title: string;
    yAxisTitle: string;
    xAxisTitle: string;
    datakeyX: string;
    datakeyY: string;
    leftMargin?: number;
}

function ScatterGraphic({ data }: { data: IComponentProps }) {
    const initialZoomState = {
        dataZoom: data?.graphicData,
        refAreaLeft: '',
        refAreaRight: '',
        animation: true,
    };

    const [zoomState, setZoomState] = React.useState(initialZoomState);

    if (data === undefined) {
        return null;
    }

    const CustomTooltip = (props: any) => {
        if (props.active && props.payload[1].value !== 0) {
            if (props.payload) {
                if (props.payload[0] === undefined) {
                    return <div></div>;
                }
                return (
                    <TimeValueTooltip
                        valueY={props.payload[1].value}
                        valueYLabel={data.datakeyY.charAt(0).toUpperCase() + data.datakeyY.slice(1)}
                        valueX={props.payload[0].value}
                        valueXLabel={data.xAxisTitle}
                    />
                );
            }
        }
        return null;
    };

    const CustomizedDot = (props: any) => {
        const { cx, cy, stroke, payload, value } = props;
        if (payload.value !== 0) {
            return <circle cx={cx} cy={cy} r="3" fill="#E6E7EA" stroke="#0083FF" strokeWidth="1" />;
        }
        return null;
    };

    const handleZoom = () => {
        let { refAreaLeft, refAreaRight } = zoomState;
        const { dataZoom } = zoomState;

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setZoomState({
                ...zoomState,
                refAreaLeft: '',
                refAreaRight: '',
            });
            return;
        }

        if (parseInt(refAreaLeft) > parseInt(refAreaRight)) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
        const dataNewZoom: any[] = [];
        dataZoom?.map((bucket: any) =>
            bucket.reduce((acc: any, curr: any) => {
                if (acc.label >= parseInt(refAreaLeft) && acc.label <= parseInt(refAreaRight))
                    dataNewZoom.push([
                        { label: acc.label, value: acc.value },
                        { label: acc.label, value: 0 },
                    ]);
            })
        );

        setZoomState({
            animation: true,
            refAreaLeft: '',
            refAreaRight: '',
            dataZoom: dataNewZoom,
        });
    };

    const handleZoomOut = () => {
        setZoomState({
            ...zoomState,
            dataZoom: data.graphicData,
            refAreaLeft: '',
            refAreaRight: '',
        });
    };

    return (
        <div className="scatter-graphic-container">
            <div className="blend-div"></div>
            <div className="scatter-graphic-legend">
                <span>{data.title}</span>
                <div>
                    <div className="scatter-graphic-value-legend">
                        <span className="scatter-graphic-value-dot"></span>
                        <span className="scatter-graphic-value-label">
                            {data.datakeyY.charAt(0).toUpperCase() + data.datakeyY.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="scatter-graphic" style={{ userSelect: 'none' }}>
                <LabelYAxis title={data.yAxisTitle.charAt(0).toUpperCase() + data.yAxisTitle.slice(1)} />
                <ResponsiveContainer>
                    <ScatterChart
                        margin={{ top: 35, right: 25, left: data?.leftMargin }}
                        onMouseDown={(e: any) => {
                            e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaLeft: e.xValue !== undefined ? parseInt(e.xValue).toString() : '',
                                  })
                                : null;
                        }}
                        onMouseMove={(e: any) => {
                            zoomState.refAreaLeft && e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaRight: e.xValue !== undefined ? parseInt(e.xValue).toString() : '',
                                  })
                                : null;
                        }}
                        // eslint-disable-next-line react/jsx-no-bind
                        onMouseUp={handleZoom}
                    >
                        <CartesianGrid strokeDasharray="5 10" vertical={false} stroke="#68759c" />
                        <XAxis
                            dataKey={data.datakeyX}
                            axisLine={false}
                            height={50}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#68759c',
                                dy: 10,
                            }}
                            width={0}
                            label={{
                                value: data.xAxisTitle,
                                position: 'insideBottom',
                                dy: 5,
                                style: {
                                    fontFamily: 'Prompt',
                                    fontStyle: 'normal',
                                    fontWeight: 'normal',
                                    fontSize: 14,
                                    fill: '#b5b8c1',
                                },
                            }}
                            padding={{ left: 20 }}
                            interval={0}
                            onClick={handleZoomOut}
                            domain={['auto', 'auto']}
                            type="number"
                        />
                        <YAxis
                            dataKey={data.datakeyY}
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#68759c',
                                width: 'fit-content',
                                dx: -10,
                            }}
                            type="number"
                            width={0}
                        />
                        <Tooltip cursor={false} content={<CustomTooltip />} />
                        {zoomState.dataZoom?.map((data: any, index: number) => {
                            return <Scatter key={index} data={data} fill="#0083FF" line shape={<CustomizedDot />} />;
                        })}
                        {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                            <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} />
                        ) : null}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <button className="zoom-out-graph-button" onClick={handleZoomOut}>
                Zoom Out
            </button>
        </div>
    );
}
export interface IScatterGraphic {
    [index: number]: Array<IScatterGraphicElement>;
}

export interface IScatterGraphicElement {
    label: number;
    value: number;
}

export default ScatterGraphic;
