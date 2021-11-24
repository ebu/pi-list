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
    const [zoomState, setZoomState] = React.useState({
        dataZoom: data?.graphicData,
        refAreaLeft: '',
        refAreaRight: '',
        activeLabelLeft: '',
        activeLabelRight: '',
        animation: true,
    });

    if (data === undefined) {
        return null;
    }

    const CustomTooltip = (props: any) => {
        if (props.active) {
            if (props.payload) {
                if (props.payload[0] === undefined) {
                    return <div></div>;
                }
                return (
                    <TimeValueTooltip
                        valueY={props.payload[1].value}
                        valueYLabel={data.datakeyY.charAt(0).toUpperCase() + data.datakeyY.slice(1)}
                        valueX={props.label}
                        valueXLabel={data.xAxisTitle}
                    />
                );
            }
        }
        return null;
    };

    const handleZoom = () => {
        console.log('HandleZoom');
        let { refAreaLeft, refAreaRight } = zoomState;
        const { dataZoom } = zoomState;

        console.log('Left', refAreaLeft);
        console.log('Right', refAreaRight);

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setZoomState({
                ...zoomState,
                refAreaLeft: '',
                refAreaRight: '',
                activeLabelLeft: '',
                activeLabelRight: '',
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

        console.log('dataNewZoom', dataNewZoom);
        setZoomState({
            animation: true,
            refAreaLeft: '',
            refAreaRight: '',
            activeLabelLeft: '',
            activeLabelRight: '',
            dataZoom: dataNewZoom,
        });
    };

    const handleZoomOut = () => {
        console.log('HandleZoomOut');
        setZoomState({
            ...zoomState,
            dataZoom: data.graphicData,
            refAreaLeft: '',
            refAreaRight: '',
            activeLabelLeft: '',
            activeLabelRight: '',
        });
    };
    return (
        <div className="line-graphic-container">
            <div className="blend-div"></div>
            <div className="line-graphic-legend">
                <span>{data.title}</span>
                <div>
                    <div className="line-graphic-value-legend">
                        <span className="line-graphic-value-dot"></span>
                        <span className="line-graphic-value-label">
                            {data.datakeyY.charAt(0).toUpperCase() + data.datakeyY.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="line-graphic" style={{ userSelect: 'none' }}>
                <LabelYAxis title={data.yAxisTitle.charAt(0).toUpperCase() + data.yAxisTitle.slice(1)} />
                <ResponsiveContainer>
                    <ScatterChart
                        margin={{ top: 35, right: 25, left: data?.leftMargin }}
                        onMouseDown={(e: any) => {
                            e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaLeft: e.xValue !== undefined ? parseInt(e.xValue).toString() : '',
                                      activeLabelLeft: e.activeLabel !== undefined ? e.activeLabel : '',
                                  })
                                : null;
                        }}
                        onMouseMove={(e: any) => {
                            zoomState.refAreaLeft && e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaRight: e.xValue !== undefined ? parseInt(e.xValue).toString() : '',
                                      activeLabelRight: e.activeLabel !== undefined ? e.activeLabel : '',
                                  })
                                : null;
                        }}
                        // eslint-disable-next-line react/jsx-no-bind
                        onMouseUp={handleZoom}
                    >
                        <CartesianGrid strokeDasharray="5 10" vertical={false} stroke="#39415A" />
                        <XAxis
                            dataKey={data.datakeyX}
                            axisLine={false}
                            height={50}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#39415A',
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
                            onClick={handleZoomOut}
                            domain={['dataMin - 1', 'dataMax + 1']}
                            type="number"
                        />
                        <YAxis
                            dataKey={data.datakeyY}
                            axisLine={false}
                            tick={{
                                fontFamily: 'Prompt',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: 12,
                                fill: '#39415A',
                                width: 'fit-content',
                                dx: -10,
                            }}
                            domain={['dataMin - 1', 'dataMax + 1']}
                            interval="preserveStart"
                            width={0}
                        />
                        <Tooltip cursor={false} content={<CustomTooltip />} />
                        {zoomState.dataZoom?.map((data: any, index: number) => {
                            return <Scatter key={index} data={data} fill="#0083FF" line shape="circle" />;
                        })}
                        {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                            <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} />
                        ) : null}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
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
