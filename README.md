## Additional Features for Coasty.ai
This repositery consists extra features for coasty.ai . And The behind build thought process with excalidraw files and a Demo Video.

### Features
This build consists first base-> whatever they coasty does ,simulated with limited usage(in order to build external features on top of them). There are two features : 

1. Feture 1 :  Multi Model Routing to save cost and tokens : Here Before any activity is performed, First the models are chosen in accordance with the User query/task

2. Feature 2 : Prevention from Prompt injection : To prevent prompt injections in screenshots during web searching and others, we are using these methods : 
  1.Separating System's commands from user input
  2.Provide user input least privilage

All these feature's rough mindmap and thought process are stored in `thought_process/` folder.

Feature 2 is Implemented In Prompts to Models and separation of inputs.
Feature 1 and base's Demo video is available to view.
