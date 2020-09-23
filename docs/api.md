# LIST API
Behind its graphical user interface, _LIST_ has a HTTP server that exposes an
_API_ capable of turning it into a valuable validation tool in a LiveIP pipeline.
Operations such as uploading _pcap_ files, tracking of the analysis progress and
getting the results are all available, among others. This document describes the
aforementioned _API_.

## Preamble
- Request and response bodies, when available, are formated in
  [_JSON_](https://www.json.org/json-en.html).
- In `POST/PUT` requests, the `Content-Type` header must be present and is
  expected to have the value `application/json;charset=UTF-8`.
- Except for the [Authentication routes](#authentication), all API routes
  require the presence of the `Authorization` header with the format
  `"Bearer <bearer-token>"`.  The `<bearer-token>` is a string of characters
  that can be obtained by a successful request to the [`login`](#login) route.

## Categories
#### [Authentication](#authentication)
- [`register`](#register)
- [`login`](#login)
- [`logout`](#logout)

---

#### [Analysis Profile](#analysis-profile)
#### [Comparisons](#comparisons)
#### [Download](#download)
#### [Meta Information](#meta-information)
#### [Pcap](#pcap)
#### [SDP](#sdp)
#### [User](#user)
#### [Workflow](#workflow)


## Authentication

#### Register
- Path: `/user/register`
- Method: `POST`
- Request Body: `{ "username": "<usr>", "password": "<pwd>" }`
- Response:
  * HTTP/201:
    ```json
    {
      "id": "",
      "username": "",
      "password": "<pwd>",
      "salt": "",
      "preferences": {
        "analysys": {
          "currentProfileId": null
        },
        "gui": {
          "_id": "<id>",
          "language": "en-US",
          "theme": "dark"
        }
      },
      "_id": "<id>"
    }
    ```
  * HTTP/500:
    ```
    E11000 duplicate key error collection: list.users index: username_1 dup key: { username: "<usr>" }
    User validation failed: username: Path `username` is required.
    ```
#### Login
- Path: `/auth/login`
- Method: `POST`
- Request Body: `{ "username": "<usr>", "password": "<pwd>" }`
- Response:
  * HTTP/200:
    ```json
    {
      "result": 0,
      "desc": "Authentication successful",
      "content": {
        "sucess": true,
        "token": "<bearer-token>"
      }
    }
    ```
  * HTTP/401:
    ```json
    {
      "result": 401,
      "desc": "Authentication failed",
      "content": {
        "sucess": false,
        "token": null
      }
    }
    ```

#### Logout
- Path: `/auth/logout`
- Method: `POST`
- Request Body: `{}`
- Response:
  * HTTP/200:
    ```json
    {
      "success": true,
      "message": "Logout succesful!"
    }
    ```


## Analysis Profile
## Comparisions
## Download
## Meta Information
## Pcap
## SDP
## User
## Workflow
