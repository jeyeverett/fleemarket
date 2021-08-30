# Fleemarket

Fleemarket is a fictional auction-style marketplace designed to allow users to buy and sell goods in a hurry. The app was built primarily to practice back-end application development with a focus on NodeJS and ExpressJS. It is a work in progress and there many additional features I'd like to add in the future, such as maps, timed auctions, OAuth, etc. It currently uses Stripe for handling payments - this is not a production implementation so it will not take actual payments. Please use the test credit card number (4242424242424242 exp: 06/25) for test payments.

The project is built with [NodeJS](https://nodejs.org/en/) and [ExpressJS](https://expressjs.com/). NodeJS is an open source, cross-platform, JavaScript runtime built on Google Chrome's V8 engine and allows you to build production grade, scalable, high-performance back-end applications. ExpressJS is a production grade web server framework for NodeJS used in many well-known applications including Fox Sports, PayPal, Uber and more.

## Notable features:

- Authentication from scratch with BcryptJS
- File uploads (images) are stored on Cloudinary with the help of the npm package Multer and its Cloudinary plugin
- NoSQL MongoDB database with MongooseJS for schema definitions
- Cross-side request forgery security accounted for with the CSURF npm package
- Content Security Policy provided by HelmetJS
- Dynamic views created with the EmbeddedJS templating engine
- Validation using express-validator
- Custom front-end JavaScript scripts for asynchronous API requests
- MVC architecture with Express Router for modularizing routes
- Custom CSS using SASS (redesign currently in progress)
- Custom PDF invoices generated with the PDFKit package
- Back-end RESTful API

# Installation

Download the project, navigate to the project root and install dependencies:

`npm install`

You will need to provide the following information in a .env file for the project to work (note that you will need to configure the [dotenv](https://www.npmjs.com/package/dotenv) npm package to access the .env variables from within the project):

- _CLOUDINARY_CLOUD_NAME_ - name of your Cloudinary account
- _CLOUDINARY_KEY_ - your Cloudinary API key
- _CLOUDINARY_SECRET_ - your Cloudinary API secret
- _STRIPE_SECRET_KEY_ - your Stripe access key
- _MONGO_URI_ - URI of your Mongo Atlas cluster
- _MONGO_USERNAME_ - your Mongo Atlas username
- _DATABASE_PASSWORD_ - your Mongo Atlas password
