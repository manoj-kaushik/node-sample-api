# Node.js Codebase

This codebase is a sample Node.js application built to demonstrate our approach to building scalable and maintainable software. It is structured around modules which is written on the top of our in-house developed  boilerplate. Here's a closer look:

## Directory Structure
```bash
-Project
 |- constants
 |- lib
 |- modules
  |- WellGuideModule
      |- controllers
          |- wellGuide.js
      |- services
          |- wellGuide.js
      |- models
          |- wellGuide.js
      |- routes
          |- wellGuide.js
  |- AddYourModulesHere1 
  |- AddYourModulesHere2
    |- ......N
 |- startup
 |- app.js
 |- logs
 |- package.json
 |- README.md
```
## Controllers

### wellGuide.controller.js

This file contains the controller logic for handling well guide-related requests. It interacts with the service layer to fetch, update, or manipulate well guide data. Functions for getting well guide details, enabling a reminder, and updating well guide details are defined here.

## Models

### wellGuide.model.js

This file defines the Well Guide schema, specifying the fields and their types that a Well Guide entity should have. This schema helps ensure data consistency and integrity.

## Services

### wellGuide.service.js

This file is part of the service layer and contains functions for interacting with the database for operations related to the Well Guide. Functions for getting well guide details, enabling reminders, calculating next reminders, and updating well guide details are defined here.

## API Versioning

In our Node.js project, we handle versioning through the HTTP header rather than the URL or folder structure. This allows us to neatly segregate different versions of our APIs and maintain backward compatibility. 

When a client sends a request to our server, they include an header specifying the version of the API that they want to use.

Our custom routing utility reads this header and routes the request to the appropriate controller action, depending on the specified version. For example, if we have two versions of an API method - `updateWellGuideDetailV100` and `updateWellGuideDetailV110` (corresponding to versions '1.0.0' and '1.1.0'), the routing utility can distinguish between the two based on the API version specified in the Accept header. If the client specifies '1.0.0', the utility will route the request to `updateWellGuideDetailV100`; if '1.1.0', then `updateWellGuideDetailV110`.

This approach to versioning allows us to ensure backward compatibility while continually enhancing and expanding the API's capabilities. It also enables the clients to choose to stick with a specific version until they decide to upgrade, at which point they merely need to modify the header in their requests.

## API Route Creation Standard

Our route creation process follows a RESTful approach. REST (Representational State Transfer) is a standard architectural style that uses HTTP methods explicitly and is stateless.

When creating routes, we follow the standard HTTP methods:

- GET: Retrieve data
- POST: Send data to be processed to a specified resource
- PUT: Update a current resource with new data
- DELETE: Remove a specified resource

# Summary

In this Node.js codebase, we adhere to the Model-View-Controller (MVC) architectural pattern (although, in this case, we don't have a view because it's an API). 

The codebase is structured such that:

- Controllers handle HTTP requests and responses and delegate heavy-lifting to the service layer.
- Models define the structure of data that we work with.
- Services interact directly with the database and contain business logic.

This structure helps us write clean, maintainable, and scalable code. Understanding the purpose of each file should provide a good foundation for navigating and understanding the rest of the codebase.
