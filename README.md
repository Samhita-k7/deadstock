# SETU — Dead Stock Exchange

> Bridging surplus inventory with demand.

---

## 🚨 The Problem

Businesses regularly end up with **surplus inventory that is still usable and valuable — but no longer moving**.

This can happen because of:

- Overproduction
- Excess purchasing
- Seasonal demand changes
- Product or packaging changes
- Business closures or cancelled orders
- Inventory sitting in warehouses for too long

The problem is not always that the product has no value.

Often, **the right buyer simply isn't aware that the stock exists.**

Today, businesses dealing with ageing or surplus inventory often rely on two options:

**1. Excessive discounts and clearance sales**
They reduce prices aggressively just to move the stock, which can significantly reduce the remaining value and margin.

**2. Distant liquidation and B2B resale**
The inventory may be shipped to liquidation buyers or businesses in other locations. But once transportation, freight, handling and logistics costs are added, moving the stock can become economically unattractive.

So a business can end up with a strange situation:

> **There is usable inventory. There are potential buyers. But they are not connected efficiently.**

And when inventory continues to sit unused, it can eventually become obsolete, damaged, expired, or waste.

---

## 💡 The SETU Idea

**SETU** — meaning *bridge* — is a surplus inventory marketplace designed to connect businesses that have excess stock with businesses that can actually use it.

Instead of treating dead stock as something that simply needs to be cleared out, SETU treats it as **local supply waiting to be discovered.**

A seller can: **Scan → Identify → Add Details → List**

A buyer can: **Discover → Compare → Locate → Connect**

The core idea is simple:

> **Instead of asking "Where can we ship this?"**
> **SETU asks "Who nearby can use this?"**

By making surplus inventory visible and location-aware, SETU aims to help businesses recover value from stock that would otherwise remain idle.

---

## 🔄 How SETU Works

### For Sellers

A seller starts by scanning their surplus inventory using their phone camera.

SETU's AI analyzes the image and identifies:

- Product
- Category
- Condition
- Confidence

The seller can then review or edit the information and add:

- Quantity
- Original price
- Selling price
- Stock age

For faster inventory entry, the seller can also use **voice input** to provide stock details naturally instead of typing everything manually.

Once the seller creates the listing, SETU stores the actual product image and associates the listing with the seller's location.

### For Buyers

Buyers can enter the marketplace and discover available surplus inventory.

Each listing provides information such as:

- Product
- Category
- Price
- Quantity
- Condition
- Stock age
- Actual product image
- Approximate distance

The marketplace also provides a map view, allowing buyers to understand where available surplus inventory is located.

This creates a location-aware connection between:

**Nearby Surplus Supply ↔ Nearby Demand**

---

## 🚀 Prototype

Our current prototype demonstrates the complete seller-to-marketplace journey.

### Seller Flow

```text
Open SETU
   ↓
I AM A SELLER
   ↓
SCAN STOCK
   ↓
Capture Product Photo
   ↓
AI Product Identification
   ↓
Review / Edit Details
   ↓
Add Quantity + Pricing + Stock Age
   ↓
Voice Input (Optional)
   ↓
Attach Seller Location
   ↓
CREATE LISTING
```

### Buyer Flow

```text
Open SETU
   ↓
I AM A BUYER
   ↓
MARKETPLACE
   ↓
Discover Surplus Inventory
   ↓
View Product + Price + Quantity
   ↓
View Actual Product Image
   ↓
View Location + Approximate Distance
   ↓
Explore Nearby Supply
```

### Complete Prototype

```text
SELLER
   ↓
SCAN STOCK
   ↓
AI IDENTIFICATION
   ↓
ADD INVENTORY DETAILS
   ↓
LOCATION
   ↓
CREATE LISTING
   ↓
━━━━━━━━━━━━━━━━━━━━━━
     SETU MARKETPLACE
━━━━━━━━━━━━━━━━━━━━━━
   ↓
BUYER DISCOVERS STOCK
   ↓
PRODUCT + PRICE + IMAGE
   ↓
MAP + DISTANCE
   ↓
NEARBY SUPPLY ↔ DEMAND
```

---

## ✨ Key Features

### 📷 AI Product Identification

A seller can simply photograph a product.

SETU uses the **Google Gemini API** to identify the product and structure information such as its category, condition and confidence score.

This reduces the effort required to manually create inventory listings.

### 🎤 Voice-Based Inventory Entry

Sellers can provide inventory information through voice input.

The system extracts:

- Quantity
- Original price
- Selling price
- Stock age

This makes listing creation faster, particularly when a seller has multiple products to enter.

### 🏷️ Structured Surplus Listings

Sellers can review the AI-generated information and add their own inventory details before publishing.

This creates a structured marketplace listing rather than relying on an unstructured product description.

### 📸 Actual Product Images

SETU preserves the seller's uploaded product image.

Buyers can therefore see the **actual stock being listed**, rather than relying only on text.

### 🛒 Surplus Marketplace

Published listings become visible in the buyer marketplace.

Buyers can browse available inventory along with relevant product and pricing information.

### 🗺️ Location-Aware Discovery

Every listing can be associated with the seller's location.

The marketplace calculates an approximate distance between the buyer and available listings and displays inventory on a map.

This helps buyers discover supply that may be accessible closer to them.

---

## 🌱 Why This Matters

When products remain unsold for long periods, they can eventually lose their usefulness or become waste.

SETU focuses on **keeping existing inventory in circulation** by making surplus stock easier to discover.

If a usable product already exists somewhere nearby and another business needs that product, connecting the two can potentially:

- Recover value from otherwise idle inventory
- Reduce unnecessary disposal
- Give buyers access to surplus products
- Reduce the need to move certain inventory over unnecessarily long distances
- Improve visibility into ageing stock

SETU does not create new inventory.

**It helps existing inventory find its next use.**

---

## 🎯 Who Can Use SETU?

SETU is designed around B2B surplus inventory and can support businesses such as:

- 🏭 Manufacturers with excess production
- 🛍️ Retailers with unsold inventory
- 📦 Distributors with ageing stock
- 👕 Apparel businesses with seasonal leftovers
- 💻 Electronics businesses with older inventory
- 🍱 Businesses with short-shelf-life or time-sensitive stock
- 🏢 Businesses shutting down or changing operations

The same underlying problem appears across many industries:

> **Inventory has value — until it sits unused for too long.**

---

## 🔮 What's Next?

The current prototype establishes the foundation for a much larger inventory intelligence platform.

### 🤝 Smarter Buyer-Seller Matching
Instead of making buyers search manually, SETU could match surplus inventory with businesses that are likely to need it.

### 📊 Demand-Based Recommendations
Historical marketplace activity and demand signals could help identify what types of surplus inventory are currently needed.

### ⚠️ Early Dead-Stock Detection
SETU could analyze inventory age, movement and demand patterns to identify stock that is **at risk of becoming dead stock before it actually happens.**

### 🗺️ Supply-Demand Heatmaps
A future map layer could show where surplus inventory is concentrated and where demand exists. This could help businesses identify opportunities for nearby transactions.

### 📦 Inventory-Age Intelligence
Businesses could receive insights into how long inventory has remained unsold and which products require attention first.

### 🚚 Smarter Logistics
Once nearby supply and demand are identified, SETU could explore logistics and fulfillment options that reduce unnecessary transportation.

### 🧠 Local / On-Device AI
Future versions could explore local AI models for faster and more private product recognition.

### 📱 Deeper Phone Integration
The platform could eventually integrate more deeply with mobile workflows and Office Kit-style inventory processes to make bulk stock capture faster.

---

## 🌍 Long-Term Vision

Most inventory systems focus on answering:

> **"What do we currently have?"**

SETU aims to go one step further:

> **"What should we do with it before it becomes dead stock?"**

The long-term vision is to move from **reacting to dead stock** to **preventing inventory from becoming dead stock in the first place.**

---

## 🛠️ Tech Stack

**Frontend**
- React Native
- Expo
- TypeScript

**Backend**
- Node.js
- Express.js
- Multer

**AI**
- Google Gemini API

**Location & Maps**
- Expo Location
- React Native Maps

---

## 🔧 Architecture

```text
                 ┌──────────────────┐
                 │    SETU APP      │
                 │ React Native     │
                 │     + Expo       │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Product       Voice Input   Location
          Image
             │            │            │
             ▼            ▼            ▼
        ┌─────────────────────────────────┐
        │       Node.js + Express         │
        │            Backend              │
        └───────────────┬─────────────────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
      Google Gemini API       Listings API
             │                     │
             ▼                     ▼
      AI Product Data        Marketplace
                                   │
                                   ▼
                              Map + Distance
```

---

## 📱 How to Use the Prototype

### Seller

1. Open SETU.
2. Select **I AM A SELLER**.
3. Tap **SCAN STOCK**.
4. Capture a product using the camera.
5. Review the AI-generated product information.
6. Edit the information if required.
7. Enter quantity, original price, selling price and stock age.
8. Use voice input if preferred.
9. Allow location access.
10. Tap **CREATE LISTING**.
11. Open the marketplace to view the published listing.

### Buyer

1. Open SETU.
2. Select **I AM A BUYER**.
3. Browse the marketplace.
4. View available surplus inventory.
5. Open a listing to view its details.
6. Check the actual product image.
7. View the listing location and approximate distance.
8. Explore nearby available supply.

---

## 🎥 Prototype Demo

**SETU — Dead Stock Exchange | Prototype Demo**

[YouTube Demo](PASTE_YOUR_YOUTUBE_LINK_HERE)

---

## 📌 Project Status

**Working Prototype**

The current prototype demonstrates:

- ✅ AI-powered product identification
- ✅ Seller camera workflow
- ✅ Manual inventory details
- ✅ Voice-based inventory entry
- ✅ Listing creation
- ✅ Real seller product images
- ✅ Seller location capture
- ✅ Marketplace discovery
- ✅ Approximate distance calculation
- ✅ Map-based listing discovery
- ✅ Seller-to-buyer prototype flow

---

## 👥 Team Incognito Mode

Built as a hackathon prototype for **iQOOHackathon - Reskill**.
