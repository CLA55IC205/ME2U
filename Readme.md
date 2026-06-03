# ME2U

## Overview

ME2U is a web-based transaction and delivery confirmation platform designed to create trust between buyers and sellers in local commerce. The platform acts as an intermediary by holding buyer payments in escrow until delivery has been confirmed.

The primary objective is to reduce fraud, increase transparency, and improve confidence in online transactions within Zambia.

## Key Features

* Buyer and seller account management
* Product listing and order management
* Escrow-based payment handling
* Delivery confirmation workflow
* Automatic payment release after confirmation
* Delivery time estimation
* Optional courier tracking integration
* Admin monitoring dashboard
* Transaction history and reporting

## How It Works

1. Buyer places an order.
2. Buyer pays using a supported payment method.
3. Payment is held in escrow.
4. Seller dispatches the item.
5. Seller optionally provides a tracking number.
6. Buyer confirms delivery.
7. Payment is released to the seller.
8. If the buyer does not respond within 24 hours after delivery indication, the system automatically releases payment.

## Technology Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Java

### Database

* PostgreSQL (preferred)
* MySQL (alternative)

### Payments

* MTN Mobile Money
* Airtel Money

## Project Structure

```text
ME2U/
├── frontend/
├── backend/
├── database/
├── docs/
└── README.md
```

## Current Development Status

The project is currently in the planning and architecture phase.

Areas being designed:

* System workflow
* Database schema
* Escrow payment flow
* User interface structure
* API design
* Delivery confirmation process

## Future Enhancements

* Dispute management system
* Refund processing
* Seller ratings
* Buyer ratings
* Advanced analytics
* SMS notifications
* Mobile application

## License

To be determined.
