import React, {Component} from "react";

class Heading extends Component {

    constructor(props){
        super(props);

        this.state = {
            dropDown: false,
            hovering: false
        }

        this.onClick = this.onClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);

        this.infoButtonColor = "#10006e";
    }

    onClick(e) {
        var isDropped = this.state.dropDown;
        this.setState({dropDown: !isDropped});
    }

    onMouseEnter(e) {
        this.setState({hovering: true});
    }

    onMouseLeave(e) {
        this.setState({hovering: false});
    }

    render() {

        var topLevelWrapperStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // gap: "20px",
            // marginTop: "50px"
        }

        var titleWrapperStyle = {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
        } 

        var titleStyle = {
            fontSize: "1.5em"
        };

        var invertColorScheme = this.state.dropDown || this.state.hovering;

        var mainColor = invertColorScheme ? null : this.infoButtonColor;
        var textColor = invertColorScheme ? this.infoButtonColor : "white";

        var infoButtonStyle = {
            width: "10px",
            height: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            borderRadius: 100,
            backgroundColor: mainColor,
            margin: "15px",
            color: textColor,
            fontSize: "65%",
            borderColor: this.infoButtonColor,
            borderWidth: "3px",
            borderStyle: "solid",
            fontSize: "0.5em"
        };

        var dropDownBox = null;

        var dropDownBoxStyle = {
            maxWidth: "700px"
        };

        if (this.state.dropDown) {
            dropDownBox = 
            <div style={dropDownBoxStyle}> 
                <p>This is a visualizer for the Burer-Monteiro method of solving 
                semidefinite programs (SDPs) on instances of the 
                Goemans-Williamson Max-Cut SDP.</p>  
                
                <p>For rank (dimension) 2 and 3, we provide 
                a visualization of the gradient descent algorithm.  For higher dimensions, 
                it no longer makes sense to have a visualization, but the rest of the 
                functionality that runs gradient descent is still implemented and usable.</p>

                <p>We developed this tool for <i>The Burer-Monteiro SDP method
                can fail even above the Barvinok-Pataki bound 
                (<a href="https://liamocarroll.github.io">Liam O'Carroll</a>,  
                {' '}<a href="https://vaidehi8913.github.io" target="_blank">Vaidehi Srinivas</a>, 
                {' '}<a href="https://users.cs.northwestern.edu/~aravindv/" target="_blank">Aravindan Vijayaraghavan</a>,
                {' '}NeurIPS 2022)</i>. 
                For more details and fun sample instances please see our 
                {' '}<a href="https://github.com/vaidehi8913/burer-monteiro/tree/main/src" target="_blank">README</a>.</p>
            </div>;
        }

        return(
            <div style={topLevelWrapperStyle}>

                <div style={titleWrapperStyle}>
                    <div style={titleStyle}>
                        <b> Burer-Monteiro Method Visualizer for Max-Cut Instances</b>
                    </div>

                    <div style={infoButtonStyle}
                        onClick={this.onClick}
                        onMouseEnter={this.onMouseEnter}
                        onMouseLeave={this.onMouseLeave}>
                        {this.state.dropDown ? <b>less</b> : <b>info</b>}
                    </div>
                </div>

                {dropDownBox}

            </div>
        );
    }
}

export default Heading;