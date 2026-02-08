-- ============================================
-- RESET — Drop all tables in dependency order
-- ============================================
-- Run this BEFORE re-creating the schema.
-- Order matters: children before parents (FK constraints).
-- ============================================

-- Kanban & Tags
DROP TABLE IF EXISTS "OrderOrderTag" CASCADE;
DROP TABLE IF EXISTS "OrderTag" CASCADE;
DROP TABLE IF EXISTS "KanbanColumn" CASCADE;

-- Messaging & Support
DROP TABLE IF EXISTS "TicketMessage" CASCADE;
DROP TABLE IF EXISTS "SupportTicket" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;

-- Employee Management
DROP TABLE IF EXISTS "TimeOffRequest" CASCADE;

-- Loyalty & Promotions
DROP TABLE IF EXISTS "Discount" CASCADE;
DROP TABLE IF EXISTS "LoyaltyTransaction" CASCADE;
DROP TABLE IF EXISTS "LoyaltyAccount" CASCADE;

-- Contact
DROP TABLE IF EXISTS "ContactMessage" CASCADE;

-- Reviews
DROP TABLE IF EXISTS "ReviewImage" CASCADE;
DROP TABLE IF EXISTS "Publish" CASCADE;

-- Orders
DROP TABLE IF EXISTS "OrderStatusHistory" CASCADE;
DROP TABLE IF EXISTS "DeliveryAssignment" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;

-- Menu (ingredients, dishes, images)
DROP TABLE IF EXISTS "MenuIngredient" CASCADE;
DROP TABLE IF EXISTS "DishIngredient" CASCADE;
DROP TABLE IF EXISTS "Ingredient" CASCADE;
DROP TABLE IF EXISTS "DishAllergen" CASCADE;
DROP TABLE IF EXISTS "Allergen" CASCADE;
DROP TABLE IF EXISTS "MenuDish" CASCADE;
DROP TABLE IF EXISTS "Dish" CASCADE;
DROP TABLE IF EXISTS "MenuImage" CASCADE;
DROP TABLE IF EXISTS "Menu" CASCADE;
DROP TABLE IF EXISTS "Theme" CASCADE;
DROP TABLE IF EXISTS "Diet" CASCADE;

-- GDPR & Consent
DROP TABLE IF EXISTS "DataDeletionRequest" CASCADE;
DROP TABLE IF EXISTS "UserConsent" CASCADE;

-- Auth & Users
DROP TABLE IF EXISTS "UserSession" CASCADE;
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
DROP TABLE IF EXISTS "UserAddress" CASCADE;
DROP TABLE IF EXISTS "RolePermission" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;

-- Company
DROP TABLE IF EXISTS "WorkingHours" CASCADE;

-- Functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS track_order_status_change() CASCADE;
