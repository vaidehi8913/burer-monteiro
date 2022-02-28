import React, { Component } from "react";


/*
    PROPS
    passUpVectors
    addNewVectorToGraph
    isRunning
    controlRun
    updateStepSize
    stepSize
    initVectors
    currentVectors
    tickTime
    updateTickTime
    perturbWithin
    updatePerturbWithin
    resetVectors
*/
class VectorTextDisplay extends Component {

    constructor(props) {
        super(props);

        this.vectorHeaderWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            gap: "15px"
        };

        this.labelWidth = "50px";
        this.vectorIndexWidth = "50px";

        this.buildPerturbWithinEntry = this.buildPerturbWithinEntry.bind(this);
        this.buildTickTimeEntry = this.buildTickTimeEntry.bind(this);
        this.buildDimensionEntry = this.buildDimensionEntry.bind(this)
        this.buildStepSizeEntry = this.buildStepSizeEntry.bind(this)
        this.formatDataRow = this.formatDataRow.bind(this)
        this.addEmptyVector = this.addEmptyVector.bind(this)
        this.updateVectorIndex = this.updateVectorIndex.bind(this)
        this.updateVectorLabel = this.updateVectorLabel.bind(this)
        this.displayVectorInputs = this.displayVectorInputs.bind(this)
        this.displayVectorValues = this.displayVectorValues.bind(this)
    }


    buildPerturbWithinEntry () {

        var stepSizeWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            gap: "5px"
        }

        return(
            <div style={stepSizeWrapperStyle}>
                (Perturb within  

                <input type="text"
                    value={this.props.perturbWithin}
                    onChange={(event) => this.props.updatePerturbWithin(event.target.value)}
                    style={{width: this.labelWidth}}/>

                )
            </div>
        );


    }

    buildTickTimeEntry () {

        var stepSizeWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            gap: "5px"
        }

        return(
            <div style={stepSizeWrapperStyle}>
                (Step every 

                <input type="text"
                    value={this.props.tickTime}
                    onChange={(event) => this.props.updateTickTime(Math.floor(event.target.value))}
                    style={{width: this.labelWidth}}/>

                msec)
            </div>
        );


    }


    buildDimensionEntry () {

        var stepSizeWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            gap: "5px"
        }

        return(
            <div style={stepSizeWrapperStyle}>
                <b>Dimension:</b>

                <input type="text"
                    value={this.props.dimension}
                    onChange={(event) => this.props.updateDimension(Math.floor(event.target.value))}
                    style={{width: this.labelWidth}}/>
            </div>
        );


    }

    buildStepSizeEntry () {

        var stepSizeWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            gap: "5px"
        }

        return(
            <div style={stepSizeWrapperStyle}>
                Step size: 

                <input type="text"
                    value={this.props.stepSize}
                    onChange={(event) => this.props.updateStepSize(event.target.value)}
                    style={{width: this.labelWidth}}/>
            </div>
        );

    }


    formatDataRow (label, data) {

        var formattedData = data.map((datum) => 
            <div style={{width: this.vectorIndexWidth}}>
                {datum}
            </div>
        );

        return (
            <div style={this.vectorHeaderWrapperStyle}>
                <div style={{width: this.labelWidth}} >
                    {label}
                </div>
                {formattedData}
            </div>
        );

    }



    addEmptyVector () {
        var newVectorCoords = Array(this.props.dimension).fill(null);
        var newVectors = this.props.initVectors.concat({label: null, vec:newVectorCoords});

        this.props.passUpVectors(newVectors);
        this.props.addNewVectorToGraph();
    }



    updateVectorIndex (vectorNumber, index, newValue) {
        var newVectors = this.props.initVectors.map((elem, listIndex) =>
            {
                if (listIndex === vectorNumber) {
                    var newVector = elem.vec.map((el, vecIndex) =>
                        {
                            if (vecIndex === index) {
                                return newValue;
                            } else {
                                return el;
                            }
                        }
                    );

                    return ({
                        label: elem.label,
                        vec: newVector
                    });

                } else {
                    return elem;
                }
            }
        );

        this.props.passUpVectors(newVectors);
    }



    updateVectorLabel (vectorNumber, newLabel) {
        var newVectors = this.props.initVectors.map((elem, listIndex) =>
            {
                if (listIndex === vectorNumber) {
                    return ({
                        label: newLabel,
                        vec: elem.vec
                    });

                } else {
                    return elem;
                }
            }
        );

        this.props.passUpVectors(newVectors);
    }



    displayVectorInputs (vec, vectorNumber) {

        var vectorInputs = vec.vec.map((coordVal, coord) =>
            <input type="text"
                   value={coordVal}
                   onChange={(event) => this.updateVectorIndex(vectorNumber, coord, event.target.value)}
                   style={{width: this.vectorIndexWidth}}/>
        );

        return (
            this.formatDataRow(
                <input type="text"
                       value={vec.label}
                       onChange={(event) => this.updateVectorLabel(vectorNumber, event.target.value)}
                       style={{width: this.labelWidth}}/>,
                vectorInputs
            )
        );
    }


    displayVectorValues (vec) {

        var fixVectorStrings = vec.vec.map((coordVal) =>
            {
                if (coordVal == null) return "";

                return Number(coordVal).toFixed(4);
            }
        );

        var formatVectorStrings = fixVectorStrings.map((coordVal) => 
            <div style={{width: this.vectorIndexWidth}}>
                {coordVal}
            </div>
        );

        return (
            this.formatDataRow(
                <div style={{width: this.labelWidth}}>
                    <b>{vec.label}</b>
                </div>,
                formatVectorStrings
            )
        );
    }


    render () {

        var vectorDisplayWrapperStyle = {
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            //width: "250px",
            //backgroundColor: "#ffcfff"
        };

        var dimensionEntry = this.buildDimensionEntry();

        if (this.props.dimension <= 1) {
            return (
                <div style={vectorDisplayWrapperStyle}>

                    {dimensionEntry}

                    Invalid dimension! Valid dimensions are greater than 1.

                </div>
            );
        }

        var perturbWithinEntry = this.buildPerturbWithinEntry();

        var tickTimeEntry = this.buildTickTimeEntry();

        var addVectorButtonStyle = {
            width: "80px"
        };

        // delete?
        // var initialVectorButtonWrapperStyle = {
        //     display: "flex",
        //     flexDirection: "row",
        //     gap: "10px"
        // };

        var controlRunButtonStyle = {
            width: "200px"
        };

        var controlRunButtonText = "Run Burer-Monteiro";
        
        if (this.props.isRunning) {
            controlRunButtonText = "Pause Burer-Monteiro";
        }

        var indexNames = [];

        if (this.props.dimension === 2) {
            indexNames = ["x", "y"];
        }

        if (this.props.dimension === 3) {
            indexNames = ["x", "y", "z"];
        }

        var formattedIndexNames = indexNames.map((name) => 
            <div style={{width: this.vectorIndexWidth}}>
                {name}
            </div>
        );

        var vectorHeader = 
                this.formatDataRow(
                    <div style={{width: this.labelWidth}}>
                        Label
                    </div>,
                    formattedIndexNames
                );

        var vectorInputDisplays = this.props.initVectors.map(this.displayVectorInputs);

        var vectorValueDisplays = this.props.currentVectors.map(this.displayVectorValues);

        var stepSizeEntry = this.buildStepSizeEntry();

        return (
            <div style={vectorDisplayWrapperStyle}>

                {dimensionEntry}

                {/* <br/> */}

                <b>Initialize Vectors:</b>

                {vectorHeader}

                {vectorInputDisplays}

                <button onClick={this.addEmptyVector}
                        style={addVectorButtonStyle}>
                    Add vector
                </button>

                {/* <br/> */}

                <b> Where are they now?</b>

                {stepSizeEntry}

                {tickTimeEntry}

                {perturbWithinEntry}

                <button onClick={this.props.controlRun}
                        style={controlRunButtonStyle}>
                    {controlRunButtonText}
                </button>

                <button onClick={this.props.resetVectors}
                            style={controlRunButtonStyle}>
                    Reset to initial positions
                </button>

                {vectorHeader}

                {vectorValueDisplays}

            </div>
        );
    }

}

export default VectorTextDisplay;