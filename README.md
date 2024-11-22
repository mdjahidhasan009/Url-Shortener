# URL Shortener Service

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technical Considerations](#technical-considerations)
    - [Data Structures](#data-structures)
    - [Short URL Uniqueness Handling](#short-url-uniqueness-handling)
- [Setup and Installation](#setup-and-installation)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation Steps](#installation-steps)
- [Running the Project](#running-the-project)
- [Running the Tests](#running-the-tests)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Commit Command](#commit-command)
- [Conclusion](#conclusion)
- [Data Structures and Uniqueness Handling](#data-structures-and-uniqueness-handling)
    - [Introduction](#introduction-1)
    - [Data Structures](#data-structures-1)
        - [URL Entity](#url-entity)
        - [User Entity](#user-entity)
        - [Database Schema](#database-schema)
    - [Short URL Uniqueness Handling](#short-url-uniqueness-handling-1)
        - [1. Hash Generation](#1-hash-generation)
        - [2. Base62 Encoding](#2-base62-encoding)
        - [3. Shortening the Hash](#3-shortening-the-hash)
        - [4. Collision Detection and Resolution](#4-collision-detection-and-resolution)
        - [5. Storing the Mapping](#5-storing-the-mapping)
    - [Advantages of the Approach](#advantages-of-the-approach)
    - [Handling Potential Errors](#handling-potential-errors)
        - [Invalid URLs](#invalid-urls)
        - [Exceeding Short URL Length Limit](#exceeding-short-url-length-limit)
    - [Conclusion](#conclusion-1)
- [Additional Notes](#additional-notes)

## Introduction

This project is a URL Shortener Service developed as part of a job assignment. The service generates short URLs for longer, original URLs, allowing users to easily share and manage links.

## Features

- Accepts a long URL as input and generates a unique short URL.
- Redirects users from the short URL to the original long URL.
- Validates input URLs to ensure they are properly formatted.
- Handles potential errors such as invalid URLs or exceeding short URL length limits.
- Ensures uniqueness of short URLs to prevent conflicts.
- Includes comprehensive unit tests covering various scenarios.

## Technical Considerations

### Data Structures

The service uses a relational database (MySQL) to store the mapping between original URLs and their corresponding short URLs. The main data structure is a table representing the URL entity, which includes fields for the short URL ID, long URL, user ID, and other metadata.

For a detailed explanation, please refer to the [Data Structures and Uniqueness Handling](#data-structures-and-uniqueness-handling) section.

### Short URL Uniqueness Handling

To ensure that short URLs are unique and do not conflict with existing entries, the service implements a combination of hashing, encoding, and collision detection mechanisms.

For a comprehensive explanation, please refer to the [Data Structures and Uniqueness Handling](#data-structures-and-uniqueness-handling) section.

## Setup and Installation

### Prerequisites

- **Node.js** (version 14.x or higher)
- **Yarn** or **npm** package manager
- **MySQL** database (e.g., [AWS RDS](https://aws.amazon.com/rds/))
- **Redis** cache server (e.g., [Redis Labs](https://redis.com/))

### Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
# Application
PORT=3000
BACKEND_DOMAIN=http://localhost:3000

# Database Configuration
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=your_database_name

# Redis Configuration
REDIS_URL=redis://your_redis_host:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
```