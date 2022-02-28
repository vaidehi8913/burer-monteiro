# Burer-Monteiro Visualizer

This project is a visualizer for running the Burer-Monteiro heuristic to solve semidefinite programs (SDPs).
Specifically, it is for the Goemans-Williamson max-cut SDP.  For running this heuristic for rank (dimension) 2 and
3, we provide a visualization of the gradient descent algorithm.  For higher dimensions, it no longer makes
sense to have a visualization, however the rest of the functionality that runs gradient descent is still 
implemented and usable.

This app is published at 

    https://vaidehi8913.github.io/burer-monteiro

## Algorithm 

More about the algorithm will eventually go here when I get around to writing it.

## Contributing to the code

This project is written in `react`.  Once you have the git repo cloned, you can contribute to 
the code by following these steps

### Install the node project manager

**If you have never worked with react before**, make sure that you have the node project 
manager installed.  You can find it here.

    https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

### Install dependencies

This project uses a few other packages that you need to install.  Luckily, the node
project manager is here to help you with exactly that.  **If this is your first time** 
**running the project (or you just pulled updates that changed the dependencies)**, run

    npm install

from the top level directory.

### Run the project locally

When editing the project, it is useful to run it locally.  To run the project
locally run 

    npm start

from the top level directory.

### Push your changes

If you are updating the code, make sure to commit and push your changes to 
git. Then...

### Deploy changes to the site

To make sure that your changes will actually show up on the published version
of the site, you should run 

    npm run deploy

from the top level directory.  The changes may take 5-6 minutes to refresh.