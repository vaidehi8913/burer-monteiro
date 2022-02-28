import React, { Component } from "react";
import { Stage, 
    Layer, 
    Line, 
    Circle,
    Ellipse,
    Text } from "react-konva";

/*
    PROPS
    vectorList
    graph
    displayGraph (boolean)
    threeD (boolean)
*/
class TwoDVectorDisplay extends Component {

    constructor(props) {
        super(props);

        this.stageWidth = 400;
        this.stageHeight = this.stageWidth;
        this.midX = this.stageWidth / 2;
        this.midY = this.stageWidth / 2;
        this.circMargin = 50;
        this.circRadius = (this.stageWidth)/2 - this.circMargin;
        this.zaxisX = -0.25;
        this.zaxisY = -0.25; // how we are going to project the z direction

        this.project3dto2d = this.project3dto2d.bind(this);
        this.findGradientColor = this.findGradientColor.bind(this);
        this.generatePointDrawing = this.generatePointDrawing.bind(this);
        this.generateGraphDrawing = this.generateGraphDrawing.bind(this);
    }


    project3dto2d (vec) {
        var newX = Number(vec.vec[0]) + vec.vec[2] * this.zaxisX;
        var newY = Number(vec.vec[1]) + vec.vec[2] * this.zaxisY;

        return {label: vec.label, vec: [newX, newY]};
    }


    findGradientColor (weight) {
        // gradient of blue -> white -> orange for 
        // values that are +1 -> 0 -> -1 

        var maxGradientValue = 1; 
        // what is the maximum absolute value that this gradient supports?

        var blueR = 0;
        var blueG = 0;
        var blueB = 255;

        var orangeR = 255;
        var orangeG = 150;
        var orangeB = 0;

        var inverseR = 0;
        var inverseG = 0; 
        var inverseB = 0;

        if (weight >= 0) {
            if (weight > maxGradientValue) weight = maxGradientValue;

            var scaleFactor = weight / maxGradientValue;

            inverseR = Math.floor((255 - blueR) * scaleFactor);
            inverseG = Math.floor((255 - blueG) * scaleFactor);
            inverseB = Math.floor((255 - blueB) * scaleFactor);
        } else {
            if (weight < maxGradientValue * -1) weight = maxGradientValue * -1;

            var scaleFactor = weight / maxGradientValue * -1;

            inverseR = Math.floor((255 - orangeR) * scaleFactor);
            inverseG = Math.floor((255 - orangeG) * scaleFactor);
            inverseB = Math.floor((255 - orangeB) * scaleFactor);
        }


        var hexCode = "#" + (255 - inverseR).toString(16).padStart(2, '0') 
                          + (255 - inverseG).toString(16).padStart(2, '0') 
                          + (255 - inverseB).toString(16).padStart(2, '0');

        return hexCode;
    }


    generateGraphDrawing () {
        if (this.props.graph.length == 0) return null;

        var vectorList = this.props.vectorList;

        if (this.props.threeD) {
            vectorList = vectorList.map(this.project3dto2d);
        }

        var lines = this.props.graph.map((row, rowIndex) =>
            {
                var rowLines = row.row.map((weight, colIndex) =>
                    {
                        if (rowIndex >= colIndex || weight == 0) return null;

                        var startXRaw = vectorList[rowIndex].vec[0];
                        var startYRaw = vectorList[rowIndex].vec[1];
                        var endXRaw = vectorList[colIndex].vec[0];
                        var endYRaw = vectorList[colIndex].vec[1];

                        var startX = (startXRaw * this.circRadius) + this.midX;
                        var startY = (startYRaw * this.circRadius * -1) + this.midY;
                        var endX = (endXRaw * this.circRadius) + this.midX;
                        var endY = (endYRaw * this.circRadius * -1) + this.midY;

                        var points = [startX, startY, endX, endY];
                        
                        var edgeColor = this.findGradientColor(weight);

                        var key = "edge:" + rowIndex + "," + colIndex;

                        return (
                            <Line points={points} 
                                  stroke={edgeColor}
                                  key={key}/>
                        );
                    }
                );

                return rowLines;
            }
        );

        var flattenedLines = lines.reduce((a, b) => a.concat(b), []);

        return (
            <Layer>
                {flattenedLines}
            </Layer>
        );
    }


    generatePointDrawing (vec) {

        if (vec.vec[0] == null || vec.vec[1] == null) {
            return null;
        }

        var isOnBack = false;

        if (this.props.threeD) {
            if (vec.vec[2] == null) return null;

            if (vec.vec[2] < 0) isOnBack = true;

            vec = this.project3dto2d(vec);
        }

        // because stupid canvas drawings are upside down
        var x = vec.vec[0];
        var y = -1 * vec.vec[1];

        var pointX = (this.circRadius * x) + this.midX;
        var pointY = (this.circRadius * y) + this.midY;

        var pointRadius = 5;
        var myRed = "#e30013";
        var myPink = "#ff7581";
        var pointColor = isOnBack ? myPink : myRed;

        var labelWidth = 10;
        var labelHeight = 10;

        var projectedPointDistance = Math.sqrt((x * x) + (y * y));
        var labelRadius = this.circRadius + this.circMargin/(3 * projectedPointDistance);
        var labelCenterX = labelRadius * x + this.midX;
        var labelCenterY = labelRadius * y + this.midY;
        var labelX = labelCenterX - labelWidth/2;
        var labelY = labelCenterY - labelHeight/2;

        return (
            { point:
                <Circle radius={pointRadius} 
                        x={pointX}
                        y={pointY} 
                        fill={pointColor}/>,
             label:
                <Text text={vec.label} 
                      x={labelX} 
                      y={labelY} 
                      width={labelWidth} 
                      height={labelHeight} 
                      align="center"
                      verticalAlign="middle"
                      fontSize={16}
                      fill={pointColor}/>,
             isOnBack: isOnBack
            }
        );
    }


    render() {

        var vectorDisplayWrapperStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            width: "400px",
            //backgroundColor: "#cfecff"
        };

        var vectorDrawings = this.props.vectorList.map(this.generatePointDrawing);
        var frontVectorDrawings = vectorDrawings.map((vecDrawing) =>
            {
                if (vecDrawing == null || vecDrawing.isOnBack) {
                    return [];
                }

                return [vecDrawing.point, vecDrawing.label];
            }
        ).reduce((a, b) => a.concat(b), []);

        var backVectorDrawings = vectorDrawings.map((vecDrawing) =>
            {
                if (vecDrawing == null || !vecDrawing.isOnBack) {
                    return [];
                }

                return [vecDrawing.point, vecDrawing.label];
            }
        ).reduce((a, b) => a.concat(b), []);

        var graphDrawing = this.generateGraphDrawing();

        var graphDrawing = this.generateGraphDrawing();
        

        var xaxisLinePoints = [this.midX - this.circRadius, this.midY, this.midX + this.circRadius, this.midY];
        var yaxisLinePoints = [this.midX, this.midY - this.circRadius, this.midX, this.midY + this.circRadius];

        var axisDrawings = [<Circle radius={this.circRadius} 
                                    x={this.midX} 
                                    y={this.midY} 
                                    stroke="gray"/>,
                            <Line points={xaxisLinePoints} 
                                  stroke="gray"
                                  dash={[5, 5]}/>,
                            <Line points={yaxisLinePoints} 
                                  stroke="gray"
                                  dash={[5, 5]}/>];
        
        var title = "2D Vector Display:";

        // extra z direction stuff 
        if (this.props.threeD) {
            var zaxisLinePoints = [this.zaxisX * this.circRadius + this.midX, 
                                   -1 * this.zaxisY * this.circRadius + this.midY,
                                   -1 * this.zaxisX * this.circRadius + this.midX, 
                                   this.zaxisY * this.circRadius + this.midY];

            var yZeroEllipseWidth = this.circRadius;
            var yZeroEllipseHeight = this.circRadius / Math.sqrt(15);
            var yZeroEllipseRadius = {x: yZeroEllipseWidth, y: yZeroEllipseHeight};
            var xZeroEllipseRadius = {x: yZeroEllipseHeight, y: yZeroEllipseWidth};

            axisDrawings = axisDrawings.concat([
                <Line points={zaxisLinePoints} 
                              stroke="gray"
                              dash={[5, 5]}/>,
                <Ellipse radius={yZeroEllipseRadius} 
                                 x={this.midX}
                                 y={this.midY}
                                 stroke="gray"
                                 dash={[5, 5]}/>,
                <Ellipse radius={xZeroEllipseRadius} 
                                 x={this.midX}
                                 y={this.midY}
                                 stroke="gray"
                                 dash={[5, 5]}/>]);

            title = "3D Vector Display:"
        }


        return (
            <div style={vectorDisplayWrapperStyle}>

                <b>{title}</b>

                <Stage width={this.stageWidth} height={this.stageHeight}>
                    <Layer>
                        {axisDrawings}
                    </Layer> 

                    <Layer>
                        {backVectorDrawings}
                    </Layer>

                    {graphDrawing}

                    <Layer>
                        {frontVectorDrawings}
                    </Layer>

                </Stage>
            </div>
        );
    }

}

export default TwoDVectorDisplay;