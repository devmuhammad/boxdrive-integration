
### What is this repository for? ###

* Sync your application with google drive or dropbox
* Version: 1.0.0

## BoxDrive API

Box Drive Integration

1.1 Purpose of Document:

This is a documentation of the above-mentioned software application developed in 2018.

1.2 Application Overview:

Boxdrive allows you to Sync your application with google drive or dropbox via our API.

1.3 Scope:

The scope of this development was to create the backend APIs to intergrate with google drive & dropbox to implement features directly from your app. 

1.4 Tools:

Boxdrive API Backend was built using NodeJs (Express Js) and deployed on a private heroku server. Other dependencies & plugins can be found in the package.json file. It was developed using the IDE - Visual studio code.

1.5 Coding Structure:

The back-end code was structured with MVC with Models, Views, Controllers and Routers. It also includes middleware to verify all incoming requests. The config file has been ignored for security reasons and confidentiality of data. This can be recreated on request as its detrimental to the running of this project

1.6 Build Commands:

Start: “yarn start” 
Deployment: Backend is run with pm2 on the server or batch script.

1.7 Repository:

Url: https://github.com/devmuhammad/boxdrive.git 
Branch: master

1.8 API/Endpoints:

Production: http://BaseURL/boxdrive-api/v1/ Development: http://localhost:3000/boxdrive-api/v1/


### Set up? ###

* Clone repository ```git clone```
* Install dependencies ```yarn install```
* if dependencies install successfully
* ```yarn start-dev```
