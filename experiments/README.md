This directory contains code and results for experiments associated with the paper 

> The Burer-Monteiro SDP method can fail even above the Barvinok-Pataki Bound  
> *[Liam O'Carroll](https://liamocarroll.github.io), [Vaidehi Srinivas](https://vaidehi8913.github.io), [Aravindan Vijayaraghavan](https://users.cs.northwestern.edu/~aravindv/)*  
> *NeurIPS 2022.*

## Code

Our code is written in MATLAB, and relies on the awesome [Manopt package](https://manopt.org).  

``experiment.m`` uses our deterministic construction of a pseudo-PD matrix,
and runs trials using random initializations at different specified distances from our target spurious local minimum. 

More details on how these matrices are constructed and what data is collected can be found in our paper.

## Data

The data that is analyzed in our paper can be found in the ``results`` subdirectory.  It contains a file called ``summary.txt`` which provides an overview of the data.