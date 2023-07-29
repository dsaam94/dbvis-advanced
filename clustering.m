%% File Loading
dataset_path = "static/datasets/";
artificial_table = readtable(dataset_path + "artificial_no-ids.csv");
artificial = normalize(artificial_table{:,2:end});
education_table = readtable(dataset_path + "education.csv");
education = normalize(education_table{:,2:end});
mtcars_table = readtable(dataset_path + "mtcars.csv");
mtcars = normalize(mtcars_table{:,2:end});

[idxA,CA] = kmeans(artificial,3);
[idxE,CE] = kmeans(education,2);
[idxM,CM] = kmeans(mtcars,2);


%% Silhoutte comparison (Uncomment to use)
% cluster = [];
% for k=2:7
%     [idx,C,sumdist] = kmeans(mtcars,k,'Distance','cityblock','Display','final');
% 
%     figure;
%     [silh,h] = silhouette(mtcars,idx,'cityblock');
%     xlabel('Silhouette Value')
%     ylabel('Cluster')
%     set(gcf,'NumberTitle','off') %don't show the figure number
%     set(gcf,'Name', strcat('k = ', num2str(k))) %select the name you want
%     
%     cluster(k-1) = mean(silh);
% end
% 
% cluster

%% Add new colum and CSV writing

artificial_table.(size(artificial_table, 2) + 1) = idxA;
education_table.(size(education_table, 2) + 1) = idxE;
mtcars_table.(size(mtcars_table, 2) + 1) = idxM;

artificial_table.Properties.VariableNames{size(artificial_table, 2)} = 'class';
education_table.Properties.VariableNames{size(education_table, 2)} = 'class';
mtcars_table.Properties.VariableNames{size(mtcars_table, 2)} = 'class';

%%
writetable(artificial_table, dataset_path + "artificial_labeled_test.csv", 'Delimiter', ',');
writetable(education_table, dataset_path + "education_labeled.csv", 'Delimiter', ',');
writetable(mtcars_table, dataset_path + "mtcars_labeled.csv", 'Delimiter', ',');

