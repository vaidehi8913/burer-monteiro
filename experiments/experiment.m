% EXPERIMENT FOR DETERMINISTIC COST MATRICES

% Experiment setup
ps = [2, 25, 100, 500];
perturbs = [0.3, 0.29, 0.28, 0.27, 0.26, 0.25]; 
trials_chart = [1000, 100, 100, 50];

directoryName = strcat("exp", datestr(datetime('now'), 'mm-dd-yy-HH-MM-SS'));
mkdir(directoryName);
directoryName = strcat(directoryName, "/");

% WRITE EXPERIMENT SETUP FILE 
% (This is redundant with the summary file, but saved now in case the 
% program crashes part way)

expSetupFileName = strcat(directoryName, "setup.txt");

expSetupFileID = fopen(expSetupFileName, 'w');

fprintf(expSetupFileID, "Experiment SETUP (for outcomes see SUMMARY file)\n");
fprintf(expSetupFileID, "DETERMINISTIC cost matrix construction, initialization PERTURBED from Yaxial\n");
fprintf(expSetupFileID, strcat("expID: ", directoryName, "\n\n"));

for pix=1:length(ps)

    pString = strcat("n = ", int2str(ps(pix) * 2), "p = ", int2str(ps(pix)), "\n");

    fprintf(expSetupFileID, pString);

    perturbString = strcat("perturbation values: ", num2str(perturbs(1)));

    for pertix=2:length(perturbs)
        perturbString = strcat(perturbString, ", ", num2str(perturbs(pertix)));
    end

    perturbString = strcat(perturbString, "\n");

    fprintf(expSetupFileID, perturbString);

    trialsString = strcat("trials: ", int2str(trials_chart(pix)), "\n\n");

    fprintf(expSetupFileID, trialsString);

end

fclose(expSetupFileID);




% EXPERIMENT

% trials, perturbs, ps
outcomes = zeros(length(trials_chart), length(perturbs), length(ps));
potentials = zeros(length(trials_chart), length(perturbs), length(ps));

for pix=1:length(ps)

    p = ps(pix)

    % Generate cost matrix
    Mbad = zeros(p, p);
    
    for ix = 1:p
        for jx=1:p
            if (ix == jx)
                Mbad(ix, jx) = 1;
            else 
                Mbad(ix, jx) = -1/(p - 1.5);
            end
        end
    end
     
    A = [Mbad, Mbad; Mbad, Mbad];
            
    Yaxial = [eye(p, p); -1 * eye(p, p)];

    for pertix=1:length(perturbs)

        perturb_by = perturbs(pertix);

        num_trials = trials_chart(pix);

        for trial=1:num_trials

            p
            perturb_by
            trial            

            % Problem Structure
            manifold = obliquefactory(p, 2*p, true); % true: unit rows
            problem.M = manifold;
            
            % Cost Function
            problem.cost = @(X) maxcutCost(A, X, p);
            problem.egrad = @(X) maxcutEuclidGrad(A, X, p);
            
            % Initial point (need to reperturb on every trial)
            perturb_scaled_rows = randn(size(Yaxial));
            perturb_unit_rows = (1/sqrt(p)) * perturb_scaled_rows;
            x0 = manifold.retr(Yaxial, perturb_unit_rows, perturb_by);
            
            % Solve
            warning('off', 'manopt:getHessian:approx');
            options = [];
            %options.verbosity = 0;
            %options.tolgradnorm = 0.0001;
            %options.Delta_bar = 1000;
            %options.stopfun = @mystopfun;
            [x, xcost, info, options] = trustregions(problem, x0, options);
            
            % x 
            xcost 
            xPotential = antipodalPotential(x, p)

            outcomes(trial, pertix, pix) = xcost;
            potentials(trial, pertix, pix) = xPotential;

        end
    end

    % SAVE EXPERIMENT OUTCOMES --->
    outcomesFilename = strcat(directoryName, "outcomes-p", int2str(p), ".csv");
    writematrix(outcomes(:, :, pix), outcomesFilename);

    potentialsFilename = strcat(directoryName, "potentials-p", int2str(p), ".csv");
    writematrix(potentials(:, :, pix), potentialsFilename)
    % <---

end

% outcomes 

% WRITE EXPERIMENT SUMMARY
% (This is the most interesting output file)

expSummaryFileName = strcat(directoryName, "summary.txt");

expSummaryFileID = fopen(expSummaryFileName, 'w');

fprintf(expSummaryFileID, "Experiment SUMMARY\n");
fprintf(expSummaryFileID, "DETERMINISTIC cost matrix construction, initialization PERTURBED from Yaxial\n");
fprintf(expSetupFileID, strcat("expID: ", directoryName, "\n\n"));

for pix=1:length(ps)

    pString = strcat("n = ", int2str(ps(pix) * 2) , ...
        ", p = ", int2str(ps(pix)), "\n");

    fprintf(expSummaryFileID, pString);

    trialsString = strcat("trials per perturbation value: ", ...
        int2str(trials_chart(pix)), "\n");

    fprintf(expSummaryFileID, trialsString);

    for pertix=1:length(perturbs)
    
        numSpurious = sum(outcomes(1:trials_chart(pix), pertix, pix)>=0);

        perturbString = strcat("perturbation magnitude: ", ...
            num2str(perturbs(pertix)), ...
            ", # trials spurious: ", int2str(numSpurious), "\n");
        
        fprintf(expSummaryFileID, perturbString);

    end

    fprintf(expSummaryFileID, "\n");

end

fclose(expSummaryFileID);




% AUXILLIARY FUNCTION DEFINITIONS

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