# divelog-server-core

Common code for [divelog-server-rest](https://github.com/btdrawer/divelog-server-rest) and [divelog-server-graphql](https://github.com/btdrawer/divelog-server-graphql).

This package sets up the connection to MongoDB and Redis, and provides an API for communicating with both.

It also includes some other common utilities:

-   Authentication utilities
-   Constant values (error codes, names of resources, subscription keys)
-   Database seeder (for unit tests)
