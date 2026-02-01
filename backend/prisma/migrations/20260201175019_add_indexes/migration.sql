-- CreateIndex
CREATE INDEX "Dish_menuId_idx" ON "Dish"("menuId");

-- CreateIndex
CREATE INDEX "Menu_dietId_idx" ON "Menu"("dietId");

-- CreateIndex
CREATE INDEX "Menu_themeId_idx" ON "Menu"("themeId");

-- CreateIndex
CREATE INDEX "Menu_title_idx" ON "Menu"("title");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_order_date_idx" ON "Order"("order_date");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
