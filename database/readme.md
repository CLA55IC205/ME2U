# 📦 ME2U DATABASE FOLDER

This folder contains everything related to how data is structured and stored in the system.



schema.sql
- Main database structure file
- Contains all tables (Users, Orders, Payments, Delivery, Disputes)
- Defines relationships between tables (foreign keys)
- Used to create the database from scratch

------------------------------------------------------------

 migrations/
- Folder that stores database changes over time
- Each file represents a change in the database structure
Example:
  - add_users_table.sql
  - add_orders_table.sql
  - update_payment_status.sql

Purpose:
- Helps update database without deleting everything
- Keeps version history of database changes

------------------------------------------------------------

 seed.sql (or seeders/)
- Contains test/sample data
- Used for development only
Example:
  - sample users (buyer, seller, admin)
  - fake orders
  - test payments

Purpose:
- Helps developers test system quickly

------------------------------------------------------------

 config.db / db.js / database.py (depends on backend tech)
- Database connection file
- Connects backend to PostgreSQL/MySQL
- Contains credentials setup (via .env file)

Purpose:
- Allows backend to communicate with database

------------------------------------------------------------

 models/ ( Django / Prisma)
- Defines database structure in code form
- Each file = one table
Example:
  - user.model.js
  - order.model.js
  - payment.model.js

Purpose:
- Used instead of writing raw SQL
- Easier database management in code

------------------------------------------------------------

 HOW IT ALL WORKS TOGETHER:

1. schema.sql creates the database structure
2. migrations/ update the structure over time
3. seeders/ insert test data
4. models/ define how backend interacts with tables
5. config file connects everything to backend

------------------------------------------------------------

 SIMPLE IDEA OF THIS FOLDER:

- schema = initial database setup
- migrations = updates/changes
- seeders = fake/test data
- models = how code talks to database
- config = connection bridge

------------------------------------------------------------