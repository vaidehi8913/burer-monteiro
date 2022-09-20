% EXPERIMENT FOR GAUSSIAN CONSTRUCTION COST MATRICES
% WITH FULLY RANDOM INITIALIZATION
 
ps = [5, 10, 25, 50, 100];
num_matrices_for_p = [20, 20, 20, 20, 20];
trials_per_matrix_for_p = [1, 1, 1, 1, 1];

% rows: trials, columns: matrix number, last dimension: p
outcomes = zeros(1, 1, 1);
potentials = zeros(1, 1, 1);

directoryName = strcat("exp", datestr(datetime('now'), 'mm-dd-yy-HH-MM-SS'));
mkdir(directoryName);
directoryName = strcat(directoryName, "/");

% WRITE EXPERIMENT SETUP FILE 
% (This is redundant with the summary file, but saved now in case the 
% program crashes part way)

expSetupFileName = strcat(directoryName, "setup.txt");
expSetupFileID = fopen(expSetupFileName, 'w');
fprintf(expSetupFileID, "Experiment SETUP (for outcomes see SUMMARY file) \n");
fprintf(expSetupFileID, "GAUSSIAN cost matrix construction and FULLY RANDOM initialization\n");
fprintf(expSetupFileID, strcat("expID: ", directoryName, "\n\n"));

for pix=1:length(ps)

    pString = strcat("n = ", int2str(ps(pix) * 2), ", p = ", int2str(ps(pix)), "\n");

    fprintf(expSetupFileID, pString);

    numMatricesString = strcat("# cost matrices: ", int2str(num_matrices_for_p(pix)), "\n");

    fprintf(expSetupFileID, numMatricesString);

    trialsString = strcat("trials per cost matrix: ", int2str(trials_per_matrix_for_p(pix)), "\n\n");

    fprintf(expSetupFileID, trialsString);

end

fclose(expSetupFileID);


% EXPERIMENT

for pix=1:length(ps)

    p = ps(pix);
    num_matrices = num_matrices_for_p(pix);
    trials_per_matrix = trials_per_matrix_for_p(pix);

    for m=1:num_matrices
    
        % Generate random cost matrix
        Mbad = generateGaussianConstruction(p);
         
        A = [Mbad, Mbad; Mbad, Mbad];

        % WRITE RANDOMLY GENERATED COST MATRIX TO FILE --->
        costMatrixFileName = strcat(directoryName, "costmatrix-p", ...
            int2str(p), "m", int2str(m), ".csv");
        writematrix(A, costMatrixFileName);
        % <---
                
        Yaxial = [eye(p, p); -1 * eye(p, p)];
    
        for trial=1:trials_per_matrix
            
            p
            matrix_num = m
            trial
    
            % Problem Structure
            manifold = obliquefactory(p, 2*p, true); % true: unit rows
            problem.M = manifold;
            
            % Cost Function
            problem.cost = @(X) maxcutCost(A, X, p);
            problem.egrad = @(X) maxcutEuclidGrad(A, X, p);
            
            % Initial point (random)
            perturb_scaled_rows = randn(size(Yaxial));
            % perturb_unit_rows = (1/sqrt(p)) * perturb_scaled_rows;
            Z = zeros(size(Yaxial));
            x0 = manifold.retr(Z, perturb_scaled_rows, 1);
            
            % Solve
            warning('off', 'manopt:getHessian:approx');
            options = [];
            %options.verbosity = 0;
            %options.tolgradnorm = 0.00001; % default is 1 10e-6, this is an order of magnitude higher
            %options.Delta_bar = 1000;
            %options.stopfun = @mystopfun;
            [x, xcost, info, options] = trustregions(problem, x0, options);
            
            % x 
            xcost 
            xPotential = antipodalPotential(x, p)
        
            outcomes(trial, m, pix) = xcost;
            potentials(trial, m, pix) = xPotential;
    
        end
    end

    if (num_matrices > 0 && trials_per_matrix > 0)
        % WRITE OUTCOMES TO FILE --->
        outcomesFilename = strcat(directoryName, "outcomes-p", int2str(p), ".csv");
        writematrix(outcomes(:, :, pix), outcomesFilename);

        potentialsFilename = strcat(directoryName, "potentials-p", int2str(p), ".csv");
        writematrix(potentials(:, :, pix), potentialsFilename);
        % <---
    end

end



% WRITE EXPERIMENT SUMMARY 
% (This is the most interesting output file)

expSummaryFileName = strcat(directoryName, "summary.txt");
expSummaryFileID = fopen(expSummaryFileName, 'w');
fprintf(expSummaryFileID, "Experiment SUMMARY \n");
fprintf(expSummaryFileID, "GAUSSIAN cost matrix construction and FULLY RANDOM initialization\n");
fprintf(expSummaryFileID, strcat("expID: ", directoryName, "\n\n"));

for pix=1:length(ps)

    num_matrices = num_matrices_for_p(pix);
    trials = trials_per_matrix_for_p(pix);

    if (num_matrices > 0 && trials > 0)
        pString = strcat("n = ", int2str(ps(pix) * 2), ", p = ", int2str(ps(pix)), "\n");
        fprintf(expSummaryFileID, pString);

        numMatricesString = strcat("# cost matrices: ", int2str(num_matrices), "\n");
        fprintf(expSummaryFileID, numMatricesString);
        trialsString = strcat("trials per cost matrix: ", int2str(trials), "\n");
        fprintf(expSummaryFileID, trialsString);
    
        fprintf(expSummaryFileID, "# trials spurious (per cost matrix): ");
    
        total_spurious_trials = 0;
    
        for m=1:num_matrices
    
            numSpurious = sum(outcomes(1:trials, m, pix)>=0);
            total_spurious_trials = total_spurious_trials + numSpurious;
    
            if (m == num_matrices)
                spuriousString = strcat(int2str(numSpurious), "\n");
            else 
                spuriousString = strcat(int2str(numSpurious), ", ");
            end
    
            fprintf(expSummaryFileID, spuriousString);
    
        end
    
        totalTrialsString = strcat("total trials (all matrices): ", ...
            int2str(num_matrices * trials), "\n");
        fprintf(expSummaryFileID, totalTrialsString);
    
        totalSpuriousString = strcat("total spurious trials (all matrices): ", ...
            int2str(total_spurious_trials), "\n\n");
        fprintf(expSummaryFileID, totalSpuriousString);
    end
end

fclose(expSummaryFileID);






% AUXILIARY FUNCTION DEFINITIONS

function cost = maxcutCost(A, X, p)
    X2 = X*X.';
    cost = dot(A(:), X2(:));
end

function G = maxcutEuclidGrad(A, X, p)
    G = zeros(2*p, p); 
    
    for ix=1:(2*p) 
        Gix = zeros(1, p);

        for jx=1:(2*p)
            Gix = Gix + A(ix, jx) * X(jx, :);
        end

        G(ix, :) = Gix;
    end
end 

function stopnow = mystopfun(problem, x, info, last) 
    stopnow = (info(last).cost < 0 || info(last).gradnorm < 0.0000001 );
end

function M = generateGaussianConstruction(p)
   
    U = randn(p, p - 1);
    offset = sqrt(log(p))* ones(p, p-1);
    Uprime = U + offset;

    UUT = Uprime*Uprime.';

    subSigmaMins = zeros(p);

    for submatrix=1:p
        P = UUT;

        P(submatrix, :) = [];
        P(:, submatrix) = [];

        [Usvdsub, Ssvdsub, Vsvdsub] = svd(P);
        subSigmaMin = Ssvdsub(p - 1, p - 1);

        subSigmaMins(submatrix) = subSigmaMin;
    end 

    sigmaMinStar = min(subSigmaMins);
    epsilon = sigmaMinStar/2;
    
    M = UUT - epsilon * eye(p);
end

function potential = antipodalPotential(X, p)
    
    potential = 0;

    for ix=1:p

        for jx=1:p

            iPlus = X(ix, jx);
            iMinus = X(ix + p, jx);

            potential = potential + (iPlus + iMinus)*(iPlus + iMinus);
        end
    end

end