import React from 'react';
import './styles.scss';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Label,
    ReferenceArea,
} from 'recharts';
import { TimeValueTooltip } from '../index';
import LabelYAxis from '../LabelYAxis/LabelYAxis';
import _ from 'lodash';

interface IComponentProps {
    graphicData: Array<IGraphicTimeMaxData | IGraphicTimeValueData>;
    toleranceValue?: number;
    title: string | React.ReactElement;
    yAxisTitle: string;
    xAxisTitle: string;
    datakeyX: string;
    datakeyY: string;
    leftMargin: number;
}

function LineGraphic({
    data,
    getNewData,
}: {
    data: IComponentProps | undefined;
    getNewData?: (first_packet_ts: string, last_packet_ts: string, numberOfPoints: number, isZoomOut: boolean) => void;
}) {
    if (data === undefined) {
        return null;
    }

    const initialZoomState = {
        dataZoom: data?.graphicData,
        refAreaLeft: '',
        refAreaRight: '',
        activeLabelLeft: '',
        activeLabelRight: '',
        animation: true,
    };

    const [zoomState, setZoomState] = React.useState(initialZoomState);

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
                        valueY={props.payload[0].value}
                        valueYLabel={data.datakeyY.charAt(0).toUpperCase() + data.datakeyY.slice(1)}
                        valueX={props.label}
                        valueXLabel={data.xAxisTitle}
                    />
                );
            }
        }
        return null;
    };

    const CustomizedActiveDot = (props: any) => {
        const { cx, cy, stroke, payload, value } = props;

        if (data.toleranceValue === undefined) {
            return null;
        }
        if (value > data.toleranceValue) {
            return <circle cx={cx} cy={cy} r="4" fill="#E6E7EA" stroke="#FF4747" strokeWidth="2" />;
        }

        return <circle cx={cx} cy={cy} r="4" fill="#E6E7EA" stroke="#0083FF" strokeWidth="2" />;
    };

    const CustomizedNotActiveDot = (props: any) => {
        const { cx, cy, stroke, payload, value } = props;
        return <circle cx={cx} cy={cy} r="3.5" fill="#002C55" stroke="#0083FF" />;
    };

    const CustomLabel = (props: any) => {
        const { label } = props;
        return (
            <g>
                <foreignObject x={props.viewBox.width + 10} y={props.viewBox.y - 9} width={50} height={18}>
                    <div className="bar-graphic-custom-label">{label}</div>
                </foreignObject>
            </g>
        );
    };

    const isTimeGraph = (value: Array<any>) => {
        if (Object.keys(value[0] === 'time')) return true;
        return false;
    };

    const handleZoom = async () => {
        let { refAreaLeft, refAreaRight } = zoomState;
        const { dataZoom } = zoomState;

        let numberOfPoints = parseInt(zoomState.refAreaRight) - parseInt(zoomState.refAreaLeft);
        const isTimeGraphValue = isTimeGraph(dataZoom);

        let activeLabelRightFixed =
            zoomState.activeLabelRight === ''
                ? zoomState.dataZoom[dataZoom.length - 1].time
                : zoomState.activeLabelRight;

        if (numberOfPoints === 0 || isNaN(numberOfPoints) || _.isNil(numberOfPoints)) numberOfPoints = dataZoom.length;

        if (zoomState.activeLabelLeft === '') {
            await getNewData!(zoomState.activeLabelLeft, activeLabelRightFixed, numberOfPoints, true);
        } else {
            await getNewData!(zoomState.activeLabelLeft, activeLabelRightFixed, numberOfPoints, false);
        }

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
        const dataNewZoom = dataZoom?.slice(parseInt(refAreaLeft), parseInt(refAreaRight) + 1);
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
        const numberOfPoints = parseInt(zoomState.refAreaRight) - parseInt(zoomState.refAreaLeft);

        getNewData!(zoomState.activeLabelLeft, zoomState.activeLabelRight, numberOfPoints, true);
    };

    React.useEffect(() => {
        setZoomState({
            ...zoomState,
            dataZoom: data.graphicData,
            refAreaLeft: '',
            refAreaRight: '',
            activeLabelLeft: '',
            activeLabelRight: '',
        });
    }, [data.graphicData]);

    return (
        <div className="line-graphic-container">
            <div className="blend-div"></div>
            <div className="line-graphic-legend">
                <span>{data.title}</span>
                <div>
                    {data.toleranceValue && (
                        <div className="line-graphic-high-tolerance-legend">
                            <span className="line-graphic-high-tolerance-dot"></span>
                            <span className="line-graphic-high-tolerance-label">High Tolerance</span>
                        </div>
                    )}

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
                    <LineChart
                        data={zoomState.dataZoom}
                        margin={{ top: 35, right: 25, left: data.leftMargin }}
                        onMouseDown={(e: any) => {
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
                            onClick={handleZoomOut}
                        />

                        <YAxis
                            dataKey={data.datakeyY}
                            domain={['dataMin - 0.25', 'dataMax + 0.25']}
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
                            width={0}
                        />

                        <Tooltip cursor={false} content={<CustomTooltip />} />
                        {data.toleranceValue ? (
                            <Line
                                dataKey={data.datakeyY}
                                stroke="#0083FF"
                                dot={<CustomizedNotActiveDot />}
                                activeDot={<CustomizedActiveDot />}
                                animationDuration={300}
                            />
                        ) : (
                            <Line dataKey={data.datakeyY} stroke="#0083FF" animationDuration={300} />
                        )}

                        {data.toleranceValue ? (
                            <ReferenceLine
                                strokeDasharray="5 10"
                                y={data.toleranceValue}
                                stroke="#FF4747"
                                ifOverflow="extendDomain"
                            >
                                <Label content={<CustomLabel label={data.toleranceValue.toString()} />} />
                            </ReferenceLine>
                        ) : null}
                        {zoomState.activeLabelLeft && zoomState.activeLabelRight ? (
                            <ReferenceArea
                                x1={zoomState.activeLabelLeft}
                                x2={zoomState.activeLabelRight}
                                strokeOpacity={0.3}
                            />
                        ) : null}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <button className="zoom-out-graph-button" onClick={handleZoomOut}>
                Zoom Out
            </button>
        </div>
    );
}

export type IGraphicTimeValueData = {
    value: number;
    time: string;
};

export type IGraphicTimeMaxData = {
    max: number;
    time: string;
};

export type IGraphicTimeValueObject = {
    data: Array<IGraphicTimeValueData>;
    isGrouped: string;
};
export type IGraphicTimeMaxObject = {
    data: Array<IGraphicTimeMaxData>;
    isGrouped: string;
};

export default LineGraphic;
