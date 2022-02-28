import React, { Component } from "react";
import * as Utils from "./Utils";

/*
    PROPS
    graph
    vecs
    updateGraph
*/
class GraphTextDisplay extends Component {

    constructor(props) {
        super(props);

        this.graphCellWidth = "50px";
        this.graphCellGap = "15px";
        this.graphRowStyle = {
            display: "flex",
            flexDirection: "row",
            gap: this.graphCellGap
        };

        this.generateGraphRow = this.generateGraphRow.bind(this);
        this.generateGraphDisplay = this.generateGraphDisplay.bind(this);
        this.generateMultiplierRow = this.generateMultiplierRow.bind(this);
        this.generateMultiplierDisplay = this.generateMultiplierDisplay.bind(this);
        //this.generateADiagLambdaY = this.generateADiagLambdaY.bind(this);
    }

    generateGraphRow (label, data, row) {
        var cellStyle = {
            width: this.graphCellWidth,
            height: this.graphCellWidth,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            //backgroundColor: "#ffbcb8"
        }

        var inputStyle = {
            width: "40px"
        };

        var formattedData = data.map((value, col) => 
            {
                if (row > col || row < 0) {
                    return (
                        <div style={cellStyle}>
                            {value}
                        </div>
                    );
                } else {
                    return (
                        <div style={cellStyle}>
                            <input type="text"
                                   value={value}
                                   onChange={(event) => this.props.updateGraph(row, col, event.target.value)}
                                   style={inputStyle}/>
                        </div>
                    )
                };
            }
        );

        return (
            <div style={this.graphRowStyle}>
                <div style={cellStyle}>
                    {label}
                </div>

                {formattedData}
            </div>
        );

    }


    generateGraphDisplay () {
        var graphWrapperStyle = {
            display: "flex",
            flexDirection: "column",
            gap: this.graphCellGap
        }

        var vectorLabels = this.props.vecs.map((elem) => <b>{elem.label}</b>);

        var headerRow = this.generateGraphRow("", vectorLabels, -1);

        var dataRows = this.props.graph.map((rowData, rowIndex) =>
            this.generateGraphRow(vectorLabels[rowIndex], rowData.row, rowIndex)
        );

        return (
            <div style={graphWrapperStyle}>
                {headerRow}
                {dataRows}
            </div>
        );
    }


    generateMultiplierRow (data) {

        var cellStyle = {
            width: this.graphCellWidth,
            height: this.graphCellWidth,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            //backgroundColor: "#ffbcb8"
        }

        var formattedData = data.map((value, col) => 
            <div style={cellStyle}>
                {value}
            </div>
        );

        return (
            <div style={this.graphRowStyle}>
                {formattedData}
            </div>
        );

    }


    calculateMultiplier (i) {

        var vecs = this.props.vecs;

        var sumComponents = vecs.map((vec, j) =>
            {
                var Aij = this.props.graph[i].row[j];

                var YizipYj = vecs[i].vec.map((Yivalue, Yindex) => 
                    {
                        var Yjvalue = vecs[j].vec[Yindex];

                        return (Yivalue * Yjvalue);
                    }
                );

                var YidotYj = YizipYj.reduce((a, b) => a + b, 0);

                return (Aij * YidotYj);
            }
        );

        var lambda_i = sumComponents.reduce((a, b) => a + b, 0);

        return lambda_i;

    }


    generateMultiplierDisplay () {

        var graphWrapperStyle = {
            display: "flex",
            flexDirection: "column",
            gap: this.graphCellGap
        }

        var vectorLabels = this.props.vecs.map((elem) => <b>{elem.label}</b>);

        var headerRow = this.generateMultiplierRow(vectorLabels);

        var multipliers = this.props.vecs.map((v, i) => this.calculateMultiplier(i));

        var fixDataStrings = multipliers.map((coordVal) =>
            {
                if (coordVal == null) return "";

                return Number(coordVal).toFixed(4);
            }
        );

        var formattedData = this.generateMultiplierRow(fixDataStrings);
        
        var AminusDiagLambda = this.props.graph.map((graphRow, rowIndex) =>
            {
                var graphRowData = graphRow.row;

                var newGraphRowData = graphRowData.map((value, colIndex) =>
                    {
                        if (colIndex == rowIndex) {
                            return (-1 * multipliers[colIndex]);
                        }

                        return (value);
                    }
                );

                return ({row: newGraphRowData});
            }
        );

        var Y = this.props.vecs.map ((vec) => ({row: vec.vec}));

        var product = Utils.matrixMultiply(AminusDiagLambda, Y);

        var formattedEntries = product.map((row) =>
            {
                var rowData = row.row;

                var fixedDataStrings = rowData.map((coordVal) =>
                    {
                        if (coordVal == null) return "";
        
                        return Number(coordVal).toFixed(4);
                    }
                );

                var formattedData = this.generateMultiplierRow(fixedDataStrings);

                return formattedData;
            }
        );

        return (
            <div>
                <b> Multipliers: </b>
                <div style={graphWrapperStyle}>
                    {headerRow}
                    {formattedData}
                </div>

                <br/>
                <b> (A - diag(lambda)) * Y :</b>
                <div style={graphWrapperStyle}>
                    {formattedEntries}
                </div>
            </div>
            
        );
    }



    render () {

        var vectorDisplayWrapperStyle = {
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            //width: "600px",
            //backgroundColor: "#d5ffcc"
        };

        return (
            <div style={vectorDisplayWrapperStyle}>
                <b>Graph:</b>
                {this.generateGraphDisplay()}

                {/* <b>Multipliers:</b> */}
                {this.generateMultiplierDisplay()}
            </div>
        );
    }
}

export default GraphTextDisplay;