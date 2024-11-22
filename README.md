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

Replace the placeholder values (your_mysql_host, your_mysql_username, etc.) with your actual configuration.

## Installation Steps
### Clone the repository

```shell
git clone https://github.com/your-username/url-shortener-service.git
cd url-shortener-service
```

### Install dependencies
```shell
yarn install
```

### Set Up the Database
* Ensure that your MySQL database is running and accessible.
* Update the `.env` file with your MySQL configuration.
* Run the database migrations to set up the necessary tables:
```shell
yarn typeorm migration:run
```

### Start the Redis Server
* Ensure that your Redis server is running and accessible.
* Update the `.env` file with your Redis configuration.

### Running the Project
Start the application in development mode:
```shell
yarn start:dev
```
The server should now be running at http://localhost:3000.

## Running the Tests
To run the unit tests and see the coverage report, execute:

```shell
yarn test
```
This will run all the tests and display the results.




# API Endpoints
### Create Short URL
**Endpoint**: POST `/url/create`

**Description**: Creates a short URL for the provided long URL.

**Request Body:**
```json
{
  "longUrl": "https://www.youtube.com"
}
```

**Headers**: 
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Response**:

```
<BACKEND_DOMAIN>/url/${shortUrlId}
```

### Redirect to Long URL
**Endpoint**: GET `/url/:shortUrlId`

**Description**: Redirects to the original long URL associated with the provided shortUrlId.

**Response**: Redirects to the original URL.

## Project Structure
* `src/`: Contains the source code.
  * `core/`: Core application logic and use cases.
  * `infrastructure/`: Infrastructure code such as controllers, services, repositories, and adapters.
  * `entities/`: ORM entities mapped to database tables.
  * `services/`: Application services.
  * `controllers/`: API controllers.
  * `adapters/`: Adapters for external dependencies.
  * `validation/`: Input validation utilities.
  * `test/`: Contains unit tests for the application components.



# Data Structures and Uniqueness Handling

## Introduction
This section provides a detailed explanation of the data structures used in the URL Shortener Service and the approach 
to handling short URL uniqueness.

## Data Structures
### URL Entity
The main data structure is the UrlEntity, which represents a mapping between a long URL and its corresponding short
URL.

#### Fields:

* `id` `(UUID)`: A unique identifier for each URL record.
* `shortUrlId` `(string)`: The unique short URL identifier (e.g., "abc123").
* `longUrl` `(string)`: The original long URL provided by the user.
* `userId` `(UUID)`: Identifier of the user who created the short URL.
* `createdAt` `(Date)`: Timestamp when the short URL was created.
* `clicks` `(number)`: The number of times the short URL has been accessed.
* `lastAccessed` `(Date)`: Timestamp of the last access.
* `isActive` `(boolean)`: Indicates whether the short URL is active.
* `expiresAt` `(Date, optional)`: Optional expiration date for the short URL.
* `metadata` `(object, optional)`: Additional metadata.

### User Entity
Represents a user in the system.

#### Fields:

* `id` `(UUID)`: Unique identifier for the user.
* `username` `(string)`: The user's username.
* `password` `(string)`: The user's hashed password.
* `urls` `(UrlEntity[])`: A list of URLs created by the user.

### Database Schema
The entities are mapped to tables in the MySQL database using TypeORM. The relationships between users and URLs are
established through foreign keys.

## Short URL Uniqueness Handling
Ensuring the uniqueness of short URLs is crucial. The following approach is used:

1. Hash Generation
   * **Algorithm**: Uses the Node.js crypto module to generate a SHA-256 hash of the original long URL.
   * **Purpose**: Creates a unique fingerprint of the long URL.
2. Base62 Encoding
   * **Process**: Converts the binary hash data into a Base62 encoded string, which is URL-friendly.
   * **Characters Used**: Uppercase letters (A-Z), lowercase letters (a-z), and digits (0-9).
3. Shortening the Hash
   * **Length**: The encoded string is truncated to 7 characters to create the shortUrlId.
   * **Rationale**: A length of 7 characters provides a large enough namespace (over 3.5 trillion combinations) to minimize collisions.
4. Collision Detection and Resolution
   * **Database Check**: Before finalizing the shortUrlId, the system checks if it already exists in the database.
   * **Collision Handling**:
     * **If Unique**: Proceeds to save the new URL mapping.
   * **If Collision Detected**:
     * **Modify Input**: Appends a random string or timestamp to the original long URL.
     * **Regenerate Hash**: Repeats the hashing and encoding process with the modified input.
     * **Recheck**: Continues until a unique shortUrlId is generated.
5. Storing the Mapping
   * **Persistence**: The unique shortUrlId and associated longUrl are stored in the database.
   * **Indexes**: The shortUrlId field is indexed and has a uniqueness constraint to enforce uniqueness at the database level.

### Advantages of the Approach
* **Efficiency**: Hashing and encoding are fast operations, allowing quick generation of short URLs.
* **Scalability**: The large namespace reduces the likelihood of collisions, even as the number of URLs grows.
* **Security**: Using SHA-256 ensures that the hash is not easily reversible, protecting the original URL.

### Handling Potential Errors
#### Invalid URLs
* **Validation**: The validateUrl function checks the format of the provided long URL using a regular expression.
* **Error Response**: If the URL is invalid, the service responds with an appropriate error message.

#### Exceeding Short URL Length Limit
* **Fixed Length**: The shortUrlId is kept at a fixed length.
* **Collision Handling**: The system handles potential collisions without increasing the length of the short URL.

## Conclusion
The combination of SHA-256 hashing, Base62 encoding, and collision detection provides an effective solution for
generating unique short URLs. This approach balances uniqueness, brevity, and performance.