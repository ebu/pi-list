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
    ReferenceArea,
} from 'recharts';
import { TimeValueTooltip } from '../index';
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

function ScatterGraphic({ data }: { data: IComponentProps | undefined }) {
    if (data === undefined) {
        return null;
    }

    const initialZoomState = {
        dataZoom: data.graphicData,
        refAreaLeft: '',
        refAreaRight: '',
        activeLabelLeft: '',
        activeLabelRight: '',
        animation: true,
    };

    const [zoomState, setZoomState] = React.useState(initialZoomState);

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
        const dataNewZoom = dataZoom.map((item: any) => item.slice(parseInt(refAreaLeft), parseInt(refAreaRight) + 1));
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
                            console.log('OnMouseDown');
                            e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaLeft:
                                          e.activeTooltipIndex !== undefined ? e.activeTooltipIndex.toString() : '',
                                      activeLabelLeft: e.activeLabel !== undefined ? e.activeLabel : '',
                                  })
                                : null;
                        }}
                        onMouseMove={(e: any) => {
                            console.log('OnMouseMove');
                            zoomState.refAreaLeft && zoomState.activeLabelLeft && e !== null
                                ? setZoomState({
                                      ...zoomState,
                                      refAreaRight:
                                          e.activeTooltipIndex !== undefined ? e.activeTooltipIndex.toString() : '',
                                      activeLabelRight: e.activeLabel !== undefined ? e.activeLabel : '',
                                  })
                                : null;
                        }}
                        // eslint-disable-next-line react/jsx-no-bind
                        onMouseUp={() => {
                            console.log('OnMouseUp');
                            handleZoom;
                        }}
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
                            domain={['dataMin - 1', 'dataMax + 1']}
                            type="number"
                            onClick={handleZoomOut}
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
                            type="number"
                            interval="preserveStart"
                            width={0}
                        />

                        <Tooltip cursor={false} content={<CustomTooltip />} />
                        {data.graphicData.map((data: any, index: number) => {
                            return <Scatter key={index} data={data} fill="#0083FF" line shape="circle" />;
                        })}
                        {zoomState.activeLabelLeft && zoomState.activeLabelRight ? (
                            <ReferenceArea
                                x1={zoomState.activeLabelLeft}
                                x2={zoomState.activeLabelRight}
                                strokeOpacity={0.3}
                            />
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
