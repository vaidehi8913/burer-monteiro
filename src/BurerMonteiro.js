import React, { Component } from "react";

import TwoDVectorDisplay from "./TwoDVectorDisplay";
import VectorTextDisplay from "./VectorTextDisplay";
import GraphTextDisplay from "./GraphTextDisplay";

class BurerMonteiro extends Component {

    constructor(props){
        super(props);

        this.state = {
            dimension: 2,
            initialVectors: [],
            // vectors are stored as {label: ..., vec: [..., ...]}
            graph: [],
            // graphs are stored as lists of rows
            // {row:[]}
            currentVectors: [],
            isRunning: false,
            stepSize: 0.3,
            tickTime: 1000,
            perturbWithin: 0.01 
        };

        this.interval = setInterval(() => this.tick(), 1000);

        this.resetVectors = this.resetVectors.bind(this);
        this.updatePerturbWithin = this.updatePerturbWithin.bind(this);
        this.updateTickTime = this.updateTickTime.bind(this)
        this.updateVectorDimension = this.updateVectorDimension.bind(this);
        this.updateDimension = this.updateDimension.bind(this);
        this.updateStepSize = this.updateStepSize.bind(this);
        this.logVectors = this.logVectors.bind(this);
        this.logGrad = this.logGrad.bind(this);
        this.perturbVectors = this.perturbVectors.bind(this);
        this.calculateGradient = this.calculateGradient.bind(this);
        this.moveAgainstGradient = this.moveAgainstGradient.bind(this);
        this.normalizeVector = this.normalizeVector.bind(this);
        this.stepBurerMonteiro = this.stepBurerMonteiro.bind(this);
        this.tick = this.tick.bind(this);
        this.controlRun = this.controlRun.bind(this);
        this.passUpVectors = this.passUpVectors.bind(this);
        this.addNewVectorToGraph = this.addNewVectorToGraph.bind(this);
        this.updateGraph = this.updateGraph.bind(this);
    }


    resetVectors () {
        this.setState({
            currentVectors: this.state.initialVectors,
            isRunning: false
        });
    }


    updatePerturbWithin (newPerturbWithin) {
        this.setState({
            perturbWithin: newPerturbWithin
        });
    }


    updateTickTime (newTickTime) {
        this.setState({
            tickTime: newTickTime
        });

        clearInterval(this.interval);
        this.interval = setInterval(() => this.tick(), this.state.tickTime);
    }


    updateVectorDimension (vec, newDimension) {

        var newValues = vec.vec.concat(Array(newDimension).fill(0)).slice(0,newDimension);
        var newVector = {label: vec.vec, vec: newValues};
        var normedNewVector = this.normalizeVector(newVector);

        return normedNewVector;
    }


    updateDimension (newDimension) {

        var newInitVectors = this.state.initialVectors.map((vec) =>
            this.updateVectorDimension(vec, newDimension)
        );

        this.setState({
            initialVectors: newInitVectors,
            currentVectors: newInitVectors,
            dimension: newDimension,
            isRunning: false
        });
    }


    updateStepSize (newStepSize) {
        this.setState({
            stepSize: newStepSize
        });
    }


    logVectors (vecs) {
        
        console.log("VECTORS ------");

        var garbage = vecs.map((vec, index) =>
            {
                var coordStrings = vec.vec.map((val) => val + ", ");
                var coordSingleString = coordStrings.reduce((a, b) => a + b, "");
                
                console.log("label: " + vec.label 
                            + ", index: " + index 
                            + ", coords: (" + coordSingleString + ")");

                
            }
        );

        console.log("-------------");
    }

    logGrad (grad) {

        console.log("GRADIENT ------");

        var garbage = grad.map((indivgrad, index) =>
            {
                var coordStrings = indivgrad.grad.map((val) => val + ", ");
                var coordSingleString = coordStrings.reduce((a, b) => a + b, "");
                
                console.log("index: " + index + ", grads: (" + coordSingleString + ")");
            }
        );

        console.log("-------------");
    }

    /* These actually run Burer-Monteiro */

    calculateGradient () {
        
        // should generate a list that of items that look like 
        // {grad: [x, y]}

        var grad = this.state.currentVectors.map((vec, vecIndex) =>
            {

                var byCoordGrads = vec.vec.map ((irrelevantValue, coord) =>
                    {
                        var coordGrads = this.state.currentVectors.map((dotWith, dotWithIndex) =>
                            (this.state.graph[vecIndex].row[dotWithIndex] * dotWith.vec[coord])
                        );

                        var coordGrad = coordGrads.reduce((a, b) => a + b, 0);

                        return coordGrad;
                    }
                );

                return ({grad: byCoordGrads});
            }
        );

        return grad;
    }


    perturbVectors (vecs) {

        // Math.random() returns something in [0, 1)

        var perturbedVecs = vecs.map((vec) =>
            {
                var perturbedIndices = vec.vec.map((entry) =>
                    entry + (2 * Math.random() * this.state.perturbWithin) - this.state.perturbWithin
                );

                return ({
                    label: vec.label,
                    vec: perturbedIndices
                });
            }
        );

        return perturbedVecs;
    }


    moveAgainstGradient (vecs, grad) {
        // move vectors in the direction of the minimum gradient

        var newVectors = vecs.map((vec, vecIndex) =>
            {
                var newIndices = vec.vec.map((oldCoord, coord) =>
                    {
                        var coordGrad = grad[vecIndex].grad[coord];
                        var newCoord = Number(oldCoord) + (coordGrad * this.state.stepSize * -1);

                        return newCoord;
                    }
                );

                return ({label: vec.label, vec: newIndices});
            }
        );

        return newVectors;
    }

    normalizeVector (vec) {

        var squaredEntries = vec.vec.map((a) => a * a);
        var sumOfSquaredEntries = squaredEntries.reduce((a, b) => a + b, 0);
        var oldNorm = Math.sqrt(sumOfSquaredEntries);

        var newEntries = vec.vec.map((a) => a / oldNorm);

        return ({label: vec.label, vec: newEntries});
    }

    stepBurerMonteiro () {
        // should add a catch here to stop updating once the gradient is basically 0
        var grad = this.calculateGradient();

        // this.logGrad(grad);

        var unnormedVecs = this.moveAgainstGradient(this.state.currentVectors, grad);

        // console.log("unnormed:");
        // this.logVectors(unnormedVecs);

        var perturbedVecs = this.perturbVectors(unnormedVecs);

        var normedVecs = perturbedVecs.map(this.normalizeVector);

        // console.log("normed");
        // this.logVectors(normedVecs);

        this.setState({
            currentVectors: normedVecs
        });
    }

    tick () {
        //console.log("tick");

        if (this.state.isRunning) {
            this.stepBurerMonteiro();
        }
    }

    // componentDidMount () {
    //     this.interval = setInterval(() => this.tick(), 500);
    // }

    componentWillUnmount () {
        clearInterval(this.interval);
    }

    controlRun () {
        this.setState({
            isRunning: !this.state.isRunning
        });
    }

    /* The rest of this is for UI and input */

    passUpVectors(newVecs) {
        this.setState({
            initialVectors: newVecs,
            currentVectors: newVecs,
            isRunning: false
        });
    }

    addNewVectorToGraph () {

        if (this.state.graph.length === 0) {
            this.setState({
                graph: [{row: [0]}]
            });
        } else {
            
            var addColumns = this.state.graph.map((r) =>
                {
                    return({row: r.row.concat(0)});
                }
            );

            var someRow = addColumns[0].row;

            var newRow = {row: someRow.map((r) => 0)};

            var totalGraph = addColumns.concat(newRow);

            this.setState({
                graph: totalGraph
            });

        }

    }

    updateGraph (row, column, newValue) {

        var newGraph = this.state.graph.map((rowData, rowIndex) =>
            {
                if (rowIndex === row || rowIndex === column) {

                    var newRowData = rowData.row.map((value, colIndex) =>
                        {
                            if ((rowIndex === row && colIndex === column)
                                || (rowIndex === column && colIndex === row)) {
                                return newValue;
                            } else {
                                return value;
                            }
                        }
                    );

                    return ({row: newRowData});

                } else {
                    return rowData;
                }
            }
        );

        this.setState({
            graph: newGraph
        });
    }

    render() {

        var topLevelWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "20px",
            marginTop: "100px"
        };

        var vectorDisplay = null;

        if (this.state.dimension === 2) {
            vectorDisplay = <TwoDVectorDisplay vectorList={this.state.currentVectors}
                                               graph={this.state.graph}
                                               displayGraph={true}/>
        } 

        if (this.state.dimension === 3) {
            vectorDisplay = <TwoDVectorDisplay vectorList={this.state.currentVectors}
                                               graph={this.state.graph}
                                               displayGraph={true}
                                               threeD={true}/>
        }

        return (
            <div style={topLevelWrapperStyle}>
                {vectorDisplay}
                <VectorTextDisplay passUpVectors={this.passUpVectors}
                                   addNewVectorToGraph={this.addNewVectorToGraph}
                                   isRunning={this.state.isRunning}
                                   controlRun={this.controlRun}
                                   updateStepSize={this.updateStepSize}
                                   stepSize={this.state.stepSize}
                                   updateDimension={this.updateDimension}
                                   dimension={this.state.dimension}
                                   initVectors={this.state.initialVectors}
                                   currentVectors={this.state.currentVectors}
                                   tickTime={this.state.tickTime}
                                   updateTickTime={this.updateTickTime}
                                   perturbWithin={this.state.perturbWithin}
                                   updatePerturbWithin={this.updatePerturbWithin}
                                   resetVectors={this.resetVectors}/>
                <GraphTextDisplay graph={this.state.graph}
                                  vecs={this.state.currentVectors}
                                  updateGraph={this.updateGraph}/>
            </div>
        );
    }
}

export default BurerMonteiro; 