# Burer-Monteiro Visualizer

This is a visualizer for running the Burer-Monteiro heuristic to solve semidefinite programs (SDPs).
Specifically, it is for the Goemans-Williamson max-cut SDP.  For rank (dimension) 2 and 3, we provide 
a visualization of the gradient descent algorithm.  For higher dimensions, it no longer makes sense 
to have a visualization, but the rest of the functionality that runs gradient descent is still 
implemented and usable.

This app is published at 

    https://vaidehi8913.github.io/burer-monteiro

## Algorithm 

# Background on this problem

The Goemans-Williamson max-cut semidefinite program is a relaxation of the max-cut problem that 
can be solved in polynomial time, and leads to an algorithm achieving a 0.878 approximation 
for max-cut.

In the max-cut problem, we are given a weighted graph $A$, and we want to find a way to 
partition the vertices such that the sum of the weights of the edges partitioning the vertices
is maximized.  Another way of thinking about this: we assign each vertex $v$ a value 
$x_v \in \{-1, 1\}$, and we want to maximize

$$\sum_{(u, v) \in E} w_{(u, v)} |x_v - x_u|.$$

This is NP-hard. So we relax our constraints.  Instead of choosing $x_v$ to be a number with
absolute value exactly 1, we choose $x_v \in \mathbb{R}^d$ to be a vector with length exactly 
$1$.  Then we write our objective as follows:

$$\min \sum_{(u, v) \in E} w_{(u, v)} (u \cdot v).$$

Recall that $u \cdot v$ will give us the cosine of the angle between $u$ and $v$ (since $u$ and 
$v$ are both constrained to be unit vectors).  Letting the variable $V$ be the $n \times d$ 
matrix containing the vectors assigned to each vertex, we can see that we are minimizing

$$\langle A, VV^T \rangle$$ 

subject to the constraint that all diagonal entries of $VV^T$ are exactly 1 (all of our vectors
are unit vectors.)  Then, we can make the observation that any matrix $X$ that can be written
as $VV^T$, is positive semidefinite, and we can therefore just minimize

$$\langle A, X\rangle$$

subject to the constraints that all diagonal entries of $X$ are exactly 1, and $X$ is positive
semidefinite, and this is equivalent to solving the earlier formulation (when the dimension of
each vector can be as large as $n$).  This new formulation is a semi-definite program (SDP), 
which is a convex problem, so we know how to solve it efficiently using gradient descent.

**However**, while we can solve the SDP efficiently, it takes a lot of memory to run.  Storing 
$VV^T$ as $X$ takes $\Omega(n^2)$ space, even if the original dimension of $V$ was a constant 
(meaning that storing $V$ was only $O(n)$ space.)  So the Burer-Monteiro heuristic does the 
following: instead of formulating the problem in the space of $X$, we directly run gradient
descent on the formulation in terms of $V$.  

Unfortunately, this problem is *not* convex, and could potentially have spurious local minima.

# This implementation

In this implementation, we take the weighted graph and the starting position of each vector
as input.  Then on each update step we do the following:

1. We calculate the Euclidean gradient of index of each vector with respect to the objective
function.  (Since the objective function is a dot product, this is a very simple linear 
function to calculate)
2. We add the step size (taken as input) times the negative gradient to each index of each vector
3. We add a random perturbation to each index of each vector.  The magnitude $m$ of the 
perturbation is taken as an input, and the perturbation is chosen uniformly from $[-m, m]$.
4. We normalize all vectors so that they are unit length again


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